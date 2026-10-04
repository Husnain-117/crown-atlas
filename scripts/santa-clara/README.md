# Santa Clara County SEO Content Scripts

Generate **Schools & Education** and **Lifestyle & Amenities** sections for Crown Coastal Homes Santa Clara County and city landing pages using the master prompts and OpenAI (API key from `.env`).

## Setup

- **OPENAI_API_KEY** in repo root `.env` or `.env.local`.
- Optional: **OPENAI_SANTACLARA_MODEL** to override model for Santa Clara scripts.

Run from **repo root**.

## Scripts

| Script | Purpose |
|--------|--------|
| `generate_santa_clara_county_schools_education.py` | Schools & Education for **Santa Clara County** (county page) |
| `generate_santa_clara_cities_schools_education.py` | Schools & Education for **each** Santa Clara County city |
| `generate_santa_clara_cities_lifestyle_amenities.py` | **Lifestyle & Amenities** for each city only |
| `run_all_santa_clara_seo.py` | Run county first, then all cities (schools then lifestyle) |
| `upsert_city_lifestyle_to_db.js` | Upsert generated city content into `city_lifestyle_research` (DATABASE_URL required) |

## Usage

```bash
# County only
python scripts/santa-clara/generate_santa_clara_county_schools_education.py

# All 15 cities – schools
python scripts/santa-clara/generate_santa_clara_cities_schools_education.py

# All 15 cities – lifestyle
python scripts/santa-clara/generate_santa_clara_cities_lifestyle_amenities.py

# Run all in order
python scripts/santa-clara/run_all_santa_clara_seo.py

# Push to DB
node scripts/santa-clara/upsert_city_lifestyle_to_db.js
```

Single city: `--city san-jose-ca`. Limit: `--limit 5`. Dry run: `--dry-run`.

## Cities (15)

Campbell, Cupertino, Gilroy, Los Altos, Los Altos Hills, Los Gatos, Milpitas, Monte Sereno, Morgan Hill, Mountain View, Palo Alto, San Jose, Santa Clara, Saratoga, Sunnyvale.
