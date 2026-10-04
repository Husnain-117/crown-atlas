import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Compare California Homes | Crown Coastal Homes",
  description:
    "Compare selected California homes side by side with pricing, photos, features, and property details from Crown Coastal Homes.",
  alternates: { canonical: "/compare" },
  robots: { index: false, follow: true },
};

export default function CompareLayout({ children }: { children: ReactNode }) {
  return children;
}
