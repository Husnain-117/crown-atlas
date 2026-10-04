# Remaining counties for SEO (excludes: san-diego, orange, santa-clara = done; los-angeles, napa = other dev)
# Order matches REMAINING_COUNTIES_LIST.md; batches of 10 (last batch = 3)
# Each: slug, name (display), cities: [{"name", "slug"}]

REMAINING_COUNTIES = [
    # Batch 1 (1-10)
    {"slug": "santa-barbara", "name": "Santa Barbara County", "cities": [
        {"name": "Buellton", "slug": "buellton-ca"}, {"name": "Carpinteria", "slug": "carpinteria-ca"},
        {"name": "Goleta", "slug": "goleta-ca"}, {"name": "Guadalupe", "slug": "guadalupe-ca"},
        {"name": "Lompoc", "slug": "lompoc-ca"}, {"name": "Santa Barbara", "slug": "santa-barbara-ca"},
        {"name": "Santa Maria", "slug": "santa-maria-ca"}, {"name": "Solvang", "slug": "solvang-ca"},
    ]},
    {"slug": "alameda", "name": "Alameda County", "cities": [
        {"name": "Alameda", "slug": "alameda-ca"}, {"name": "Albany", "slug": "albany-ca"},
        {"name": "Berkeley", "slug": "berkeley-ca"}, {"name": "Dublin", "slug": "dublin-ca"},
        {"name": "Emeryville", "slug": "emeryville-ca"}, {"name": "Fremont", "slug": "fremont-ca"},
        {"name": "Hayward", "slug": "hayward-ca"}, {"name": "Livermore", "slug": "livermore-ca"},
        {"name": "Newark", "slug": "newark-ca"}, {"name": "Oakland", "slug": "oakland-ca"},
        {"name": "Piedmont", "slug": "piedmont-ca"}, {"name": "Pleasanton", "slug": "pleasanton-ca"},
        {"name": "San Leandro", "slug": "san-leandro-ca"}, {"name": "Union City", "slug": "union-city-ca"},
    ]},
    {"slug": "alpine", "name": "Alpine County", "cities": []},
    {"slug": "amador", "name": "Amador County", "cities": [
        {"name": "Amador City", "slug": "amador-city-ca"}, {"name": "Ione", "slug": "ione-ca"},
        {"name": "Jackson", "slug": "jackson-ca"}, {"name": "Plymouth", "slug": "plymouth-ca"},
        {"name": "Sutter Creek", "slug": "sutter-creek-ca"},
    ]},
    {"slug": "butte", "name": "Butte County", "cities": [
        {"name": "Biggs", "slug": "biggs-ca"}, {"name": "Chico", "slug": "chico-ca"},
        {"name": "Gridley", "slug": "gridley-ca"}, {"name": "Oroville", "slug": "oroville-ca"},
        {"name": "Paradise", "slug": "paradise-ca"},
    ]},
    {"slug": "calaveras", "name": "Calaveras County", "cities": [
        {"name": "Angels Camp", "slug": "angels-camp-ca"},
    ]},
    {"slug": "colusa", "name": "Colusa County", "cities": [
        {"name": "Colusa", "slug": "colusa-ca"}, {"name": "Williams", "slug": "williams-ca"},
    ]},
    {"slug": "contra-costa", "name": "Contra Costa County", "cities": [
        {"name": "Antioch", "slug": "antioch-ca"}, {"name": "Brentwood", "slug": "brentwood-ca"},
        {"name": "Clayton", "slug": "clayton-ca"}, {"name": "Concord", "slug": "concord-ca"},
        {"name": "Danville", "slug": "danville-ca"}, {"name": "El Cerrito", "slug": "el-cerrito-ca"},
        {"name": "Hercules", "slug": "hercules-ca"}, {"name": "Lafayette", "slug": "lafayette-ca"},
        {"name": "Martinez", "slug": "martinez-ca"}, {"name": "Moraga", "slug": "moraga-ca"},
        {"name": "Oakley", "slug": "oakley-ca"}, {"name": "Orinda", "slug": "orinda-ca"},
        {"name": "Pinole", "slug": "pinole-ca"}, {"name": "Pittsburg", "slug": "pittsburg-ca"},
        {"name": "Pleasant Hill", "slug": "pleasant-hill-ca"}, {"name": "Richmond", "slug": "richmond-ca"},
        {"name": "San Pablo", "slug": "san-pablo-ca"}, {"name": "San Ramon", "slug": "san-ramon-ca"},
        {"name": "Walnut Creek", "slug": "walnut-creek-ca"},
    ]},
    {"slug": "del-norte", "name": "Del Norte County", "cities": [
        {"name": "Crescent City", "slug": "crescent-city-ca"},
    ]},
    {"slug": "el-dorado", "name": "El Dorado County", "cities": [
        {"name": "Placerville", "slug": "placerville-ca"}, {"name": "South Lake Tahoe", "slug": "south-lake-tahoe-ca"},
    ]},
    # Batch 2 (11-20)
    {"slug": "fresno", "name": "Fresno County", "cities": [
        {"name": "Clovis", "slug": "clovis-ca"}, {"name": "Coalinga", "slug": "coalinga-ca"},
        {"name": "Dos Palos", "slug": "dos-palos-ca"}, {"name": "Firebaugh", "slug": "firebaugh-ca"},
        {"name": "Fowler", "slug": "fowler-ca"}, {"name": "Fresno", "slug": "fresno-ca"},
        {"name": "Huron", "slug": "huron-ca"}, {"name": "Kerman", "slug": "kerman-ca"},
        {"name": "Kingsburg", "slug": "kingsburg-ca"}, {"name": "Mendota", "slug": "mendota-ca"},
        {"name": "Orange Cove", "slug": "orange-cove-ca"}, {"name": "Parlier", "slug": "parlier-ca"},
        {"name": "Reedley", "slug": "reedley-ca"}, {"name": "Sanger", "slug": "sanger-ca"},
        {"name": "Selma", "slug": "selma-ca"},
    ]},
    {"slug": "glenn", "name": "Glenn County", "cities": [
        {"name": "Orland", "slug": "orland-ca"}, {"name": "Willows", "slug": "willows-ca"},
    ]},
    {"slug": "humboldt", "name": "Humboldt County", "cities": [
        {"name": "Arcata", "slug": "arcata-ca"}, {"name": "Blue Lake", "slug": "blue-lake-ca"},
        {"name": "Eureka", "slug": "eureka-ca"}, {"name": "Ferndale", "slug": "ferndale-ca"},
        {"name": "Fortuna", "slug": "fortuna-ca"}, {"name": "Rio Dell", "slug": "rio-dell-ca"},
    ]},
    {"slug": "imperial", "name": "Imperial County", "cities": [
        {"name": "Brawley", "slug": "brawley-ca"}, {"name": "Calexico", "slug": "calexico-ca"},
        {"name": "Calipatria", "slug": "calipatria-ca"}, {"name": "El Centro", "slug": "el-centro-ca"},
        {"name": "Holtville", "slug": "holtville-ca"}, {"name": "Imperial", "slug": "imperial-ca"},
        {"name": "Westmorland", "slug": "westmorland-ca"},
    ]},
    {"slug": "inyo", "name": "Inyo County", "cities": [
        {"name": "Bishop", "slug": "bishop-ca"},
    ]},
    {"slug": "kern", "name": "Kern County", "cities": [
        {"name": "Arvin", "slug": "arvin-ca"}, {"name": "Bakersfield", "slug": "bakersfield-ca"},
        {"name": "California City", "slug": "california-city-ca"}, {"name": "Delano", "slug": "delano-ca"},
        {"name": "Maricopa", "slug": "maricopa-ca"}, {"name": "McFarland", "slug": "mcfarland-ca"},
        {"name": "Ridgecrest", "slug": "ridgecrest-ca"}, {"name": "Shafter", "slug": "shafter-ca"},
        {"name": "Taft", "slug": "taft-ca"}, {"name": "Tehachapi", "slug": "tehachapi-ca"},
        {"name": "Wasco", "slug": "wasco-ca"},
    ]},
    {"slug": "kings", "name": "Kings County", "cities": [
        {"name": "Avenal", "slug": "avenal-ca"}, {"name": "Corcoran", "slug": "corcoran-ca"},
        {"name": "Hanford", "slug": "hanford-ca"}, {"name": "Lemoore", "slug": "lemoore-ca"},
    ]},
    {"slug": "lake", "name": "Lake County", "cities": [
        {"name": "Clearlake", "slug": "clearlake-ca"}, {"name": "Lakeport", "slug": "lakeport-ca"},
    ]},
    {"slug": "lassen", "name": "Lassen County", "cities": [
        {"name": "Susanville", "slug": "susanville-ca"},
    ]},
    {"slug": "madera", "name": "Madera County", "cities": [
        {"name": "Chowchilla", "slug": "chowchilla-ca"}, {"name": "Madera", "slug": "madera-ca"},
    ]},
    # Batch 3 (21-30)
    {"slug": "marin", "name": "Marin County", "cities": [
        {"name": "Belvedere", "slug": "belvedere-ca"}, {"name": "Corte Madera", "slug": "corte-madera-ca"},
        {"name": "Fairfax", "slug": "fairfax-ca"}, {"name": "Larkspur", "slug": "larkspur-ca"},
        {"name": "Mill Valley", "slug": "mill-valley-ca"}, {"name": "Novato", "slug": "novato-ca"},
        {"name": "San Anselmo", "slug": "san-anselmo-ca"}, {"name": "San Rafael", "slug": "san-rafael-ca"},
        {"name": "Sausalito", "slug": "sausalito-ca"}, {"name": "Tiburon", "slug": "tiburon-ca"},
    ]},
    {"slug": "mariposa", "name": "Mariposa County", "cities": []},
    {"slug": "mendocino", "name": "Mendocino County", "cities": [
        {"name": "Fort Bragg", "slug": "fort-bragg-ca"}, {"name": "Point Arena", "slug": "point-arena-ca"},
        {"name": "Ukiah", "slug": "ukiah-ca"}, {"name": "Willits", "slug": "willits-ca"},
    ]},
    {"slug": "merced", "name": "Merced County", "cities": [
        {"name": "Atwater", "slug": "atwater-ca"}, {"name": "Gustine", "slug": "gustine-ca"},
        {"name": "Livingston", "slug": "livingston-ca"}, {"name": "Los Banos", "slug": "los-banos-ca"},
        {"name": "Merced", "slug": "merced-ca"},
    ]},
    {"slug": "modoc", "name": "Modoc County", "cities": [
        {"name": "Alturas", "slug": "alturas-ca"},
    ]},
    {"slug": "mono", "name": "Mono County", "cities": [
        {"name": "Mammoth Lakes", "slug": "mammoth-lakes-ca"},
    ]},
    {"slug": "monterey", "name": "Monterey County", "cities": [
        {"name": "Carmel-by-the-Sea", "slug": "carmel-by-the-sea-ca"}, {"name": "Del Rey Oaks", "slug": "del-rey-oaks-ca"},
        {"name": "Gonzales", "slug": "gonzales-ca"}, {"name": "Greenfield", "slug": "greenfield-ca"},
        {"name": "King City", "slug": "king-city-ca"}, {"name": "Marina", "slug": "marina-ca"},
        {"name": "Monterey", "slug": "monterey-ca"}, {"name": "Pacific Grove", "slug": "pacific-grove-ca"},
        {"name": "Salinas", "slug": "salinas-ca"}, {"name": "Sand City", "slug": "sand-city-ca"},
        {"name": "Seaside", "slug": "seaside-ca"}, {"name": "Soledad", "slug": "soledad-ca"},
    ]},
    {"slug": "nevada", "name": "Nevada County", "cities": [
        {"name": "Grass Valley", "slug": "grass-valley-ca"}, {"name": "Nevada City", "slug": "nevada-city-ca"},
        {"name": "Truckee", "slug": "truckee-ca"},
    ]},
    {"slug": "placer", "name": "Placer County", "cities": [
        {"name": "Auburn", "slug": "auburn-ca"}, {"name": "Colfax", "slug": "colfax-ca"},
        {"name": "Lincoln", "slug": "lincoln-ca"}, {"name": "Loomis", "slug": "loomis-ca"},
        {"name": "Rocklin", "slug": "rocklin-ca"}, {"name": "Roseville", "slug": "roseville-ca"},
    ]},
    {"slug": "plumas", "name": "Plumas County", "cities": [
        {"name": "Chester", "slug": "chester-ca"}, {"name": "Portola", "slug": "portola-ca"},
        {"name": "Quincy", "slug": "quincy-ca"},
    ]},
    # Batch 4 (31-40)
    {"slug": "riverside", "name": "Riverside County", "cities": [
        {"name": "Banning", "slug": "banning-ca"}, {"name": "Beaumont", "slug": "beaumont-ca"},
        {"name": "Blythe", "slug": "blythe-ca"}, {"name": "Calimesa", "slug": "calimesa-ca"},
        {"name": "Canyon Lake", "slug": "canyon-lake-ca"}, {"name": "Cathedral City", "slug": "cathedral-city-ca"},
        {"name": "Coachella", "slug": "coachella-ca"}, {"name": "Corona", "slug": "corona-ca"},
        {"name": "Desert Hot Springs", "slug": "desert-hot-springs-ca"}, {"name": "Eastvale", "slug": "eastvale-ca"},
        {"name": "Hemet", "slug": "hemet-ca"}, {"name": "Indian Wells", "slug": "indian-wells-ca"},
        {"name": "Indio", "slug": "indio-ca"}, {"name": "Lake Elsinore", "slug": "lake-elsinore-ca"},
        {"name": "La Quinta", "slug": "la-quinta-ca"}, {"name": "Menifee", "slug": "menifee-ca"},
        {"name": "Moreno Valley", "slug": "moreno-valley-ca"}, {"name": "Murrieta", "slug": "murrieta-ca"},
        {"name": "Norco", "slug": "norco-ca"}, {"name": "Palm Desert", "slug": "palm-desert-ca"},
        {"name": "Palm Springs", "slug": "palm-springs-ca"}, {"name": "Perris", "slug": "perris-ca"},
        {"name": "Rancho Mirage", "slug": "rancho-mirage-ca"}, {"name": "Riverside", "slug": "riverside-ca"},
        {"name": "San Jacinto", "slug": "san-jacinto-ca"}, {"name": "Temecula", "slug": "temecula-ca"},
        {"name": "Wildomar", "slug": "wildomar-ca"},
    ]},
    {"slug": "sacramento", "name": "Sacramento County", "cities": [
        {"name": "Citrus Heights", "slug": "citrus-heights-ca"}, {"name": "Elk Grove", "slug": "elk-grove-ca"},
        {"name": "Folsom", "slug": "folsom-ca"}, {"name": "Galt", "slug": "galt-ca"},
        {"name": "Isleton", "slug": "isleton-ca"}, {"name": "Rancho Cordova", "slug": "rancho-cordova-ca"},
        {"name": "Sacramento", "slug": "sacramento-ca"},
    ]},
    {"slug": "san-benito", "name": "San Benito County", "cities": [
        {"name": "Hollister", "slug": "hollister-ca"}, {"name": "San Juan Bautista", "slug": "san-juan-bautista-ca"},
    ]},
    {"slug": "san-bernardino", "name": "San Bernardino County", "cities": [
        {"name": "Adelanto", "slug": "adelanto-ca"}, {"name": "Apple Valley", "slug": "apple-valley-ca"},
        {"name": "Barstow", "slug": "barstow-ca"}, {"name": "Big Bear Lake", "slug": "big-bear-lake-ca"},
        {"name": "Chino", "slug": "chino-ca"}, {"name": "Chino Hills", "slug": "chino-hills-ca"},
        {"name": "Colton", "slug": "colton-ca"}, {"name": "Fontana", "slug": "fontana-ca"},
        {"name": "Grand Terrace", "slug": "grand-terrace-ca"}, {"name": "Hesperia", "slug": "hesperia-ca"},
        {"name": "Highland", "slug": "highland-ca"}, {"name": "Loma Linda", "slug": "loma-linda-ca"},
        {"name": "Montclair", "slug": "montclair-ca"}, {"name": "Ontario", "slug": "ontario-ca"},
        {"name": "Rancho Cucamonga", "slug": "rancho-cucamonga-ca"}, {"name": "Redlands", "slug": "redlands-ca"},
        {"name": "Rialto", "slug": "rialto-ca"}, {"name": "San Bernardino", "slug": "san-bernardino-ca"},
        {"name": "Twentynine Palms", "slug": "twentynine-palms-ca"}, {"name": "Upland", "slug": "upland-ca"},
        {"name": "Victorville", "slug": "victorville-ca"}, {"name": "Yucaipa", "slug": "yucaipa-ca"},
        {"name": "Yucca Valley", "slug": "yucca-valley-ca"},
    ]},
    {"slug": "san-francisco", "name": "San Francisco County", "cities": [
        {"name": "San Francisco", "slug": "san-francisco-ca"},
    ]},
    {"slug": "san-joaquin", "name": "San Joaquin County", "cities": [
        {"name": "Escalon", "slug": "escalon-ca"}, {"name": "Lathrop", "slug": "lathrop-ca"},
        {"name": "Lodi", "slug": "lodi-ca"}, {"name": "Manteca", "slug": "manteca-ca"},
        {"name": "Ripon", "slug": "ripon-ca"}, {"name": "Stockton", "slug": "stockton-ca"},
        {"name": "Tracy", "slug": "tracy-ca"},
    ]},
    {"slug": "san-luis-obispo", "name": "San Luis Obispo County", "cities": [
        {"name": "Arroyo Grande", "slug": "arroyo-grande-ca"}, {"name": "Atascadero", "slug": "atascadero-ca"},
        {"name": "Grover Beach", "slug": "grover-beach-ca"}, {"name": "Morro Bay", "slug": "morro-bay-ca"},
        {"name": "Paso Robles", "slug": "paso-robles-ca"}, {"name": "Pismo Beach", "slug": "pismo-beach-ca"},
        {"name": "San Luis Obispo", "slug": "san-luis-obispo-ca"},
    ]},
    {"slug": "san-mateo", "name": "San Mateo County", "cities": [
        {"name": "Atherton", "slug": "atherton-ca"}, {"name": "Belmont", "slug": "belmont-ca"},
        {"name": "Brisbane", "slug": "brisbane-ca"}, {"name": "Burlingame", "slug": "burlingame-ca"},
        {"name": "Colma", "slug": "colma-ca"}, {"name": "Daly City", "slug": "daly-city-ca"},
        {"name": "East Palo Alto", "slug": "east-palo-alto-ca"}, {"name": "Foster City", "slug": "foster-city-ca"},
        {"name": "Half Moon Bay", "slug": "half-moon-bay-ca"}, {"name": "Hillsborough", "slug": "hillsborough-ca"},
        {"name": "Menlo Park", "slug": "menlo-park-ca"}, {"name": "Millbrae", "slug": "millbrae-ca"},
        {"name": "Pacifica", "slug": "pacifica-ca"}, {"name": "Portola Valley", "slug": "portola-valley-ca"},
        {"name": "Redwood City", "slug": "redwood-city-ca"}, {"name": "San Bruno", "slug": "san-bruno-ca"},
        {"name": "San Carlos", "slug": "san-carlos-ca"}, {"name": "San Mateo", "slug": "san-mateo-ca"},
        {"name": "South San Francisco", "slug": "south-san-francisco-ca"}, {"name": "Woodside", "slug": "woodside-ca"},
    ]},
    {"slug": "santa-cruz", "name": "Santa Cruz County", "cities": [
        {"name": "Capitola", "slug": "capitola-ca"}, {"name": "Santa Cruz", "slug": "santa-cruz-ca"},
        {"name": "Scotts Valley", "slug": "scotts-valley-ca"}, {"name": "Watsonville", "slug": "watsonville-ca"},
    ]},
    {"slug": "shasta", "name": "Shasta County", "cities": [
        {"name": "Anderson", "slug": "anderson-ca"}, {"name": "Redding", "slug": "redding-ca"},
        {"name": "Shasta Lake", "slug": "shasta-lake-ca"},
    ]},
    # Batch 5 (41-50)
    {"slug": "sierra", "name": "Sierra County", "cities": [
        {"name": "Loyalton", "slug": "loyalton-ca"},
    ]},
    {"slug": "siskiyou", "name": "Siskiyou County", "cities": [
        {"name": "Dorris", "slug": "dorris-ca"}, {"name": "Dunsmuir", "slug": "dunsmuir-ca"},
        {"name": "Etna", "slug": "etna-ca"}, {"name": "Fort Jones", "slug": "fort-jones-ca"},
        {"name": "Montague", "slug": "montague-ca"}, {"name": "Mount Shasta", "slug": "mount-shasta-ca"},
        {"name": "Tulelake", "slug": "tulelake-ca"}, {"name": "Weed", "slug": "weed-ca"},
        {"name": "Yreka", "slug": "yreka-ca"},
    ]},
    {"slug": "solano", "name": "Solano County", "cities": [
        {"name": "Benicia", "slug": "benicia-ca"}, {"name": "Dixon", "slug": "dixon-ca"},
        {"name": "Fairfield", "slug": "fairfield-ca"}, {"name": "Rio Vista", "slug": "rio-vista-ca"},
        {"name": "Suisun City", "slug": "suisun-city-ca"}, {"name": "Vacaville", "slug": "vacaville-ca"},
        {"name": "Vallejo", "slug": "vallejo-ca"},
    ]},
    {"slug": "sonoma", "name": "Sonoma County", "cities": [
        {"name": "Cloverdale", "slug": "cloverdale-ca"}, {"name": "Cotati", "slug": "cotati-ca"},
        {"name": "Healdsburg", "slug": "healdsburg-ca"}, {"name": "Petaluma", "slug": "petaluma-ca"},
        {"name": "Rohnert Park", "slug": "rohnert-park-ca"}, {"name": "Santa Rosa", "slug": "santa-rosa-ca"},
        {"name": "Sebastopol", "slug": "sebastopol-ca"}, {"name": "Sonoma", "slug": "sonoma-ca"},
        {"name": "Windsor", "slug": "windsor-ca"},
    ]},
    {"slug": "stanislaus", "name": "Stanislaus County", "cities": [
        {"name": "Ceres", "slug": "ceres-ca"}, {"name": "Hughson", "slug": "hughson-ca"},
        {"name": "Modesto", "slug": "modesto-ca"}, {"name": "Newman", "slug": "newman-ca"},
        {"name": "Oakdale", "slug": "oakdale-ca"}, {"name": "Patterson", "slug": "patterson-ca"},
        {"name": "Riverbank", "slug": "riverbank-ca"}, {"name": "Salida", "slug": "salida-ca"},
        {"name": "Turlock", "slug": "turlock-ca"}, {"name": "Waterford", "slug": "waterford-ca"},
    ]},
    {"slug": "sutter", "name": "Sutter County", "cities": [
        {"name": "Live Oak", "slug": "live-oak-ca"}, {"name": "Yuba City", "slug": "yuba-city-ca"},
    ]},
    {"slug": "tehama", "name": "Tehama County", "cities": [
        {"name": "Corning", "slug": "corning-ca"}, {"name": "Red Bluff", "slug": "red-bluff-ca"},
        {"name": "Tehama", "slug": "tehama-ca"},
    ]},
    {"slug": "trinity", "name": "Trinity County", "cities": []},
    {"slug": "tulare", "name": "Tulare County", "cities": [
        {"name": "Dinuba", "slug": "dinuba-ca"}, {"name": "Exeter", "slug": "exeter-ca"},
        {"name": "Farmersville", "slug": "farmersville-ca"}, {"name": "Lindsay", "slug": "lindsay-ca"},
        {"name": "Porterville", "slug": "porterville-ca"}, {"name": "Strathmore", "slug": "strathmore-ca"},
        {"name": "Tulare", "slug": "tulare-ca"}, {"name": "Visalia", "slug": "visalia-ca"},
        {"name": "Woodlake", "slug": "woodlake-ca"},
    ]},
    {"slug": "tuolumne", "name": "Tuolumne County", "cities": [
        {"name": "Sonora", "slug": "sonora-ca"},
    ]},
    # Batch 6 (51-53)
    {"slug": "ventura", "name": "Ventura County", "cities": [
        {"name": "Camarillo", "slug": "camarillo-ca"}, {"name": "Fillmore", "slug": "fillmore-ca"},
        {"name": "Moorpark", "slug": "moorpark-ca"}, {"name": "Ojai", "slug": "ojai-ca"},
        {"name": "Oxnard", "slug": "oxnard-ca"}, {"name": "Port Hueneme", "slug": "port-hueneme-ca"},
        {"name": "Ventura", "slug": "ventura-ca"}, {"name": "Santa Paula", "slug": "santa-paula-ca"},
        {"name": "Simi Valley", "slug": "simi-valley-ca"}, {"name": "Thousand Oaks", "slug": "thousand-oaks-ca"},
    ]},
    {"slug": "yolo", "name": "Yolo County", "cities": [
        {"name": "Davis", "slug": "davis-ca"}, {"name": "West Sacramento", "slug": "west-sacramento-ca"},
        {"name": "Winters", "slug": "winters-ca"}, {"name": "Woodland", "slug": "woodland-ca"},
    ]},
    {"slug": "yuba", "name": "Yuba County", "cities": [
        {"name": "Marysville", "slug": "marysville-ca"}, {"name": "Wheatland", "slug": "wheatland-ca"},
    ]},
]

BATCH_SIZE = 10

def get_batch(n: int):
    """1-based batch number; batch 6 has 3 counties (51-53)."""
    start = (n - 1) * BATCH_SIZE
    end = min(start + BATCH_SIZE, len(REMAINING_COUNTIES))
    return REMAINING_COUNTIES[start:end]

def get_county(slug: str):
    for c in REMAINING_COUNTIES:
        if c["slug"] == slug:
            return c
    return None
