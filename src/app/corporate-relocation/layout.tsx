import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Corporate Relocation Services in California | Crown Coastal Homes",
  description:
    "California corporate relocation real estate support for HR teams and relocating employees seeking rentals, home purchases, and area information.",
  alternates: { canonical: "/corporate-relocation" },
  openGraph: {
    title: "Corporate Relocation Services in California | Crown Coastal Homes",
    description:
      "Relocation real estate support for California companies, HR teams, and moving employees.",
    url: "/corporate-relocation",
  },
};

export default function CorporateRelocationLayout({ children }: { children: ReactNode }) {
  return children;
}
