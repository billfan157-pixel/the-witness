#!/usr/bin/env python3
"""VieNeu-TTS v3 Turbo synthesis, technical QC, mastering, and comparison worker.

Runs torch-free ONNX Runtime CPU inference by default (`backend="onnx"`,
`precision="fp32"`). Preset voices only: external voice cloning is disabled to
prevent unauthorized speaker cloning.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import math
import os
import pathlib
import sys
import time
import warnings
from typing import Any, Dict, List, Optional, Tuple

os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
warnings.filterwarnings("ignore", category=UserWarning, module="huggingface_hub")

import numpy as np
import soundfile as sf


def sha256_file(path: pathlib.Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def measure_pcm(wav: np.ndarray, sr: int) -> Dict[str, Any]:
    samples = int(wav.shape[0])
    if samples == 0:
        return {
            "samples": 0,
            "sampleRate": sr,
            "channels": 1,
            "durationSeconds": 0.0,
            "peak": 0.0,
            "rms": 0.0,
            "dcOffset": 0.0,
            "clippingFraction": 1.0,
            "activeRatio": 0.0,
            "peakDbfs": -120.0,
            "rmsDbfs": -120.0,
            "finite": True,
        }
    finite = bool(np.all(np.isfinite(wav)))
    peak = float(np.max(np.abs(wav)))
    rms = float(np.sqrt(np.mean(np.square(wav, dtype=np.float64))))
    dc_offset = float(abs(np.mean(wav, dtype=np.float64)))
    clip_fraction = float(np.mean(np.abs(wav) >= 0.999))
    active_thresh = 10.0 ** (-45.0 / 20.0)
    active_ratio = float(np.mean(np.abs(wav) >= active_thresh))
    peak_dbfs = 20.0 * math.log10(max(peak, 1e-6))
    rms_dbfs = 20.0 * math.log10(max(rms, 1e-6))
    return {
        "samples": samples,
        "sampleRate": sr,
        "channels": 1,
        "durationSeconds": round(samples / sr, 4),
        "peak": round(peak, 6),
        "rms": round(rms, 6),
        "dcOffset": round(dc_offset, 6),
        "clippingFraction": round(clip_fraction, 6),
        "activeRatio": round(active_ratio, 4),
        "peakDbfs": round(peak_dbfs, 2),
        "rmsDbfs": round(rms_dbfs, 2),
        "finite": finite,
    }


def trim_and_master(
    wav: np.ndarray,
    sr: int,
    thresholds: Dict[str, Any],
) -> Tuple[np.ndarray, float]:
    out = np.asarray(wav, dtype=np.float32).reshape(-1).copy()
    if out.size == 0:
        return out, 0.0

    # Remove residual DC offset before edge gating and normalization.
    mean_val = float(np.mean(out, dtype=np.float64))
    if abs(mean_val) > 1e-4:
        out = out - np.float32(mean_val)

    # Trim dead silence beyond natural margin around speech activity (-50 dBFS).
    gate = 10.0 ** (-50.0 / 20.0)
    active = np.flatnonzero(np.abs(out) >= gate)
    margin = int((thresholds.get("trimMarginMs", 70) / 1000.0) * sr)
    if active.size > 0:
        start = max(0, int(active[0]) - margin)
        end = min(out.size, int(active[-1]) + margin + 1)
        out = out[start:end]

    # Peak-safe loudness normalization toward consistent broadcast voice level.
    rms = float(np.sqrt(np.mean(np.square(out, dtype=np.float64))))
    peak = float(np.max(np.abs(out)))
    target_rms = float(thresholds.get("targetRms", 0.105))
    peak_ceiling = float(thresholds.get("targetPeakCeiling", 0.85))
    max_gain_lin = 10.0 ** (float(thresholds.get("maxGainDb", 6.0)) / 20.0)
    gain = 1.0
    if rms > 1e-5 and peak > 1e-5:
        desired = min(target_rms / rms, max_gain_lin)
        gain = min(desired, peak_ceiling / peak)
        if peak > peak_ceiling:
            gain = min(gain, peak_ceiling / peak)
    out = np.clip(out * np.float32(gain), -0.99, 0.99).astype(np.float32)

    # Smooth edge cosine fades prevent discontinuous clicks on seek/repeat.
    fade_in = min(int((thresholds.get("fadeInMs", 8) / 1000.0) * sr), out.size // 4)
    fade_out = min(int((thresholds.get("fadeOutMs", 12) / 1000.0) * sr), out.size // 4)
    if fade_in > 1:
        ramp = 0.5 * (1.0 - np.cos(np.linspace(0.0, math.pi, fade_in, dtype=np.float32)))
        out[:fade_in] *= ramp
    if fade_out > 1:
        ramp = 0.5 * (1.0 + np.cos(np.linspace(0.0, math.pi, fade_out, dtype=np.float32)))
        out[-fade_out:] *= ramp

    gain_db = round(20.0 * math.log10(max(gain, 1e-6)), 2)
    return out, gain_db


def check_qc(metrics: Dict[str, Any], thresholds: Dict[str, Any]) -> Tuple[bool, List[str]]:
    issues: List[str] = []
    if not metrics["finite"]:
        issues.append("non-finite samples in waveform")
    if metrics["durationSeconds"] < float(thresholds.get("minDurationSeconds", 0.4)):
        issues.append(f"duration too short ({metrics['durationSeconds']}s)")
    if metrics["durationSeconds"] > float(thresholds.get("maxDurationSeconds", 30.0)):
        issues.append(f"duration too long ({metrics['durationSeconds']}s)")
    if metrics["rms"] < float(thresholds.get("minRms", 0.025)):
        issues.append(f"RMS too low ({metrics['rms']})")
    if metrics["peak"] > float(thresholds.get("maxPeak", 0.89)):
        issues.append(f"peak exceeds ceiling ({metrics['peak']})")
    if metrics["dcOffset"] > float(thresholds.get("maxDcOffset", 0.008)):
        issues.append(f"DC offset too high ({metrics['dcOffset']})")
    if metrics["clippingFraction"] > float(thresholds.get("maxClippingFraction", 0.0005)):
        issues.append(f"clipping fraction too high ({metrics['clippingFraction']})")
    if metrics["activeRatio"] < float(thresholds.get("minActiveRatio", 0.25)):
        issues.append(f"speech activity ratio too low ({metrics['activeRatio']})")
    return len(issues) == 0, issues


def write_audio(path: pathlib.Path, wav: np.ndarray, sr: int, fmt: str, compression_level: float) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if fmt == "mp3":
        sf.write(
            str(path),
            wav,
            sr,
            format="MP3",
            subtype="MPEG_LAYER_III",
            compression_level=float(compression_level),
        )
    elif fmt == "wav":
        sf.write(str(path), wav, sr, format="WAV", subtype="PCM_16")
    else:
        raise ValueError(f"Unsupported audio format: {fmt}")


def synthesize_with_retry(
    tts: Any,
    tts_text: str,
    voice_id: str,
    base_seed: int,
    thresholds: Dict[str, Any],
) -> Tuple[np.ndarray, Dict[str, Any], Dict[str, Any], int, float, float]:
    attempts = 2
    last_issues: List[str] = []
    for attempt in range(attempts):
        used_seed = base_seed + attempt
        np.random.seed(used_seed)
        t0 = time.perf_counter()
        raw_wav = tts.infer(tts_text, voice=voice_id, apply_watermark=False)
        gen_seconds = time.perf_counter() - t0
        sr = int(getattr(tts, "sample_rate", 48000))
        raw_metrics = measure_pcm(np.asarray(raw_wav, dtype=np.float32).reshape(-1), sr)
        mastered, gain_db = trim_and_master(raw_wav, sr, thresholds)
        qc_metrics = measure_pcm(mastered, sr)
        qc_metrics["gainAppliedDb"] = gain_db
        passed, issues = check_qc(qc_metrics, thresholds)
        qc_metrics["passed"] = passed
        qc_metrics["issues"] = issues
        if passed:
            return mastered, raw_metrics, qc_metrics, used_seed, gen_seconds, sr
        last_issues = issues
    raise RuntimeError(f"Audio QC failed after {attempts} attempts for voice '{voice_id}': {'; '.join(last_issues)}")


def collect_hf_revision(repo_id: str) -> Optional[str]:
    hub_cache = pathlib.Path.home() / ".cache" / "huggingface" / "hub"
    refs_main = hub_cache / f"models--{repo_id.replace('/', '--')}" / "refs" / "main"
    if refs_main.is_file():
        return refs_main.read_text(encoding="utf-8").strip()
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description="VieNeu-TTS v3 Turbo synthesis worker")
    parser.add_argument("--manifest", required=True, help="Path to input job manifest JSON")
    parser.add_argument("--report", required=True, help="Path to write synthesis report JSON")
    args = parser.parse_args()

    manifest = json.loads(pathlib.Path(args.manifest).read_text(encoding="utf-8"))
    if manifest.get("allowVoiceCloning"):
        raise PermissionError("Voice cloning is disabled by repository policy.")

    backend = manifest.get("backend", "onnx")
    precision = manifest.get("precision", "fp32")
    threads = int(manifest.get("threads", 0))
    thresholds = manifest.get("qcThresholds", {})
    compression_level = float(manifest.get("mp3CompressionLevel", 0.35))
    jobs = manifest.get("jobs", [])
    reels = manifest.get("comparisonReels", [])

    from vieneu import Vieneu

    t_load0 = time.perf_counter()
    tts = Vieneu(mode="v3turbo", backend=backend, precision=precision, threads=threads)
    load_seconds = round(time.perf_counter() - t_load0, 3)

    preset_ids = {voice_id for _, voice_id in tts.list_preset_voices()}
    sr = int(getattr(tts, "sample_rate", 48000))

    runtime_info = {
        "sdkPackage": "vieneu",
        "sdkVersion": importlib.metadata.version("vieneu"),
        "onnxruntimeVersion": importlib.metadata.version("onnxruntime"),
        "seaG2pVersion": importlib.metadata.version("sea-g2p"),
        "soundfileVersion": importlib.metadata.version("soundfile"),
        "backend": getattr(tts, "backend", backend),
        "precision": precision,
        "sampleRate": sr,
        "loadSeconds": load_seconds,
        "hfModelRepo": manifest.get("hfModelRepo", "pnnbao-ump/VieNeu-TTS-v3-Turbo"),
        "hfCachedRevision": collect_hf_revision(manifest.get("hfModelRepo", "pnnbao-ump/VieNeu-TTS-v3-Turbo")),
        "codecCachedRevision": collect_hf_revision(manifest.get("codecRepo", "OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX")),
    }

    completed_jobs: List[Dict[str, Any]] = []
    # Keep waveforms in memory for building optional stitched comparison reels cleanly.
    reel_cache: Dict[str, np.ndarray] = {}

    for idx, job in enumerate(jobs, start=1):
        voice_id = job["voiceId"]
        if voice_id not in preset_ids:
            raise ValueError(f"Preset voice '{voice_id}' is not available in installed VieNeu SDK presets.")
        if job.get("refAudio"):
            raise PermissionError(f"refAudio rejected for job {job['id']}: voice cloning is prohibited.")

        out_path = pathlib.Path(job["outPath"])
        wav_out_path = pathlib.Path(job["comparisonWavPath"]) if job.get("comparisonWavPath") else None

        print(f"[{idx}/{len(jobs)}] Synthesizing {job['id']} ({voice_id}) ...", file=sys.stderr, flush=True)
        mastered, raw_metrics, qc_metrics, used_seed, gen_seconds, actual_sr = synthesize_with_retry(
            tts=tts,
            tts_text=job["ttsText"],
            voice_id=voice_id,
            base_seed=int(job["seed"]),
            thresholds=thresholds,
        )

        write_audio(out_path, mastered, actual_sr, "mp3", compression_level)
        if wav_out_path:
            write_audio(wav_out_path, mastered, actual_sr, "wav", compression_level)

        reel_cache[job["id"]] = mastered
        dur = max(qc_metrics["durationSeconds"], 1e-6)
        completed_jobs.append({
            "id": job["id"],
            "file": job["relPath"],
            "audioSha256": sha256_file(out_path),
            "bytes": out_path.stat().st_size,
            "comparisonWavFile": job.get("comparisonWavRelPath"),
            "seedUsed": used_seed,
            "generationSeconds": round(gen_seconds, 3),
            "rtf": round(gen_seconds / dur, 4),
            "rawMetrics": raw_metrics,
            "qc": qc_metrics,
        })

    completed_reels: List[Dict[str, Any]] = []
    for reel in reels:
        gap_seconds = reel.get("gapSeconds", [])
        segments: List[np.ndarray] = []
        timings: List[Dict[str, Any]] = []
        cursor = 0.0
        for s_idx, item in enumerate(reel["items"]):
            job_id = item["jobId"]
            if job_id in reel_cache:
                seg_wav = reel_cache[job_id]
            else:
                seg_path = pathlib.Path(item["audioPath"])
                seg_wav, seg_sr = sf.read(str(seg_path), dtype="float32", always_2d=False)
                if getattr(seg_wav, "ndim", 1) > 1:
                    seg_wav = seg_wav.mean(axis=1)
                if seg_sr != sr:
                    import soxr
                    seg_wav = soxr.resample(np.asarray(seg_wav, dtype=np.float32), seg_sr, sr)
            seg_wav = np.asarray(seg_wav, dtype=np.float32).reshape(-1)
            start_sec = round(cursor, 3)
            seg_dur = len(seg_wav) / sr
            end_sec = round(cursor + seg_dur, 3)
            segments.append(seg_wav)
            timings.append({
                "jobId": job_id,
                "text": item["text"],
                "start": start_sec,
                "end": end_sec,
                "durationSeconds": round(seg_dur, 3),
            })
            cursor += seg_dur
            if s_idx < len(reel["items"]) - 1:
                gap = float(gap_seconds[s_idx]) if s_idx < len(gap_seconds) else 0.55
                if gap > 0:
                    segments.append(np.zeros(int(round(gap * sr)), dtype=np.float32))
                    cursor += gap

        combined = np.concatenate(segments) if segments else np.zeros(0, dtype=np.float32)
        reel_mp3 = pathlib.Path(reel["mp3OutPath"])
        write_audio(reel_mp3, combined, sr, "mp3", compression_level)
        reel_metrics = measure_pcm(combined, sr)
        reel_metrics["passed"], reel_metrics["issues"] = check_qc(reel_metrics, {**thresholds, "maxDurationSeconds": 90.0})

        reel_wav_path = pathlib.Path(reel["wavOutPath"]) if reel.get("wavOutPath") else None
        if reel_wav_path:
            write_audio(reel_wav_path, combined, sr, "wav", compression_level)

        completed_reels.append({
            "id": reel["id"],
            "voiceId": reel["voiceId"],
            "mp3File": reel["mp3RelPath"],
            "mp3Sha256": sha256_file(reel_mp3),
            "mp3Bytes": reel_mp3.stat().st_size,
            "wavFile": reel.get("wavRelPath"),
            "durationSeconds": reel_metrics["durationSeconds"],
            "qc": reel_metrics,
            "segments": timings,
        })

    report = {
        "runtime": runtime_info,
        "jobs": completed_jobs,
        "comparisonReels": completed_reels,
    }
    report_path = pathlib.Path(args.report)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
