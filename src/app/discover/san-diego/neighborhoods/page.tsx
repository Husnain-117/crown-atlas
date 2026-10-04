import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Home, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "San Diego Neighborhood Guide | Crown Coastal Homes",
  description:
    "Explore San Diego neighborhoods by location and local features, then compare current CRMLS listings for each area.",
  openGraph: {
    title: "San Diego Neighborhood Guide | Crown Coastal Homes",
    description: "Explore San Diego areas and compare current CRMLS listings.",
  },
  alternates: { canonical: "/discover/san-diego/neighborhoods" },
}

interface Neighborhood {
  name: string
  summary: string
  features: string[]
}

interface NeighborhoodGroup {
  title: string
  description: string
  neighborhoods: Neighborhood[]
}

const neighborhoodGroups: NeighborhoodGroup[] = [
  {
    title: "Coastal Areas",
    description: "Communities along the Pacific coast and San Diego Bay.",
    neighborhoods: [
      {
        name: "La Jolla",
        summary: "A coastal area with village shopping, beaches, and a mix of condominium and single-family inventory.",
        features: ["La Jolla Cove", "Village commercial district", "Coastal access"],
      },
      {
        name: "Pacific Beach",
        summary: "A beach community organized around the shoreline, boardwalk, and commercial corridors.",
        features: ["Pacific Beach", "Oceanfront boardwalk", "Mission Bay access"],
      },
      {
        name: "Ocean Beach",
        summary: "A coastal community west of Point Loma with a compact commercial district and beach access.",
        features: ["Ocean Beach", "Newport Avenue", "Sunset Cliffs proximity"],
      },
      {
        name: "Mission Beach",
        summary: "A narrow coastal community between the Pacific Ocean and Mission Bay.",
        features: ["Belmont Park", "Oceanfront boardwalk", "Mission Bay"],
      },
      {
        name: "Point Loma",
        summary: "A peninsula community bordering the Pacific, San Diego Bay, and the harbor.",
        features: ["Cabrillo National Monument", "Liberty Station proximity", "Harbor access"],
      },
    ],
  },
  {
    title: "Central & Urban Areas",
    description: "Denser neighborhoods near downtown, Balboa Park, and central commercial districts.",
    neighborhoods: [
      {
        name: "Downtown / Gaslamp",
        summary: "An urban district with condominium inventory near employment, dining, and event venues.",
        features: ["Gaslamp Quarter", "Petco Park", "Trolley access"],
      },
      {
        name: "Little Italy",
        summary: "A downtown-adjacent district with condominium inventory and a walkable commercial core.",
        features: ["India Street", "Waterfront proximity", "Little Italy Mercato"],
      },
      {
        name: "East Village",
        summary: "A downtown neighborhood with high-rise, mid-rise, and loft-style housing.",
        features: ["Petco Park", "Central Library", "Trolley access"],
      },
      {
        name: "Hillcrest",
        summary: "A central neighborhood near Balboa Park with condominium, apartment, and single-family options.",
        features: ["University Avenue", "Balboa Park proximity", "Bus routes"],
      },
      {
        name: "North Park",
        summary: "A central neighborhood with older homes, multifamily properties, and commercial corridors.",
        features: ["30th Street", "University Avenue", "Balboa Park proximity"],
      },
    ],
  },
  {
    title: "Northern & Inland Areas",
    description: "Neighborhoods north and inland from San Diego's central and coastal districts.",
    neighborhoods: [
      {
        name: "Carmel Valley",
        summary: "A northern San Diego community with planned residential areas and nearby employment centers.",
        features: ["State Route 56 access", "Torrey Hills proximity", "Shopping centers"],
      },
      {
        name: "Rancho Bernardo",
        summary: "An inland North County community with condominium, townhome, and single-family inventory.",
        features: ["Interstate 15 access", "Community parks", "Commercial centers"],
      },
      {
        name: "Scripps Ranch",
        summary: "A residential area east of Interstate 15 with planned neighborhoods and open-space access.",
        features: ["Lake Miramar", "Interstate 15 access", "Community parks"],
      },
      {
        name: "University City",
        summary: "A northern central area near major employment, education, retail, and transit connections.",
        features: ["UC San Diego proximity", "UTC transit center", "Interstate 5 access"],
      },
    ],
  },
]

const allNeighborhoods = neighborhoodGroups.flatMap((group) => group.neighborhoods)

function listingHref(name: string) {
  return `/properties?city=${encodeURIComponent("San Diego")}&neighborhood=${encodeURIComponent(name)}`
}

export default function SanDiegoNeighborhoodsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] pt-28 sm:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "San Diego neighborhood guide",
            itemListElement: allNeighborhoods.map((neighborhood, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: neighborhood.name,
              url: `https://crowncoastalhomes.com${listingHref(neighborhood.name)}`,
            })),
          }).replace(/</g, "\\u003c"),
        }}
      />

      <header className="border-b border-[var(--coastal-border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <nav className="mb-5 flex items-center gap-2 text-sm text-[var(--coastal-muted-text)]" aria-label="Breadcrumb">
            <Link href="/discover/san-diego" className="hover:text-[var(--coastal-primary)]">San Diego</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Neighborhoods</span>
          </nav>
          <h1 className="max-w-4xl text-3xl font-bold text-[var(--coastal-text)] sm:text-4xl lg:text-5xl">
            San Diego Neighborhood Guide
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--coastal-muted-text)] sm:text-lg">
            Start with location and local features, then compare current CRMLS listings, ownership costs,
            property condition, commute routes, and the address-specific factors important to you.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {neighborhoodGroups.map((group) => (
          <section key={group.title} aria-labelledby={group.title.replaceAll(" ", "-").toLowerCase()}>
            <div className="mb-6 flex items-start gap-3">
              <MapPin className="mt-1 h-6 w-6 shrink-0 text-[var(--coastal-primary)]" aria-hidden="true" />
              <div>
                <h2 id={group.title.replaceAll(" ", "-").toLowerCase()} className="text-2xl font-semibold text-[var(--coastal-text)] sm:text-3xl">
                  {group.title}
                </h2>
                <p className="mt-2 text-[var(--coastal-muted-text)]">{group.description}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.neighborhoods.map((neighborhood) => (
                <article key={neighborhood.name} className="rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-5">
                  <h3 className="text-lg font-semibold text-[var(--coastal-text)]">{neighborhood.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--coastal-muted-text)]">{neighborhood.summary}</p>
                  <ul className="mt-4 space-y-2 text-sm text-[var(--coastal-muted-text)]">
                    {neighborhood.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--coastal-secondary)]" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={listingHref(neighborhood.name)}
                    className="mt-5 inline-flex min-h-11 items-center gap-2 font-medium text-[var(--coastal-primary)] hover:underline"
                  >
                    View current listings
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="border-t border-[var(--coastal-border)] pt-10 text-center">
          <h2 className="text-2xl font-semibold text-[var(--coastal-text)] sm:text-3xl">Compare Current San Diego Inventory</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[var(--coastal-muted-text)]">
            Listing availability and property details can change. Review the data methodology and verify material facts before making a decision.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/properties?city=San%20Diego" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--coastal-primary)] px-6 py-3 font-semibold text-white hover:opacity-90">
              <Home className="h-5 w-5" aria-hidden="true" />
              View San Diego listings
            </Link>
            <Link href="/about/data-methodology" className="inline-flex min-h-12 items-center justify-center rounded-md border border-[var(--coastal-border)] bg-[var(--surface)] px-6 py-3 font-semibold text-[var(--coastal-text)] hover:bg-[var(--surface-muted)]">
              Data methodology
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
