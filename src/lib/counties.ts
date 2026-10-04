export interface CountyCity {
  name: string
  slug: string
  displayName: string
  zipCodes?: string[]
}

export interface CountyConfig {
  slug: string
  name: string
  state: string
  cities: CountyCity[]
}

const SAN_DIEGO_CITIES: CountyCity[] = [
  { name: "Carlsbad", slug: "carlsbad-ca", displayName: "Carlsbad, CA", zipCodes: ["92008", "92009", "92010", "92011"] },
  { name: "Chula Vista", slug: "chula-vista-ca", displayName: "Chula Vista, CA", zipCodes: ["91910", "91911", "91913", "91914", "91915"] },
  { name: "Coronado", slug: "coronado-ca", displayName: "Coronado, CA", zipCodes: ["92118"] },
  { name: "Del Mar", slug: "del-mar-ca", displayName: "Del Mar, CA", zipCodes: ["92014"] },
  { name: "El Cajon", slug: "el-cajon-ca", displayName: "El Cajon, CA", zipCodes: ["92019", "92020", "92021"] },
  { name: "Encinitas", slug: "encinitas-ca", displayName: "Encinitas, CA", zipCodes: ["92024"] },
  { name: "Escondido", slug: "escondido-ca", displayName: "Escondido, CA", zipCodes: ["92025", "92026", "92027", "92029"] },
  { name: "Imperial Beach", slug: "imperial-beach-ca", displayName: "Imperial Beach, CA", zipCodes: ["91932"] },
  { name: "La Jolla", slug: "la-jolla-ca", displayName: "La Jolla, CA", zipCodes: ["92037"] },
  { name: "La Mesa", slug: "la-mesa-ca", displayName: "La Mesa, CA", zipCodes: ["91941", "91942"] },
  { name: "Lemon Grove", slug: "lemon-grove-ca", displayName: "Lemon Grove, CA", zipCodes: ["91945"] },
  { name: "National City", slug: "national-city-ca", displayName: "National City, CA", zipCodes: ["91950"] },
  { name: "Oceanside", slug: "oceanside-ca", displayName: "Oceanside, CA", zipCodes: ["92054", "92056", "92057", "92058"] },
  { name: "Poway", slug: "poway-ca", displayName: "Poway, CA", zipCodes: ["92064"] },
  { name: "San Diego", slug: "san-diego-ca", displayName: "San Diego, CA", zipCodes: ["92101", "92103", "92104", "92105", "92106", "92107", "92108", "92109", "92110", "92111", "92113", "92114", "92115", "92116", "92117", "92119", "92120", "92121", "92122", "92123", "92124", "92126", "92127", "92128", "92129", "92130", "92131", "92139", "92154"] },
  { name: "San Marcos", slug: "san-marcos-ca", displayName: "San Marcos, CA", zipCodes: ["92069", "92078", "92096"] },
  { name: "Santee", slug: "santee-ca", displayName: "Santee, CA", zipCodes: ["92071"] },
  { name: "Solana Beach", slug: "solana-beach-ca", displayName: "Solana Beach, CA", zipCodes: ["92075"] },
  { name: "Vista", slug: "vista-ca", displayName: "Vista, CA", zipCodes: ["92081", "92083", "92084"] }
]

const ORANGE_COUNTY_CITIES: CountyCity[] = [
  { name: "Aliso Viejo", slug: "aliso-viejo-ca", displayName: "Aliso Viejo, CA", zipCodes: ["92656"] },
  { name: "Anaheim", slug: "anaheim-ca", displayName: "Anaheim, CA", zipCodes: ["92801", "92802", "92804", "92805", "92806", "92807", "92808"] },
  { name: "Brea", slug: "brea-ca", displayName: "Brea, CA", zipCodes: ["92821", "92823"] },
  { name: "Buena Park", slug: "buena-park-ca", displayName: "Buena Park, CA", zipCodes: ["90620", "90621"] },
  { name: "Costa Mesa", slug: "costa-mesa-ca", displayName: "Costa Mesa, CA", zipCodes: ["92626", "92627"] },
  { name: "Cypress", slug: "cypress-ca", displayName: "Cypress, CA", zipCodes: ["90630"] },
  { name: "Dana Point", slug: "dana-point-ca", displayName: "Dana Point, CA", zipCodes: ["92624", "92629"] },
  { name: "Fountain Valley", slug: "fountain-valley-ca", displayName: "Fountain Valley, CA", zipCodes: ["92708"] },
  { name: "Fullerton", slug: "fullerton-ca", displayName: "Fullerton, CA", zipCodes: ["92831", "92832", "92833", "92835"] },
  { name: "Garden Grove", slug: "garden-grove-ca", displayName: "Garden Grove, CA", zipCodes: ["92840", "92841", "92843", "92844", "92845"] },
  { name: "Huntington Beach", slug: "huntington-beach-ca", displayName: "Huntington Beach, CA", zipCodes: ["92646", "92647", "92648", "92649"] },
  { name: "Irvine", slug: "irvine-ca", displayName: "Irvine, CA", zipCodes: ["92602", "92603", "92604", "92606", "92612", "92614", "92617", "92618", "92620"] },
  { name: "La Habra", slug: "la-habra-ca", displayName: "La Habra, CA", zipCodes: ["90631"] },
  { name: "La Palma", slug: "la-palma-ca", displayName: "La Palma, CA", zipCodes: ["90623"] },
  { name: "Laguna Beach", slug: "laguna-beach-ca", displayName: "Laguna Beach, CA", zipCodes: ["92651"] },
  { name: "Laguna Hills", slug: "laguna-hills-ca", displayName: "Laguna Hills, CA", zipCodes: ["92653"] },
  { name: "Laguna Niguel", slug: "laguna-niguel-ca", displayName: "Laguna Niguel, CA", zipCodes: ["92677"] },
  { name: "Laguna Woods", slug: "laguna-woods-ca", displayName: "Laguna Woods, CA", zipCodes: ["92637"] },
  { name: "Lake Forest", slug: "lake-forest-ca", displayName: "Lake Forest, CA", zipCodes: ["92630"] },
  { name: "Los Alamitos", slug: "los-alamitos-ca", displayName: "Los Alamitos, CA", zipCodes: ["90720"] },
  { name: "Mission Viejo", slug: "mission-viejo-ca", displayName: "Mission Viejo, CA", zipCodes: ["92691", "92692"] },
  { name: "Newport Beach", slug: "newport-beach-ca", displayName: "Newport Beach, CA", zipCodes: ["92660", "92661", "92662", "92663"] },
  { name: "Orange", slug: "orange-ca", displayName: "Orange, CA", zipCodes: ["92865", "92866", "92867", "92868", "92869"] },
  { name: "Placentia", slug: "placentia-ca", displayName: "Placentia, CA", zipCodes: ["92870"] },
  { name: "Rancho Santa Margarita", slug: "rancho-santa-margarita-ca", displayName: "Rancho Santa Margarita, CA", zipCodes: ["92688"] },
  { name: "San Clemente", slug: "san-clemente-ca", displayName: "San Clemente, CA", zipCodes: ["92672", "92673"] },
  { name: "San Juan Capistrano", slug: "san-juan-capistrano-ca", displayName: "San Juan Capistrano, CA", zipCodes: ["92675"] },
  { name: "Santa Ana", slug: "santa-ana-ca", displayName: "Santa Ana, CA", zipCodes: ["92701", "92703", "92704", "92705", "92706", "92707"] },
  { name: "Seal Beach", slug: "seal-beach-ca", displayName: "Seal Beach, CA", zipCodes: ["90740"] },
  { name: "Stanton", slug: "stanton-ca", displayName: "Stanton, CA", zipCodes: ["90680"] },
  { name: "Tustin", slug: "tustin-ca", displayName: "Tustin, CA", zipCodes: ["92780", "92782"] },
  { name: "Villa Park", slug: "villa-park-ca", displayName: "Villa Park, CA", zipCodes: ["92861"] },
  { name: "Westminster", slug: "westminster-ca", displayName: "Westminster, CA", zipCodes: ["92683"] },
  { name: "Yorba Linda", slug: "yorba-linda-ca", displayName: "Yorba Linda, CA", zipCodes: ["92886", "92887"] }
]

const LOS_ANGELES_COUNTY_CITIES: CountyCity[] = [
  { name: "Agoura Hills", slug: "agoura-hills-ca", displayName: "Agoura Hills, CA", zipCodes: ["91301"] },
  { name: "Alhambra", slug: "alhambra-ca", displayName: "Alhambra, CA", zipCodes: ["91801"] },
  { name: "Arcadia", slug: "arcadia-ca", displayName: "Arcadia, CA", zipCodes: ["91007"] },
  { name: "Artesia", slug: "artesia-ca", displayName: "Artesia, CA", zipCodes: ["90701"] },
  { name: "Avalon", slug: "avalon-ca", displayName: "Avalon, CA", zipCodes: ["90704"] },
  { name: "Azusa", slug: "azusa-ca", displayName: "Azusa, CA", zipCodes: ["91702"] },
  { name: "Baldwin Park", slug: "baldwin-park-ca", displayName: "Baldwin Park, CA", zipCodes: ["91706"] },
  { name: "Bell", slug: "bell-ca", displayName: "Bell, CA", zipCodes: ["90201"] },
  { name: "Bell Gardens", slug: "bell-gardens-ca", displayName: "Bell Gardens, CA", zipCodes: ["90201"] },
  { name: "Bellflower", slug: "bellflower-ca", displayName: "Bellflower, CA", zipCodes: ["90706"] },
  { name: "Beverly Hills", slug: "beverly-hills-ca", displayName: "Beverly Hills, CA", zipCodes: ["90210"] },
  { name: "Bradbury", slug: "bradbury-ca", displayName: "Bradbury, CA", zipCodes: ["91008"] },
  { name: "Burbank", slug: "burbank-ca", displayName: "Burbank, CA", zipCodes: ["91505"] },
  { name: "Calabasas", slug: "calabasas-ca", displayName: "Calabasas, CA", zipCodes: ["91302"] },
  { name: "Carson", slug: "carson-ca", displayName: "Carson, CA", zipCodes: ["90745"] },
  { name: "Cerritos", slug: "cerritos-ca", displayName: "Cerritos, CA", zipCodes: ["90703"] },
  { name: "Claremont", slug: "claremont-ca", displayName: "Claremont, CA", zipCodes: ["91711"] },
  { name: "Commerce", slug: "commerce-ca", displayName: "Commerce, CA", zipCodes: ["90040"] },
  { name: "Compton", slug: "compton-ca", displayName: "Compton, CA", zipCodes: ["90220"] },
  { name: "Covina", slug: "covina-ca", displayName: "Covina, CA", zipCodes: ["91722"] },
  { name: "Cudahy", slug: "cudahy-ca", displayName: "Cudahy, CA", zipCodes: ["90201"] },
  { name: "Culver City", slug: "culver-city-ca", displayName: "Culver City, CA", zipCodes: ["90230"] },
  { name: "Diamond Bar", slug: "diamond-bar-ca", displayName: "Diamond Bar, CA", zipCodes: ["91765"] },
  { name: "Downey", slug: "downey-ca", displayName: "Downey, CA", zipCodes: ["90241"] },
  { name: "Duarte", slug: "duarte-ca", displayName: "Duarte, CA", zipCodes: ["91010"] },
  { name: "El Monte", slug: "el-monte-ca", displayName: "El Monte, CA", zipCodes: ["91731"] },
  { name: "El Segundo", slug: "el-segundo-ca", displayName: "El Segundo, CA", zipCodes: ["90245"] },
  { name: "Gardena", slug: "gardena-ca", displayName: "Gardena, CA", zipCodes: ["90247"] },
  { name: "Glendale", slug: "glendale-ca", displayName: "Glendale, CA", zipCodes: ["91205"] },
  { name: "Glendora", slug: "glendora-ca", displayName: "Glendora, CA", zipCodes: ["91740"] },
  { name: "Hawaiian Gardens", slug: "hawaiian-gardens-ca", displayName: "Hawaiian Gardens, CA", zipCodes: ["90716"] },
  { name: "Hawthorne", slug: "hawthorne-ca", displayName: "Hawthorne, CA", zipCodes: ["90250"] },
  { name: "Hermosa Beach", slug: "hermosa-beach-ca", displayName: "Hermosa Beach, CA", zipCodes: ["90254"] },
  { name: "Hidden Hills", slug: "hidden-hills-ca", displayName: "Hidden Hills, CA", zipCodes: ["91302"] },
  { name: "Huntington Park", slug: "huntington-park-ca", displayName: "Huntington Park, CA", zipCodes: ["90255"] },
  { name: "Industry", slug: "industry-ca", displayName: "Industry, CA", zipCodes: ["91744"] },
  { name: "Inglewood", slug: "inglewood-ca", displayName: "Inglewood, CA", zipCodes: ["90301"] },
  { name: "Irwindale", slug: "irwindale-ca", displayName: "Irwindale, CA", zipCodes: ["91706"] },
  { name: "La Canada Flintridge", slug: "la-canada-flintridge-ca", displayName: "La Canada Flintridge, CA", zipCodes: ["91011"] },
  { name: "La Habra Heights", slug: "la-habra-heights-ca", displayName: "La Habra Heights, CA", zipCodes: ["90631"] },
  { name: "La Mirada", slug: "la-mirada-ca", displayName: "La Mirada, CA", zipCodes: ["90638"] },
  { name: "La Puente", slug: "la-puente-ca", displayName: "La Puente, CA", zipCodes: ["91744"] },
  { name: "La Verne", slug: "la-verne-ca", displayName: "La Verne, CA", zipCodes: ["91750"] },
  { name: "Lakewood", slug: "lakewood-ca", displayName: "Lakewood, CA", zipCodes: ["90712"] },
  { name: "Lancaster", slug: "lancaster-ca", displayName: "Lancaster, CA", zipCodes: ["93534"] },
  { name: "Lawndale", slug: "lawndale-ca", displayName: "Lawndale, CA", zipCodes: ["90260"] },
  { name: "Lomita", slug: "lomita-ca", displayName: "Lomita, CA", zipCodes: ["90717"] },
  { name: "Long Beach", slug: "long-beach-ca", displayName: "Long Beach, CA", zipCodes: ["90802"] },
  { name: "Los Angeles", slug: "los-angeles-ca", displayName: "Los Angeles, CA", zipCodes: ["90001"] },
  { name: "Lynwood", slug: "lynwood-ca", displayName: "Lynwood, CA", zipCodes: ["90262"] },
  { name: "Malibu", slug: "malibu-ca", displayName: "Malibu, CA", zipCodes: ["90265"] },
  { name: "Manhattan Beach", slug: "manhattan-beach-ca", displayName: "Manhattan Beach, CA", zipCodes: ["90266"] },
  { name: "Maywood", slug: "maywood-ca", displayName: "Maywood, CA", zipCodes: ["90270"] },
  { name: "Monrovia", slug: "monrovia-ca", displayName: "Monrovia, CA", zipCodes: ["91016"] },
  { name: "Montebello", slug: "montebello-ca", displayName: "Montebello, CA", zipCodes: ["90640"] },
  { name: "Monterey Park", slug: "monterey-park-ca", displayName: "Monterey Park, CA", zipCodes: ["91754"] },
  { name: "Norwalk", slug: "norwalk-ca", displayName: "Norwalk, CA", zipCodes: ["90650"] },
  { name: "Palmdale", slug: "palmdale-ca", displayName: "Palmdale, CA", zipCodes: ["93550"] },
  { name: "Palos Verdes Estates", slug: "palos-verdes-estates-ca", displayName: "Palos Verdes Estates, CA", zipCodes: ["90274"] },
  { name: "Paramount", slug: "paramount-ca", displayName: "Paramount, CA", zipCodes: ["90723"] },
  { name: "Pasadena", slug: "pasadena-ca", displayName: "Pasadena, CA", zipCodes: ["91101"] },
  { name: "Pico Rivera", slug: "pico-rivera-ca", displayName: "Pico Rivera, CA", zipCodes: ["90660"] },
  { name: "Pomona", slug: "pomona-ca", displayName: "Pomona, CA", zipCodes: ["91766"] },
  { name: "Rancho Palos Verdes", slug: "rancho-palos-verdes-ca", displayName: "Rancho Palos Verdes, CA", zipCodes: ["90275"] },
  { name: "Redondo Beach", slug: "redondo-beach-ca", displayName: "Redondo Beach, CA", zipCodes: ["90277"] },
  { name: "Rolling Hills", slug: "rolling-hills-ca", displayName: "Rolling Hills, CA", zipCodes: ["90274"] },
  { name: "Rolling Hills Estates", slug: "rolling-hills-estates-ca", displayName: "Rolling Hills Estates, CA", zipCodes: ["90274"] },
  { name: "Rosemead", slug: "rosemead-ca", displayName: "Rosemead, CA", zipCodes: ["91770"] },
  { name: "San Dimas", slug: "san-dimas-ca", displayName: "San Dimas, CA", zipCodes: ["91773"] },
  { name: "San Fernando", slug: "san-fernando-ca", displayName: "San Fernando, CA", zipCodes: ["91340"] },
  { name: "San Gabriel", slug: "san-gabriel-ca", displayName: "San Gabriel, CA", zipCodes: ["91776"] },
  { name: "San Marino", slug: "san-marino-ca", displayName: "San Marino, CA", zipCodes: ["91108"] },
  { name: "Santa Clarita", slug: "santa-clarita-ca", displayName: "Santa Clarita, CA", zipCodes: ["91350"] },
  { name: "Santa Fe Springs", slug: "santa-fe-springs-ca", displayName: "Santa Fe Springs, CA", zipCodes: ["90670"] },
  { name: "Santa Monica", slug: "santa-monica-ca", displayName: "Santa Monica, CA", zipCodes: ["90401"] },
  { name: "Sierra Madre", slug: "sierra-madre-ca", displayName: "Sierra Madre, CA", zipCodes: ["91024"] },
  { name: "Signal Hill", slug: "signal-hill-ca", displayName: "Signal Hill, CA", zipCodes: ["90755"] },
  { name: "South El Monte", slug: "south-el-monte-ca", displayName: "South El Monte, CA", zipCodes: ["91733"] },
  { name: "South Gate", slug: "south-gate-ca", displayName: "South Gate, CA", zipCodes: ["90280"] },
  { name: "South Pasadena", slug: "south-pasadena-ca", displayName: "South Pasadena, CA", zipCodes: ["91030"] },
  { name: "Temple City", slug: "temple-city-ca", displayName: "Temple City, CA", zipCodes: ["91780"] },
  { name: "Torrance", slug: "torrance-ca", displayName: "Torrance, CA", zipCodes: ["90501"] },
  { name: "Vernon", slug: "vernon-ca", displayName: "Vernon, CA", zipCodes: ["90058"] },
  { name: "Walnut", slug: "walnut-ca", displayName: "Walnut, CA", zipCodes: ["91789"] },
  { name: "West Covina", slug: "west-covina-ca", displayName: "West Covina, CA", zipCodes: ["91790"] },
  { name: "West Hollywood", slug: "west-hollywood-ca", displayName: "West Hollywood, CA", zipCodes: ["90069"] },
  { name: "Westlake Village", slug: "westlake-village-ca", displayName: "Westlake Village, CA", zipCodes: ["91361"] },
  { name: "Whittier", slug: "whittier-ca", displayName: "Whittier, CA", zipCodes: ["90601"] }
]

const NAPA_COUNTY_CITIES: CountyCity[] = [
  { name: "American Canyon", slug: "american-canyon-ca", displayName: "American Canyon, CA", zipCodes: ["94503"] },
  { name: "Calistoga", slug: "calistoga-ca", displayName: "Calistoga, CA", zipCodes: ["94515"] },
  { name: "Napa", slug: "napa-ca", displayName: "Napa, CA", zipCodes: ["94558", "94559", "94581"] },
  { name: "St. Helena", slug: "st-helena-ca", displayName: "St. Helena, CA", zipCodes: ["94574"] },
  { name: "Yountville", slug: "yountville-ca", displayName: "Yountville, CA", zipCodes: ["94599"] }
]

const SANTA_BARBARA_COUNTY_CITIES: CountyCity[] = [
  { name: "Buellton", slug: "buellton-ca", displayName: "Buellton, CA", zipCodes: ["93427"] },
  { name: "Carpinteria", slug: "carpinteria-ca", displayName: "Carpinteria, CA", zipCodes: ["93013", "93014"] },
  { name: "Goleta", slug: "goleta-ca", displayName: "Goleta, CA", zipCodes: ["93117", "93118"] },
  { name: "Guadalupe", slug: "guadalupe-ca", displayName: "Guadalupe, CA", zipCodes: ["93434"] },
  { name: "Lompoc", slug: "lompoc-ca", displayName: "Lompoc, CA", zipCodes: ["93436", "93437", "93438"] },
  { name: "Montecito", slug: "montecito-ca", displayName: "Montecito, CA", zipCodes: ["93108"] },
  { name: "Santa Barbara", slug: "santa-barbara-ca", displayName: "Santa Barbara, CA", zipCodes: ["93101", "93103", "93105", "93108", "93109", "93110", "93111"] },
  { name: "Santa Maria", slug: "santa-maria-ca", displayName: "Santa Maria, CA", zipCodes: ["93454", "93455", "93456", "93457", "93458"] },
  { name: "Solvang", slug: "solvang-ca", displayName: "Solvang, CA", zipCodes: ["93463", "93464"] }
]

const SANTA_CLARA_COUNTY_CITIES: CountyCity[] = [
  { name: "Campbell", slug: "campbell-ca", displayName: "Campbell, CA", zipCodes: ["95008"] },
  { name: "Cupertino", slug: "cupertino-ca", displayName: "Cupertino, CA", zipCodes: ["95014"] },
  { name: "Gilroy", slug: "gilroy-ca", displayName: "Gilroy, CA", zipCodes: ["95020"] },
  { name: "Los Altos", slug: "los-altos-ca", displayName: "Los Altos, CA", zipCodes: ["94022"] },
  { name: "Los Altos Hills", slug: "los-altos-hills-ca", displayName: "Los Altos Hills, CA", zipCodes: ["94022"] },
  { name: "Los Gatos", slug: "los-gatos-ca", displayName: "Los Gatos, CA", zipCodes: ["95032"] },
  { name: "Milpitas", slug: "milpitas-ca", displayName: "Milpitas, CA", zipCodes: ["95035"] },
  { name: "Monte Sereno", slug: "monte-sereno-ca", displayName: "Monte Sereno, CA", zipCodes: ["95030"] },
  { name: "Morgan Hill", slug: "morgan-hill-ca", displayName: "Morgan Hill, CA", zipCodes: ["95037"] },
  { name: "Mountain View", slug: "mountain-view-ca", displayName: "Mountain View, CA", zipCodes: ["94040"] },
  { name: "Palo Alto", slug: "palo-alto-ca", displayName: "Palo Alto, CA", zipCodes: ["94301"] },
  { name: "San Jose", slug: "san-jose-ca", displayName: "San Jose, CA", zipCodes: ["95112"] },
  { name: "Santa Clara", slug: "santa-clara-ca", displayName: "Santa Clara, CA", zipCodes: ["95050"] },
  { name: "Saratoga", slug: "saratoga-ca", displayName: "Saratoga, CA", zipCodes: ["95070"] },
  { name: "Sunnyvale", slug: "sunnyvale-ca", displayName: "Sunnyvale, CA", zipCodes: ["94086"] }
]

const ALAMEDA_COUNTY_CITIES: CountyCity[] = [
  { name: "Alameda", slug: "alameda-ca", displayName: "Alameda, CA", zipCodes: ["94501", "94502"] },
  { name: "Albany", slug: "albany-ca", displayName: "Albany, CA", zipCodes: ["94706"] },
  { name: "Berkeley", slug: "berkeley-ca", displayName: "Berkeley, CA", zipCodes: ["94702", "94703", "94704", "94705", "94707", "94708", "94709", "94710"] },
  { name: "Dublin", slug: "dublin-ca", displayName: "Dublin, CA", zipCodes: ["94568"] },
  { name: "Emeryville", slug: "emeryville-ca", displayName: "Emeryville, CA", zipCodes: ["94608"] },
  { name: "Fremont", slug: "fremont-ca", displayName: "Fremont, CA", zipCodes: ["94536", "94537", "94538", "94539", "94555"] },
  { name: "Hayward", slug: "hayward-ca", displayName: "Hayward, CA", zipCodes: ["94541", "94542", "94544", "94545", "94546"] },
  { name: "Livermore", slug: "livermore-ca", displayName: "Livermore, CA", zipCodes: ["94550", "94551"] },
  { name: "Newark", slug: "newark-ca", displayName: "Newark, CA", zipCodes: ["94560"] },
  { name: "Oakland", slug: "oakland-ca", displayName: "Oakland, CA", zipCodes: ["94601", "94602", "94603", "94605", "94606", "94607", "94608", "94609", "94610", "94611", "94612", "94618", "94619", "94621"] },
  { name: "Piedmont", slug: "piedmont-ca", displayName: "Piedmont, CA", zipCodes: ["94610"] },
  { name: "Pleasanton", slug: "pleasanton-ca", displayName: "Pleasanton, CA", zipCodes: ["94566", "94588"] },
  { name: "San Leandro", slug: "san-leandro-ca", displayName: "San Leandro, CA", zipCodes: ["94577", "94578", "94579"] },
  { name: "Union City", slug: "union-city-ca", displayName: "Union City, CA", zipCodes: ["94587"] },
]

const MARIN_COUNTY_CITIES: CountyCity[] = [
  { name: "Belvedere", slug: "belvedere-ca", displayName: "Belvedere, CA", zipCodes: ["94920"] },
  { name: "Corte Madera", slug: "corte-madera-ca", displayName: "Corte Madera, CA", zipCodes: ["94925"] },
  { name: "Fairfax", slug: "fairfax-ca", displayName: "Fairfax, CA", zipCodes: ["94930"] },
  { name: "Larkspur", slug: "larkspur-ca", displayName: "Larkspur, CA", zipCodes: ["94939"] },
  { name: "Mill Valley", slug: "mill-valley-ca", displayName: "Mill Valley, CA", zipCodes: ["94941"] },
  { name: "Novato", slug: "novato-ca", displayName: "Novato, CA", zipCodes: ["94945", "94947", "94949"] },
  { name: "Ross", slug: "ross-ca", displayName: "Ross, CA", zipCodes: ["94957"] },
  { name: "San Anselmo", slug: "san-anselmo-ca", displayName: "San Anselmo, CA", zipCodes: ["94960"] },
  { name: "San Rafael", slug: "san-rafael-ca", displayName: "San Rafael, CA", zipCodes: ["94901", "94903", "94912", "94913", "94915"] },
  { name: "Sausalito", slug: "sausalito-ca", displayName: "Sausalito, CA", zipCodes: ["94965"] },
  { name: "Tiburon", slug: "tiburon-ca", displayName: "Tiburon, CA", zipCodes: ["94920"] },
]

const RIVERSIDE_COUNTY_CITIES: CountyCity[] = [
  { name: "Banning", slug: "banning-ca", displayName: "Banning, CA", zipCodes: ["92220"] },
  { name: "Beaumont", slug: "beaumont-ca", displayName: "Beaumont, CA", zipCodes: ["92223"] },
  { name: "Blythe", slug: "blythe-ca", displayName: "Blythe, CA", zipCodes: ["92225"] },
  { name: "Calimesa", slug: "calimesa-ca", displayName: "Calimesa, CA", zipCodes: ["92320"] },
  { name: "Canyon Lake", slug: "canyon-lake-ca", displayName: "Canyon Lake, CA", zipCodes: ["92587"] },
  { name: "Cathedral City", slug: "cathedral-city-ca", displayName: "Cathedral City, CA", zipCodes: ["92234", "92235"] },
  { name: "Coachella", slug: "coachella-ca", displayName: "Coachella, CA", zipCodes: ["92236"] },
  { name: "Corona", slug: "corona-ca", displayName: "Corona, CA", zipCodes: ["92879", "92880", "92881", "92882", "92883"] },
  { name: "Desert Hot Springs", slug: "desert-hot-springs-ca", displayName: "Desert Hot Springs, CA", zipCodes: ["92240", "92241"] },
  { name: "Eastvale", slug: "eastvale-ca", displayName: "Eastvale, CA", zipCodes: ["91752"] },
  { name: "Hemet", slug: "hemet-ca", displayName: "Hemet, CA", zipCodes: ["92543", "92544", "92545", "92546"] },
  { name: "Indian Wells", slug: "indian-wells-ca", displayName: "Indian Wells, CA", zipCodes: ["92210"] },
  { name: "Indio", slug: "indio-ca", displayName: "Indio, CA", zipCodes: ["92201", "92202", "92203"] },
  { name: "Jurupa Valley", slug: "jurupa-valley-ca", displayName: "Jurupa Valley, CA", zipCodes: ["91752", "92509"] },
  { name: "Lake Elsinore", slug: "lake-elsinore-ca", displayName: "Lake Elsinore, CA", zipCodes: ["92530", "92532"] },
  { name: "La Quinta", slug: "la-quinta-ca", displayName: "La Quinta, CA", zipCodes: ["92253"] },
  { name: "Menifee", slug: "menifee-ca", displayName: "Menifee, CA", zipCodes: ["92584", "92585", "92586"] },
  { name: "Moreno Valley", slug: "moreno-valley-ca", displayName: "Moreno Valley, CA", zipCodes: ["92551", "92552", "92553", "92554", "92555"] },
  { name: "Murrieta", slug: "murrieta-ca", displayName: "Murrieta, CA", zipCodes: ["92562", "92563", "92564"] },
  { name: "Norco", slug: "norco-ca", displayName: "Norco, CA", zipCodes: ["92860"] },
  { name: "Palm Desert", slug: "palm-desert-ca", displayName: "Palm Desert, CA", zipCodes: ["92211", "92255", "92260"] },
  { name: "Palm Springs", slug: "palm-springs-ca", displayName: "Palm Springs, CA", zipCodes: ["92262", "92263", "92264"] },
  { name: "Perris", slug: "perris-ca", displayName: "Perris, CA", zipCodes: ["92570", "92571", "92572"] },
  { name: "Rancho Mirage", slug: "rancho-mirage-ca", displayName: "Rancho Mirage, CA", zipCodes: ["92270"] },
  { name: "Riverside", slug: "riverside-ca", displayName: "Riverside, CA", zipCodes: ["92501", "92503", "92504", "92505", "92506", "92507", "92508", "92509"] },
  { name: "San Jacinto", slug: "san-jacinto-ca", displayName: "San Jacinto, CA", zipCodes: ["92582", "92583"] },
  { name: "Temecula", slug: "temecula-ca", displayName: "Temecula, CA", zipCodes: ["92589", "92590", "92591", "92592", "92593"] },
  { name: "Wildomar", slug: "wildomar-ca", displayName: "Wildomar, CA", zipCodes: ["92595"] },
]

const SAN_BERNARDINO_COUNTY_CITIES: CountyCity[] = [
  { name: "Adelanto", slug: "adelanto-ca", displayName: "Adelanto, CA", zipCodes: ["92301"] },
  { name: "Apple Valley", slug: "apple-valley-ca", displayName: "Apple Valley, CA", zipCodes: ["92308"] },
  { name: "Barstow", slug: "barstow-ca", displayName: "Barstow, CA", zipCodes: ["92311"] },
  { name: "Big Bear Lake", slug: "big-bear-lake-ca", displayName: "Big Bear Lake, CA", zipCodes: ["92315", "92316"] },
  { name: "Chino", slug: "chino-ca", displayName: "Chino, CA", zipCodes: ["91708", "91710"] },
  { name: "Chino Hills", slug: "chino-hills-ca", displayName: "Chino Hills, CA", zipCodes: ["91709"] },
  { name: "Colton", slug: "colton-ca", displayName: "Colton, CA", zipCodes: ["92324"] },
  { name: "Fontana", slug: "fontana-ca", displayName: "Fontana, CA", zipCodes: ["92335", "92336", "92337"] },
  { name: "Grand Terrace", slug: "grand-terrace-ca", displayName: "Grand Terrace, CA", zipCodes: ["92313"] },
  { name: "Hesperia", slug: "hesperia-ca", displayName: "Hesperia, CA", zipCodes: ["92345"] },
  { name: "Highland", slug: "highland-ca", displayName: "Highland, CA", zipCodes: ["92346"] },
  { name: "Loma Linda", slug: "loma-linda-ca", displayName: "Loma Linda, CA", zipCodes: ["92354"] },
  { name: "Montclair", slug: "montclair-ca", displayName: "Montclair, CA", zipCodes: ["91763"] },
  { name: "Needles", slug: "needles-ca", displayName: "Needles, CA", zipCodes: ["92363"] },
  { name: "Ontario", slug: "ontario-ca", displayName: "Ontario, CA", zipCodes: ["91761", "91762", "91764"] },
  { name: "Rancho Cucamonga", slug: "rancho-cucamonga-ca", displayName: "Rancho Cucamonga, CA", zipCodes: ["91701", "91729", "91730", "91737", "91739"] },
  { name: "Redlands", slug: "redlands-ca", displayName: "Redlands, CA", zipCodes: ["92373", "92374", "92375"] },
  { name: "Rialto", slug: "rialto-ca", displayName: "Rialto, CA", zipCodes: ["92376", "92377"] },
  { name: "San Bernardino", slug: "san-bernardino-ca", displayName: "San Bernardino, CA", zipCodes: ["92401", "92404", "92405", "92407", "92408", "92410", "92411"] },
  { name: "Twentynine Palms", slug: "twentynine-palms-ca", displayName: "Twentynine Palms, CA", zipCodes: ["92277"] },
  { name: "Upland", slug: "upland-ca", displayName: "Upland, CA", zipCodes: ["91784", "91786"] },
  { name: "Victorville", slug: "victorville-ca", displayName: "Victorville, CA", zipCodes: ["92392", "92393", "92394", "92395"] },
  { name: "Yucaipa", slug: "yucaipa-ca", displayName: "Yucaipa, CA", zipCodes: ["92399"] },
  { name: "Yucca Valley", slug: "yucca-valley-ca", displayName: "Yucca Valley, CA", zipCodes: ["92284"] },
]

const SACRAMENTO_COUNTY_CITIES: CountyCity[] = [
  { name: "Citrus Heights", slug: "citrus-heights-ca", displayName: "Citrus Heights, CA", zipCodes: ["95610", "95621"] },
  { name: "Elk Grove", slug: "elk-grove-ca", displayName: "Elk Grove, CA", zipCodes: ["95624", "95757", "95758", "95759"] },
  { name: "Folsom", slug: "folsom-ca", displayName: "Folsom, CA", zipCodes: ["95630", "95671"] },
  { name: "Galt", slug: "galt-ca", displayName: "Galt, CA", zipCodes: ["95632"] },
  { name: "Isleton", slug: "isleton-ca", displayName: "Isleton, CA", zipCodes: ["95641"] },
  { name: "Rancho Cordova", slug: "rancho-cordova-ca", displayName: "Rancho Cordova, CA", zipCodes: ["95670", "95742"] },
  { name: "Sacramento", slug: "sacramento-ca", displayName: "Sacramento, CA", zipCodes: ["95811", "95814", "95815", "95816", "95817", "95818", "95819", "95820", "95821", "95822", "95823", "95824", "95825", "95826", "95827", "95828", "95829", "95830", "95831", "95832", "95833", "95834", "95835", "95838", "95842", "95864"] },
]

const SONOMA_COUNTY_CITIES: CountyCity[] = [
  { name: "Cloverdale", slug: "cloverdale-ca", displayName: "Cloverdale, CA", zipCodes: ["95425"] },
  { name: "Cotati", slug: "cotati-ca", displayName: "Cotati, CA", zipCodes: ["94931"] },
  { name: "Healdsburg", slug: "healdsburg-ca", displayName: "Healdsburg, CA", zipCodes: ["95448"] },
  { name: "Petaluma", slug: "petaluma-ca", displayName: "Petaluma, CA", zipCodes: ["94952", "94954", "94975"] },
  { name: "Rohnert Park", slug: "rohnert-park-ca", displayName: "Rohnert Park, CA", zipCodes: ["94928"] },
  { name: "Santa Rosa", slug: "santa-rosa-ca", displayName: "Santa Rosa, CA", zipCodes: ["95401", "95403", "95404", "95405", "95407", "95409"] },
  { name: "Sebastopol", slug: "sebastopol-ca", displayName: "Sebastopol, CA", zipCodes: ["95472"] },
  { name: "Sonoma", slug: "sonoma-ca", displayName: "Sonoma, CA", zipCodes: ["95476"] },
  { name: "Windsor", slug: "windsor-ca", displayName: "Windsor, CA", zipCodes: ["95492"] },
]

const VENTURA_COUNTY_CITIES: CountyCity[] = [
  { name: "Camarillo", slug: "camarillo-ca", displayName: "Camarillo, CA", zipCodes: ["93010", "93012"] },
  { name: "Fillmore", slug: "fillmore-ca", displayName: "Fillmore, CA", zipCodes: ["93015", "93016"] },
  { name: "Moorpark", slug: "moorpark-ca", displayName: "Moorpark, CA", zipCodes: ["93021"] },
  { name: "Ojai", slug: "ojai-ca", displayName: "Ojai, CA", zipCodes: ["93023"] },
  { name: "Oxnard", slug: "oxnard-ca", displayName: "Oxnard, CA", zipCodes: ["93030", "93033", "93035", "93036"] },
  { name: "Port Hueneme", slug: "port-hueneme-ca", displayName: "Port Hueneme, CA", zipCodes: ["93041", "93043"] },
  { name: "Ventura", slug: "ventura-ca", displayName: "Ventura, CA", zipCodes: ["93001", "93003", "93004"] },
  { name: "Santa Paula", slug: "santa-paula-ca", displayName: "Santa Paula, CA", zipCodes: ["93060"] },
  { name: "Simi Valley", slug: "simi-valley-ca", displayName: "Simi Valley, CA", zipCodes: ["93063", "93065"] },
  { name: "Thousand Oaks", slug: "thousand-oaks-ca", displayName: "Thousand Oaks, CA", zipCodes: ["91319", "91320", "91360", "91361", "91362"] },
]

const CONTRA_COSTA_COUNTY_CITIES: CountyCity[] = [
  { name: "Antioch", slug: "antioch-ca", displayName: "Antioch, CA", zipCodes: ["94509", "94531"] },
  { name: "Brentwood", slug: "brentwood-ca", displayName: "Brentwood, CA", zipCodes: ["94513"] },
  { name: "Clayton", slug: "clayton-ca", displayName: "Clayton, CA", zipCodes: ["94517"] },
  { name: "Concord", slug: "concord-ca", displayName: "Concord, CA", zipCodes: ["94518", "94519", "94520", "94521"] },
  { name: "Danville", slug: "danville-ca", displayName: "Danville, CA", zipCodes: ["94506", "94526"] },
  { name: "El Cerrito", slug: "el-cerrito-ca", displayName: "El Cerrito, CA", zipCodes: ["94530"] },
  { name: "Hercules", slug: "hercules-ca", displayName: "Hercules, CA", zipCodes: ["94547"] },
  { name: "Lafayette", slug: "lafayette-ca", displayName: "Lafayette, CA", zipCodes: ["94549"] },
  { name: "Martinez", slug: "martinez-ca", displayName: "Martinez, CA", zipCodes: ["94553"] },
  { name: "Moraga", slug: "moraga-ca", displayName: "Moraga, CA", zipCodes: ["94556"] },
  { name: "Oakley", slug: "oakley-ca", displayName: "Oakley, CA", zipCodes: ["94561"] },
  { name: "Orinda", slug: "orinda-ca", displayName: "Orinda, CA", zipCodes: ["94563"] },
  { name: "Pinole", slug: "pinole-ca", displayName: "Pinole, CA", zipCodes: ["94564"] },
  { name: "Pittsburg", slug: "pittsburg-ca", displayName: "Pittsburg, CA", zipCodes: ["94565"] },
  { name: "Pleasant Hill", slug: "pleasant-hill-ca", displayName: "Pleasant Hill, CA", zipCodes: ["94523"] },
  { name: "Richmond", slug: "richmond-ca", displayName: "Richmond, CA", zipCodes: ["94801", "94804", "94805", "94806"] },
  { name: "San Pablo", slug: "san-pablo-ca", displayName: "San Pablo, CA", zipCodes: ["94806"] },
  { name: "San Ramon", slug: "san-ramon-ca", displayName: "San Ramon, CA", zipCodes: ["94582", "94583"] },
  { name: "Walnut Creek", slug: "walnut-creek-ca", displayName: "Walnut Creek, CA", zipCodes: ["94595", "94596", "94597", "94598"] },
]

const SAN_MATEO_COUNTY_CITIES: CountyCity[] = [
  { name: "Atherton", slug: "atherton-ca", displayName: "Atherton, CA", zipCodes: ["94027"] },
  { name: "Belmont", slug: "belmont-ca", displayName: "Belmont, CA", zipCodes: ["94002"] },
  { name: "Brisbane", slug: "brisbane-ca", displayName: "Brisbane, CA", zipCodes: ["94005"] },
  { name: "Burlingame", slug: "burlingame-ca", displayName: "Burlingame, CA", zipCodes: ["94010", "94011"] },
  { name: "Colma", slug: "colma-ca", displayName: "Colma, CA", zipCodes: ["94014"] },
  { name: "Daly City", slug: "daly-city-ca", displayName: "Daly City, CA", zipCodes: ["94014", "94015", "94016", "94017"] },
  { name: "East Palo Alto", slug: "east-palo-alto-ca", displayName: "East Palo Alto, CA", zipCodes: ["94303"] },
  { name: "Foster City", slug: "foster-city-ca", displayName: "Foster City, CA", zipCodes: ["94404"] },
  { name: "Half Moon Bay", slug: "half-moon-bay-ca", displayName: "Half Moon Bay, CA", zipCodes: ["94019"] },
  { name: "Hillsborough", slug: "hillsborough-ca", displayName: "Hillsborough, CA", zipCodes: ["94010"] },
  { name: "Menlo Park", slug: "menlo-park-ca", displayName: "Menlo Park, CA", zipCodes: ["94025", "94026", "94027", "94028"] },
  { name: "Millbrae", slug: "millbrae-ca", displayName: "Millbrae, CA", zipCodes: ["94030"] },
  { name: "Pacifica", slug: "pacifica-ca", displayName: "Pacifica, CA", zipCodes: ["94044"] },
  { name: "Portola Valley", slug: "portola-valley-ca", displayName: "Portola Valley, CA", zipCodes: ["94028"] },
  { name: "Redwood City", slug: "redwood-city-ca", displayName: "Redwood City, CA", zipCodes: ["94061", "94062", "94063", "94064", "94065"] },
  { name: "San Bruno", slug: "san-bruno-ca", displayName: "San Bruno, CA", zipCodes: ["94066"] },
  { name: "San Carlos", slug: "san-carlos-ca", displayName: "San Carlos, CA", zipCodes: ["94070"] },
  { name: "San Mateo", slug: "san-mateo-ca", displayName: "San Mateo, CA", zipCodes: ["94401", "94402", "94403", "94404", "94497"] },
  { name: "South San Francisco", slug: "south-san-francisco-ca", displayName: "South San Francisco, CA", zipCodes: ["94080", "94083"] },
  { name: "Woodside", slug: "woodside-ca", displayName: "Woodside, CA", zipCodes: ["94061", "94062"] },
]

const SAN_FRANCISCO_COUNTY_CITIES: CountyCity[] = [
  { name: "San Francisco", slug: "san-francisco-ca", displayName: "San Francisco, CA", zipCodes: ["94102", "94103", "94104", "94105", "94107", "94108", "94109", "94110", "94111", "94112", "94114", "94115", "94116", "94117", "94118", "94121", "94122", "94123", "94124", "94127", "94131", "94132", "94133", "94134", "94143", "94158"] },
  { name: "Nob Hill", slug: "nob-hill", displayName: "Nob Hill, SF" },
  { name: "Russian Hill", slug: "russian-hill", displayName: "Russian Hill, SF" },
  { name: "Pacific Heights", slug: "pacific-heights", displayName: "Pacific Heights, SF", zipCodes: ["94115", "94118", "94123"] },
  { name: "North Beach", slug: "north-beach", displayName: "North Beach, SF" },
  { name: "Mission District", slug: "mission", displayName: "Mission District, SF" },
  { name: "Castro", slug: "castro", displayName: "Castro, SF" },
  { name: "Hayes Valley", slug: "hayes-valley", displayName: "Hayes Valley, SF" },
  { name: "SoMa", slug: "soma", displayName: "SoMa, SF" },
  { name: "Noe Valley", slug: "noe-valley", displayName: "Noe Valley, SF" },
  { name: "Sunset District", slug: "sunset", displayName: "Sunset District, SF" },
  { name: "Richmond District", slug: "richmond", displayName: "Richmond District, SF" },
  { name: "Bernal Heights", slug: "bernal-heights", displayName: "Bernal Heights, SF" },
  { name: "Haight-Ashbury", slug: "haight-ashbury", displayName: "Haight-Ashbury, SF" },
  { name: "Marina District", slug: "marina", displayName: "Marina District, SF" },
  { name: "Potrero Hill", slug: "potrero-hill", displayName: "Potrero Hill, SF" },
  { name: "Dogpatch", slug: "dogpatch", displayName: "Dogpatch, SF" },
  { name: "Chinatown", slug: "chinatown", displayName: "Chinatown, SF" },
  { name: "Japantown", slug: "japantown", displayName: "Japantown, SF" },
  { name: "Presidio", slug: "presidio", displayName: "Presidio, SF" },
  { name: "Twin Peaks", slug: "twin-peaks", displayName: "Twin Peaks, SF" },
  { name: "Glen Park", slug: "glen-park", displayName: "Glen Park, SF" },
  { name: "Financial District", slug: "financial-district", displayName: "Financial District, SF" },
  { name: "Tenderloin", slug: "tenderloin", displayName: "Tenderloin, SF" }
]

const MONTEREY_COUNTY_CITIES: CountyCity[] = [
  { name: "Carmel-by-the-Sea", slug: "carmel-by-the-sea-ca", displayName: "Carmel-by-the-Sea, CA", zipCodes: ["93921", "93922", "93923"] },
  { name: "Del Rey Oaks", slug: "del-rey-oaks-ca", displayName: "Del Rey Oaks, CA", zipCodes: ["93940"] },
  { name: "Gonzales", slug: "gonzales-ca", displayName: "Gonzales, CA", zipCodes: ["93926"] },
  { name: "Greenfield", slug: "greenfield-ca", displayName: "Greenfield, CA", zipCodes: ["93927"] },
  { name: "King City", slug: "king-city-ca", displayName: "King City, CA", zipCodes: ["93930"] },
  { name: "Marina", slug: "marina-ca", displayName: "Marina, CA", zipCodes: ["93933"] },
  { name: "Monterey", slug: "monterey-ca", displayName: "Monterey, CA", zipCodes: ["93940", "93942", "93943", "93944"] },
  { name: "Pacific Grove", slug: "pacific-grove-ca", displayName: "Pacific Grove, CA", zipCodes: ["93950"] },
  { name: "Salinas", slug: "salinas-ca", displayName: "Salinas, CA", zipCodes: ["93901", "93905", "93906", "93907", "93908", "93912", "93915"] },
  { name: "Sand City", slug: "sand-city-ca", displayName: "Sand City, CA", zipCodes: ["93955"] },
  { name: "Seaside", slug: "seaside-ca", displayName: "Seaside, CA", zipCodes: ["93955"] },
  { name: "Soledad", slug: "soledad-ca", displayName: "Soledad, CA", zipCodes: ["93960"] },
]

const SAN_LUIS_OBISPO_COUNTY_CITIES: CountyCity[] = [
  { name: "Arroyo Grande", slug: "arroyo-grande-ca", displayName: "Arroyo Grande, CA", zipCodes: ["93420", "93421"] },
  { name: "Atascadero", slug: "atascadero-ca", displayName: "Atascadero, CA", zipCodes: ["93422", "93423"] },
  { name: "Grover Beach", slug: "grover-beach-ca", displayName: "Grover Beach, CA", zipCodes: ["93433"] },
  { name: "Morro Bay", slug: "morro-bay-ca", displayName: "Morro Bay, CA", zipCodes: ["93442", "93443"] },
  { name: "Paso Robles", slug: "paso-robles-ca", displayName: "Paso Robles, CA", zipCodes: ["93446"] },
  { name: "Pismo Beach", slug: "pismo-beach-ca", displayName: "Pismo Beach, CA", zipCodes: ["93449"] },
  { name: "San Luis Obispo", slug: "san-luis-obispo-ca", displayName: "San Luis Obispo, CA", zipCodes: ["93401", "93403", "93405", "93406", "93408", "93410", "93412"] },
]

const SANTA_CRUZ_COUNTY_CITIES: CountyCity[] = [
  { name: "Capitola", slug: "capitola-ca", displayName: "Capitola, CA", zipCodes: ["95010"] },
  { name: "Santa Cruz", slug: "santa-cruz-ca", displayName: "Santa Cruz, CA", zipCodes: ["95060", "95062", "95063", "95064", "95065"] },
  { name: "Scotts Valley", slug: "scotts-valley-ca", displayName: "Scotts Valley, CA", zipCodes: ["95066"] },
  { name: "Watsonville", slug: "watsonville-ca", displayName: "Watsonville, CA", zipCodes: ["95076", "95077"] },
]

const SAN_JOAQUIN_COUNTY_CITIES: CountyCity[] = [
  { name: "Escalon", slug: "escalon-ca", displayName: "Escalon, CA", zipCodes: ["95320"] },
  { name: "Lathrop", slug: "lathrop-ca", displayName: "Lathrop, CA", zipCodes: ["95330"] },
  { name: "Lodi", slug: "lodi-ca", displayName: "Lodi, CA", zipCodes: ["95240", "95242"] },
  { name: "Manteca", slug: "manteca-ca", displayName: "Manteca, CA", zipCodes: ["95336", "95337"] },
  { name: "Ripon", slug: "ripon-ca", displayName: "Ripon, CA", zipCodes: ["95366"] },
  { name: "Stockton", slug: "stockton-ca", displayName: "Stockton, CA", zipCodes: ["95202", "95203", "95204", "95205", "95206", "95207", "95209", "95210", "95211", "95212", "95219"] },
  { name: "Tracy", slug: "tracy-ca", displayName: "Tracy, CA", zipCodes: ["95304", "95376", "95377", "95391"] },
]

const SOLANO_COUNTY_CITIES: CountyCity[] = [
  { name: "Benicia", slug: "benicia-ca", displayName: "Benicia, CA", zipCodes: ["94510"] },
  { name: "Dixon", slug: "dixon-ca", displayName: "Dixon, CA", zipCodes: ["95620"] },
  { name: "Fairfield", slug: "fairfield-ca", displayName: "Fairfield, CA", zipCodes: ["94533", "94534", "94535"] },
  { name: "Rio Vista", slug: "rio-vista-ca", displayName: "Rio Vista, CA", zipCodes: ["94571"] },
  { name: "Suisun City", slug: "suisun-city-ca", displayName: "Suisun City, CA", zipCodes: ["94585"] },
  { name: "Vacaville", slug: "vacaville-ca", displayName: "Vacaville, CA", zipCodes: ["95687", "95688"] },
  { name: "Vallejo", slug: "vallejo-ca", displayName: "Vallejo, CA", zipCodes: ["94589", "94590", "94591", "94592"] },
]

const FRESNO_COUNTY_CITIES: CountyCity[] = [
  { name: "Clovis", slug: "clovis-ca", displayName: "Clovis, CA", zipCodes: ["93611", "93612", "93619"] },
  { name: "Coalinga", slug: "coalinga-ca", displayName: "Coalinga, CA", zipCodes: ["93210"] },
  { name: "Firebaugh", slug: "firebaugh-ca", displayName: "Firebaugh, CA", zipCodes: ["93622"] },
  { name: "Fowler", slug: "fowler-ca", displayName: "Fowler, CA", zipCodes: ["93625"] },
  { name: "Fresno", slug: "fresno-ca", displayName: "Fresno, CA", zipCodes: ["93701", "93702", "93703", "93704", "93705", "93706", "93710", "93711", "93720", "93721", "93722", "93725", "93726", "93727", "93728", "93730"] },
  { name: "Huron", slug: "huron-ca", displayName: "Huron, CA", zipCodes: ["93234"] },
  { name: "Kerman", slug: "kerman-ca", displayName: "Kerman, CA", zipCodes: ["93630"] },
  { name: "Kingsburg", slug: "kingsburg-ca", displayName: "Kingsburg, CA", zipCodes: ["93631"] },
  { name: "Mendota", slug: "mendota-ca", displayName: "Mendota, CA", zipCodes: ["93640"] },
  { name: "Orange Cove", slug: "orange-cove-ca", displayName: "Orange Cove, CA", zipCodes: ["93646"] },
  { name: "Parlier", slug: "parlier-ca", displayName: "Parlier, CA", zipCodes: ["93648"] },
  { name: "Reedley", slug: "reedley-ca", displayName: "Reedley, CA", zipCodes: ["93654"] },
  { name: "San Joaquin", slug: "san-joaquin-ca", displayName: "San Joaquin, CA", zipCodes: ["93660"] },
  { name: "Sanger", slug: "sanger-ca", displayName: "Sanger, CA", zipCodes: ["93657"] },
  { name: "Selma", slug: "selma-ca", displayName: "Selma, CA", zipCodes: ["93662"] },
]

const KERN_COUNTY_CITIES: CountyCity[] = [
  { name: "Arvin", slug: "arvin-ca", displayName: "Arvin, CA", zipCodes: ["93203"] },
  { name: "Bakersfield", slug: "bakersfield-ca", displayName: "Bakersfield, CA", zipCodes: ["93301", "93304", "93305", "93306", "93307", "93308", "93309", "93311", "93312", "93313", "93314"] },
  { name: "California City", slug: "california-city-ca", displayName: "California City, CA", zipCodes: ["93505"] },
  { name: "Delano", slug: "delano-ca", displayName: "Delano, CA", zipCodes: ["93215"] },
  { name: "Maricopa", slug: "maricopa-ca", displayName: "Maricopa, CA", zipCodes: ["93252"] },
  { name: "McFarland", slug: "mcfarland-ca", displayName: "McFarland, CA", zipCodes: ["93250"] },
  { name: "Ridgecrest", slug: "ridgecrest-ca", displayName: "Ridgecrest, CA", zipCodes: ["93555"] },
  { name: "Shafter", slug: "shafter-ca", displayName: "Shafter, CA", zipCodes: ["93263"] },
  { name: "Taft", slug: "taft-ca", displayName: "Taft, CA", zipCodes: ["93268"] },
  { name: "Tehachapi", slug: "tehachapi-ca", displayName: "Tehachapi, CA", zipCodes: ["93561"] },
  { name: "Wasco", slug: "wasco-ca", displayName: "Wasco, CA", zipCodes: ["93280"] },
]

const PLACER_COUNTY_CITIES: CountyCity[] = [
  { name: "Auburn", slug: "auburn-ca", displayName: "Auburn, CA", zipCodes: ["95602", "95603", "95604"] },
  { name: "Colfax", slug: "colfax-ca", displayName: "Colfax, CA", zipCodes: ["95713"] },
  { name: "Lincoln", slug: "lincoln-ca", displayName: "Lincoln, CA", zipCodes: ["95648"] },
  { name: "Loomis", slug: "loomis-ca", displayName: "Loomis, CA", zipCodes: ["95650"] },
  { name: "Rocklin", slug: "rocklin-ca", displayName: "Rocklin, CA", zipCodes: ["95677", "95765"] },
  { name: "Roseville", slug: "roseville-ca", displayName: "Roseville, CA", zipCodes: ["95661", "95678", "95747"] },
]

const EL_DORADO_COUNTY_CITIES: CountyCity[] = [
  { name: "Placerville", slug: "placerville-ca", displayName: "Placerville, CA", zipCodes: ["95667"] },
  { name: "South Lake Tahoe", slug: "south-lake-tahoe-ca", displayName: "South Lake Tahoe, CA", zipCodes: ["96150", "96151", "96158"] },
]

const STANISLAUS_COUNTY_CITIES: CountyCity[] = [
  { name: "Ceres", slug: "ceres-ca", displayName: "Ceres, CA", zipCodes: ["95307"] },
  { name: "Hughson", slug: "hughson-ca", displayName: "Hughson, CA", zipCodes: ["95326"] },
  { name: "Modesto", slug: "modesto-ca", displayName: "Modesto, CA", zipCodes: ["95350", "95351", "95354", "95355", "95356", "95357", "95358"] },
  { name: "Newman", slug: "newman-ca", displayName: "Newman, CA", zipCodes: ["95360"] },
  { name: "Oakdale", slug: "oakdale-ca", displayName: "Oakdale, CA", zipCodes: ["95361"] },
  { name: "Patterson", slug: "patterson-ca", displayName: "Patterson, CA", zipCodes: ["95363"] },
  { name: "Riverbank", slug: "riverbank-ca", displayName: "Riverbank, CA", zipCodes: ["95367"] },
  { name: "Salida", slug: "salida-ca", displayName: "Salida, CA", zipCodes: ["95368"] },
  { name: "Turlock", slug: "turlock-ca", displayName: "Turlock, CA", zipCodes: ["95380", "95381", "95382"] },
  { name: "Waterford", slug: "waterford-ca", displayName: "Waterford, CA", zipCodes: ["95386"] },
]

const MERCED_COUNTY_CITIES: CountyCity[] = [
  { name: "Atwater", slug: "atwater-ca", displayName: "Atwater, CA", zipCodes: ["95301"] },
  { name: "Dos Palos", slug: "dos-palos-ca", displayName: "Dos Palos, CA", zipCodes: ["93620"] },
  { name: "Gustine", slug: "gustine-ca", displayName: "Gustine, CA", zipCodes: ["95322"] },
  { name: "Livingston", slug: "livingston-ca", displayName: "Livingston, CA", zipCodes: ["95334"] },
  { name: "Los Banos", slug: "los-banos-ca", displayName: "Los Banos, CA", zipCodes: ["93635"] },
  { name: "Merced", slug: "merced-ca", displayName: "Merced, CA", zipCodes: ["95340", "95341", "95343", "95348"] },
]

const MADERA_COUNTY_CITIES: CountyCity[] = [
  { name: "Chowchilla", slug: "chowchilla-ca", displayName: "Chowchilla, CA", zipCodes: ["93610"] },
  { name: "Madera", slug: "madera-ca", displayName: "Madera, CA", zipCodes: ["93637", "93638", "93639"] },
]

const YOLO_COUNTY_CITIES: CountyCity[] = [
  { name: "Davis", slug: "davis-ca", displayName: "Davis, CA", zipCodes: ["95616", "95617", "95618"] },
  { name: "West Sacramento", slug: "west-sacramento-ca", displayName: "West Sacramento, CA", zipCodes: ["95605", "95691"] },
  { name: "Winters", slug: "winters-ca", displayName: "Winters, CA", zipCodes: ["95694"] },
  { name: "Woodland", slug: "woodland-ca", displayName: "Woodland, CA", zipCodes: ["95695", "95776"] },
]

const SAN_BENITO_COUNTY_CITIES: CountyCity[] = [
  { name: "Hollister", slug: "hollister-ca", displayName: "Hollister, CA", zipCodes: ["95023", "95024"] },
  { name: "San Juan Bautista", slug: "san-juan-bautista-ca", displayName: "San Juan Bautista, CA", zipCodes: ["95045"] },
]

const IMPERIAL_COUNTY_CITIES: CountyCity[] = [
  { name: "Brawley", slug: "brawley-ca", displayName: "Brawley, CA", zipCodes: ["92227"] },
  { name: "Calexico", slug: "calexico-ca", displayName: "Calexico, CA", zipCodes: ["92231", "92232"] },
  { name: "Calipatria", slug: "calipatria-ca", displayName: "Calipatria, CA", zipCodes: ["92233"] },
  { name: "El Centro", slug: "el-centro-ca", displayName: "El Centro, CA", zipCodes: ["92243", "92244"] },
  { name: "Holtville", slug: "holtville-ca", displayName: "Holtville, CA", zipCodes: ["92250"] },
  { name: "Imperial", slug: "imperial-ca", displayName: "Imperial, CA", zipCodes: ["92251"] },
  { name: "Westmorland", slug: "westmorland-ca", displayName: "Westmorland, CA", zipCodes: ["92281"] },
]

const TULARE_COUNTY_CITIES: CountyCity[] = [
  { name: "Dinuba", slug: "dinuba-ca", displayName: "Dinuba, CA", zipCodes: ["93618"] },
  { name: "Exeter", slug: "exeter-ca", displayName: "Exeter, CA", zipCodes: ["93221"] },
  { name: "Farmersville", slug: "farmersville-ca", displayName: "Farmersville, CA", zipCodes: ["93223"] },
  { name: "Lindsay", slug: "lindsay-ca", displayName: "Lindsay, CA", zipCodes: ["93247"] },
  { name: "Porterville", slug: "porterville-ca", displayName: "Porterville, CA", zipCodes: ["93257", "93258"] },
  { name: "Strathmore", slug: "strathmore-ca", displayName: "Strathmore, CA", zipCodes: ["93267"] },
  { name: "Tulare", slug: "tulare-ca", displayName: "Tulare, CA", zipCodes: ["93274", "93275"] },
  { name: "Visalia", slug: "visalia-ca", displayName: "Visalia, CA", zipCodes: ["93277", "93278", "93291", "93292"] },
  { name: "Woodlake", slug: "woodlake-ca", displayName: "Woodlake, CA", zipCodes: ["93286"] },
]

const KINGS_COUNTY_CITIES: CountyCity[] = [
  { name: "Avenal", slug: "avenal-ca", displayName: "Avenal, CA", zipCodes: ["93204"] },
  { name: "Corcoran", slug: "corcoran-ca", displayName: "Corcoran, CA", zipCodes: ["93212"] },
  { name: "Hanford", slug: "hanford-ca", displayName: "Hanford, CA", zipCodes: ["93230", "93232"] },
  { name: "Lemoore", slug: "lemoore-ca", displayName: "Lemoore, CA", zipCodes: ["93245"] },
]

const BUTTE_COUNTY_CITIES: CountyCity[] = [
  { name: "Biggs", slug: "biggs-ca", displayName: "Biggs, CA", zipCodes: ["95917"] },
  { name: "Chico", slug: "chico-ca", displayName: "Chico, CA", zipCodes: ["95926", "95927", "95928", "95973"] },
  { name: "Gridley", slug: "gridley-ca", displayName: "Gridley, CA", zipCodes: ["95948"] },
  { name: "Oroville", slug: "oroville-ca", displayName: "Oroville, CA", zipCodes: ["95965", "95966"] },
  { name: "Paradise", slug: "paradise-ca", displayName: "Paradise, CA", zipCodes: ["95969"] },
]

const HUMBOLDT_COUNTY_CITIES: CountyCity[] = [
  { name: "Arcata", slug: "arcata-ca", displayName: "Arcata, CA", zipCodes: ["95521"] },
  { name: "Blue Lake", slug: "blue-lake-ca", displayName: "Blue Lake, CA", zipCodes: ["95525"] },
  { name: "Eureka", slug: "eureka-ca", displayName: "Eureka, CA", zipCodes: ["95501", "95502", "95503"] },
  { name: "Ferndale", slug: "ferndale-ca", displayName: "Ferndale, CA", zipCodes: ["95536"] },
  { name: "Fortuna", slug: "fortuna-ca", displayName: "Fortuna, CA", zipCodes: ["95540"] },
  { name: "Rio Dell", slug: "rio-dell-ca", displayName: "Rio Dell, CA", zipCodes: ["95562"] },
  { name: "Trinidad", slug: "trinidad-ca", displayName: "Trinidad, CA", zipCodes: ["95570"] },
]

const SHASTA_COUNTY_CITIES: CountyCity[] = [
  { name: "Anderson", slug: "anderson-ca", displayName: "Anderson, CA", zipCodes: ["96007"] },
  { name: "Redding", slug: "redding-ca", displayName: "Redding, CA", zipCodes: ["96001", "96002", "96003"] },
  { name: "Shasta Lake", slug: "shasta-lake-ca", displayName: "Shasta Lake, CA", zipCodes: ["96019"] },
]

const LAKE_COUNTY_CITIES: CountyCity[] = [
  { name: "Clearlake", slug: "clearlake-ca", displayName: "Clearlake, CA", zipCodes: ["95422", "95423", "95424"] },
  { name: "Lakeport", slug: "lakeport-ca", displayName: "Lakeport, CA", zipCodes: ["95453"] },
]

const MENDOCINO_COUNTY_CITIES: CountyCity[] = [
  { name: "Fort Bragg", slug: "fort-bragg-ca", displayName: "Fort Bragg, CA", zipCodes: ["95437"] },
  { name: "Point Arena", slug: "point-arena-ca", displayName: "Point Arena, CA", zipCodes: ["95468"] },
  { name: "Ukiah", slug: "ukiah-ca", displayName: "Ukiah, CA", zipCodes: ["95482"] },
  { name: "Willits", slug: "willits-ca", displayName: "Willits, CA", zipCodes: ["95490"] },
]

const NEVADA_COUNTY_CITIES: CountyCity[] = [
  { name: "Grass Valley", slug: "grass-valley-ca", displayName: "Grass Valley, CA", zipCodes: ["95945", "95949"] },
  { name: "Nevada City", slug: "nevada-city-ca", displayName: "Nevada City, CA", zipCodes: ["95959"] },
  { name: "Truckee", slug: "truckee-ca", displayName: "Truckee, CA", zipCodes: ["96160", "96161", "96162"] },
]

const YUBA_COUNTY_CITIES: CountyCity[] = [
  { name: "Marysville", slug: "marysville-ca", displayName: "Marysville, CA", zipCodes: ["95901"] },
  { name: "Wheatland", slug: "wheatland-ca", displayName: "Wheatland, CA", zipCodes: ["95692"] },
]

const SUTTER_COUNTY_CITIES: CountyCity[] = [
  { name: "Live Oak", slug: "live-oak-ca", displayName: "Live Oak, CA", zipCodes: ["95953"] },
  { name: "Yuba City", slug: "yuba-city-ca", displayName: "Yuba City, CA", zipCodes: ["95991", "95993"] },
]

const TEHAMA_COUNTY_CITIES: CountyCity[] = [
  { name: "Corning", slug: "corning-ca", displayName: "Corning, CA", zipCodes: ["96021"] },
  { name: "Red Bluff", slug: "red-bluff-ca", displayName: "Red Bluff, CA", zipCodes: ["96080"] },
  { name: "Tehama", slug: "tehama-ca", displayName: "Tehama, CA", zipCodes: ["96090"] },
]

const AMADOR_COUNTY_CITIES: CountyCity[] = [
  { name: "Amador City", slug: "amador-city-ca", displayName: "Amador City, CA", zipCodes: ["95601"] },
  { name: "Ione", slug: "ione-ca", displayName: "Ione, CA", zipCodes: ["95640"] },
  { name: "Jackson", slug: "jackson-ca", displayName: "Jackson, CA", zipCodes: ["95642"] },
  { name: "Plymouth", slug: "plymouth-ca", displayName: "Plymouth, CA", zipCodes: ["95669"] },
  { name: "Sutter Creek", slug: "sutter-creek-ca", displayName: "Sutter Creek, CA", zipCodes: ["95685"] },
]

// Alpine County has no incorporated cities; expose its county seat for property search.
const ALPINE_COUNTY_CITIES: CountyCity[] = [
  { name: "Markleeville", slug: "markleeville-ca", displayName: "Markleeville, CA", zipCodes: ["96120"] },
]

const CALAVERAS_COUNTY_CITIES: CountyCity[] = [
  { name: "Angels Camp", slug: "angels-camp-ca", displayName: "Angels Camp, CA", zipCodes: ["95222"] },
]

const COLUSA_COUNTY_CITIES: CountyCity[] = [
  { name: "Colusa", slug: "colusa-ca", displayName: "Colusa, CA", zipCodes: ["95932"] },
  { name: "Williams", slug: "williams-ca", displayName: "Williams, CA", zipCodes: ["95987"] },
]

const DEL_NORTE_COUNTY_CITIES: CountyCity[] = [
  { name: "Crescent City", slug: "crescent-city-ca", displayName: "Crescent City, CA", zipCodes: ["95531", "95532", "95538"] },
]

const GLENN_COUNTY_CITIES: CountyCity[] = [
  { name: "Orland", slug: "orland-ca", displayName: "Orland, CA", zipCodes: ["95963"] },
  { name: "Willows", slug: "willows-ca", displayName: "Willows, CA", zipCodes: ["95988"] },
]

const INYO_COUNTY_CITIES: CountyCity[] = [
  { name: "Bishop", slug: "bishop-ca", displayName: "Bishop, CA", zipCodes: ["93514", "93515"] },
]

const LASSEN_COUNTY_CITIES: CountyCity[] = [
  { name: "Susanville", slug: "susanville-ca", displayName: "Susanville, CA", zipCodes: ["96130"] },
]

// Mariposa County has no incorporated cities; expose its county seat for property search.
const MARIPOSA_COUNTY_CITIES: CountyCity[] = [
  { name: "Mariposa", slug: "mariposa-ca", displayName: "Mariposa, CA", zipCodes: ["95338"] },
]

const MODOC_COUNTY_CITIES: CountyCity[] = [
  { name: "Alturas", slug: "alturas-ca", displayName: "Alturas, CA", zipCodes: ["96101"] },
]

const MONO_COUNTY_CITIES: CountyCity[] = [
  { name: "Mammoth Lakes", slug: "mammoth-lakes-ca", displayName: "Mammoth Lakes, CA", zipCodes: ["93546"] },
]

const PLUMAS_COUNTY_CITIES: CountyCity[] = [
  { name: "Chester", slug: "chester-ca", displayName: "Chester, CA", zipCodes: ["96020"] },
  { name: "Portola", slug: "portola-ca", displayName: "Portola, CA", zipCodes: ["96122"] },
  { name: "Quincy", slug: "quincy-ca", displayName: "Quincy, CA", zipCodes: ["95971"] },
]

const SIERRA_COUNTY_CITIES: CountyCity[] = [
  { name: "Loyalton", slug: "loyalton-ca", displayName: "Loyalton, CA", zipCodes: ["96118"] },
]

const SISKIYOU_COUNTY_CITIES: CountyCity[] = [
  { name: "Dorris", slug: "dorris-ca", displayName: "Dorris, CA", zipCodes: ["96023"] },
  { name: "Dunsmuir", slug: "dunsmuir-ca", displayName: "Dunsmuir, CA", zipCodes: ["96025"] },
  { name: "Etna", slug: "etna-ca", displayName: "Etna, CA", zipCodes: ["96027"] },
  { name: "Fort Jones", slug: "fort-jones-ca", displayName: "Fort Jones, CA", zipCodes: ["96032"] },
  { name: "Montague", slug: "montague-ca", displayName: "Montague, CA", zipCodes: ["96064"] },
  { name: "Mount Shasta", slug: "mount-shasta-ca", displayName: "Mount Shasta, CA", zipCodes: ["96067"] },
  { name: "Tulelake", slug: "tulelake-ca", displayName: "Tulelake, CA", zipCodes: ["96134"] },
  { name: "Weed", slug: "weed-ca", displayName: "Weed, CA", zipCodes: ["96094"] },
  { name: "Yreka", slug: "yreka-ca", displayName: "Yreka, CA", zipCodes: ["96097"] },
]

// Trinity County has no incorporated cities; expose its county seat for property search.
const TRINITY_COUNTY_CITIES: CountyCity[] = [
  { name: "Weaverville", slug: "weaverville-ca", displayName: "Weaverville, CA", zipCodes: ["96093"] },
]

const TUOLUMNE_COUNTY_CITIES: CountyCity[] = [
  { name: "Sonora", slug: "sonora-ca", displayName: "Sonora, CA", zipCodes: ["95370"] },
]

export const COUNTIES: CountyConfig[] = [
  {
    slug: "san-diego",
    name: "San Diego County",
    state: "CA",
    cities: SAN_DIEGO_CITIES
  },
  {
    slug: "orange",
    name: "Orange County",
    state: "CA",
    cities: ORANGE_COUNTY_CITIES
  },
  {
    slug: "los-angeles",
    name: "Los Angeles County",
    state: "CA",
    cities: LOS_ANGELES_COUNTY_CITIES
  },
  {
    slug: "napa",
    name: "Napa County",
    state: "CA",
    cities: NAPA_COUNTY_CITIES
  },
  {
    slug: "santa-barbara",
    name: "Santa Barbara County",
    state: "CA",
    cities: SANTA_BARBARA_COUNTY_CITIES
  },
  {
    slug: "santa-clara",
    name: "Santa Clara County",
    state: "CA",
    cities: SANTA_CLARA_COUNTY_CITIES
  },
  // Additional California counties (stubbed with empty city lists for now)
  { slug: "alameda", name: "Alameda County", state: "CA", cities: ALAMEDA_COUNTY_CITIES },
  { slug: "alpine", name: "Alpine County", state: "CA", cities: ALPINE_COUNTY_CITIES },
  { slug: "amador", name: "Amador County", state: "CA", cities: AMADOR_COUNTY_CITIES },
  { slug: "butte", name: "Butte County", state: "CA", cities: BUTTE_COUNTY_CITIES },
  { slug: "calaveras", name: "Calaveras County", state: "CA", cities: CALAVERAS_COUNTY_CITIES },
  { slug: "colusa", name: "Colusa County", state: "CA", cities: COLUSA_COUNTY_CITIES },
  { slug: "contra-costa", name: "Contra Costa County", state: "CA", cities: CONTRA_COSTA_COUNTY_CITIES },
  { slug: "del-norte", name: "Del Norte County", state: "CA", cities: DEL_NORTE_COUNTY_CITIES },
  { slug: "el-dorado", name: "El Dorado County", state: "CA", cities: EL_DORADO_COUNTY_CITIES },
  { slug: "fresno", name: "Fresno County", state: "CA", cities: FRESNO_COUNTY_CITIES },
  { slug: "glenn", name: "Glenn County", state: "CA", cities: GLENN_COUNTY_CITIES },
  { slug: "humboldt", name: "Humboldt County", state: "CA", cities: HUMBOLDT_COUNTY_CITIES },
  { slug: "imperial", name: "Imperial County", state: "CA", cities: IMPERIAL_COUNTY_CITIES },
  { slug: "inyo", name: "Inyo County", state: "CA", cities: INYO_COUNTY_CITIES },
  { slug: "kern", name: "Kern County", state: "CA", cities: KERN_COUNTY_CITIES },
  { slug: "kings", name: "Kings County", state: "CA", cities: KINGS_COUNTY_CITIES },
  { slug: "lake", name: "Lake County", state: "CA", cities: LAKE_COUNTY_CITIES },
  { slug: "lassen", name: "Lassen County", state: "CA", cities: LASSEN_COUNTY_CITIES },
  { slug: "madera", name: "Madera County", state: "CA", cities: MADERA_COUNTY_CITIES },
  { slug: "marin", name: "Marin County", state: "CA", cities: MARIN_COUNTY_CITIES },
  { slug: "mariposa", name: "Mariposa County", state: "CA", cities: MARIPOSA_COUNTY_CITIES },
  { slug: "mendocino", name: "Mendocino County", state: "CA", cities: MENDOCINO_COUNTY_CITIES },
  { slug: "merced", name: "Merced County", state: "CA", cities: MERCED_COUNTY_CITIES },
  { slug: "modoc", name: "Modoc County", state: "CA", cities: MODOC_COUNTY_CITIES },
  { slug: "mono", name: "Mono County", state: "CA", cities: MONO_COUNTY_CITIES },
  { slug: "monterey", name: "Monterey County", state: "CA", cities: MONTEREY_COUNTY_CITIES },
  { slug: "nevada", name: "Nevada County", state: "CA", cities: NEVADA_COUNTY_CITIES },
  { slug: "placer", name: "Placer County", state: "CA", cities: PLACER_COUNTY_CITIES },
  { slug: "plumas", name: "Plumas County", state: "CA", cities: PLUMAS_COUNTY_CITIES },
  { slug: "riverside", name: "Riverside County", state: "CA", cities: RIVERSIDE_COUNTY_CITIES },
  { slug: "sacramento", name: "Sacramento County", state: "CA", cities: SACRAMENTO_COUNTY_CITIES },
  { slug: "san-benito", name: "San Benito County", state: "CA", cities: SAN_BENITO_COUNTY_CITIES },
  { slug: "san-bernardino", name: "San Bernardino County", state: "CA", cities: SAN_BERNARDINO_COUNTY_CITIES },
  { slug: "san-francisco", name: "San Francisco County", state: "CA", cities: SAN_FRANCISCO_COUNTY_CITIES },
  { slug: "san-joaquin", name: "San Joaquin County", state: "CA", cities: SAN_JOAQUIN_COUNTY_CITIES },
  { slug: "san-luis-obispo", name: "San Luis Obispo County", state: "CA", cities: SAN_LUIS_OBISPO_COUNTY_CITIES },
  { slug: "san-mateo", name: "San Mateo County", state: "CA", cities: SAN_MATEO_COUNTY_CITIES },
  { slug: "santa-cruz", name: "Santa Cruz County", state: "CA", cities: SANTA_CRUZ_COUNTY_CITIES },
  { slug: "shasta", name: "Shasta County", state: "CA", cities: SHASTA_COUNTY_CITIES },
  { slug: "sierra", name: "Sierra County", state: "CA", cities: SIERRA_COUNTY_CITIES },
  { slug: "siskiyou", name: "Siskiyou County", state: "CA", cities: SISKIYOU_COUNTY_CITIES },
  { slug: "solano", name: "Solano County", state: "CA", cities: SOLANO_COUNTY_CITIES },
  { slug: "sonoma", name: "Sonoma County", state: "CA", cities: SONOMA_COUNTY_CITIES },
  { slug: "stanislaus", name: "Stanislaus County", state: "CA", cities: STANISLAUS_COUNTY_CITIES },
  { slug: "sutter", name: "Sutter County", state: "CA", cities: SUTTER_COUNTY_CITIES },
  { slug: "tehama", name: "Tehama County", state: "CA", cities: TEHAMA_COUNTY_CITIES },
  { slug: "trinity", name: "Trinity County", state: "CA", cities: TRINITY_COUNTY_CITIES },
  { slug: "tulare", name: "Tulare County", state: "CA", cities: TULARE_COUNTY_CITIES },
  { slug: "tuolumne", name: "Tuolumne County", state: "CA", cities: TUOLUMNE_COUNTY_CITIES },
  { slug: "ventura", name: "Ventura County", state: "CA", cities: VENTURA_COUNTY_CITIES },
  { slug: "yolo", name: "Yolo County", state: "CA", cities: YOLO_COUNTY_CITIES },
  { slug: "yuba", name: "Yuba County", state: "CA", cities: YUBA_COUNTY_CITIES },
]

const countyMap = new Map(COUNTIES.map((county) => [county.slug, county]))
const citySlugMap = new Map(
  COUNTIES.flatMap((county) =>
    county.cities.map((city) => [city.slug, city])
  )
)

export function getCounty(slug: string): CountyConfig | undefined {
  return countyMap.get(slug.toLowerCase())
}

export function getCountyCities(slug: string): CountyCity[] {
  return countyMap.get(slug.toLowerCase())?.cities ?? []
}

export function getCityBySlug(citySlug: string): CountyCity | undefined {
  return citySlugMap.get(citySlug.toLowerCase())
}

export function cityToSlug(name: string): string {
  const base = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
  return base.endsWith("-ca") ? base : `${base}-ca`
}

export function slugToDisplay(citySlug: string): string {
  const entry = getCityBySlug(citySlug)
  if (entry) return entry.displayName
  const cleaned = citySlug.replace(/-ca$/i, "").replace(/-/g, " ")
  const titled = cleaned.replace(/\b\w/g, (c) => c.toUpperCase())
  return `${titled}, CA`
}

export function slugToCityName(citySlug: string): string {
  const entry = getCityBySlug(citySlug)
  if (entry) return entry.name
  return citySlug.replace(/-ca$/i, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function getAllCitySlugsForCounty(countySlug: string): string[] {
  return getCountyCities(countySlug).map((city) => city.slug)
}

/** Resolve a city display name to its county slug + city slug for /buy routing. */
export function getCountyAndCitySlugForCityName(
  cityName: string
): { countySlug: string; citySlug: string } | null {
  const lower = cityName.toLowerCase().trim()
  for (const county of COUNTIES) {
    for (const city of county.cities) {
      if (city.name.toLowerCase() === lower) {
        return { countySlug: county.slug, citySlug: city.slug }
      }
    }
  }
  return null
}

/** Resolve a ZIP code to its county slug + city slug for /buy routing. */
export function getCountyAndCitySlugForZip(
  zip: string
): { countySlug: string; citySlug: string; cityName: string } | null {
  const trimmed = zip.trim()
  for (const county of COUNTIES) {
    for (const city of county.cities) {
      if (city.zipCodes?.includes(trimmed)) {
        return { countySlug: county.slug, citySlug: city.slug, cityName: city.name }
      }
    }
  }
  return null
}
