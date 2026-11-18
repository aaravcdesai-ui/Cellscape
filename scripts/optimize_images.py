"""Generate web-ready WebP images from the PNG masters in assets/.

The PNGs are kept as lossless source artwork; the website loads only the
WebP files this script writes:

  assets/<group>/<name>.webp         full illustration (max 1640 px wide, 2x the 820 px atlas)
  assets/specimens/thumbs/<name>.webp  small preview for lists and the gallery (440 px wide)

Requires Pillow (pip install Pillow). Re-run after adding or editing a PNG:

  python3 scripts/optimize_images.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
GROUPS = {"assets/specimens": True, "assets/organelles": False}  # group -> needs thumbnails
FULL_WIDTH = 1640
THUMB_WIDTH = 440


def save_webp(image, width, target, quality):
    if image.width > width:
        image = image.resize((width, round(image.height * width / image.width)), Image.LANCZOS)
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, "WEBP", quality=quality, method=6, exact=False)
    return target.stat().st_size


def main():
    for group, thumbs in GROUPS.items():
        for png in sorted((ROOT / group).glob("*.png")):
            with Image.open(png) as source:
                image = source.convert("RGBA")
            full = save_webp(image, FULL_WIDTH, png.with_suffix(".webp"), 84)
            note = f"{png.relative_to(ROOT)}: {png.stat().st_size // 1024} KB -> {full // 1024} KB full"
            if thumbs:
                thumb = save_webp(image, THUMB_WIDTH, png.parent / "thumbs" / f"{png.stem}.webp", 80)
                note += f", {thumb // 1024} KB thumb"
            print(note)


if __name__ == "__main__":
    main()
