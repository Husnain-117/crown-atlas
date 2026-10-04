import type { BuyerLocation } from './international-buyer-location-types';

// Official local research sources reviewed on 6 September 2026.
const sources = {
  bayArea: {
    label: 'MTC: the San Francisco Bay Area',
    href: 'https://mtc.ca.gov/planning/long-range-planning',
  },
  sfUses: {
    label: 'San Francisco: building uses and permits',
    href: 'https://www.sf.gov/existing-uses-in-building-permits',
  },
  sfPlanning: {
    label: 'San Francisco Planning: Property Information Map',
    href: 'https://sfplanninggis.org/pim/',
  },
  orangeCities: {
    label: 'Orange County: city directory',
    href: 'https://www.ocgov.com/about-county/info-oc/oc-links/orange-county-links/orange-county-cities',
  },
  orangePlanning: {
    label: 'OC Development Services: planning and development',
    href: 'https://pwds.oc.gov/service-areas/oc-development-services/planning-development',
  },
  orangeTax: {
    label: 'Orange County Treasurer: Mello-Roos',
    href: 'https://octreasurer.gov/melloroos',
  },
  newportCoastal: {
    label: 'Newport Beach: Local Coastal Program questions',
    href: 'https://www.newportbeachca.gov/government/departments/community-development-/planning-division/local-coastal-program-launch-page/faq?NavID=20286',
  },
  newportHarbor: {
    label: 'Newport Beach: Newport Harbor',
    href: 'https://newportbeachca.gov/trending/newport-harbor',
  },
  newportFlood: {
    label: 'Newport Beach: flood maps and management',
    href: 'https://www.newportbeachca.gov/government/departments/community-development/building-division/floodplain-management-information',
  },
  lagunaDesign: {
    label: 'Laguna Beach: design review',
    href: 'https://www.lagunabeachcity.net/government/departments/community-development/planning/design-review-process',
  },
  lagunaRecords: {
    label: 'Laguna Beach: Real Property Reports',
    href: 'https://www.lagunabeachcity.net/government/departments/community-development/planning-zoning/applications-handouts/real-property-reports',
  },
  lagunaEvacuation: {
    label: 'Laguna Beach: evacuation planning',
    href: 'https://www.lagunabeachcity.net/live-here/emergency-management/evacuation-planning',
  },
  irvineMaps: {
    label: 'Irvine: planning areas, zoning and district maps',
    href: 'https://gis.cityofirvine.org/irvinegis/pdfmaps.html',
  },
  irvineSchools: {
    label: 'Irvine Unified: school boundaries and assignments',
    href: 'https://iusd.org/about/iusd-enrollment/school-boundaries-assignments',
  },
  irvinePlanning: {
    label: 'Irvine: planning and zoning questions',
    href: 'https://legacy.cityofirvine.org/services/categoryqna.asp?id=194',
  },
  sanJosePermits: {
    label: 'San José: property and permit searches',
    href: 'https://www.sanjoseca.gov/businesses/development-services-permit-center/help-for-sjpermits-sjeplans',
  },
  sanJoseHistoric: {
    label: 'San José: projects involving historic resources',
    href: 'https://www.sanjoseca.gov/your-government/departments-offices/planning-building-code-enforcement/planning-division/historic-resources/permits-for-projects-with-historic-resources',
  },
  sanJoseNoise: {
    label: 'San José Mineta International Airport: noise research',
    href: 'https://www.flysanjose.com/node/10346',
  },
};

export const NORTH_ORANGE_BUYER_LOCATIONS: BuyerLocation[] = [
  {
    slug: 'san-francisco',
    name: 'San Francisco',
    kind: 'city',
    searchRegion: 'San Francisco / Bay Area',
    searchHref: '/buy/san-francisco/san-francisco-ca',
    image: '/city/california/san-francisco/san-francisco-ca.webp',
    imageAlt: 'San Francisco, California',
    en: {
      intro: 'Start by deciding whether you mean San Francisco itself or the wider Bay Area. San Francisco is both a city and a county; a South Bay search is a different brief. Within the city, connect the building, the street and the journeys you will actually make before comparing interiors.',
      searchFocus: 'Shortlist by ownership type, usable layout and daily routes. Include stairs, garage access and the walk from the nearest transit stop in each viewing.',
      checks: [
        {
          title: 'Set the search boundary',
          body: 'Keep San Francisco addresses separate from Peninsula and South Bay options. Test the full journey to your regular destination, including connections and the walk at either end.',
          source: sources.bayArea,
        },
        {
          title: 'Match rooms to the records',
          body: 'For converted ground floors or additional accommodation, ask how the space is recorded and permitted. Compare the current floor plan with the building records before relying on advertised use.',
          source: sources.sfUses,
        },
        {
          title: 'Research the parcel before a remodel',
          body: 'Use the city’s Property Information Map to start a planning and permit search. Bring the address and your proposed changes to Planning for property-specific clarification.',
          source: sources.sfPlanning,
        },
      ],
      areas: [
        {
          name: 'Pacific Heights',
          description: 'Explore this city neighbourhood, then compare individual buildings, street gradients and access to your regular destinations.',
          href: '/buy/san-francisco/pacific-heights',
        },
        {
          name: 'Noe Valley',
          description: 'Use the neighbourhood search to investigate the layout, outdoor space and street access of each available home.',
          href: '/buy/san-francisco/noe-valley',
        },
        {
          name: 'Mission District',
          description: 'Compare the immediate surroundings of each address, including evening activity, transit access and the building entrance.',
          href: '/buy/san-francisco/mission',
        },
      ],
      faqs: [
        {
          question: 'Does a San Francisco search cover the whole Bay Area?',
          answer: 'No. San Francisco is one city and county within a wider region. MTC plans for the nine-county Bay Area. If your destination is elsewhere in the region, compare that location separately instead of treating it as a San Francisco neighbourhood.',
          source: sources.bayArea,
        },
        {
          question: 'Can I assume a lower-level suite is an authorised dwelling?',
          answer: 'A listing description does not resolve that question. San Francisco distinguishes building uses in its permit system. Ask for records identifying the authorised use and unit count, and have discrepancies between the documents and the current layout explained.',
          source: sources.sfUses,
        },
        {
          question: 'Where should I start checking a San Francisco renovation idea?',
          answer: 'Find the exact property in the Planning Department’s Property Information Map and review the available planning and permit information. Ask Planning which reviews your intended work would need; a neighbouring renovation is not an approval for your property.',
          source: sources.sfPlanning,
        },
      ],
    },
    de: {
      intro: 'Legen Sie zuerst fest, ob Sie in San Francisco selbst oder in der weiteren Bay Area suchen. San Francisco ist zugleich Stadt und County; eine Suche in der South Bay betrifft andere Orte. Prüfen Sie innerhalb der Stadt Gebäude, Straße und Ihre regelmäßigen Wege gemeinsam, bevor Sie nur die Innenräume vergleichen.',
      searchFocus: 'Vergleichen Sie Eigentumsform, nutzbaren Grundriss und Alltagswege. Prüfen Sie bei jeder Besichtigung auch Treppen, Garagenzufahrt und den Fußweg zur Haltestelle.',
      checks: [
        {
          title: 'Suchgebiet klar abgrenzen',
          body: 'Trennen Sie Adressen in San Francisco von Angeboten auf der Peninsula oder in der South Bay. Testen Sie Ihre gesamte regelmäßige Strecke einschließlich Umsteigen und Fußwegen.',
          source: sources.bayArea,
        },
        {
          title: 'Räume mit Bauunterlagen abgleichen',
          body: 'Klären Sie bei ausgebauten Erdgeschossen oder zusätzlichen Wohnbereichen die dokumentierte und genehmigte Nutzung. Gleichen Sie den heutigen Grundriss mit den Bauunterlagen ab.',
          source: sources.sfUses,
        },
        {
          title: 'Umbaupläne am Grundstück prüfen',
          body: 'Beginnen Sie mit der Property Information Map der Stadt. Legen Sie der Planungsbehörde die genaue Adresse und Ihre gewünschten Änderungen zur Prüfung vor.',
          source: sources.sfPlanning,
        },
      ],
      areas: [
        {
          name: 'Pacific Heights',
          description: 'Vergleichen Sie in diesem Stadtviertel einzelne Gebäude, Straßensteigungen und die Wege zu Ihren regelmäßigen Zielen.',
          href: '/buy/san-francisco/pacific-heights',
        },
        {
          name: 'Noe Valley',
          description: 'Prüfen Sie anhand der verfügbaren Angebote Grundriss, Außenflächen und den Zugang von der Straße zum Haus.',
          href: '/buy/san-francisco/noe-valley',
        },
        {
          name: 'Mission District',
          description: 'Sehen Sie sich das direkte Umfeld der Adresse an: abendliche Nutzung, Haltestellen und Hauseingang gehören zum Vergleich.',
          href: '/buy/san-francisco/mission',
        },
      ],
      faqs: [
        {
          question: 'Umfasst eine Suche in San Francisco die gesamte Bay Area?',
          answer: 'Nein. San Francisco ist eine Stadt und zugleich ein County innerhalb der größeren Region. Die Verkehrsplanung der MTC umfasst die Bay Area mit neun Counties. Liegt Ihr regelmäßiges Ziel anderswo, vergleichen Sie den betreffenden Ort separat.',
          source: sources.bayArea,
        },
        {
          question: 'Ist ein ausgebautes Untergeschoss automatisch eine genehmigte Wohnung?',
          answer: 'Das lässt sich nicht aus dem Exposé ableiten. San Francisco unterscheidet verschiedene Gebäudenutzungen im Genehmigungssystem. Fordern Sie Unterlagen zur genehmigten Nutzung und Anzahl der Wohneinheiten an. Lassen Sie Abweichungen zum heutigen Grundriss erklären.',
          source: sources.sfUses,
        },
        {
          question: 'Wie beginne ich die Prüfung eines geplanten Umbaus in San Francisco?',
          answer: 'Suchen Sie das Grundstück in der Property Information Map und prüfen Sie die verfügbaren Planungs- und Genehmigungsinformationen. Klären Sie anschließend mit der Behörde, welche Verfahren für Ihr Vorhaben gelten. Ein Umbau beim Nachbarn ersetzt diese Prüfung nicht.',
          source: sources.sfPlanning,
        },
      ],
    },
  },
  {
    slug: 'orange-county',
    name: 'Orange County',
    kind: 'county',
    searchRegion: 'Orange County',
    searchHref: '/buy/orange',
    image: '/County/california/orange.webp',
    imageAlt: 'Orange County, California',
    en: {
      intro: 'Orange County is a county containing separate cities, including Newport Beach, Laguna Beach and Irvine. It is not another name for the City of Orange. Begin with a county-wide comparison, then narrow the search to the municipalities and addresses that fit your intended use and regular journeys.',
      searchFocus: 'Compare coastal and inland addresses using the same brief: home type, daily destinations, maintenance arrangements and an itemised ownership budget.',
      checks: [
        {
          title: 'Name the city as well as the county',
          body: 'Record the actual municipality for every shortlisted home. Keep Newport Beach, Laguna Beach and Irvine as separate comparisons rather than treating Orange County as one neighbourhood.',
          source: sources.orangeCities,
        },
        {
          title: 'Identify the permitting authority',
          body: 'Check whether the parcel is within an incorporated city or an unincorporated county area. Confirm which planning office holds the records before assessing alterations or intended uses.',
          source: sources.orangePlanning,
        },
        {
          title: 'Request a parcel-specific cost breakdown',
          body: 'Ask for the current property tax bill and an estimate for your proposed purchase. Identify any special assessment lines and obtain association charges separately.',
          source: sources.orangeTax,
        },
      ],
      areas: [
        {
          name: 'Newport Beach',
          description: 'A coastal city search for comparing harbour, beach and other residential settings, with property-specific access and permit checks.',
          href: '/buy/orange/newport-beach-ca',
        },
        {
          name: 'Laguna Beach',
          description: 'Compare coastal and hillside addresses, including the actual driveway, stairs and routes you would use.',
          href: '/buy/orange/laguna-beach-ca',
        },
        {
          name: 'Irvine',
          description: 'Compare planning areas and housing arrangements against your daily destinations, association documents and parcel costs.',
          href: '/buy/orange/irvine-ca',
        },
      ],
      faqs: [
        {
          question: 'Is Orange County the same place as the City of Orange?',
          answer: 'No. Orange County contains the City of Orange and other distinct cities, including Irvine, Newport Beach and Laguna Beach. A county search covers a broader area than a search for homes in the City of Orange.',
          source: sources.orangeCities,
        },
        {
          question: 'Does one planning office handle every home in Orange County?',
          answer: 'Do not assume a county address means county planning jurisdiction. First establish whether the property sits within a city or an unincorporated area, then confirm the responsible authority. OC Development Services is a starting point for county planning enquiries.',
          source: sources.orangePlanning,
        },
        {
          question: 'Why compare the tax bills of similar Orange County homes?',
          answer: 'Parcel charges can differ. The county explains that Mello-Roos charges appear among special assessments on the property tax bill. Request an itemised review for each address and a purchase-specific estimate rather than reusing the seller’s total.',
          source: sources.orangeTax,
        },
      ],
    },
    de: {
      intro: 'Orange County ist ein County mit eigenständigen Städten, darunter Newport Beach, Laguna Beach und Irvine. Es ist nicht gleichbedeutend mit der Stadt Orange. Beginnen Sie mit einem regionalen Vergleich und grenzen Sie dann die Städte und Adressen ein, die zu Ihrer Nutzung und Ihren regelmäßigen Wegen passen.',
      searchFocus: 'Vergleichen Sie Küsten- und Binnenlagen anhand derselben Kriterien: Haustyp, Alltagsziele, Betreuung des Hauses und einzeln aufgeschlüsselte laufende Kosten.',
      checks: [
        {
          title: 'Stadt und County festhalten',
          body: 'Notieren Sie für jedes Haus die tatsächliche Stadt. Vergleichen Sie Newport Beach, Laguna Beach und Irvine getrennt; Orange County ist kein einzelnes Stadtviertel.',
          source: sources.orangeCities,
        },
        {
          title: 'Zuständige Baubehörde feststellen',
          body: 'Prüfen Sie, ob das Grundstück innerhalb einer Stadt oder in einem vom County verwalteten Gebiet liegt. Klären Sie die Zuständigkeit für Bauakten und geplante Änderungen.',
          source: sources.orangePlanning,
        },
        {
          title: 'Kosten je Grundstück aufschlüsseln',
          body: 'Fordern Sie die aktuelle Grundsteuerabrechnung und eine Schätzung für Ihren Kauf an. Lassen Sie Sonderabgaben einzeln erklären und erfragen Sie Beiträge der Eigentümergemeinschaft separat.',
          source: sources.orangeTax,
        },
      ],
      areas: [
        {
          name: 'Newport Beach',
          description: 'Vergleichen Sie Hafen-, Strand- und weitere Wohnlagen dieser Küstenstadt mit Blick auf Zugang und Genehmigungen am konkreten Objekt.',
          href: '/buy/orange/newport-beach-ca',
        },
        {
          name: 'Laguna Beach',
          description: 'Prüfen Sie Küsten- und Hanglagen einschließlich der tatsächlichen Zufahrt, Treppen und Alltagswege.',
          href: '/buy/orange/laguna-beach-ca',
        },
        {
          name: 'Irvine',
          description: 'Gleichen Sie Planungsgebiete und Wohnformen mit Ihren Alltagszielen, Gemeinschaftsunterlagen und Grundstückskosten ab.',
          href: '/buy/orange/irvine-ca',
        },
      ],
      faqs: [
        {
          question: 'Sind Orange County und die Stadt Orange dasselbe?',
          answer: 'Nein. Zum County gehören die Stadt Orange und weitere eigenständige Städte wie Irvine, Newport Beach und Laguna Beach. Die Suche im gesamten County umfasst daher deutlich mehr Orte als eine Suche in der Stadt Orange.',
          source: sources.orangeCities,
        },
        {
          question: 'Ist eine einzige Baubehörde für ganz Orange County zuständig?',
          answer: 'Gehen Sie nicht automatisch von einer Zuständigkeit des Countys aus. Klären Sie zunächst, ob das Grundstück innerhalb einer Stadt oder in einem nicht eingemeindeten Gebiet liegt. OC Development Services ist eine erste Anlaufstelle für Planungsfragen auf County-Ebene.',
          source: sources.orangePlanning,
        },
        {
          question: 'Warum sollte ich die Grundsteuerabrechnungen ähnlicher Häuser vergleichen?',
          answer: 'Grundstücksbezogene Abgaben können abweichen. Das County erläutert, dass Mello-Roos unter den Sonderabgaben der Grundsteuerabrechnung erscheinen. Lassen Sie die Positionen jedes Objekts prüfen und eine Schätzung für Ihren Kauf erstellen, statt den Gesamtbetrag des Verkäufers zu übernehmen.',
          source: sources.orangeTax,
        },
      ],
    },
  },
  {
    slug: 'newport-beach',
    name: 'Newport Beach',
    kind: 'city',
    parentSlug: 'orange-county',
    searchRegion: 'Orange County',
    searchHref: '/buy/orange/newport-beach-ca',
    image: '/city/california/orange/newport-beach-ca.webp',
    imageAlt: 'Newport Beach in Orange County, California',
    en: {
      intro: 'In Newport Beach, decide what being near the water means for your search: a view, a walk to the beach, a harbour frontage or access to a boat. Those are different property questions. Add parking, access from the street and any planned alterations to the brief before arranging viewings.',
      searchFocus: 'Separate the house from any claimed waterfront rights. Compare the exact parcel, permitted improvements and your practical route to the water.',
      checks: [
        {
          title: 'Check the coastal-zone address',
          body: 'Use the city’s Local Coastal Program guidance to check the property’s location. Ask Planning about your proposed alterations before treating a coastal home as a straightforward remodel.',
          source: sources.newportCoastal,
        },
        {
          title: 'Investigate the dock separately',
          body: 'For a home advertised with a pier or dock, request the current authorisation and maintenance records. Ask the Harbor Department what applies to that facility and a change of ownership.',
          source: sources.newportHarbor,
        },
        {
          title: 'Use the flood map for the actual parcel',
          body: 'Review the city’s flood information for the address and request property-specific insurance terms. A photograph, water view or nearby home’s policy cannot answer that enquiry.',
          source: sources.newportFlood,
        },
      ],
      areas: [
        {
          name: 'Newport Beach',
          description: 'Keep the main city search open while comparing the precise setting and water access of individual homes.',
          href: '/buy/orange/newport-beach-ca',
        },
        {
          name: 'Costa Mesa',
          description: 'Compare this separate nearby city if your priorities include regular inland destinations as well as coastal visits.',
          href: '/buy/orange/costa-mesa-ca',
        },
        {
          name: 'Irvine',
          description: 'Add a separate inland city comparison when the everyday journey matters more than having a Newport Beach address.',
          href: '/buy/orange/irvine-ca',
        },
      ],
      faqs: [
        {
          question: 'Does a Newport Beach waterfront listing automatically include dock rights?',
          answer: 'Treat the dock as a separate due-diligence question. The city manages residential pier matters in Newport Harbor. Obtain the facility’s documentation and ask the Harbor Department to confirm the authorisation, permitted use and ownership-change process for that particular dock.',
          source: sources.newportHarbor,
        },
        {
          question: 'Could changing a coastal home require more than a building permit?',
          answer: 'Yes, coastal review may be relevant. Start with the city’s Local Coastal Program map and guidance, then describe the exact work to Planning. The address and project scope determine the questions to resolve before setting a renovation budget.',
          source: sources.newportCoastal,
        },
        {
          question: 'How should I compare flood exposure between Newport Beach homes?',
          answer: 'Review the mapped information for each parcel through the city’s flood resources, then discuss the building and coverage with an insurer. Use the same questions for every home; a broad neighbourhood description does not establish conditions or insurance terms at an address.',
          source: sources.newportFlood,
        },
      ],
    },
    de: {
      intro: 'Legen Sie für Newport Beach fest, was Wassernähe für Sie bedeutet: Aussicht, ein Fußweg zum Strand, eine Lage am Hafen oder ein Bootszugang. Daraus ergeben sich unterschiedliche Objektprüfungen. Ergänzen Sie Parkplatz, Zugang von der Straße und mögliche Umbauten, bevor Sie Besichtigungen planen.',
      searchFocus: 'Prüfen Sie das Haus und etwaige Nutzungsrechte am Wasser getrennt. Entscheidend sind Grundstück, genehmigte Anlagen und Ihr tatsächlicher Weg zum Wasser.',
      checks: [
        {
          title: 'Lage in der Küstenzone prüfen',
          body: 'Prüfen Sie die Adresse anhand des Local Coastal Program der Stadt. Klären Sie geplante Änderungen mit der Baubehörde, bevor Sie den Umbau als unkompliziert einplanen.',
          source: sources.newportCoastal,
        },
        {
          title: 'Bootssteg separat untersuchen',
          body: 'Fordern Sie für einen beworbenen Bootssteg Genehmigungs- und Wartungsunterlagen an. Fragen Sie beim Harbor Department nach den Vorgaben für die Anlage und einen Eigentümerwechsel.',
          source: sources.newportHarbor,
        },
        {
          title: 'Überflutungsinformationen je Adresse prüfen',
          body: 'Prüfen Sie die städtischen Karten für das konkrete Grundstück und holen Sie objektspezifische Versicherungsbedingungen ein. Fotos oder die Police eines Nachbarhauses ersetzen diese Prüfung nicht.',
          source: sources.newportFlood,
        },
      ],
      areas: [
        {
          name: 'Newport Beach',
          description: 'Vergleichen Sie innerhalb der Stadt die genaue Lage und den tatsächlichen Wasserzugang der einzelnen Häuser.',
          href: '/buy/orange/newport-beach-ca',
        },
        {
          name: 'Costa Mesa',
          description: 'Beziehen Sie diese eigenständige Nachbarstadt ein, wenn Sie sowohl Ziele im Landesinneren als auch die Küste regelmäßig besuchen möchten.',
          href: '/buy/orange/costa-mesa-ca',
        },
        {
          name: 'Irvine',
          description: 'Vergleichen Sie diese separate Stadt im Landesinneren, wenn Ihr täglicher Weg wichtiger ist als eine Adresse in Newport Beach.',
          href: '/buy/orange/irvine-ca',
        },
      ],
      faqs: [
        {
          question: 'Gehören zu einem Haus am Wasser automatisch Rechte an einem Bootssteg?',
          answer: 'Prüfen Sie den Steg separat. Die Stadt bearbeitet Angelegenheiten privater Bootsanleger im Newport Harbor. Fordern Sie die Unterlagen an und lassen Sie vom Harbor Department Genehmigung, zulässige Nutzung und Verfahren beim Eigentümerwechsel für genau diese Anlage bestätigen.',
          source: sources.newportHarbor,
        },
        {
          question: 'Kann ein Umbau zusätzlich zur Baugenehmigung eine Küstenprüfung erfordern?',
          answer: 'Ja, eine zusätzliche Prüfung kann relevant sein. Beginnen Sie mit Karte und Erläuterungen zum Local Coastal Program. Besprechen Sie dann die konkreten Arbeiten mit der Behörde. Adresse und Umfang des Vorhabens bestimmen, was vor der Budgetplanung zu klären ist.',
          source: sources.newportCoastal,
        },
        {
          question: 'Wie vergleiche ich mögliche Überflutungsrisiken verschiedener Häuser?',
          answer: 'Prüfen Sie die städtischen Karten für jedes Grundstück und besprechen Sie Gebäude und Deckung mit einem Versicherer. Stellen Sie bei jedem Haus dieselben Fragen. Eine allgemeine Lagebeschreibung belegt weder die Bedingungen am Objekt noch dessen Versicherbarkeit.',
          source: sources.newportFlood,
        },
      ],
    },
  },
  {
    slug: 'laguna-beach',
    name: 'Laguna Beach',
    kind: 'city',
    parentSlug: 'orange-county',
    searchRegion: 'Orange County',
    searchHref: '/buy/orange/laguna-beach-ca',
    image: '/city/california/orange/laguna-beach-ca.webp',
    imageAlt: 'Laguna Beach in Orange County, California',
    en: {
      intro: 'A Laguna Beach search should connect the view with the way the house works. Walk from the parking space to the entrance, test any sloping driveway and follow your route to everyday destinations. For a hillside or altered home, make the building records and your future plans part of the comparison.',
      searchFocus: 'Compare access, existing approvals and renovation scope alongside the coastal setting. Look at the actual address before drawing conclusions from a listing photograph.',
      checks: [
        {
          title: 'Read the property report against the house',
          body: 'Request the city’s Real Property Report and relevant plans. Compare recorded information with the rooms, decks and additions shown at the viewing, and raise discrepancies before proceeding.',
          source: sources.lagunaRecords,
        },
        {
          title: 'Discuss the remodel before pricing it',
          body: 'Take a clear description of exterior changes, additions or rebuilding to Planning. Check the applicable design review process rather than assuming an existing view establishes what you can build.',
          source: sources.lagunaDesign,
        },
        {
          title: 'Learn the address and its exit routes',
          body: 'Use the city’s evacuation resources to identify the home’s zone and plan practical routes. Include household mobility needs and arrangements for anyone staying while you are away.',
          source: sources.lagunaEvacuation,
        },
      ],
      areas: [
        {
          name: 'Laguna Beach',
          description: 'Compare individual coastal and hillside homes, keeping the approach to the property and planned alterations in view.',
          href: '/buy/orange/laguna-beach-ca',
        },
        {
          name: 'Laguna Niguel',
          description: 'This is a separate city. Add it to the comparison if an inland address could fit your home and travel requirements.',
          href: '/buy/orange/laguna-niguel-ca',
        },
        {
          name: 'Dana Point',
          description: 'Compare another coastal city using the same brief for space, access, ownership arrangements and everyday journeys.',
          href: '/buy/orange/dana-point-ca',
        },
      ],
      faqs: [
        {
          question: 'What is a useful first records request for a Laguna Beach home?',
          answer: 'Ask for the city’s Real Property Report and supporting property records. Use them to frame questions about the existing building and any changes. They are a research starting point; arrange the physical inspections and specialist reviews the particular property needs.',
          source: sources.lagunaRecords,
        },
        {
          question: 'Can I assume a Laguna Beach house can be enlarged after purchase?',
          answer: 'No approval follows from a listing description. The city has a design review process, and the applicable planning controls depend on the property and proposal. Discuss your intended addition or replacement with Planning before treating it as part of the purchase plan.',
          source: sources.lagunaDesign,
        },
        {
          question: 'How do I research evacuation arrangements for a hillside address?',
          answer: 'Start with the city’s evacuation planning resources and locate the address’s zone. Familiarise yourself with the routes and local alert information. Build a household plan that also works for visitors or anyone responsible for the home during your absence.',
          source: sources.lagunaEvacuation,
        },
      ],
    },
    de: {
      intro: 'Prüfen Sie in Laguna Beach neben der Aussicht auch, wie das Haus im Alltag funktioniert. Gehen Sie vom Parkplatz zum Eingang, testen Sie eine geneigte Zufahrt und Ihre Wege zu regelmäßigen Zielen. Bei Hanglagen oder umgebauten Häusern gehören die Bauunterlagen und Ihre späteren Pläne zum Vergleich.',
      searchFocus: 'Vergleichen Sie Zugang, vorhandene Genehmigungen und Umbaupläne gemeinsam mit der Küstenlage. Prüfen Sie die konkrete Adresse, bevor Sie allein nach Fotos entscheiden.',
      checks: [
        {
          title: 'Objektbericht mit dem Haus abgleichen',
          body: 'Fordern Sie den städtischen Real Property Report und relevante Pläne an. Vergleichen Sie die Angaben mit Räumen, Terrassen und Anbauten vor Ort und klären Sie Abweichungen.',
          source: sources.lagunaRecords,
        },
        {
          title: 'Umbau vor der Kalkulation besprechen',
          body: 'Beschreiben Sie geplante Fassadenänderungen, Anbauten oder einen Neubau bei der Planungsbehörde. Klären Sie das Design-Review-Verfahren; aus einer vorhandenen Aussicht folgt kein bestimmtes Baurecht.',
          source: sources.lagunaDesign,
        },
        {
          title: 'Adresse und Ausweichwege kennenlernen',
          body: 'Ermitteln Sie mit den städtischen Evakuierungsinformationen die Zone des Hauses und mögliche Wege. Berücksichtigen Sie Mobilitätsbedürfnisse sowie Personen, die während Ihrer Abwesenheit dort wohnen.',
          source: sources.lagunaEvacuation,
        },
      ],
      areas: [
        {
          name: 'Laguna Beach',
          description: 'Vergleichen Sie einzelne Küsten- und Hanglagen einschließlich Zufahrt, Hauseingang und geplanter Veränderungen.',
          href: '/buy/orange/laguna-beach-ca',
        },
        {
          name: 'Laguna Niguel',
          description: 'Dies ist eine eigenständige Stadt. Beziehen Sie sie ein, wenn eine Lage im Landesinneren zu Ihren Wohn- und Reiseplänen passt.',
          href: '/buy/orange/laguna-niguel-ca',
        },
        {
          name: 'Dana Point',
          description: 'Vergleichen Sie eine weitere Küstenstadt nach denselben Kriterien für Platz, Zugang, Eigentumsform und Alltagswege.',
          href: '/buy/orange/dana-point-ca',
        },
      ],
      faqs: [
        {
          question: 'Welche Unterlagen sollte ich für ein Haus in Laguna Beach zuerst anfordern?',
          answer: 'Fragen Sie nach dem städtischen Real Property Report und den zugehörigen Objektunterlagen. Daraus lassen sich Fragen zum Gebäude und zu Veränderungen ableiten. Ergänzen Sie diese Recherche um die baulichen Untersuchungen und Fachprüfungen, die das konkrete Haus erfordert.',
          source: sources.lagunaRecords,
        },
        {
          question: 'Kann ich ein Haus in Laguna Beach nach dem Kauf einfach vergrößern?',
          answer: 'Ein Exposé ersetzt keine Genehmigung. Die Stadt hat ein Design-Review-Verfahren; maßgeblich sind Grundstück, Vorhaben und geltende Planungsvorgaben. Besprechen Sie den gewünschten Anbau oder Ersatzbau mit der Behörde, bevor Sie ihn zur Grundlage Ihrer Kaufplanung machen.',
          source: sources.lagunaDesign,
        },
        {
          question: 'Wie prüfe ich Evakuierungswege für eine Adresse am Hang?',
          answer: 'Beginnen Sie mit den städtischen Evakuierungsinformationen und ermitteln Sie die Zone der Adresse. Machen Sie sich mit Wegen und Warnsystemen vertraut. Planen Sie auch für Gäste und Personen, die das Haus während Ihrer Abwesenheit betreuen.',
          source: sources.lagunaEvacuation,
        },
      ],
    },
  },
  {
    slug: 'irvine',
    name: 'Irvine',
    kind: 'city',
    parentSlug: 'orange-county',
    searchRegion: 'Orange County',
    searchHref: '/buy/orange/irvine-ca',
    image: '/city/california/orange/irvine-ca.webp',
    imageAlt: 'Irvine in Orange County, California',
    en: {
      intro: 'For Irvine, turn a village name into an address-level comparison. Find the planning area, identify the ownership and association arrangements, and map your everyday destinations. If schools are part of the brief, verify the district and the address’s current assignment directly instead of relying on a listing’s general location label.',
      searchFocus: 'Compare the actual home and its documents: usable outdoor space, parking, association responsibilities, planning constraints and the journeys your household will make.',
      checks: [
        {
          title: 'Locate the home on the city maps',
          body: 'Use Irvine’s planning-area, tract and zoning maps to place the address. Keep the marketing name, official planning area and ownership documents as separate pieces of information.',
          source: sources.irvineMaps,
        },
        {
          title: 'Verify a school address directly',
          body: 'Identify the relevant district first. For an IUSD address, check its boundary and assignment tools for the intended school year, then confirm your circumstances with the district.',
          source: sources.irvineSchools,
        },
        {
          title: 'Read the association documents',
          body: 'For an association property, identify every applicable association, its charges and maintenance responsibilities. Ask about exterior changes, parking and arrangements for the home during extended absences.',
        },
      ],
      areas: [
        {
          name: 'Irvine',
          description: 'Compare homes across the city, then use the exact address to research the planning area and daily routes.',
          href: '/buy/orange/irvine-ca',
        },
        {
          name: 'Tustin',
          description: 'Add this separate nearby city to test whether another address better fits your space and travel requirements.',
          href: '/buy/orange/tustin-ca',
        },
        {
          name: 'Lake Forest',
          description: 'Compare a further Orange County city while applying the same questions about ownership, access and routine journeys.',
          href: '/buy/orange/lake-forest-ca',
        },
      ],
      faqs: [
        {
          question: 'How do I connect an Irvine village name with official property information?',
          answer: 'Start with the street address. The city publishes planning-area address maps, tract maps and zoning maps. Use those to locate the property, then check the applicable documents; a village name alone does not describe the parcel’s planning or ownership arrangements.',
          source: sources.irvineMaps,
        },
        {
          question: 'Does an Irvine listing establish which school a child can attend?',
          answer: 'No. Confirm the district and use its current address and enrolment guidance. IUSD provides school boundary and assignment resources for its district. Verify the intended school year and any individual placement questions with the district before relying on an advertised school name.',
          source: sources.irvineSchools,
        },
        {
          question: 'Where can I check a planned extension or different use of an Irvine home?',
          answer: 'Ask Irvine’s planning staff about the address and the exact proposal. The city’s zoning guidance covers permitted uses and development standards. If the home belongs to an association, obtain its requirements separately; resolve both sets of questions before commissioning a design.',
          source: sources.irvinePlanning,
        },
      ],
    },
    de: {
      intro: 'Machen Sie aus einem Village-Namen in Irvine einen Vergleich konkreter Adressen. Ermitteln Sie das Planungsgebiet, klären Sie Eigentumsform und Gemeinschaftsregeln und prüfen Sie Ihre Alltagswege. Wenn Schulen wichtig sind, bestätigen Sie Bezirk und aktuelle Zuordnung direkt, statt sich auf die allgemeine Lageangabe im Exposé zu verlassen.',
      searchFocus: 'Vergleichen Sie Haus und Unterlagen gemeinsam: nutzbare Außenflächen, Stellplätze, Aufgaben der Eigentümergemeinschaft, Planungsvorgaben und die regelmäßigen Wege Ihres Haushalts.',
      checks: [
        {
          title: 'Adresse in den Stadtplänen verorten',
          body: 'Prüfen Sie die Karten für Planungsgebiete, Grundstücksgruppen und bauliche Nutzung. Unterscheiden Sie Vermarktungsname, offizielles Planungsgebiet und die Angaben in den Eigentumsunterlagen.',
          source: sources.irvineMaps,
        },
        {
          title: 'Schulzuordnung direkt bestätigen',
          body: 'Ermitteln Sie zuerst den zuständigen Schulbezirk. Prüfen Sie bei einer IUSD-Adresse die Grenzen und Zuordnung für das gewünschte Schuljahr und klären Sie Ihren Einzelfall direkt.',
          source: sources.irvineSchools,
        },
        {
          title: 'Gemeinschaftsunterlagen lesen',
          body: 'Ermitteln Sie alle zuständigen Eigentümergemeinschaften, Beiträge und Instandhaltungspflichten. Fragen Sie nach Regeln für äußere Veränderungen, Parken und die Betreuung des Hauses bei längerer Abwesenheit.',
        },
      ],
      areas: [
        {
          name: 'Irvine',
          description: 'Vergleichen Sie Häuser im Stadtgebiet und prüfen Sie anschließend Planungsgebiet und Alltagswege anhand der genauen Adresse.',
          href: '/buy/orange/irvine-ca',
        },
        {
          name: 'Tustin',
          description: 'Beziehen Sie diese eigenständige Nachbarstadt ein, um Wohnfläche und regelmäßige Wege an weiteren Adressen zu vergleichen.',
          href: '/buy/orange/tustin-ca',
        },
        {
          name: 'Lake Forest',
          description: 'Vergleichen Sie eine weitere Stadt in Orange County mit denselben Fragen zu Eigentumsform, Zugang und Alltagswegen.',
          href: '/buy/orange/lake-forest-ca',
        },
      ],
      faqs: [
        {
          question: 'Wie finde ich zu einem Village-Namen die offiziellen Grundstücksinformationen?',
          answer: 'Beginnen Sie mit der Straßenadresse. Irvine veröffentlicht Adresskarten der Planungsgebiete sowie Karten zu Grundstücksgruppen und baulicher Nutzung. Ordnen Sie damit das Objekt zu und prüfen Sie die Unterlagen. Der Village-Name allein erklärt weder Planungsrecht noch Eigentumsverhältnisse.',
          source: sources.irvineMaps,
        },
        {
          question: 'Belegt ein Immobilienangebot in Irvine die Schulzuordnung meines Kindes?',
          answer: 'Nein. Bestätigen Sie zunächst den Schulbezirk und beachten Sie dessen aktuelle Adress- und Anmeldeinformationen. IUSD veröffentlicht Zuordnungs- und Grenzinformationen für seinen Bezirk. Klären Sie Schuljahr und individuelle Platzierungsfragen direkt, bevor Sie sich auf eine beworbene Schule verlassen.',
          source: sources.irvineSchools,
        },
        {
          question: 'Wo prüfe ich einen Anbau oder eine andere Nutzung eines Hauses in Irvine?',
          answer: 'Besprechen Sie Adresse und Vorhaben mit der städtischen Planungsstelle. Deren Zoning-Hinweise erläutern zulässige Nutzungen und Bebauungsvorgaben. Falls eine Eigentümergemeinschaft zuständig ist, erfragen Sie deren Regeln zusätzlich. Klären Sie beides, bevor Sie eine Planung beauftragen.',
          source: sources.irvinePlanning,
        },
      ],
    },
  },
  {
    slug: 'san-jose',
    name: 'San Jose',
    kind: 'city',
    searchRegion: 'San Francisco / Bay Area',
    searchHref: '/buy/santa-clara/san-jose-ca',
    image: '/city/california/santa-clara/san-jose-ca.webp',
    imageAlt: 'San Jose in Santa Clara County, California',
    en: {
      intro: 'San Jose is a separate city in Santa Clara County, in the South Bay, rather than a San Francisco neighbourhood. Anchor the search to the workplace or other destinations you will use. Then compare each address’s building history, immediate surroundings and practical access, rather than relying on the broad Silicon Valley label.',
      searchFocus: 'Test your regular journeys from the actual street. Review permits for altered spaces and spend time at the home to understand road, rail and aircraft noise.',
      checks: [
        {
          title: 'Verify jurisdiction and permit history',
          body: 'Use SJPermits to check the address, city-boundary information and permit history. Ask for clarification of additions or conversions that do not match the records provided.',
          source: sources.sanJosePermits,
        },
        {
          title: 'Check historic status before changing a home',
          body: 'For an older property, ask whether a historic designation affects your proposal. Review the city’s historic-resource permit guidance before planning exterior changes or replacement work.',
          source: sources.sanJoseHistoric,
        },
        {
          title: 'Research noise at the address',
          body: 'Use the airport’s noise resources as one input, then visit at different times. Include nearby roads, rail lines and activity around the home in your own assessment.',
          source: sources.sanJoseNoise,
        },
      ],
      areas: [
        {
          name: 'San Jose',
          description: 'Keep the city search tied to your specific destinations, then compare the records and setting of each shortlisted home.',
          href: '/buy/santa-clara/san-jose-ca',
        },
        {
          name: 'Campbell',
          description: 'Compare this separate Santa Clara County city if its addresses fit your daily route and housing requirements.',
          href: '/buy/santa-clara/campbell-ca',
        },
        {
          name: 'Santa Clara',
          description: 'Search the City of Santa Clara separately from San Jose; compare actual travel routes and property arrangements.',
          href: '/buy/santa-clara/santa-clara-ca',
        },
      ],
      faqs: [
        {
          question: 'Can I look up a San Jose home’s permits before travelling to view it?',
          answer: 'Yes. The city says anyone can search property permit history through SJPermits. Use the address to find the records and confirm city jurisdiction. Request explanations and supporting documents for relevant work; an online entry alone does not establish the home’s physical condition.',
          source: sources.sanJosePermits,
        },
        {
          question: 'How can historic status affect a San Jose renovation plan?',
          answer: 'San Jose has specific permit guidance for projects involving historic resources. Ask Planning which designation, if any, applies to the home and how it affects your intended work. Do this before assuming an older house can be altered in the same way as a nearby property.',
          source: sources.sanJoseHistoric,
        },
        {
          question: 'Is distance from San Jose airport enough to judge aircraft noise?',
          answer: 'No. The airport recommends researching the noise environment of the specific home and provides noise mapping. Use that alongside visits at different times; road, rail and other local activity also affect what you hear at a particular address.',
          source: sources.sanJoseNoise,
        },
      ],
    },
    de: {
      intro: 'San Jose ist eine eigenständige Stadt im Santa Clara County in der South Bay und kein Stadtviertel von San Francisco. Richten Sie die Suche an Ihrem Arbeitsplatz oder anderen regelmäßigen Zielen aus. Vergleichen Sie dann Bauhistorie, direktes Umfeld und Zugang jeder Adresse statt nur das allgemeine Schlagwort Silicon Valley.',
      searchFocus: 'Testen Sie Ihre Alltagswege ab der tatsächlichen Straße. Prüfen Sie Unterlagen zu umgebauten Räumen und erleben Sie Straßen-, Bahn- und Fluggeräusche am Haus selbst.',
      checks: [
        {
          title: 'Zuständigkeit und Bauhistorie prüfen',
          body: 'Prüfen Sie mit SJPermits Adresse, Stadtgrenze und Genehmigungshistorie. Lassen Sie Anbauten oder Umnutzungen erklären, die nicht mit den vorgelegten Unterlagen übereinstimmen.',
          source: sources.sanJosePermits,
        },
        {
          title: 'Historischen Schutzstatus klären',
          body: 'Fragen Sie bei älteren Häusern nach einer möglichen historischen Einstufung. Prüfen Sie die städtischen Hinweise, bevor Sie äußere Änderungen oder den Ersatz von Gebäudeteilen planen.',
          source: sources.sanJoseHistoric,
        },
        {
          title: 'Geräuschumfeld vor Ort erleben',
          body: 'Nutzen Sie die Lärminformationen des Flughafens und besuchen Sie das Haus zu unterschiedlichen Zeiten. Beziehen Sie Straßen, Bahnstrecken und Aktivitäten im unmittelbaren Umfeld ein.',
          source: sources.sanJoseNoise,
        },
      ],
      areas: [
        {
          name: 'San Jose',
          description: 'Richten Sie die Stadtsuche an Ihren konkreten Zielen aus und vergleichen Sie Unterlagen und Umfeld jedes Hauses.',
          href: '/buy/santa-clara/san-jose-ca',
        },
        {
          name: 'Campbell',
          description: 'Vergleichen Sie diese eigenständige Stadt im Santa Clara County anhand Ihrer täglichen Wege und Wohnanforderungen.',
          href: '/buy/santa-clara/campbell-ca',
        },
        {
          name: 'Santa Clara',
          description: 'Suchen Sie in der Stadt Santa Clara getrennt von San Jose und vergleichen Sie tatsächliche Wege sowie Eigentumsverhältnisse.',
          href: '/buy/santa-clara/santa-clara-ca',
        },
      ],
      faqs: [
        {
          question: 'Kann ich Genehmigungen eines Hauses in San Jose vor der Reise recherchieren?',
          answer: 'Ja. Laut Stadt kann jeder die Genehmigungshistorie über SJPermits durchsuchen. Prüfen Sie die Adresse und städtische Zuständigkeit. Fordern Sie zu relevanten Arbeiten Erläuterungen und Unterlagen an; ein Online-Eintrag belegt allein nicht den baulichen Zustand des Hauses.',
          source: sources.sanJosePermits,
        },
        {
          question: 'Was bedeutet ein historischer Schutzstatus für meinen Umbau in San Jose?',
          answer: 'San Jose veröffentlicht besondere Genehmigungshinweise für Vorhaben an historischen Objekten. Fragen Sie die Behörde nach der Einstufung des Hauses und deren Bedeutung für Ihre konkreten Arbeiten. Übertragen Sie einen Umbau am Nachbarhaus nicht ungeprüft auf das Kaufobjekt.',
          source: sources.sanJoseHistoric,
        },
        {
          question: 'Reicht die Entfernung zum Flughafen aus, um Fluglärm einzuschätzen?',
          answer: 'Nein. Der Flughafen empfiehlt, das Geräuschumfeld des konkreten Hauses zu prüfen, und stellt Lärmkarten bereit. Ergänzen Sie diese Informationen durch Besuche zu verschiedenen Zeiten. Auch Straßen, Bahn und andere Aktivitäten beeinflussen die Geräusche an einer Adresse.',
          source: sources.sanJoseNoise,
        },
      ],
    },
  },
];
