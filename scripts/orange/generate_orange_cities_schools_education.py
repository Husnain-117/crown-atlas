#!/usr/bin/env python3
"""
Generate Schools and Education section for each Orange County city.
Uses OpenAI API from .env. Run from repo root: python scripts/orange/generate_orange_cities_schools_education.py [--city slug] [--limit N]
"""
import os
import sys
import json
import argparse
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

# Load .env from repo root (script in scripts/orange -> parent.parent.parent = repo root)
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(REPO_ROOT / ".env")
load_dotenv(REPO_ROOT / ".env.local")

from config import ORANGE_COUNTY_CITIES, SCHOOLS_EDUCATION_MASTER_PROMPT

STATE = "California"
PAGE_TYPE = "City"
SCHOOL_DISTRICTS = ""
UNIVERSITIES = ""
EDU_NOTES = ""
FOCUS_KEYWORD = ""


def build_prompt(place: str):
    return SCHOOLS_EDUCATION_MASTER_PROMPT.format(
        PLACE=place,
        STATE=STATE,
        PAGE_TYPE=PAGE_TYPE,
        SCHOOL_DISTRICTS=SCHOOL_DISTRICTS or "(none provided)",
        UNIVERSITIES=UNIVERSITIES or "(none provided)",
        EDU_NOTES=EDU_NOTES or "(none provided)",
        FOCUS_KEYWORD=FOCUS_KEYWORD or "(none)",
    )


def main():
    parser = argparse.ArgumentParser(description="Generate Schools and Education for Orange County cities")
    parser.add_argument("--city", help="Single city slug (e.g. irvine-ca). If omitted, run for all cities.")
    parser.add_argument("--limit", type=int, help="Max number of cities to process (when running all)")
    parser.add_argument("--dry-run", action="store_true", help="Print prompts only, do not call OpenAI")
    args = parser.parse_args()

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key and not args.dry_run:
        print("OPENAI_API_KEY not set in .env or .env.local. Aborting.", file=sys.stderr)
        sys.exit(1)

    if args.city:
        cities = [c for c in ORANGE_COUNTY_CITIES if c["slug"] == args.city]
        if not cities:
            print(f"City slug not found: {args.city}", file=sys.stderr)
            sys.exit(1)
    else:
        cities = ORANGE_COUNTY_CITIES
        if args.limit:
            cities = cities[: args.limit]

    client = OpenAI(api_key=api_key) if api_key else None
    out_dir = Path(__file__).resolve().parent / "output"
    out_dir.mkdir(exist_ok=True)
    results = []

    for i, city in enumerate(cities):
        name, slug = city["name"], city["slug"]
        prompt = build_prompt(name)
        print(f"[{i+1}/{len(cities)}] {name} ({slug})")

        if args.dry_run:
            print("--- Prompt (first 500 chars) ---")
            print(prompt[:500] + "..." if len(prompt) > 500 else prompt)
            print()
            continue

        try:
            response = client.chat.completions.create(
                model=os.getenv("OPENAI_ORANGE_MODEL") or ("gpt-4o-mini" if (os.getenv("OPENAI_MODEL") or "").startswith("gpt-5") else os.getenv("OPENAI_MODEL", "gpt-4o-mini")),
                messages=[
                    {"role": "system", "content": "You are an expert real estate copywriter. Return only the section text, no meta commentary."},
                    {"role": "user", "content": prompt},
                ],
                temperature=1,
                max_completion_tokens=600,
            )
            text = (response.choices[0].message.content or "").strip()
            if not text:
                print(f"  Empty response for {name}", file=sys.stderr)
                results.append({"slug": slug, "name": name, "error": "empty response", "content": None})
                continue

            results.append({"slug": slug, "name": name, "section": "schools_education", "content": text})
            city_file = out_dir / f"{slug}_schools_education.txt"
            city_file.write_text(text, encoding="utf-8")
            print(f"  Saved {city_file.name}")
        except Exception as e:
            print(f"  Error: {e}", file=sys.stderr)
            results.append({"slug": slug, "name": name, "error": str(e), "content": None})

    if not args.dry_run and results:
        json_file = out_dir / "orange_cities_schools_education.json"
        json_file.write_text(json.dumps(results, indent=2), encoding="utf-8")
        print(f"\nAll results saved to {json_file}")


if __name__ == "__main__":
    main()
