#!/usr/bin/env python3
"""Generate Schools and Education for each Santa Clara County city. Run from repo root."""
import os
import sys
import json
import argparse
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(REPO_ROOT / ".env")
load_dotenv(REPO_ROOT / ".env.local")

from config import SANTA_CLARA_COUNTY_CITIES, SCHOOLS_EDUCATION_MASTER_PROMPT

STATE = "California"
PAGE_TYPE = "City"
SCHOOL_DISTRICTS = ""
UNIVERSITIES = ""
EDU_NOTES = ""
FOCUS_KEYWORD = ""


def build_prompt(place):
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
    parser = argparse.ArgumentParser()
    parser.add_argument("--city", help="Single city slug")
    parser.add_argument("--limit", type=int)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key and not args.dry_run:
        print("OPENAI_API_KEY not set. Aborting.", file=sys.stderr)
        sys.exit(1)

    cities = [c for c in SANTA_CLARA_COUNTY_CITIES if c["slug"] == args.city] if args.city else SANTA_CLARA_COUNTY_CITIES
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
            print(prompt[:500] + "..." if len(prompt) > 500 else prompt)
            continue
        try:
            r = client.chat.completions.create(
                model=os.getenv("OPENAI_SANTACLARA_MODEL") or ("gpt-4o-mini" if (os.getenv("OPENAI_MODEL") or "").startswith("gpt-5") else os.getenv("OPENAI_MODEL", "gpt-4o-mini")),
                messages=[
                    {"role": "system", "content": "You are an expert real estate copywriter. Return only the section text."},
                    {"role": "user", "content": prompt},
                ],
                temperature=1,
                max_completion_tokens=600,
            )
            text = (r.choices[0].message.content or "").strip()
            if not text:
                results.append({"slug": slug, "name": name, "error": "empty", "content": None})
                continue
            results.append({"slug": slug, "name": name, "section": "schools_education", "content": text})
            (out_dir / f"{slug}_schools_education.txt").write_text(text, encoding="utf-8")
            print(f"  Saved {slug}_schools_education.txt")
        except Exception as e:
            results.append({"slug": slug, "name": name, "error": str(e), "content": None})
            print(f"  Error: {e}", file=sys.stderr)

    if results and not args.dry_run:
        (out_dir / "santa_clara_cities_schools_education.json").write_text(json.dumps(results, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
