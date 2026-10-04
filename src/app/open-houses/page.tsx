import { permanentRedirect } from "next/navigation"

export default function LegacyOpenHousesPage() {
  permanentRedirect("/open-homes")
}
