#!/usr/bin/env python3
"""
Run SEO generation for a batch of counties (county schools, then cities schools, then cities lifestyle).
Usage:
  python scripts/county_seo/run_batch.py --batch 1   # first 10 counties
  python scripts/county_seo/run_batch.py --county santa-barbara   # single county
"""
import argparse
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent

from manifest import get_batch, get_county, REMAINING_COUNTIES, BATCH_SIZE


def run(cmd: list) -> bool:
    print("Running:", " ".join(cmd))
    r = subprocess.run(cmd, cwd=REPO_ROOT)
    return r.returncode == 0


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch", type=int, help="Batch number (1-based). Batch 6 = counties 51-53.")
    parser.add_argument("--county", help="Single county slug (e.g. santa-barbara)")
    args = parser.parse_args()

    if args.county:
        county = get_county(args.county)
        if not county:
            print(f"Unknown county: {args.county}", file=sys.stderr)
            sys.exit(1)
        counties = [county]
    elif args.batch is not None:
        counties = get_batch(args.batch)
        if not counties:
            print(f"No counties in batch {args.batch}", file=sys.stderr)
            sys.exit(1)
        print(f"Batch {args.batch}: {[c['slug'] for c in counties]}")
    else:
        print("Provide --batch N or --county slug", file=sys.stderr)
        sys.exit(1)

    for county in counties:
        slug = county["slug"]
        print("\n---", county["name"], "---")

        if not run([sys.executable, str(SCRIPT_DIR / "generate_county_schools.py"), "--county", slug]):
            print(f"Failed county schools for {slug}", file=sys.stderr)
            sys.exit(1)

        if not run([sys.executable, str(SCRIPT_DIR / "generate_cities_schools.py"), "--county", slug]):
            print(f"Failed cities schools for {slug}", file=sys.stderr)
            sys.exit(1)

        if not run([sys.executable, str(SCRIPT_DIR / "generate_cities_lifestyle.py"), "--county", slug]):
            print(f"Failed cities lifestyle for {slug}", file=sys.stderr)
            sys.exit(1)

    print("\nDone. Run upsert_batch.js to push to DB.")


if __name__ == "__main__":
    main()
