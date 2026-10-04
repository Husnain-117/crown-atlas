#!/usr/bin/env python3
"""
Run Santa Clara County SEO generation in order: county Schools & Education, then all cities Schools & Education, then all cities Lifestyle & Amenities.
Uses OpenAI from .env. Run from repo root: python scripts/santa-clara/run_all_santa_clara_seo.py [--limit N]
"""
import sys
import subprocess
import argparse
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent


def run(cmd, description):
    print(f"\n{'='*60}\n{description}\n{'='*60}\n")
    result = subprocess.run(cmd, shell=False, cwd=Path(__file__).resolve().parent.parent)
    if result.returncode != 0:
        print(f"Failed: {description} (exit code {result.returncode})", file=sys.stderr)
        sys.exit(result.returncode)


def main():
    parser = argparse.ArgumentParser(description="Run all Santa Clara County SEO scripts in order")
    parser.add_argument("--limit", type=int, help="Limit cities (for city scripts only)")
    args = parser.parse_args()

    run(
        [sys.executable, str(SCRIPT_DIR / "generate_santa_clara_county_schools_education.py")],
        "1. Santa Clara County (county) – Schools & Education",
    )

    cmd = [sys.executable, str(SCRIPT_DIR / "generate_santa_clara_cities_schools_education.py")]
    if args.limit:
        cmd.extend(["--limit", str(args.limit)])
    run(cmd, "2. Santa Clara County cities – Schools & Education")

    cmd = [sys.executable, str(SCRIPT_DIR / "generate_santa_clara_cities_lifestyle_amenities.py")]
    if args.limit:
        cmd.extend(["--limit", str(args.limit)])
    run(cmd, "3. Santa Clara County cities – Lifestyle & Amenities")

    print("\nAll Santa Clara County SEO steps completed.\n")


if __name__ == "__main__":
    main()
