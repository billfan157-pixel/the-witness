'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const A=require('../witness-audio.js'),L=require('../witness-audio-library.js'),M=require('../witness-model.js');
const ledger=JSON.parse(fs.readFileSync('assets/audio/q01/procedural-sources.json'));
for(const e of ledger.entries){const b=fs.readFileSync(e.file);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),e.sha256);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.readUInt32LE(24),22050);assert.equal(b.readUInt32LE(40),b.length-44);let energy=0,peak=0;for(let i=44;i<b.length;i+=2){const x=b.readInt16LE(i)/32768;energy+=x*x;peak=Math.max(peak,Math.abs(x));}assert(peak<.9&&energy>1,e.id);assert(L.sounds[e.id].files.includes(e.file));}
const voice=JSON.parse(fs.readFileSync('assets/audio/q01/voice-sources.json'));assert.equal(crypto.createHash('sha256').update(fs.readFileSync(voice.file)).digest('hex'),voice.sha256);
for(const v of L.voices){assert(v.start>=0&&v.end>v.start&&v.end<=voice.durationSeconds);assert.equal(A.recorded(v.person,v.text),v);assert(fs.statSync(v.file).size>1000);}
let s=M.beginQ01Scene(M.fresh(),{campaign:true});assert(A.profile(s).beds.some(b=>b.sound==='harbor'));s.sceneProgress.Q01.beat=4;s.sceneProgress.Q01.phase='evening';assert(A.profile(s).beds.some(b=>b.sound==='fire'));s.sceneProgress.Q01.beat=7;s.sceneProgress.Q01.phase='night';assert(A.profile(s).beds.some(b=>b.sound==='q01-quiet-score'));
s=M.fresh();s.workshop.records['Q01.LOAD']={owner:'Q01'};const audio=A.create();audio.tick({position:[-14.2,3.5],walking:true},s);audio.tick({position:[-14.1,3.5],walking:true},s);audio.dispose();
console.log(JSON.stringify({status:'passed',proceduralAssets:ledger.entries.length,recordedSentences:L.voices.length,scope:'Reproducible media bytes, PCM levels, source hashes, speech segment bounds, scene beds and completed-LOAD tick regression; not listening approval or full voice coverage'}));
