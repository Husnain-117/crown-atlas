interface LeafletMarkerLike {
  getElement(): HTMLElement | undefined
  on(event: string, handler: () => void): unknown
}

/** Adds a stable accessible name to Leaflet's generated marker element. */
export function labelLeafletMarker(marker: LeafletMarkerLike, label: string): void {
  const applyLabel = () => {
    const element = marker.getElement()
    if (!element) return

    element.setAttribute("role", "button")
    element.setAttribute("aria-label", label)
    element.setAttribute("aria-haspopup", "dialog")
    element.setAttribute("aria-expanded", "false")
    element.setAttribute("title", label)
    if (!element.hasAttribute("tabindex")) element.tabIndex = 0
  }

  marker.on("add", applyLabel)
  marker.on("popupopen", () => marker.getElement()?.setAttribute("aria-expanded", "true"))
  marker.on("popupclose", () => marker.getElement()?.setAttribute("aria-expanded", "false"))
  applyLabel()
}
