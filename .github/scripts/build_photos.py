import json, re, shutil
from pathlib import Path
from PIL import Image

site = Path("public/images/library")
thumbs = site / "thumbs"
thumbs.mkdir(parents=True, exist_ok=True)
pattern = re.compile(r"^library(\d+)\.(png|jpe?g|gif|webp|avif|bmp)$", re.I)

for stray in Path("images/library").glob("library*.*"):
    if pattern.match(stray.name) and not (site / stray.name).exists():
        shutil.copy2(stray, site / stray.name)

photos = []
for f in site.iterdir():
    m = pattern.match(f.name)
    if not m:
        continue
    try:
        with Image.open(f) as im:
            im.load()
            if f.suffix.lower() != ".gif":
                thumb = thumbs / (f.stem + ".jpg")
                if not thumb.exists() or thumb.stat().st_mtime < f.stat().st_mtime:
                    im = im.convert("RGBA")
                    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
                    bg.alpha_composite(im)
                    t = bg.convert("RGB")
                    t.thumbnail((480, 480))
                    t.save(thumb, quality=82)
    except Exception as e:
        print(f"skipping {f.name}: {e}")
        continue
    photos.append((int(m.group(1)), f.name))

photos.sort()
(site / "photos.json").write_text(json.dumps([name for _, name in photos]))
print(f"{len(photos)} photos")
