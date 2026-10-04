import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Condos for Rent in California | Crown Coastal Homes",
  description: "Browse condos for Rent in California. Find your perfect condo with expert guidance. Schedule a tour or contact a local agent today.",
}

export default function CondosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

