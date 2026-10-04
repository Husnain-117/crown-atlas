import CanadaConsultPage, { canadaConsultMetadata } from "@/components/international-buyers/canada-consult-page"

export const metadata = canadaConsultMetadata("santa-barbara")

export default function Page() {
  return <CanadaConsultPage region="santa-barbara" />
}
