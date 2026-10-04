#!/usr/bin/env python3
"""
Generate Schools and Education section for one county (county-level).
Usage: python scripts/county_seo/generate_county_schools.py --county santa-barbara
"""
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
PAGE_TYPE = "County"
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
    parser.add_argument("--county", required=True, help="County slug (e.g. santa-barbara)")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    county = get_county(args.county)
    if not county:
        print(f"Unknown county: {args.county}", file=sys.stderr)
        sys.exit(1)

    place = county["name"]
    slug = county["slug"]

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key and not args.dry_run:
        print("OPENAI_API_KEY not set. Aborting.", file=sys.stderr)
        sys.exit(1)

    prompt = build_prompt(place)
    if args.dry_run:
        print(prompt[:800] + "..." if len(prompt) > 800 else prompt)
        return

    client = OpenAI(api_key=api_key)
    print(f"Generating Schools and Education for {place}...")
    try:
        model = os.getenv("OPENAI_MODEL") or "gpt-4o-mini"
        if model.startswith("gpt-5"):
            model = "gpt-4o-mini"
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an expert real estate copywriter. Return only the section text, no meta commentary."},
                {"role": "user", "content": prompt},
            ],
            temperature=1,
            max_completion_tokens=600,
        )
        text = (response.choices[0].message.content or "").strip()
        if not text:
            print("Empty response from OpenAI.", file=sys.stderr)
            sys.exit(1)

        out_dir = Path(__file__).resolve().parent / "output"
        out_dir.mkdir(exist_ok=True)
        base = slug
        out_file = out_dir / f"{base}_county_schools_education.txt"
        out_file.write_text(text, encoding="utf-8")
        print(f"Saved to {out_file}")

        json_file = out_dir / f"{base}_county_schools_education.json"
        json_file.write_text(
            json.dumps({"place": place, "page_type": PAGE_TYPE, "section": "schools_education", "content": text}, indent=2),
            encoding="utf-8",
        )
        print(f"Saved to {json_file}")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
