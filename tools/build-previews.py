"""Create small, distinct mission previews from the original shipped artwork.

Requires Pillow with WebP support. Run from any directory. The original images
and game location IDs remain unchanged.
"""
from pathlib import Path
import base64
import hashlib
import io
import json
import re
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / "index.html").read_text()
media = json.loads(re.search(r'<script[^>]*id="bundled-media"[^>]*>(.*?)</script>', source, re.S)[1])
target = ROOT / "assets" / "previews"
target.mkdir(parents=True, exist_ok=True)
rows = []
for index, url in enumerate(media["floors"]):
    if index < 3 or not url:
        continue
    original = base64.b64decode(url.split(",", 1)[1]) if url.startswith("data:") else (ROOT / url).read_bytes()
    with Image.open(io.BytesIO(original)) as art:
        # Match the game canvas's existing 360:640 projection, preserving hard
        # pixel edges; previews cover retina phone cards without large decodes.
        small = art.convert("RGB").resize((360, 640), Image.Resampling.NEAREST).crop((0, 170, 360, 350))
        name = f"{index:03}.webp"
        small.save(target / name, format="WEBP", quality=88, method=5)
    data = (target / name).read_bytes()
    rows.append({"location": index, "source": url, "sourceBytes": len(original),
                 "sourceSHA256": hashlib.sha256(original).hexdigest(), "preview": name,
                 "previewBytes": len(data), "previewSHA256": hashlib.sha256(data).hexdigest()})
assert len(rows) == len(media['floors']) - 3
assert len({r["previewSHA256"] for r in rows}) == len(rows)
(target / "manifest.json").write_text(json.dumps({"width": 360, "height": 180, "top": 170, "quality": 88, "images": rows}, indent=2) + "\n")
print(json.dumps({"worlds": len(rows), "originalBytes": sum(r["sourceBytes"] for r in rows),
                  "previewBytes": sum(r["previewBytes"] for r in rows)}))
