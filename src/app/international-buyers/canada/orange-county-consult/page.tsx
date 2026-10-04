import CanadaConsultPage, { canadaConsultMetadata } from "@/components/international-buyers/canada-consult-page"

export const metadata = canadaConsultMetadata("orange-county")

export default function Page() {
  return <CanadaConsultPage region="orange-county" />
}
