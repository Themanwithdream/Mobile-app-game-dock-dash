"""Convert existing original paintings named <id>.png into the game's art budget.

Usage: python tools/import-open-roads-paintings.py /absolute/source-directory
The separate originals are never changed. Requires Pillow.
"""
from pathlib import Path
import hashlib
import json
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]

def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    source = Path(sys.argv[1]).resolve()
    target = ROOT / 'assets/worlds/open-roads'
    if source == target.resolve():
        raise SystemExit('Keep full-size source originals separate from runtime assets.')
    manifest = json.loads((target / 'manifest.json').read_text())
    inputs = [(row, source / (row['id'] + '.png')) for row in manifest['images']]
    missing = [str(path) for _, path in inputs if not path.is_file()]
    if missing:
        raise SystemExit('Missing source paintings: ' + ', '.join(missing))
    converted = []
    for row, path in inputs:
        with Image.open(path) as art:
            art = art.convert('RGB').resize((360, 640), Image.Resampling.NEAREST)
            converted.append((row, path, art.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)))
    for row, path, art in converted:
        destination = target / row['file']
        art.save(destination, optimize=True)
        data = destination.read_bytes()
        row.update(bytes=len(data), sha256=hashlib.sha256(data).hexdigest(), sourceSHA256=hashlib.sha256(path.read_bytes()).hexdigest(), method='imagegen')
    (target / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps({'paintings': len(converted), 'bytes': sum(row['bytes'] for row in manifest['images'])}))

if __name__ == '__main__':
    main()
