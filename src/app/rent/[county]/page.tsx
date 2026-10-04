import { Suspense } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getCounty } from "@/lib/counties"
import CountyRentSuspenseLoader from "../_components/CountyRentSuspenseLoader"
import CountyRentSkeleton from "../_components/CountyRentSkeleton"

export const revalidate = 7200

export async function generateMetadata({ params }: { params: Promise<{ county: string }> }): Promise<Metadata> {
  const { county } = await params
  const countyData = getCounty(county)
  if (!countyData) {
    return {
      title: "County Not Found | Crown Coastal Homes",
      description: "Browse California counties and find homes for rent."
    }
  }
  const title = `Homes for Rent in ${countyData.name}, CA | Crown Coastal Homes`
  const description = `Find current rental properties across ${countyData.name}, CA. Browse available houses, condos, and apartments from the CRMLS listing feed.`
  const canonical = `https://crowncoastalhomes.com/rent/${countyData.slug}`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical }
  }
}

export default async function CountyRentPage({
  params,
  searchParams
}: {
  params: Promise<{ county: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { county } = await params
  const countyData = getCounty(county)
  if (!countyData) notFound()

  const displayName = countyData.name
  const query = await searchParams
  const page = Number(query.page || 1)

  return (
    <Suspense fallback={<CountyRentSkeleton />}>
      <CountyRentSuspenseLoader
        countyData={countyData}
        displayName={displayName}
        query={query}
        page={page}
      />
    </Suspense>
  )
}
