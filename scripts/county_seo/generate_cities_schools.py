#!/usr/bin/env python3
"""Generate Schools and Education for each city in a county. Use --county slug."""
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

from manifest import get_county
from prompts import SCHOOLS_EDUCATION_MASTER_PROMPT

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
    parser = argparse.ArgumentParser()
    parser.add_argument("--county", required=True, help="County slug")
    parser.add_argument("--limit", type=int, help="Max cities to process")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    county = get_county(args.county)
    if not county:
        print(f"Unknown county: {args.county}", file=sys.stderr)
        sys.exit(1)

    cities = county["cities"]
    if args.limit:
        cities = cities[: args.limit]

    if not cities:
        print(f"No cities for {args.county}; skipping city-level schools.")
        out_dir = Path(__file__).resolve().parent / "output"
        out_dir.mkdir(exist_ok=True)
        out_file = out_dir / f"{county['slug']}_cities_schools_education.json"
        out_file.write_text(json.dumps([], indent=2), encoding="utf-8")
        print(f"Wrote empty {out_file}")
        return

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key and not args.dry_run:
        print("OPENAI_API_KEY not set. Aborting.", file=sys.stderr)
        sys.exit(1)

    client = OpenAI(api_key=api_key) if api_key else None
    out_dir = Path(__file__).resolve().parent / "output"
    out_dir.mkdir(exist_ok=True)
    results = []

    for i, city in enumerate(cities):
        name, slug = city["name"], city["slug"]
        prompt = build_prompt(name)
        print(f"[{i+1}/{len(cities)}] {name} ({slug})")
        if args.dry_run:
            continue
        try:
            model = os.getenv("OPENAI_MODEL") or "gpt-4o-mini"
            if model.startswith("gpt-5"):
                model = "gpt-4o-mini"
            r = client.chat.completions.create(
                model=model,
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
            else:
                results.append({"slug": slug, "name": name, "section": "schools_education", "content": text})
        except Exception as e:
            results.append({"slug": slug, "name": name, "error": str(e), "content": None})

    out_file = out_dir / f"{county['slug']}_cities_schools_education.json"
    out_file.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"Saved to {out_file}")


if __name__ == "__main__":
    main()
