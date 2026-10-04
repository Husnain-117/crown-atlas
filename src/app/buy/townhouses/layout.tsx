import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Townhouses for Sale in California | Crown Coastal Homes",
  description: "Browse townhouses for sale in California. Find your ideal townhouse with expert guidance. Schedule a tour or contact a local agent today.",
}

export default function TownhousesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

