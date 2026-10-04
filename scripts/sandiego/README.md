# San Diego County SEO Content Scripts

Generate **Schools & Education** and **Lifestyle & Amenities** sections for Crown Coastal Homes San Diego County and city landing pages using the master prompts and OpenAI (API key from `.env`).

## Setup

- **OPENAI_API_KEY** must be set in the repo root `.env` or `.env.local`.
- Optional: **OPENAI_MODEL** (default: `gpt-4o-mini`). If you use `gpt-5-mini`, scripts auto fall back to `gpt-4o-mini` for completions. Optional: **OPENAI_SANDIEGO_MODEL** to override for San Diego only.

Run all commands from the **repo root**:

```bash
cd "d:\New folder (10)\costal-prime-back-new"
```

## Scripts

| Script | Purpose |
|--------|--------|
| `generate_sandiego_county_schools_education.py` | Schools & Education for **San Diego County** (county page) |
| `generate_sandiego_cities_schools_education.py` | Schools & Education for **each San Diego County city** |
| `generate_sandiego_cities_lifestyle_amenities.py` | **Lifestyle & Amenities** for each San Diego County city only |
| `run_all_sandiego_seo.py` | Run county first, then all cities (schools then lifestyle) |
| `upsert_city_lifestyle_to_db.js` | Insert/update `city_lifestyle_research` from output JSON (requires DATABASE_URL) |

## Usage

**1. San Diego County (county) – Schools & Education only**

```bash
python scripts/sandiego/generate_sandiego_county_schools_education.py
```

Output: `scripts/sandiego/output/sandiego_county_schools_education.txt` and `.json`.

**2. All San Diego County cities – Schools & Education**

```bash
# All 18 cities
python scripts/sandiego/generate_sandiego_cities_schools_education.py

# Single city
python scripts/sandiego/generate_sandiego_cities_schools_education.py --city san-diego-ca

# First N cities
python scripts/sandiego/generate_sandiego_cities_schools_education.py --limit 5

# Dry run (no API calls)
python scripts/sandiego/generate_sandiego_cities_schools_education.py --dry-run
```

Output: `scripts/sandiego/output/<city-slug>_schools_education.txt` and `sandiego_cities_schools_education.json`.

**3. All San Diego County cities – Lifestyle & Amenities (city only)**

```bash
python scripts/sandiego/generate_sandiego_cities_lifestyle_amenities.py
python scripts/sandiego/generate_sandiego_cities_lifestyle_amenities.py --city coronado-ca
python scripts/sandiego/generate_sandiego_cities_lifestyle_amenities.py --limit 5
```

Output: `scripts/sandiego/output/<city-slug>_lifestyle_amenities.txt` and `sandiego_cities_lifestyle_amenities.json`.

**4. Run all (county first, then all cities)**

```bash
python scripts/sandiego/run_all_sandiego_seo.py
```

**5. Push city content to database**

After generating, upsert into `city_lifestyle_research`:

```bash
node scripts/sandiego/upsert_city_lifestyle_to_db.js
```

## Master prompts

- **Schools & Education**: `config.py` → `SCHOOLS_EDUCATION_MASTER_PROMPT` (place, state, page type, optional school districts, universities, education notes, focus keyword).
- **Lifestyle & Amenities**: `config.py` → `LIFESTYLE_AMENITIES_MASTER_PROMPT` (place, state). Used for **city** pages only.

Rules: no underscores, no quotation marks, no hyphens; no invented names or stats; Fair Housing compliant; Crown Coastal Homes tone; 180–230 words; structure as in the master prompt.

## Cities (18)

Carlsbad, Chula Vista, Coronado, Del Mar, El Cajon, Encinitas, Escondido, Imperial Beach, La Mesa, Lemon Grove, National City, Oceanside, Poway, San Diego, San Marcos, Santee, Solana Beach, Vista.
