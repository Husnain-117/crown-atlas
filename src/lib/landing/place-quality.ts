/** MLS missing-value labels are not places, even when supplied by a database. */
export function isPlaceholderPlace(value: string): boolean {
  const normalized = value.toLowerCase().replace(/&nbsp;|&#160;/g, " ").replace(/[_\-/]/g, " ").replace(/\s+/g, " ").trim()
  return /^(?:not applicable|not listed|not provided|not specified|not available|unknown|other|none|n a|na|null|undefined|0|see remarks|see supplement)$/.test(normalized)
}

export function hasPlaceholderPlaceText(value: string): boolean {
  return /\b(?:not[\s_-]+applicable|not[\s_-]+listed|not[\s_-]+specified|not[\s_-]+provided)\b/i.test(value.replace(/&nbsp;|&#160;/g, " "))
}
