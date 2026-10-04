import type { MetadataRoute } from "next";
import { CANADA_CAMPAIGN_PATHS } from "@/lib/canada-campaign-seo";
import { BUYER_LOCATIONS } from "@/lib/international-buyer-locations";
import { BUYER_MARKETS } from "@/lib/international-buyer-markets";
import { COUNTIES } from "@/lib/counties";
import { SITE_URL } from "@/lib/constants/site";
import { getPublishedArticleSitemapRows } from "@/lib/blog-postgres";
import {
  isPriorityCitySlug,
  PRIORITY_CITY_SLUGS,
  PRIORITY_COUNTY_SLUGS,
  PRIORITY_LANDING_SLUGS,
} from "@/lib/seo/priority-locations";
import { canonicalCityFacetPath, resolveCanonicalCityLocation } from "@/lib/seo/location-canonical";

export const revalidate = 3600;

const BLOG_SITEMAP_LIMIT = 45000;

const STATIC_ROUTES = [
  "/",
  "/about",
  "/about/data-methodology",
  "/about/facts",
  "/accessibility",
  "/affordability-calculator",
  "/agents",
  "/buyers-guide",
  "/blogs",
  "/buy",
  "/buy/condos",
  "/buy/houses",
  "/buy/land",
  "/buy/luxury",
  "/buy/manufactured",
  "/buy/townhouses",
  "/buy/under-1m",
  "/buy/waterfront",
  "/closing-cost-estimator",
  "/contact",
  "/corporate-relocation",
  "/discover/san-diego/neighborhoods",
  "/faq",
  "/fair-housing",
  "/home-valuation",
  "/international-buyers/uk",
  "/international-buyers/uk/san-diego",
  "/international-buyers/germany",
  "/international-buyers/germany/san-diego",
  "/international-buyers/canada",
  "/international-buyers/canada/san-diego",
  "/map",
  "/market-reports",
  "/mortgage-calculator",
  "/neighborhoods",
  "/new-construction",
  "/new-listings",
  "/open-homes",
  "/privacy",
  "/properties",
  "/rent",
  "/rent/commercial",
  "/rent/condos",
  "/rent/houses",
  "/rent/land",
  "/rent/luxury",
  "/rent/manufactured",
  "/rent/townhouses",
  "/rent/under-1m",
  "/rent/waterfront",
  "/sell",
  "/services",
  "/services/affiliates",
  "/services/concierge-home-buying",
  "/services/investment",
  "/services/relocation",
  "/site-map",
  "/sold",
  "/team/reza-barghlameno",
  "/terms",
  "/testimonials",
];

function entry(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly"
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  };
}

async function getBlogEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const articles = await getPublishedArticleSitemapRows(BLOG_SITEMAP_LIMIT);

    return articles.map((article) => ({
      url: `${SITE_URL}/blogs/${article.slug}`,
      lastModified: article.updatedAt ? new Date(article.updatedAt) : new Date(article.publishedAt),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (error) {
    console.warn(
      "[sitemap] Skipping blog URLs:",
      error instanceof Error ? error.message : error
    );
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = new Map<string, MetadataRoute.Sitemap[number]>();
  const add = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly"
  ) => {
    if (!entries.has(path)) {
      entries.set(path, entry(path, priority, changeFrequency));
    }
  };

  STATIC_ROUTES.forEach((path) => {
    add(path, path === "/" ? 1 : 0.7);
  });

  CANADA_CAMPAIGN_PATHS.forEach((path) => add(path, 0.7));

  Object.values(BUYER_MARKETS).forEach((market) => {
    BUYER_LOCATIONS.forEach((location) => add(`${market.path}/${location.slug}`, 0.7));
  });

  COUNTIES.filter((county) => PRIORITY_COUNTY_SLUGS.includes(county.slug as typeof PRIORITY_COUNTY_SLUGS[number])).forEach((county) => {
    add(`/buy/${county.slug}`, 0.85, "daily");
    add(`/rent/${county.slug}`, 0.78, "daily");

    county.cities.filter((city) => isPriorityCitySlug(city.slug)).forEach((city) => {
      add(`/buy/${county.slug}/${city.slug}`, 0.8, "daily");
      add(`/rent/${county.slug}/${city.slug}`, 0.7, "daily");
    });
  });

  PRIORITY_CITY_SLUGS.forEach((citySlug) => {
    const location = resolveCanonicalCityLocation(citySlug);
    if (!location) return;

    PRIORITY_LANDING_SLUGS.forEach((landingSlug) => {
      if (landingSlug === "homes-for-sale") return;
      add(canonicalCityFacetPath(location, landingSlug), 0.65, "weekly");
    });
  });

  for (const blogEntry of await getBlogEntries()) {
    entries.set(blogEntry.url, blogEntry);
  }

  return Array.from(entries.values());
}
