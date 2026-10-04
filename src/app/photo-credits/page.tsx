import type { Metadata } from "next"

import {
  CALIFORNIA_CITY_IMAGES,
  CALIFORNIA_COUNTY_IMAGES,
} from "@/lib/california-location-images"
import type { CityImage } from "@/lib/city-image"
import { COUNTIES } from "@/lib/counties"

export const metadata: Metadata = {
  title: "Photo Credits | Crown Coastal Homes",
  description:
    "Credits and licenses for California county and city photography used by Crown Coastal Homes.",
  alternates: { canonical: "/photo-credits" },
}

interface CreditImage extends CityImage {
  label: string
}

const creditGroups = COUNTIES.map((county) => {
  const countyImage = CALIFORNIA_COUNTY_IMAGES[county.slug]
  const images: CreditImage[] = [
    ...(countyImage
      ? [
          {
            city: county.name,
            label: `${county.name} overview`,
            src: countyImage.src,
            alt: countyImage.alt,
            attractionLabel: countyImage.attractionLabel,
            creator: countyImage.creator,
            license: countyImage.license,
            licenseUrl: countyImage.licenseUrl,
            sourceUrl: countyImage.sourceUrl,
          },
        ]
      : []),
    ...county.cities
      .map((city) => CALIFORNIA_CITY_IMAGES[city.slug])
      .filter((image): image is CityImage => Boolean(image))
      .sort((a, b) => a.city.localeCompare(b.city))
      .map((image) => ({ ...image, label: image.city })),
  ]

  return { region: county.name, images }
})

export default function PhotoCreditsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] pb-20 pt-28 text-[var(--coastal-text)]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="max-w-3xl border-b border-[var(--coastal-border)] pb-10">
          <p className="text-sm font-semibold uppercase text-[var(--coastal-primary)]">
            Image transparency
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Photo Credits</h1>
          <p className="mt-5 text-lg leading-relaxed text-[var(--coastal-muted-text)]">
            California location photographs below are sourced from Wikimedia Commons.
            Images may be cropped, resized, and converted to WebP for consistent
            presentation and performance.
          </p>
        </header>

        {creditGroups.map((group) => (
          <section key={group.region} className="pt-12">
            <h2 className="text-2xl font-bold">{group.region}</h2>
            <div className="mt-4 divide-y divide-[var(--coastal-border)]">
              {group.images.map((image) => (
                <div
                  key={image.src}
                  className="grid gap-2 py-6 sm:grid-cols-[180px_1fr] sm:gap-6"
                >
                  <h3 className="font-semibold">{image.label}</h3>
                  <p className="leading-7 text-[var(--coastal-muted-text)]">
                    <a
                      className="font-medium text-[var(--coastal-primary)] underline"
                      href={image.sourceUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Original photograph
                    </a>{" "}
                    by {image.creator}. Licensed under{" "}
                    <a
                      className="font-medium text-[var(--coastal-primary)] underline"
                      href={image.licenseUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {image.license}
                    </a>
                    .
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
