#!/usr/bin/env python3
"""
Generate Schools and Education section for Santa Clara County (county-level) landing page.
Uses OpenAI API from .env. Run from repo root: python scripts/santa-clara/generate_santa_clara_county_schools_education.py
"""
import os
import sys
import json
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(REPO_ROOT / ".env")
load_dotenv(REPO_ROOT / ".env.local")

from config import SCHOOLS_EDUCATION_MASTER_PROMPT

PLACE = "Santa Clara County"
STATE = "California"
PAGE_TYPE = "County"
SCHOOL_DISTRICTS = ""
UNIVERSITIES = ""
EDU_NOTES = ""
FOCUS_KEYWORD = ""


def build_prompt():
    return SCHOOLS_EDUCATION_MASTER_PROMPT.format(
        PLACE=PLACE,
        STATE=STATE,
        PAGE_TYPE=PAGE_TYPE,
        SCHOOL_DISTRICTS=SCHOOL_DISTRICTS or "(none provided)",
        UNIVERSITIES=UNIVERSITIES or "(none provided)",
        EDU_NOTES=EDU_NOTES or "(none provided)",
        FOCUS_KEYWORD=FOCUS_KEYWORD or "(none)",
    )


def main():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("OPENAI_API_KEY not set in .env or .env.local. Aborting.", file=sys.stderr)
        sys.exit(1)

    client = OpenAI(api_key=api_key)
    prompt = build_prompt()

    print("Generating Schools and Education for Santa Clara County (county)...")
    try:
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_SANTACLARA_MODEL") or ("gpt-4o-mini" if (os.getenv("OPENAI_MODEL") or "").startswith("gpt-5") else os.getenv("OPENAI_MODEL", "gpt-4o-mini")),
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

        print("\n--- Schools and Education (Santa Clara County) ---\n")
        print(text)
        print("\n--- End ---\n")

        out_dir = Path(__file__).resolve().parent / "output"
        out_dir.mkdir(exist_ok=True)
        out_file = out_dir / "santa_clara_county_schools_education.txt"
        out_file.write_text(text, encoding="utf-8")
        print(f"Saved to {out_file}")

        json_file = out_dir / "santa_clara_county_schools_education.json"
        json_file.write_text(
            json.dumps({"place": PLACE, "page_type": PAGE_TYPE, "section": "schools_education", "content": text}, indent=2),
            encoding="utf-8",
        )
        print(f"Saved to {json_file}")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
