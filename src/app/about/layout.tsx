import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About Crown Coastal Homes | California Real Estate",
  description:
    "Learn about Crown Coastal Homes and its licensed California real estate services for buyers and sellers in San Diego and coastal markets.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Crown Coastal Homes | California Real Estate",
    description:
      "Licensed California real estate guidance for buyers and sellers in San Diego and coastal markets.",
    url: "/about",
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
