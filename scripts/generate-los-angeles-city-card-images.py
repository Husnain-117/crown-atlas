#!/usr/bin/env python3
import argparse
import base64
import io
import os
from pathlib import Path
from typing import Dict, List, Tuple

from openai import OpenAI
from PIL import Image

MODEL = "gpt-image-1"
MAX_OUTPUT_BYTES = 500 * 1024
OUTPUT_DIR = Path("public") / "city" / "los-angeles"

# First 10 cities in LOS_ANGELES_COUNTY_CITIES (src/lib/counties.ts)
LOS_ANGELES_FIRST_10_CITIES: List[Dict[str, str]] = [
    {"name": "Agoura Hills", "slug": "agoura-hills-ca"},
    {"name": "Alhambra", "slug": "alhambra-ca"},
    {"name": "Arcadia", "slug": "arcadia-ca"},
    {"name": "Artesia", "slug": "artesia-ca"},
    {"name": "Avalon", "slug": "avalon-ca"},
    {"name": "Azusa", "slug": "azusa-ca"},
    {"name": "Baldwin Park", "slug": "baldwin-park-ca"},
    {"name": "Bell", "slug": "bell-ca"},
    {"name": "Bell Gardens", "slug": "bell-gardens-ca"},
    {"name": "Bellflower", "slug": "bellflower-ca"},
]


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def build_prompt(city_name: str) -> str:
    # Keeping prompt text aligned with the user-provided wording.
    return (
        f"Panoramic aerial view of {city_name}, Los Angeles County, California,\n"
        "authentic Southern California cityscape,\n"
        f"Panoramic aerial view of {city_name}, Los Angeles County, California,\n"
        "authentic Southern California cityscape,\n"
        f"recognizable local landmark or distinctive architectural element unique to {city_name} subtly visible in the background,\n"
        "residential neighborhoods with palm trees,\n"
        "distant hills or mountains,\n"
        "clear blue sky, bright natural daylight,\n"
        "professional drone photography,\n"
        "premium real estate website hero image,\n"
        "natural realistic colors,\n"
        "wide angle lens,\n"
        "ultra realistic, high detail, 4k,\n"
        "clean open sky space for website text overlay,\n"
        "not a tourist postcard, realistic everyday city atmosphere\n"
        "in the background,\n"
        "residential neighborhoods with palm trees,\n"
        "distant hills or mountains,\n"
        "clear blue sky, bright natural daylight,\n"
        "professional drone photography,\n"
        "premium real estate website hero image,\n"
        "natural realistic colors,\n"
        "wide angle lens,\n"
        "ultra realistic, high detail, 4k,\n"
        "clean open sky space for website text overlay,\n"
        "not a tourist postcard, realistic everyday city atmosphere"
    )


def generate_base_image(client: OpenAI, prompt: str) -> bytes:
    response = client.images.generate(
        model=MODEL,
        prompt=prompt,
        size="1536x1024",
        quality="high",
        output_format="png",
    )
    item = response.data[0]

    if getattr(item, "b64_json", None):
        return base64.b64decode(item.b64_json)

    if getattr(item, "url", None):
        import requests

        r = requests.get(item.url, timeout=60)
        r.raise_for_status()
        return r.content

    raise RuntimeError("No image bytes returned by API (missing b64_json/url).")


def compress_under_limit(image_bytes: bytes, max_bytes: int) -> Tuple[bytes, int, int]:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    width, height = image.size
    quality = 88

    while True:
        resized = image
        if width < image.width:
            new_height = max(1, int((width / image.width) * image.height))
            resized = image.resize((width, new_height), Image.Resampling.LANCZOS)

        buf = io.BytesIO()
        resized.save(buf, format="JPEG", quality=quality, optimize=True, progressive=True)
        output = buf.getvalue()

        if len(output) <= max_bytes:
            return output, width, quality

        if quality > 50:
            quality -= 6
            continue

        if width > 900:
            width = int(width * 0.88)
            quality = 72
            continue

        raise RuntimeError(f"Could not compress image below {max_bytes} bytes.")


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate Los Angeles city-card images (first 10 cities).")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files.")
    args = parser.parse_args()

    root = Path.cwd()
    load_env_file(root / ".env")
    load_env_file(root / ".env.local")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("OPENAI_API_KEY is missing. Add it to .env or .env.local.")
        return 1

    client = OpenAI(api_key=api_key)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Model: {MODEL}")
    print("County: los-angeles")
    print(f"Cities: {len(LOS_ANGELES_FIRST_10_CITIES)}")
    print(f"Max file size: {MAX_OUTPUT_BYTES // 1024}KB")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Mode: {'force overwrite' if args.force else 'skip existing'}")
    print("")

    created = 0
    skipped = 0
    failed = 0

    for idx, city in enumerate(LOS_ANGELES_FIRST_10_CITIES, start=1):
        city_name = city["name"]
        slug = city["slug"]
        output_path = OUTPUT_DIR / f"{slug}.jpg"

        if output_path.exists() and not args.force:
            skipped += 1
            print(f"[{idx}/{len(LOS_ANGELES_FIRST_10_CITIES)}] {city_name}: skipped (exists)")
            continue

        try:
            prompt = build_prompt(city_name)
            raw_bytes = generate_base_image(client, prompt)
            optimized, width, quality = compress_under_limit(raw_bytes, MAX_OUTPUT_BYTES)
            output_path.write_bytes(optimized)
            created += 1
            kb = round(len(optimized) / 1024)
            print(
                f"[{idx}/{len(LOS_ANGELES_FIRST_10_CITIES)}] {city_name}: "
                f"saved {slug}.jpg ({kb}KB, width={width}, quality={quality})"
            )
        except Exception as exc:
            failed += 1
            print(f"[{idx}/{len(LOS_ANGELES_FIRST_10_CITIES)}] {city_name}: failed -> {exc}")

    print("")
    print("Done.")
    print(f"Created: {created}")
    print(f"Skipped: {skipped}")
    print(f"Failed: {failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
