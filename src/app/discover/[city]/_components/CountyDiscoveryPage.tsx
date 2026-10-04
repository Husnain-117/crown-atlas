/**
 * CountyDiscoveryPage — thin wrapper to avoid SWC JSX parse error in this file.
 * Actual implementation is in CountyDiscoveryPageContent.tsx.
 */

import React from "react"
import CountyDiscoveryPageContent, { type Props } from "./CountyDiscoveryPageContent"

export type { Props }

export default function CountyDiscoveryPage(props: Props) {
  return React.createElement(CountyDiscoveryPageContent, props)
}
