import CanadaConsultPage, { canadaConsultMetadata } from "@/components/international-buyers/canada-consult-page"

export const metadata = canadaConsultMetadata("san-diego")

export default function Page() {
  return <CanadaConsultPage region="san-diego" />
}
