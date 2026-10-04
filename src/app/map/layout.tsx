import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "California Property Map Search | Crown Coastal Homes",
  description:
    "Search California homes for sale and rent on an interactive map with property filters, photos, prices, and local listing details.",
  alternates: { canonical: "/map" },
  openGraph: {
    title: "California Property Map Search | Crown Coastal Homes",
    description:
      "Explore California homes for sale and rent on an interactive property map.",
    url: "/map",
  },
};

export default function MapLayout({ children }: { children: ReactNode }) {
  return children;
}
