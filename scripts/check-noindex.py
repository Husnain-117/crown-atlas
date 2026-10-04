#!/usr/bin/env python3
"""
check-noindex.py — Batch noindex verifier for Crown Coastal Homes
=================================================================
Reads the Google Search Console Table.csv export (list of affected URLs),
fetches each URL, and checks for noindex directives in BOTH:
  1. HTTP response header:  X-Robots-Tag: noindex
  2. HTML <meta name="robots" content="noindex"> tag

Usage:
    pip install requests beautifulsoup4
    python scripts/check-noindex.py [path/to/Table.csv]

Default CSV path:
    https___crowncoastalhomes.com_-Coverage-Drilldown-2026-05-09/Table.csv

Output:
    - Prints a line per URL: PASS / NOINDEX (header) / NOINDEX (meta) / ERROR
    - Prints a summary at the end: total checked, total still noindex, total fixed
"""

import sys
import csv
import time
import re
import concurrent.futures
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("ERROR: Missing dependencies. Run: pip install requests beautifulsoup4")
    sys.exit(1)

# ── Configuration ────────────────────────────────────────────────────────────

DEFAULT_CSV = (
    Path(__file__).parent.parent
    / "https___crowncoastalhomes.com_-Coverage-Drilldown-2026-05-09"
    / "Table.csv"
)

REQUEST_TIMEOUT = 15        # seconds per request
MAX_WORKERS = 10            # concurrent requests (be polite to your own server)
DELAY_BETWEEN_BATCHES = 1   # seconds between worker batches
USER_AGENT = (
    "Mozilla/5.0 (compatible; NoindexChecker/1.0; "
    "+https://crowncoastalhomes.com/about)"
)

# ── Helpers ──────────────────────────────────────────────────────────────────

def is_noindex_header(headers: dict) -> bool:
    """Check X-Robots-Tag HTTP header for noindex directive."""
    xrt = headers.get("x-robots-tag", "").lower()
    return "noindex" in xrt


def is_noindex_meta(html: str) -> bool:
    """Check <meta name="robots"> in HTML for noindex directive."""
    try:
        soup = BeautifulSoup(html, "html.parser")
        for tag in soup.find_all("meta"):
            name = (tag.get("name") or tag.get("property") or "").lower()
            if name in ("robots", "googlebot"):
                content = (tag.get("content") or "").lower()
                if "noindex" in content:
                    return True
    except Exception:
        pass
    return False


def check_url(url: str) -> dict:
    """Fetch a URL and return its noindex status."""
    result = {"url": url, "status": "UNKNOWN", "http_code": None, "detail": ""}
    try:
        resp = requests.get(
            url,
            timeout=REQUEST_TIMEOUT,
            headers={"User-Agent": USER_AGENT},
            allow_redirects=True,
        )
        result["http_code"] = resp.status_code

        if resp.status_code >= 400:
            result["status"] = f"HTTP_{resp.status_code}"
            return result

        header_noindex = is_noindex_header(dict(resp.headers))
        meta_noindex = is_noindex_meta(resp.text)

        if header_noindex and meta_noindex:
            result["status"] = "NOINDEX (header + meta)"
        elif header_noindex:
            result["status"] = "NOINDEX (header)"
        elif meta_noindex:
            result["status"] = "NOINDEX (meta)"
        else:
            result["status"] = "PASS"

    except requests.exceptions.Timeout:
        result["status"] = "ERROR"
        result["detail"] = "timeout"
    except requests.exceptions.ConnectionError as exc:
        result["status"] = "ERROR"
        result["detail"] = str(exc)[:80]
    except Exception as exc:
        result["status"] = "ERROR"
        result["detail"] = str(exc)[:80]

    return result


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    csv_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_CSV

    if not csv_path.exists():
        print(f"ERROR: CSV file not found: {csv_path}")
        print(f"Usage: python scripts/check-noindex.py [path/to/Table.csv]")
        sys.exit(1)

    # Read URLs from CSV (first column, skip header)
    urls = []
    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            if i == 0:
                continue  # skip header
            if row and row[0].startswith("http"):
                urls.append(row[0].strip())

    if not urls:
        print("ERROR: No URLs found in CSV file.")
        sys.exit(1)

    print(f"Checking {len(urls)} URLs from: {csv_path.name}")
    print(f"Using {MAX_WORKERS} concurrent workers\n")
    print(f"{'STATUS':<30} {'HTTP':<6} {'URL'}")
    print("-" * 100)

    counters = {"PASS": 0, "NOINDEX": 0, "HTTP_ERR": 0, "ERROR": 0}
    noindex_urls = []

    # Process in batches to avoid hammering the server
    batch_size = MAX_WORKERS
    for i in range(0, len(urls), batch_size):
        batch = urls[i : i + batch_size]
        with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
            futures = {ex.submit(check_url, url): url for url in batch}
            for future in concurrent.futures.as_completed(futures):
                r = future.result()
                http = str(r["http_code"]) if r["http_code"] else "—"
                detail = f"  [{r['detail']}]" if r["detail"] else ""
                print(f"{r['status']:<30} {http:<6} {r['url']}{detail}")

                if r["status"] == "PASS":
                    counters["PASS"] += 1
                elif "NOINDEX" in r["status"]:
                    counters["NOINDEX"] += 1
                    noindex_urls.append(r["url"])
                elif r["status"].startswith("HTTP_"):
                    counters["HTTP_ERR"] += 1
                else:
                    counters["ERROR"] += 1

        if i + batch_size < len(urls):
            time.sleep(DELAY_BETWEEN_BATCHES)

    # Summary
    total = len(urls)
    print("\n" + "=" * 100)
    print(f"SUMMARY — {total} URLs checked")
    print(f"  ✅  PASS (indexable):   {counters['PASS']:>4}  ({counters['PASS']/total*100:.1f}%)")
    print(f"  ❌  Still NOINDEX:      {counters['NOINDEX']:>4}  ({counters['NOINDEX']/total*100:.1f}%)")
    print(f"  ⚠️   HTTP errors (4xx+): {counters['HTTP_ERR']:>4}")
    print(f"  💥  Request errors:     {counters['ERROR']:>4}")

    if noindex_urls:
        print(f"\nURLs still showing noindex ({len(noindex_urls)}):")
        for url in noindex_urls[:20]:
            print(f"  {url}")
        if len(noindex_urls) > 20:
            print(f"  ... and {len(noindex_urls) - 20} more")

        # Write to file for further action
        out_path = csv_path.parent / "still-noindex.txt"
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("\n".join(noindex_urls))
        print(f"\nFull list saved to: {out_path}")
    else:
        print("\n🎉 All checked URLs are now indexable! Submit 'Validate Fix' in Google Search Console.")


if __name__ == "__main__":
    main()
