"""Rebuild the bundled CC0 terrain atlases from Poly Haven's verified 1K maps."""
import hashlib
import io
import json
from pathlib import Path
import urllib.request
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'terrain'
OUT.mkdir(parents=True, exist_ok=True)
LAYERS = [('soil', 'brown_mud_dry'), ('limestone', 'coral_ground_02'),
          ('grass', 'aerial_grass_rock'), ('path', 'grass_path_2')]
SIZE, GUTTER = 512, 8
SLOT = SIZE + GUTTER * 2
HEADERS = {'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'}

def fetch(url):
    request = urllib.request.Request(url, headers=HEADERS)
    return urllib.request.urlopen(request, timeout=60).read()

def tile(atlas, source, index):
    # Repeat the opposite edge into each gutter so bilinear/mipmap taps wrap.
    image = source.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    x, y = index % 2 * SLOT + GUTTER, index // 2 * SLOT + GUTTER
    for dx in [-SIZE, 0, SIZE]:
        for dy in [-SIZE, 0, SIZE]:
            box = (max(0, -GUTTER-dx), max(0, -GUTTER-dy),
                   min(SIZE, SIZE+GUTTER-dx), min(SIZE, SIZE+GUTTER-dy))
            if box[2] > box[0] and box[3] > box[1]:
                atlas.paste(image.crop(box), (x+dx+box[0], y+dy+box[1]))

atlases = {key: Image.new('RGB', (SLOT * 2, SLOT * 2))
           for key in ['albedo', 'normal', 'orm-height']}
manifest = {'license': 'CC0-1.0', 'licenseUrl': 'https://polyhaven.com/license',
            'tileSize': SIZE, 'gutter': GUTTER, 'layers': []}
for index, (name, asset) in enumerate(LAYERS):
    metadata = json.loads(fetch('https://api.polyhaven.com/files/' + asset + '?witness=1'))
    maps, sources = {}, {}
    for channel in ['Diffuse', 'nor_gl', 'arm', 'Displacement']:
        entry = metadata[channel]['1k']['jpg']
        data = fetch(entry['url'])
        assert hashlib.md5(data).hexdigest() == entry['md5'], 'Source checksum mismatch'
        maps[channel] = Image.open(io.BytesIO(data)).convert('RGB')
        sources[channel] = {'url': entry['url'], 'md5': entry['md5']}
    tile(atlases['albedo'], maps['Diffuse'], index)
    tile(atlases['normal'], maps['nor_gl'], index)
    packed = Image.merge('RGB', (maps['arm'].getchannel('R'), maps['arm'].getchannel('G'),
                                maps['Displacement'].getchannel('R')))
    tile(atlases['orm-height'], packed, index)
    manifest['layers'].append({'layer': name, 'asset': asset,
                              'source': 'https://polyhaven.com/a/' + asset, 'maps': sources})
    print('Prepared', name, asset, flush=True)
atlases['albedo'].save(OUT / 'albedo.webp', quality=90, method=6)
for name in ['normal', 'orm-height']:
    atlases[name].save(OUT / (name + '.webp'), lossless=True, method=6)
(OUT / 'sources.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print('Terrain atlases:', sum(p.stat().st_size for p in OUT.glob('*.webp')), 'bytes')
