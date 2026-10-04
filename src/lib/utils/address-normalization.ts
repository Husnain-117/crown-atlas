/**
 * Address normalization and validation utilities
 * Ensures consistent address formatting and filters malformed addresses
 */

/**
 * Normalize address formatting to a consistent standard
 * Handles common formatting issues and inconsistencies
 */
export function normalizeAddress(addr: string): string {
  if (!addr || typeof addr !== 'string') return ''
  
  // Remove leading zeros from street numbers
  let normalized = addr.trim()
    .replace(/^0+(\d+)/, '$1') // Remove leading zeros from numbers
    .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
    .replace(/\s*,\s*/g, ', ') // Normalize comma spacing
    .replace(/\s*#\s*/g, ' #') // Normalize unit/apartment separators
    .replace(/\s*-\s*/g, '-') // Normalize hyphens
    .trim()
  
  // Fix common formatting issues
  normalized = normalized
    .replace(/(\d+)\s+(\d+)\s+([A-Za-z])/g, '$1 $3') // Fix "123 456 St" -> "123 St"
    .replace(/\bSt\s+St\b/gi, 'St') // Remove duplicate "St St"
    .replace(/\bAve\s+Ave\b/gi, 'Ave') // Remove duplicate "Ave Ave"
    .replace(/\bRd\s+Rd\b/gi, 'Rd') // Remove duplicate "Rd Rd"
    .replace(/\bDr\s+Dr\b/gi, 'Dr') // Remove duplicate "Dr Dr"
    .replace(/\bBlvd\s+Blvd\b/gi, 'Blvd') // Remove duplicate "Blvd Blvd"
    .replace(/\bLn\s+Ln\b/gi, 'Ln') // Remove duplicate "Ln Ln"
    .replace(/\bCt\s+Ct\b/gi, 'Ct') // Remove duplicate "Ct Ct"
    .replace(/\bPkwy\s+Pkwy\b/gi, 'Pkwy') // Remove duplicate "Pkwy Pkwy"
    .replace(/\s+/g, ' ') // Final space collapse
    .trim()
  
  return normalized
}

/**
 * Validate address format - returns true if address appears valid
 * Drops malformed, placeholder, or invalid addresses
 */
export function isValidAddress(addr: string): boolean {
  if (!addr || typeof addr !== 'string') return false
  if (addr.length < 5) return false // Too short to be valid
  if (addr.length > 200) return false // Too long, likely malformed
  if (/^[^0-9]*$/.test(addr)) return false // No numbers at all
  if (/^[0-9\s\-]+$/.test(addr)) return false // Only numbers and dashes
  if (/^(null|undefined|n\/a|na|address|unknown|tbd|tba)/i.test(addr.trim())) return false // Placeholder text
  if (/[<>{}[\]\\|`~]/.test(addr)) return false // Invalid characters
  return true
}

/**
 * Deduplicate properties by listing_key
 * Returns a Map of unique properties keyed by listing_key
 */
export function deduplicateProperties<T extends { listing_key: string }>(
  properties: T[]
): T[] {
  const seenIds = new Set<string>()
  const deduplicated: T[] = []
  
  for (const property of properties) {
    const id = property.listing_key
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      continue // Skip properties without valid listing_key
    }
    
    if (seenIds.has(id)) {
      continue // Skip duplicates
    }
    
    seenIds.add(id)
    deduplicated.push(property)
  }
  
  return deduplicated
}

/**
 * Normalize and validate property addresses
 * Returns properties with normalized addresses, filtering out invalid ones
 */
export function normalizePropertyAddresses<T extends { 
  listing_key: string
  unparsed_address?: string
  cleaned_address?: string
  address?: string
}>(
  properties: T[]
): Array<T & { address: string }> {
  return properties
    .map((p) => {
      const rawAddress = p.unparsed_address || p.cleaned_address || p.address || ''
      
      // Validate address
      if (!isValidAddress(rawAddress)) {
        return null
      }
      
      // Normalize address
      const normalizedAddress = normalizeAddress(rawAddress)
      
      return {
        ...p,
        address: normalizedAddress,
      }
    })
    .filter((p): p is T & { address: string } => p !== null)
}


