export interface FooterCityLink {
  name: string
  slug: string
}

export interface FooterCountyLink {
  displayName: string
  topCities: FooterCityLink[]
  totalCities: number
}

export const FOOTER_COUNTY_LINKS: Record<string, FooterCountyLink> = {
  "san-diego": {
    displayName: "San Diego County",
    topCities: [
      { name: "San Diego", slug: "san-diego-ca" },
      { name: "Coronado", slug: "coronado-ca" },
      { name: "Del Mar", slug: "del-mar-ca" },
      { name: "Encinitas", slug: "encinitas-ca" },
      { name: "La Jolla", slug: "la-jolla-ca" },
    ],
    totalCities: 18,
  },
  orange: {
    displayName: "Orange County",
    topCities: [
      { name: "Newport Beach", slug: "newport-beach-ca" },
      { name: "Laguna Beach", slug: "laguna-beach-ca" },
      { name: "Irvine", slug: "irvine-ca" },
      { name: "Huntington Beach", slug: "huntington-beach-ca" },
      { name: "Dana Point", slug: "dana-point-ca" },
    ],
    totalCities: 34,
  },
  "los-angeles": {
    displayName: "Los Angeles County",
    topCities: [
      { name: "Beverly Hills", slug: "beverly-hills-ca" },
      { name: "Malibu", slug: "malibu-ca" },
      { name: "Santa Monica", slug: "santa-monica-ca" },
      { name: "Pasadena", slug: "pasadena-ca" },
      { name: "Long Beach", slug: "long-beach-ca" },
    ],
    totalCities: 88,
  },
  riverside: {
    displayName: "Riverside County",
    topCities: [
      { name: "Palm Springs", slug: "palm-springs-ca" },
      { name: "Palm Desert", slug: "palm-desert-ca" },
      { name: "Rancho Mirage", slug: "rancho-mirage-ca" },
      { name: "Temecula", slug: "temecula-ca" },
      { name: "La Quinta", slug: "la-quinta-ca" },
    ],
    totalCities: 27,
  },
  "santa-clara": {
    displayName: "Santa Clara County",
    topCities: [
      { name: "Palo Alto", slug: "palo-alto-ca" },
      { name: "Cupertino", slug: "cupertino-ca" },
      { name: "Los Altos", slug: "los-altos-ca" },
      { name: "Saratoga", slug: "saratoga-ca" },
      { name: "San Jose", slug: "san-jose-ca" },
    ],
    totalCities: 15,
  },
  "san-mateo": {
    displayName: "San Mateo County",
    topCities: [
      { name: "Atherton", slug: "atherton-ca" },
      { name: "Menlo Park", slug: "menlo-park-ca" },
      { name: "Hillsborough", slug: "hillsborough-ca" },
      { name: "Woodside", slug: "woodside-ca" },
      { name: "Burlingame", slug: "burlingame-ca" },
    ],
    totalCities: 20,
  },
  "santa-barbara": {
    displayName: "Santa Barbara County",
    topCities: [
      { name: "Santa Barbara", slug: "santa-barbara-ca" },
      { name: "Montecito", slug: "montecito-ca" },
      { name: "Carpinteria", slug: "carpinteria-ca" },
      { name: "Goleta", slug: "goleta-ca" },
      { name: "Solvang", slug: "solvang-ca" },
    ],
    totalCities: 8,
  },
  // Other counties: show top 3 cities each to keep link count low
  ventura: {
    displayName: "Ventura County",
    topCities: [
      { name: "Ventura", slug: "ventura-ca" },
      { name: "Thousand Oaks", slug: "thousand-oaks-ca" },
      { name: "Camarillo", slug: "camarillo-ca" },
    ],
    totalCities: 9,
  },
  sacramento: {
    displayName: "Sacramento County",
    topCities: [
      { name: "Sacramento", slug: "sacramento-ca" },
      { name: "Elk Grove", slug: "elk-grove-ca" },
      { name: "Folsom", slug: "folsom-ca" },
    ],
    totalCities: 7,
  },
  "san-bernardino": {
    displayName: "San Bernardino County",
    topCities: [
      { name: "San Bernardino", slug: "san-bernardino-ca" },
      { name: "Rancho Cucamonga", slug: "rancho-cucamonga-ca" },
      { name: "Redlands", slug: "redlands-ca" },
    ],
    totalCities: 23,
  },
  alameda: {
    displayName: "Alameda County",
    topCities: [
      { name: "Oakland", slug: "oakland-ca" },
      { name: "Berkeley", slug: "berkeley-ca" },
      { name: "Pleasanton", slug: "pleasanton-ca" },
    ],
    totalCities: 14,
  },
  "contra-costa": {
    displayName: "Contra Costa County",
    topCities: [
      { name: "Walnut Creek", slug: "walnut-creek-ca" },
      { name: "Danville", slug: "danville-ca" },
      { name: "Lafayette", slug: "lafayette-ca" },
    ],
    totalCities: 19,
  },
  marin: {
    displayName: "Marin County",
    topCities: [
      { name: "Mill Valley", slug: "mill-valley-ca" },
      { name: "Sausalito", slug: "sausalito-ca" },
      { name: "San Rafael", slug: "san-rafael-ca" },
    ],
    totalCities: 10,
  },
  monterey: {
    displayName: "Monterey County",
    topCities: [
      { name: "Monterey", slug: "monterey-ca" },
      { name: "Carmel-by-the-Sea", slug: "carmel-by-the-sea-ca" },
      { name: "Pacific Grove", slug: "pacific-grove-ca" },
    ],
    totalCities: 12,
  },
  "san-francisco": {
    displayName: "San Francisco County",
    topCities: [{ name: "San Francisco", slug: "san-francisco-ca" }],
    totalCities: 1,
  },
  sonoma: {
    displayName: "Sonoma County",
    topCities: [
      { name: "Santa Rosa", slug: "santa-rosa-ca" },
      { name: "Healdsburg", slug: "healdsburg-ca" },
      { name: "Sonoma", slug: "sonoma-ca" },
    ],
    totalCities: 9,
  },
  placer: {
    displayName: "Placer County",
    topCities: [
      { name: "Roseville", slug: "roseville-ca" },
      { name: "Rocklin", slug: "rocklin-ca" },
      { name: "Auburn", slug: "auburn-ca" },
    ],
    totalCities: 6,
  },
}

