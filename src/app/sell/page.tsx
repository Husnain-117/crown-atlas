import type { Metadata } from "next"
import SellPageClient from "./SellPageClient"

// Static marketing page — revalidate once per day.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Sell Your Home in California | Crown Coastal Homes",
  description:
    "Sell your California coastal property with confidence. Expert marketing, competitive pricing, and personalized service. Get your free home valuation today.",
  alternates: { canonical: "/sell" },
}

export default function SellPage() {
  return <SellPageClient />
}
