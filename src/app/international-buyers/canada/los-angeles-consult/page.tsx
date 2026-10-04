import CanadaConsultPage, { canadaConsultMetadata } from "@/components/international-buyers/canada-consult-page"

export const metadata = canadaConsultMetadata("los-angeles")

export default function Page() {
  return <CanadaConsultPage region="los-angeles" />
}
