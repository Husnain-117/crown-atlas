import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Homes for Sale in California | Crown Coastal Homes",
  description: "Browse houses for sale in California. Find your dream home with expert guidance. Schedule a tour or contact a local agent today.",
}

export default function HousesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

