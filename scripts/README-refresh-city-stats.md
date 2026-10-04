# Refreshing City Statistics (Top Neighborhoods table)

The **Top Neighborhoods** table on buy city pages (e.g. `/buy/orange/irvine-ca`) is filled from the `city_statistics` table. Each row’s `top_neighborhoods` JSON includes per-neighborhood:

- **name** – subdivision/neighborhood name  
- **median_price** – median list price  
- **avg_price** – average list price (fallback)  
- **avg_dom** – median days on market (uses `days_on_market` when present, otherwise computed from `listed_at` / `modification_timestamp`)  
- **walk_score** – average walk score (if the `properties` table has a `walk_score` column; otherwise N/A)  
- **count** – listing count  

**Best For** is not in the DB and shows as “Lifestyle fit” unless you add another data source.

## How to fill the table for Orange County (and all cities)

1. **Use the cron endpoint**  
   Trigger the refresh so every city in `COUNTIES` (including all Orange County cities) is updated from the `properties` table:

   ```bash
   curl -X POST "https://YOUR_DEPLOYMENT_URL/api/cron/refresh-city-stats" \
     -H "x-cron-secret: YOUR_CRON_SECRET"
   ```

   Replace `YOUR_DEPLOYMENT_URL` and `YOUR_CRON_SECRET` with the values from your env (e.g. `.env`: `CRON_SECRET`).

2. **What the cron does**  
   For each city it:

   - Reads `properties` (active for-sale, `city` match).
   - Computes city-level stats and **top 8 neighborhoods** by listing count.
   - For each neighborhood: `median_price`, `avg_price`, `count`, `avg_dom` (median days on market).
   - Upserts into `city_statistics` (including `top_neighborhoods`).

3. **After the refresh**  
   Buy city pages will show real Median Price and Avg DOM in the Top Neighborhoods table for any city that has active listings and subdivision data in `properties`.

## Optional: run only for Orange County

The cron refreshes **all** counties. If you only want Orange County updated, you can either:

- Call the same API (it will update Orange County along with others), or  
- Temporarily limit the cron code to Orange County cities and run it once.
