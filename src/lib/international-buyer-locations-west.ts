import type { BuyerLocation } from './international-buyer-location-types';

// Municipal guidance checked 2026-09-06. Confirm the applicable rules for the
// individual address and proposed use; these summaries do not establish approval.
const sources = {
  laZoning: { label: 'Los Angeles City Planning — Zoning Search', href: 'https://planning.lacity.gov/zoning/zoning-search' },
  laSharing: { label: 'Los Angeles City Planning — Home-Sharing', href: 'https://planning.lacity.gov/project-review/home-sharing' },
  laHistoric: { label: 'Los Angeles City Planning — Historic District Project Review', href: 'https://planning.lacity.gov/preservation-design/historic-district-project-review' },
  bhZoning: { label: 'City of Beverly Hills — Zoning Code & Maps', href: 'https://beverlyhills.org/820/Zoning-Code-Maps' },
  bhRecords: { label: 'City of Beverly Hills — Land Records & Transparency', href: 'https://beverlyhills.gov/770/Transparency' },
  bhRentals: { label: 'City of Beverly Hills — Short-Term Rentals', href: 'https://www.beverlyhills.gov/278/Short-Term-Rentals' },
  malibuCoastal: { label: 'City of Malibu — Local Coastal Program', href: 'https://www.malibucity.org/372/Local-Coastal-Program' },
  malibuWastewater: { label: 'City of Malibu — Onsite Wastewater System Approval', href: 'https://www.malibucity.org/311/Process-for-Installing-a-New-System' },
  malibuEmergency: { label: 'City of Malibu — Emergency Preparedness Tips', href: 'https://www.malibucity.org/1144/Emergency-Preparedness-Tips' },
  smSeismic: { label: 'City of Santa Monica — Seismic Retrofit Program', href: 'https://www.santamonica.gov/programs/seismic-retrofit-program' },
  smRecords: { label: 'City of Santa Monica — Rent Control Document Portal', href: 'https://www.santamonica.gov/process-explainers/how-to-use-the-rent-control-document-portal' },
  smSharing: { label: 'City of Santa Monica — Residential Rental Business License', href: 'https://www.santamonica.gov/process-explainers/how-to-apply-for-a-residential-rental-business-license' },
  smHousing: { label: 'City of Santa Monica — Housing Protection', href: 'https://www.santamonica.gov/topic-explainers/housing-protection' },
  lbHistoric: { label: 'City of Long Beach — Certificate of Appropriateness', href: 'https://www.longbeach.gov/lbcd/planning/preservation/certificate/' },
  lbFlood: { label: 'City of Long Beach — Flood Zone Information', href: 'https://www.longbeach.gov/pw/resources/flood-zone/' },
  lbRentals: { label: 'City of Long Beach — Short-Term Rentals', href: 'https://www.longbeach.gov/lbcd/enforcement/strs/' },
  sbRecords: { label: 'City of Santa Barbara — Zoning Information Reports', href: 'https://santabarbaraca.gov/services/construction-land-development/reference-library' },
  sbMaps: { label: 'City of Santa Barbara — Planning & Zoning Maps', href: 'https://santabarbaraca.gov/services/construction-land-development/reference-library/reference-library-maps' },
  sbHistoric: { label: 'City of Santa Barbara — Historic Resource Surveys', href: 'https://santabarbaraca.gov/government/priorities-policies/historic-preservation/historic-resource-surveys' },
};

export const WEST_BUYER_LOCATIONS: BuyerLocation[] = [
  {
    slug: 'los-angeles',
    name: 'Los Angeles',
    kind: 'city',
    searchRegion: 'Los Angeles',
    searchHref: '/buy/los-angeles/los-angeles-ca',
    image: '/city/los-angeles-county/los-angeles-ca.webp',
    imageAlt: 'Local view of Los Angeles, Los Angeles County, California',
    en: {
      intro: 'Start a Los Angeles search with the places you need to reach, then compare individual addresses. This guide concerns the City of Los Angeles. Beverly Hills, Santa Monica and other cities in Los Angeles County have their own local rules and should be evaluated separately.',
      searchFocus: 'The main search opens Los Angeles city listings. Build a shortlist around your regular journeys, parking needs and preferred property type; use the neighbouring-city searches below when you want a deliberate comparison beyond the city boundary.',
      checks: [
        { title: 'Confirm the parcel and planning area', body: 'Look up the exact address in ZIMAS. Review zoning, the community plan and additional overlays before treating a neighbourhood description as evidence that an extension or change of use is possible.', source: sources.laZoning },
        { title: 'Separate a second home from home-sharing', body: 'The city’s home-sharing programme is tied to an eligible primary residence and registration. Check your intended use before including short-stay income in a purchase plan from abroad.', source: sources.laSharing },
        { title: 'Check historic review before a remodel', body: 'If ZIMAS identifies a Historic Preservation Overlay Zone, ask which review applies to your proposed work. A listing’s renovation potential does not establish that a project is approved.', source: sources.laHistoric },
      ],
      areas: [
        { name: 'Los Angeles city', description: 'Start with city listings, then compare the actual journeys from each shortlisted address.', href: '/buy/los-angeles/los-angeles-ca' },
        { name: 'Santa Monica', description: 'Compare a separate coastal city when beach access is central to how you will use the home.', href: '/buy/los-angeles/santa-monica-ca' },
        { name: 'Beverly Hills', description: 'Compare this separate municipality and check its own planning and rental requirements.', href: '/buy/los-angeles/beverly-hills-ca' },
      ],
      faqs: [
        { question: 'Does a Los Angeles County search show only homes in the City of Los Angeles?', answer: 'No. The county contains multiple cities. Our main link here opens Los Angeles city listings; check the individual address and use the city’s ZIMAS tool for its parcel-level planning information.', source: sources.laZoning },
        { question: 'Can I let out a Los Angeles second home for short stays when I am overseas?', answer: 'Do not assume it qualifies. The city’s home-sharing programme requires an eligible primary residence and registration. Ask City Planning to confirm your proposed arrangement before relying on rental income.', source: sources.laSharing },
        { question: 'What should I check before buying a Los Angeles house in a historic district?', answer: 'Identify the overlay and the property’s contributing status, then discuss your actual renovation scope with planning staff. Historic review varies with the work and the building; it can affect changes you consider routine.', source: sources.laHistoric },
      ],
    },
    de: {
      intro: 'Beginnen Sie Ihre Suche in Los Angeles mit den Orten, die Sie regelmäßig erreichen möchten, und vergleichen Sie anschließend konkrete Adressen. Dieser Leitfaden behandelt die Stadt Los Angeles. Beverly Hills, Santa Monica und weitere Städte im Los Angeles County haben eigene örtliche Vorschriften.',
      searchFocus: 'Die Hauptsuche öffnet Angebote in der Stadt Los Angeles. Grenzen Sie Ihre Auswahl anhand Ihrer regelmäßigen Wege, Ihres Parkplatzbedarfs und der gewünschten Immobilienart ein. Die weiteren Suchlinks ermöglichen einen bewussten Vergleich mit eigenständigen Nachbarstädten.',
      checks: [
        { title: 'Grundstück und Planungsgebiet zuordnen', body: 'Suchen Sie die genaue Adresse in ZIMAS. Prüfen Sie Nutzungszone, örtlichen Entwicklungsplan und zusätzliche Schutz- oder Gestaltungsvorgaben, bevor Sie einen Anbau oder eine andere Nutzung einplanen.', source: sources.laZoning },
        { title: 'Zweitwohnsitz und Kurzzeitvermietung unterscheiden', body: 'Das städtische Home-Sharing-Programm setzt einen geeigneten Hauptwohnsitz und eine Registrierung voraus. Klären Sie Ihre geplante Nutzung, bevor Sie Einnahmen aus kurzen Aufenthalten in die Kaufplanung einrechnen.', source: sources.laSharing },
        { title: 'Historische Schutzvorgaben vor dem Umbau prüfen', body: 'Zeigt ZIMAS eine Historic Preservation Overlay Zone, lassen Sie das notwendige Prüfverfahren für Ihre Baumaßnahme klären. Ein im Exposé genanntes Umbaupotenzial ist keine Genehmigung.', source: sources.laHistoric },
      ],
      areas: [
        { name: 'Stadt Los Angeles', description: 'Beginnen Sie mit Stadtangeboten und vergleichen Sie Ihre tatsächlichen Wege ab jeder ausgewählten Adresse.', href: '/buy/los-angeles/los-angeles-ca' },
        { name: 'Santa Monica', description: 'Vergleichen Sie diese eigenständige Küstenstadt, wenn der Strandzugang für Ihre Nutzung wichtig ist.', href: '/buy/los-angeles/santa-monica-ca' },
        { name: 'Beverly Hills', description: 'Prüfen Sie diese eigenständige Stadt mit ihren eigenen Bau- und Vermietungsvorgaben.', href: '/buy/los-angeles/beverly-hills-ca' },
      ],
      faqs: [
        { question: 'Zeigt eine Suche im Los Angeles County nur Immobilien in der Stadt Los Angeles?', answer: 'Nein. Zum County gehören mehrere Städte. Der Hauptlink auf dieser Seite öffnet Angebote in der Stadt Los Angeles. Prüfen Sie die einzelne Adresse und deren Planungsinformationen im städtischen ZIMAS-System.', source: sources.laZoning },
        { question: 'Darf ich meinen Zweitwohnsitz in Los Angeles während meiner Auslandsaufenthalte kurzzeitig vermieten?', answer: 'Setzen Sie die Zulässigkeit nicht voraus. Das städtische Home-Sharing-Programm verlangt einen geeigneten Hauptwohnsitz und eine Registrierung. Lassen Sie Ihre konkrete Planung von City Planning prüfen, bevor Sie mit Mieteinnahmen rechnen.', source: sources.laSharing },
        { question: 'Was sollte ich bei einem Haus in einem historischen Viertel von Los Angeles prüfen?', answer: 'Klären Sie die Schutzgebietsausweisung und den historischen Status des Gebäudes. Besprechen Sie danach Ihre konkreten Umbauwünsche mit der Planungsbehörde. Das Verfahren hängt von Gebäude und Maßnahme ab und kann auch vermeintlich einfache Änderungen betreffen.', source: sources.laHistoric },
      ],
    },
  },
  {
    slug: 'beverly-hills',
    name: 'Beverly Hills',
    kind: 'city',
    parentSlug: 'los-angeles',
    searchRegion: 'Los Angeles',
    searchHref: '/buy/los-angeles/beverly-hills-ca',
    image: '/city/los-angeles-county/beverly-hills-ca.webp',
    imageAlt: 'Local view of Beverly Hills, Los Angeles County, California',
    en: {
      intro: 'A Beverly Hills purchase benefits from an address-level comparison of the Central Area, Hillside and Trousdale Estates. Consider how the plot, access and existing building fit your plans, and confirm the municipal boundary before applying Beverly Hills rules to a marketed address.',
      searchFocus: 'Open Beverly Hills listings, then compare the existing floor plan with any proposed alterations. For a purchase managed from overseas, assemble the property records and clarify rental intentions before arranging a tightly scheduled viewing trip.',
      checks: [
        { title: 'Identify Central, Hillside or Trousdale', body: 'Use the city’s single-family area map to locate the property. Take the correct area designation to the Planning Division when asking about an extension, replacement home or site changes.', source: sources.bhZoning },
        { title: 'Match the listing to the property records', body: 'Use the city’s land-records search and request relevant approvals from the seller. Compare the advertised layout, guest accommodation and past alterations with the available records; ask about any gaps.', source: sources.bhRecords },
        { title: 'Test the intended rental use early', body: 'Beverly Hills prohibits short-term rentals in residential units. If you expect to use a home only part of the year, check the current leasing rules before assuming you can rent it between visits.', source: sources.bhRentals },
      ],
      areas: [
        { name: 'Beverly Hills', description: 'Compare city homes, identifying the planning area for each address on your shortlist.', href: '/buy/los-angeles/beverly-hills-ca' },
        { name: 'West Hollywood', description: 'Explore a separate nearby city if an apartment or condominium also fits your search.', href: '/buy/los-angeles/west-hollywood-ca' },
        { name: 'Los Angeles city', description: 'Broaden the comparison to Los Angeles addresses while checking which city governs each property.', href: '/buy/los-angeles/los-angeles-ca' },
      ],
      faqs: [
        { question: 'How do I compare the Flats, Hillside and Trousdale when buying in Beverly Hills?', answer: 'Start with the city’s official area map rather than a marketing label. Establish whether the parcel is in the Central Area, Hillside or Trousdale Estates, then have your intended building work assessed against that area’s rules.', source: sources.bhZoning },
        { question: 'Can a Beverly Hills holiday home earn short-term rental income between my visits?', answer: 'The city prohibits short-term rentals in residential units. Treat personal use and permitted longer-term leasing as separate plans, and confirm current requirements with the city before basing a purchase on rental income.', source: sources.bhRentals },
        { question: 'What can I review remotely before viewing a renovated Beverly Hills house?', answer: 'Request the seller’s permit and approval records and use the city’s land-records service. Check whether the advertised rooms and alterations are documented. Missing or unclear records warrant follow-up before you rely on the layout.', source: sources.bhRecords },
      ],
    },
    de: {
      intro: 'Vergleichen Sie beim Kauf in Beverly Hills konkrete Grundstücke in der Central Area, der Hillside Area und Trousdale Estates. Entscheidend ist, ob Grundstück, Zufahrt und vorhandenes Gebäude zu Ihren Plänen passen. Klären Sie außerdem die Stadtgrenze, bevor Sie die Vorschriften von Beverly Hills auf eine angebotene Adresse anwenden.',
      searchFocus: 'Öffnen Sie die Angebote in Beverly Hills und vergleichen Sie den vorhandenen Grundriss mit Ihren Umbauwünschen. Fordern Sie bei einer Suche aus dem Ausland die Objektunterlagen frühzeitig an und klären Sie eine geplante Vermietung vor Ihrer Besichtigungsreise.',
      checks: [
        { title: 'Central Area, Hillside oder Trousdale zuordnen', body: 'Bestimmen Sie die Lage anhand der städtischen Karte für Einfamilienhausgebiete. Verwenden Sie diese Zuordnung, wenn Sie mit der Planungsbehörde einen Anbau, Neubau oder Änderungen am Grundstück besprechen.', source: sources.bhZoning },
        { title: 'Exposé und Bauunterlagen vergleichen', body: 'Nutzen Sie die städtische Grundstücksakten-Suche und fordern Sie Genehmigungen beim Verkäufer an. Gleichen Sie Grundriss, Gästeunterkunft und Umbauten mit den verfügbaren Unterlagen ab und lassen Sie Lücken erklären.', source: sources.bhRecords },
        { title: 'Geplante Vermietung frühzeitig klären', body: 'Beverly Hills untersagt die Kurzzeitvermietung von Wohneinheiten. Wenn Sie das Haus nur zeitweise nutzen möchten, prüfen Sie die aktuellen Mietvorgaben, bevor Sie eine Vermietung zwischen Ihren Aufenthalten einplanen.', source: sources.bhRentals },
      ],
      areas: [
        { name: 'Beverly Hills', description: 'Vergleichen Sie Stadtangebote und ordnen Sie jede ausgewählte Adresse dem richtigen Planungsgebiet zu.', href: '/buy/los-angeles/beverly-hills-ca' },
        { name: 'West Hollywood', description: 'Beziehen Sie diese eigenständige Nachbarstadt ein, wenn auch eine Eigentumswohnung infrage kommt.', href: '/buy/los-angeles/west-hollywood-ca' },
        { name: 'Stadt Los Angeles', description: 'Erweitern Sie den Vergleich um Adressen in Los Angeles und prüfen Sie die jeweilige Zuständigkeit.', href: '/buy/los-angeles/los-angeles-ca' },
      ],
      faqs: [
        { question: 'Wie vergleiche ich die Flats, Hillside und Trousdale beim Kauf in Beverly Hills?', answer: 'Beginnen Sie mit der offiziellen Gebietskarte der Stadt. Klären Sie, ob das Grundstück zur Central Area, Hillside Area oder zu Trousdale Estates gehört. Lassen Sie Ihre geplanten Baumaßnahmen anhand der dort geltenden Vorgaben prüfen.', source: sources.bhZoning },
        { question: 'Kann ich ein Ferienhaus in Beverly Hills zwischen meinen Besuchen kurzzeitig vermieten?', answer: 'Die Stadt untersagt die Kurzzeitvermietung von Wohneinheiten. Trennen Sie Eigennutzung und eine gegebenenfalls zulässige längerfristige Vermietung in Ihrer Planung. Bestätigen Sie die aktuellen Anforderungen mit der Stadt, bevor Sie Mieteinnahmen einkalkulieren.', source: sources.bhRentals },
        { question: 'Was kann ich vor der Besichtigung eines renovierten Hauses in Beverly Hills aus der Ferne prüfen?', answer: 'Fordern Sie Genehmigungsunterlagen beim Verkäufer an und nutzen Sie die städtische Grundstücksakten-Suche. Prüfen Sie, ob die angebotenen Räume und Umbauten dokumentiert sind. Fehlende oder unklare Nachweise sollten Sie vor Ihrer Entscheidung klären lassen.', source: sources.bhRecords },
      ],
    },
  },
  {
    slug: 'malibu',
    name: 'Malibu',
    kind: 'city',
    parentSlug: 'los-angeles',
    searchRegion: 'Los Angeles',
    searchHref: '/buy/los-angeles/malibu-ca',
    image: '/city/los-angeles-county/malibu-ca.webp',
    imageAlt: 'Local view of Malibu, Los Angeles County, California',
    en: {
      intro: 'In Malibu, compare the physical site as carefully as the house. A beachfront property and a home reached by a hillside road can require very different due diligence. Coastal approvals, the wastewater system and practical access deserve attention before a viewing trip from abroad.',
      searchFocus: 'Shortlist homes by the setting you actually want: proximity to the beach, an elevated outlook or access to your regular destinations. Request existing approvals and wastewater information early, especially if you are considering rebuilding or adding accommodation.',
      checks: [
        { title: 'Review the coastal planning position', body: 'The entire city lies in the coastal zone. Ask Planning how the Local Coastal Program applies to the parcel and your proposed work, including whether a coastal permit or exemption is relevant.', source: sources.malibuCoastal },
        { title: 'Identify the wastewater system', body: 'Request records for the property’s actual wastewater arrangements. If it uses an onsite treatment system, investigate its approvals and suitability for your plans; Malibu has a specific process for installing a new system.', source: sources.malibuWastewater },
        { title: 'Check access and evacuation preparation', body: 'Locate the home’s evacuation zone and review the routes recommended by the city. For remote viewings, request a look at the driveway and road approach as well as the interior.', source: sources.malibuEmergency },
      ],
      areas: [
        { name: 'Malibu', description: 'Compare Malibu addresses with particular attention to coastal setting, road access and existing approvals.', href: '/buy/los-angeles/malibu-ca' },
        { name: 'Santa Monica', description: 'Compare another coastal city if the balance between beach access and an urban setting matters to you.', href: '/buy/los-angeles/santa-monica-ca' },
        { name: 'Calabasas', description: 'Consider an inland alternative and compare the journeys from each property to the coast.', href: '/buy/los-angeles/calabasas-ca' },
      ],
      faqs: [
        { question: 'Does a Malibu house away from the beach still fall under coastal planning rules?', answer: 'Yes. The city states that all of Malibu is in the coastal zone. Whether particular work needs a coastal permit or qualifies for an exemption depends on the proposal; confirm it before relying on redevelopment potential.', source: sources.malibuCoastal },
        { question: 'Why ask about septic or wastewater records before buying in Malibu?', answer: 'The system serving the property may be relevant to planned additions or replacement construction. Malibu requires coastal approval for a new onsite wastewater treatment system. Obtain the existing records and discuss any proposed change with the city and a qualified specialist.', source: sources.malibuWastewater },
        { question: 'What should a remote Malibu viewing show beyond the house and ocean view?', answer: 'Ask to see the driveway, road approach and how you would leave the property. Separately review the city’s evacuation information and identify the relevant zone. A property video does not establish that a route will remain available during an emergency.', source: sources.malibuEmergency },
      ],
    },
    de: {
      intro: 'Prüfen Sie in Malibu das Grundstück ebenso sorgfältig wie das Haus. Eine Immobilie direkt am Strand und ein Haus an einer Hangstraße können sehr unterschiedliche Prüfungen erfordern. Küstenrechtliche Genehmigungen, Abwasserentsorgung und tatsächliche Erreichbarkeit sollten Sie vor Ihrer Reise aus Deutschland klären.',
      searchFocus: 'Wählen Sie zunächst die gewünschte Lage: Strandnähe, erhöhter Ausblick oder passende Wege zu Ihren regelmäßigen Zielen. Fordern Sie bestehende Genehmigungen und Angaben zur Abwasserentsorgung frühzeitig an, besonders bei einem geplanten Neubau oder zusätzlichen Wohnräumen.',
      checks: [
        { title: 'Küstenrechtliche Planung prüfen', body: 'Das gesamte Stadtgebiet liegt in der Küstenzone. Klären Sie mit der Planungsbehörde, wie das Local Coastal Program für das Grundstück und Ihre Baumaßnahme gilt und ob eine Genehmigung oder Ausnahme infrage kommt.', source: sources.malibuCoastal },
        { title: 'Abwasserentsorgung konkret feststellen', body: 'Fordern Sie Unterlagen zum tatsächlichen Abwassersystem der Immobilie an. Bei einer grundstückseigenen Anlage sollten Sie Genehmigung und Eignung für Ihre Pläne prüfen lassen. Für neue Anlagen hat Malibu ein eigenes Verfahren.', source: sources.malibuWastewater },
        { title: 'Zufahrt und Evakuierung vorbereiten', body: 'Bestimmen Sie die Evakuierungszone des Hauses und prüfen Sie die von der Stadt genannten Routen. Lassen Sie sich bei einer Videobesichtigung auch die Zufahrt und den Straßenverlauf zum Grundstück zeigen.', source: sources.malibuEmergency },
      ],
      areas: [
        { name: 'Malibu', description: 'Vergleichen Sie Küstenlage, Zufahrt und vorhandene Genehmigungen der einzelnen Malibu-Adressen.', href: '/buy/los-angeles/malibu-ca' },
        { name: 'Santa Monica', description: 'Prüfen Sie diese weitere Küstenstadt, wenn Sie Strandzugang mit einem städtischen Umfeld verbinden möchten.', href: '/buy/los-angeles/santa-monica-ca' },
        { name: 'Calabasas', description: 'Vergleichen Sie eine Alternative im Landesinneren und die tatsächlichen Wege zur Küste.', href: '/buy/los-angeles/calabasas-ca' },
      ],
      faqs: [
        { question: 'Gelten die Küstenvorschriften in Malibu auch für Häuser abseits des Strandes?', answer: 'Ja. Nach Angaben der Stadt liegt ganz Malibu in der Küstenzone. Ob Ihre konkrete Maßnahme eine Küstengenehmigung benötigt oder eine Ausnahme erfüllt, hängt vom Vorhaben ab. Klären Sie dies, bevor Sie mit einem Neu- oder Ausbau rechnen.', source: sources.malibuCoastal },
        { question: 'Warum sind Unterlagen zur Abwasseranlage beim Hauskauf in Malibu wichtig?', answer: 'Das vorhandene System kann für einen Anbau oder Ersatzneubau entscheidend sein. Eine neue grundstückseigene Abwasserbehandlungsanlage benötigt in Malibu eine küstenrechtliche Genehmigung. Besprechen Sie vorhandene Unterlagen und geplante Änderungen mit der Stadt und einer qualifizierten Fachperson.', source: sources.malibuWastewater },
        { question: 'Was sollte eine Videobesichtigung in Malibu außer Haus und Meerblick zeigen?', answer: 'Lassen Sie sich Einfahrt, Straßenanbindung und die Ausfahrt vom Grundstück zeigen. Prüfen Sie zusätzlich die städtischen Evakuierungsinformationen und die zugehörige Zone. Ein Immobilienvideo belegt nicht, dass eine Route im Notfall verfügbar bleibt.', source: sources.malibuEmergency },
      ],
    },
  },
  {
    slug: 'santa-monica',
    name: 'Santa Monica',
    kind: 'city',
    parentSlug: 'los-angeles',
    searchRegion: 'Los Angeles',
    searchHref: '/buy/los-angeles/santa-monica-ca',
    image: '/city/los-angeles-county/santa-monica-ca.webp',
    imageAlt: 'Local view of Santa Monica, Los Angeles County, California',
    en: {
      intro: 'A Santa Monica search should connect your preferred beach or town location with the condition and legal use of the actual building. For an older condominium or a property with tenants, building records and occupancy questions can be as important as the individual floor plan.',
      searchFocus: 'Compare the routes from each address to the beach, everyday shopping and your regular destinations. For apartments and condominiums, request association documents, parking details and the building’s retrofit information alongside the listing.',
      checks: [
        { title: 'Ask about seismic retrofit status', body: 'Check whether the building is covered by Santa Monica’s Seismic Retrofit Program. Request any assessment, required work and completion records; an attractive interior does not answer a building-wide structural question.', source: sources.smSeismic },
        { title: 'Review the unit’s rental history', body: 'For a property that is or has been rented, search the Rent Control Document Portal by address or parcel number. Ask for clarification of the unit’s status and any relevant decisions.', source: sources.smRecords },
        { title: 'Do not confuse home-sharing with a holiday let', body: 'Santa Monica distinguishes regulated home-sharing with the primary resident present from prohibited short-term vacation rentals. Verify the proposed use before assuming you can let the whole home while abroad.', source: sources.smSharing },
      ],
      areas: [
        { name: 'Santa Monica', description: 'Compare houses and condominiums by exact location, parking and building condition.', href: '/buy/los-angeles/santa-monica-ca' },
        { name: 'Culver City', description: 'Explore a separate inland city when your regular Westside destinations matter more than immediate beach access.', href: '/buy/los-angeles/culver-city-ca' },
        { name: 'Malibu', description: 'Compare a different coastal setting, with separate planning, access and wastewater checks.', href: '/buy/los-angeles/malibu-ca' },
      ],
      faqs: [
        { question: 'What should I request before buying an older Santa Monica condominium?', answer: 'Ask whether the building is covered by the city’s seismic programme and request its assessment and completion documents. Review those alongside association budgets and planned works, so you understand both the individual unit and the shared building.', source: sources.smSeismic },
        { question: 'Can I immediately use a tenant-occupied Santa Monica property as my second home?', answer: 'Do not assume vacant possession. Review the tenancy, the unit’s regulatory status and any applicable owner-occupancy process before agreeing your purchase timetable. Santa Monica’s housing-protection guidance identifies procedures that may apply; obtain advice for the specific property.', source: sources.smHousing },
        { question: 'Is renting out an entire Santa Monica home during my overseas trips the same as home-sharing?', answer: 'No. The city’s home-sharing rules concern an eligible primary residence with the host present during the guest’s stay. Its guidance prohibits short-term vacation rentals. Confirm the intended arrangement rather than relying on a listing’s income suggestion.', source: sources.smSharing },
      ],
    },
    de: {
      intro: 'Verbinden Sie bei Ihrer Suche in Santa Monica die gewünschte Strand- oder Stadtlage mit der Prüfung des tatsächlichen Gebäudes und seiner zulässigen Nutzung. Bei älteren Eigentumswohnungen und vermieteten Immobilien sind Bauunterlagen und Belegungsfragen ebenso wichtig wie der Grundriss.',
      searchFocus: 'Vergleichen Sie die Wege jeder Adresse zum Strand, zu Einkaufsmöglichkeiten und zu Ihren regelmäßigen Zielen. Fordern Sie bei Eigentumswohnungen zusätzlich Unterlagen der Eigentümergemeinschaft, Parkplatzangaben und Informationen zur baulichen Nachrüstung an.',
      checks: [
        { title: 'Status der Erdbebennachrüstung klären', body: 'Prüfen Sie, ob das Gebäude unter Santa Monicas Seismic Retrofit Program fällt. Fordern Sie Bewertungen, angeordnete Arbeiten und Abschlussnachweise an. Ein renovierter Innenraum sagt nichts über die Tragstruktur des gesamten Gebäudes aus.', source: sources.smSeismic },
        { title: 'Vermietungshistorie der Einheit prüfen', body: 'Suchen Sie bei aktuell oder früher vermieteten Immobilien im Rent Control Document Portal nach Adresse oder Grundstücksnummer. Lassen Sie den Status der Einheit und einschlägige Entscheidungen erläutern.', source: sources.smRecords },
        { title: 'Home-Sharing und Ferienvermietung unterscheiden', body: 'Santa Monica unterscheidet reguliertes Home-Sharing bei anwesendem Hauptbewohner von untersagter Kurzzeit-Ferienvermietung. Prüfen Sie die geplante Nutzung, bevor Sie eine Vermietung des gesamten Hauses während Ihrer Abwesenheit einplanen.', source: sources.smSharing },
      ],
      areas: [
        { name: 'Santa Monica', description: 'Vergleichen Sie Häuser und Eigentumswohnungen nach genauer Lage, Parkplatzsituation und Gebäudezustand.', href: '/buy/los-angeles/santa-monica-ca' },
        { name: 'Culver City', description: 'Prüfen Sie diese eigenständige Stadt im Landesinneren, wenn Ihre regelmäßigen Ziele auf der Westside wichtiger als unmittelbare Strandnähe sind.', href: '/buy/los-angeles/culver-city-ca' },
        { name: 'Malibu', description: 'Vergleichen Sie eine andere Küstenlage mit eigenen Fragen zu Planung, Zufahrt und Abwasserentsorgung.', href: '/buy/los-angeles/malibu-ca' },
      ],
      faqs: [
        { question: 'Welche Unterlagen sollte ich vor dem Kauf einer älteren Eigentumswohnung in Santa Monica anfordern?', answer: 'Klären Sie, ob das Gebäude vom städtischen Erdbebennachrüstungsprogramm erfasst wird, und fordern Sie Bewertungen sowie Abschlussnachweise an. Prüfen Sie diese gemeinsam mit den Finanzen und geplanten Arbeiten der Eigentümergemeinschaft, um Einheit und Gesamtgebäude beurteilen zu können.', source: sources.smSeismic },
        { question: 'Kann ich eine vermietete Immobilie in Santa Monica sofort als Zweitwohnsitz nutzen?', answer: 'Gehen Sie nicht von einer mietfreien Übergabe aus. Prüfen Sie Mietverhältnis, rechtlichen Status und mögliche Verfahren zur Eigennutzung vor der Terminplanung. Die städtischen Informationen zum Wohnungsschutz nennen einschlägige Verfahren. Lassen Sie den konkreten Fall fachkundig beurteilen.', source: sources.smHousing },
        { question: 'Ist die Vermietung meines gesamten Hauses in Santa Monica während einer Auslandsreise Home-Sharing?', answer: 'Nein. Die städtischen Home-Sharing-Regeln betreffen einen geeigneten Hauptwohnsitz, in dem der Gastgeber während des Gästeaufenthalts anwesend ist. Kurzzeit-Ferienvermietungen sind nach städtischer Auskunft untersagt. Lassen Sie Ihre Nutzungsplanung unabhängig von Ertragsangaben im Exposé prüfen.', source: sources.smSharing },
      ],
    },
  },
  {
    slug: 'long-beach',
    name: 'Long Beach',
    kind: 'city',
    parentSlug: 'los-angeles',
    searchRegion: 'Los Angeles',
    searchHref: '/buy/los-angeles/long-beach-ca',
    image: '/city/los-angeles-county/long-beach-ca.webp',
    imageAlt: 'Local view of Long Beach, Los Angeles County, California',
    en: {
      intro: 'In Long Beach, a waterfront condominium and a house in a historic district raise different purchase questions. Compare the building’s shared obligations, the parcel’s flood information and any restrictions on alterations, rather than treating all city listings as one type of coastal home.',
      searchFocus: 'Build a shortlist around your preferred property type and the destinations you will use. Ask for association documents where applicable, check the actual parking arrangements and examine the parcel before judging a home by its distance from the water.',
      checks: [
        { title: 'Identify historic approval requirements', body: 'Use the city’s historic map for the address. Exterior changes to a landmark or property in a historic district require a Certificate of Appropriateness, including some work that does not need a building permit.', source: sources.lbHistoric },
        { title: 'Review flood information for the parcel', body: 'Use the city’s flood-zone resources and request property-specific insurance information. For a condominium, ask how any shared coverage and your own policy relate to flood risk.', source: sources.lbFlood },
        { title: 'Check both city and building rental restrictions', body: 'If short stays form part of your plan, review Long Beach’s registration requirements and Prohibited Buildings List. Confirm association restrictions and the applicable registration category before assuming eligibility.', source: sources.lbRentals },
      ],
      areas: [
        { name: 'Long Beach', description: 'Compare city listings and distinguish shared-building obligations from those of a detached home.', href: '/buy/los-angeles/long-beach-ca' },
        { name: 'Signal Hill', description: 'Compare this separate municipality and verify its own planning position for each address.', href: '/buy/los-angeles/signal-hill-ca' },
        { name: 'Lakewood', description: 'Explore an inland alternative and compare outdoor space, parking and your regular journeys.', href: '/buy/los-angeles/lakewood-ca' },
      ],
      faqs: [
        { question: 'Can I replace windows or repaint a house in a Long Beach historic district after purchase?', answer: 'Check the historic-review process first. The city requires a Certificate of Appropriateness for exterior changes to district properties and landmarks, and specifically lists windows and painting. This can apply even where a building permit is unnecessary.', source: sources.lbHistoric },
        { question: 'Does a standard homeowners policy settle the flood question for a Long Beach home?', answer: 'No. The city notes that standard homeowners insurance does not cover flood losses. Check the parcel’s flood information and obtain an insurance review; condominium buyers should also examine the association’s coverage and exclusions.', source: sources.lbFlood },
        { question: 'Can a Long Beach condominium association prevent short-term renting even if the city has a registration programme?', answer: 'The city maintains a Prohibited Buildings List through which eligible owners and associations can prohibit registrations at their property. Check that list, the governing documents and the relevant city registration rules before including short-stay income in your plans.', source: sources.lbRentals },
      ],
    },
    de: {
      intro: 'In Long Beach wirft eine Eigentumswohnung am Wasser andere Kauffragen auf als ein Haus in einem historischen Viertel. Vergleichen Sie gemeinschaftliche Gebäudeverpflichtungen, Überschwemmungsinformationen zum Grundstück und mögliche Umbauvorgaben. Die Stadtangebote umfassen unterschiedliche Wohnsituationen.',
      searchFocus: 'Erstellen Sie Ihre Auswahl anhand der gewünschten Immobilienart und Ihrer regelmäßigen Ziele. Fordern Sie gegebenenfalls Unterlagen der Eigentümergemeinschaft an, prüfen Sie die tatsächlichen Parkmöglichkeiten und beurteilen Sie das Grundstück über die reine Entfernung zum Wasser hinaus.',
      checks: [
        { title: 'Historische Genehmigungspflichten feststellen', body: 'Prüfen Sie die Adresse in der städtischen Denkmalkarte. Äußere Änderungen an geschützten Gebäuden oder Objekten in historischen Bezirken benötigen ein Certificate of Appropriateness, teilweise auch ohne zusätzliche Baugenehmigung.', source: sources.lbHistoric },
        { title: 'Überschwemmungsinformationen zum Grundstück prüfen', body: 'Nutzen Sie die städtischen Karten und fordern Sie eine objektbezogene Prüfung des Versicherungsschutzes an. Klären Sie bei Eigentumswohnungen auch, wie gemeinschaftliche und eigene Policen das Überschwemmungsrisiko behandeln.', source: sources.lbFlood },
        { title: 'Vermietungsregeln der Stadt und des Gebäudes prüfen', body: 'Wenn Sie Kurzzeitvermietung planen, prüfen Sie die Registrierungsvorgaben und die Prohibited Buildings List von Long Beach. Klären Sie zusätzlich die Regeln der Eigentümergemeinschaft und die passende Registrierungskategorie.', source: sources.lbRentals },
      ],
      areas: [
        { name: 'Long Beach', description: 'Vergleichen Sie Stadtangebote und unterscheiden Sie Gemeinschaftspflichten von den Aufgaben bei einem freistehenden Haus.', href: '/buy/los-angeles/long-beach-ca' },
        { name: 'Signal Hill', description: 'Vergleichen Sie diese eigenständige Stadt und prüfen Sie die örtlichen Planungsvorgaben für die konkrete Adresse.', href: '/buy/los-angeles/signal-hill-ca' },
        { name: 'Lakewood', description: 'Prüfen Sie eine Alternative im Landesinneren mit Blick auf Außenflächen, Parkmöglichkeiten und regelmäßige Wege.', href: '/buy/los-angeles/lakewood-ca' },
      ],
      faqs: [
        { question: 'Darf ich bei einem Haus in einem historischen Viertel von Long Beach Fenster austauschen oder die Fassade streichen?', answer: 'Prüfen Sie zuerst das historische Genehmigungsverfahren. Die Stadt verlangt für äußere Änderungen ein Certificate of Appropriateness und nennt ausdrücklich Fenster und Anstriche. Dies kann auch gelten, wenn keine Baugenehmigung benötigt wird.', source: sources.lbHistoric },
        { question: 'Ist das Überschwemmungsrisiko eines Hauses in Long Beach durch eine übliche Wohngebäudeversicherung geklärt?', answer: 'Nein. Die Stadt weist darauf hin, dass übliche US-Hauseigentümerpolicen Überschwemmungsschäden nicht abdecken. Prüfen Sie Grundstückskarte und Versicherungsmöglichkeiten. Bei Eigentumswohnungen sollten Sie zusätzlich die Deckung und Ausschlüsse der gemeinschaftlichen Versicherung prüfen lassen.', source: sources.lbFlood },
        { question: 'Kann eine Eigentümergemeinschaft in Long Beach Kurzzeitvermietung trotz städtischem Registrierungsprogramm ausschließen?', answer: 'Die Stadt führt eine Prohibited Buildings List, über die berechtigte Eigentümer und Eigentümergemeinschaften Registrierungen an ihrem Objekt ausschließen können. Prüfen Sie diese Liste, die Gemeinschaftsunterlagen und die städtischen Anforderungen, bevor Sie entsprechende Mieteinnahmen einplanen.', source: sources.lbRentals },
      ],
    },
  },
  {
    slug: 'santa-barbara',
    name: 'Santa Barbara',
    kind: 'city',
    searchRegion: 'Santa Barbara',
    searchHref: '/buy/santa-barbara/santa-barbara-ca',
    image: '/city/california/santa-barbara/santa-barbara-ca.webp',
    imageAlt: 'Santa Barbara in Santa Barbara County, California',
    en: {
      intro: 'Focus a Santa Barbara purchase on the particular street and building: a hillside address, a waterfront location and a home near the centre can suit different routines. This guide covers the City of Santa Barbara; nearby Goleta and Carpinteria are separate city comparisons within the county.',
      searchFocus: 'Open Santa Barbara city listings and compare access, outdoor space and the existing floor plan. If alterations are part of your plan, obtain the city’s property records and check coastal or historic designations before scheduling specialist visits.',
      checks: [
        { title: 'Request the Zoning Information Report', body: 'Ask for the property’s ZIR and review the city’s Street and Planning files. The city describes this report as a records package, excluding plans; request relevant building plans separately.', source: sources.sbRecords },
        { title: 'Locate coastal and other site constraints', body: 'Use the city’s planning maps for the parcel, including coastal-zone and permit-jurisdiction layers. Ask planning staff how mapped restrictions affect your proposed addition or change of use.', source: sources.sbMaps },
        { title: 'Check historic status before altering a home', body: 'Review the city’s historic surveys, including relevant Lower Riviera or waterfront records. Ask about the specific building’s current status before assuming its exterior, footprint or demolition potential can be changed.', source: sources.sbHistoric },
      ],
      areas: [
        { name: 'Santa Barbara city', description: 'Compare city addresses and check the records and designations for each shortlisted property.', href: '/buy/santa-barbara/santa-barbara-ca' },
        { name: 'Goleta', description: 'Explore a separate city to the west and compare access to the destinations you expect to use.', href: '/buy/santa-barbara/goleta-ca' },
        { name: 'Carpinteria', description: 'Compare a separate coastal city to the east, using its own address-specific planning checks.', href: '/buy/santa-barbara/carpinteria-ca' },
      ],
      faqs: [
        { question: 'What does a Santa Barbara Zoning Information Report tell a buyer?', answer: 'The city describes the ZIR as copies from its official Street and Planning files, excluding plans. Use it to review the available history, then request missing plans or explanations separately. It does not replace an inspection of the property.', source: sources.sbRecords },
        { question: 'How do I find out whether a Santa Barbara home is in the coastal zone?', answer: 'Look up the address in the city’s mapping resources and review the coastal-zone and permit-jurisdiction maps. A broad neighbourhood label is insufficient to establish the parcel’s status or whether your particular project needs approval.', source: sources.sbMaps },
        { question: 'Should I investigate historic status when buying in Santa Barbara’s Lower Riviera or waterfront area?', answer: 'Yes. The city publishes historic-resource surveys for these areas. Check the individual address and ask the city to confirm its current status, particularly if your purchase depends on changing the building rather than using its existing layout.', source: sources.sbHistoric },
      ],
    },
    de: {
      intro: 'Richten Sie Ihre Kaufsuche in Santa Barbara auf die konkrete Straße und das Gebäude aus: Hanglage, Wassernähe und eine Adresse nahe dem Zentrum passen zu unterschiedlichen Alltagsabläufen. Dieser Leitfaden behandelt die Stadt Santa Barbara. Goleta und Carpinteria sind eigenständige Vergleichsstädte im selben County.',
      searchFocus: 'Öffnen Sie Angebote in der Stadt Santa Barbara und vergleichen Sie Erreichbarkeit, Außenflächen und vorhandenen Grundriss. Wenn Sie umbauen möchten, beschaffen Sie frühzeitig die Objektakten und prüfen Sie Küsten- oder Denkmalschutzvorgaben vor der Terminplanung mit Fachleuten.',
      checks: [
        { title: 'Zoning Information Report anfordern', body: 'Fordern Sie den ZIR der Immobilie an und prüfen Sie die städtischen Street- und Planning-Akten. Dieser Bericht ist eine Aktensammlung ohne Baupläne. Benötigte Gebäudepläne müssen Sie gesondert anfordern.', source: sources.sbRecords },
        { title: 'Küstenzone und Grundstücksvorgaben zuordnen', body: 'Prüfen Sie das Grundstück in den städtischen Planungskarten, einschließlich Küstenzone und Genehmigungszuständigkeit. Lassen Sie erläutern, wie eingezeichnete Vorgaben Ihren Anbau oder eine andere Nutzung betreffen.', source: sources.sbMaps },
        { title: 'Historischen Status vor Änderungen klären', body: 'Prüfen Sie die städtischen historischen Erhebungen, etwa für Lower Riviera oder die Waterfront. Fragen Sie nach dem aktuellen Status des Gebäudes, bevor Sie eine Fassadenänderung, Erweiterung oder einen Abriss einplanen.', source: sources.sbHistoric },
      ],
      areas: [
        { name: 'Stadt Santa Barbara', description: 'Vergleichen Sie Stadtadressen und prüfen Sie Objektakten sowie Ausweisungen für jede Immobilie Ihrer Auswahl.', href: '/buy/santa-barbara/santa-barbara-ca' },
        { name: 'Goleta', description: 'Vergleichen Sie diese eigenständige Stadt westlich von Santa Barbara anhand Ihrer geplanten Wege.', href: '/buy/santa-barbara/goleta-ca' },
        { name: 'Carpinteria', description: 'Beziehen Sie diese eigenständige Küstenstadt im Osten ein und prüfen Sie ihre eigenen Grundstücksvorgaben.', href: '/buy/santa-barbara/carpinteria-ca' },
      ],
      faqs: [
        { question: 'Was erfahre ich als Käufer aus dem Zoning Information Report von Santa Barbara?', answer: 'Die Stadt beschreibt den ZIR als Kopien ihrer offiziellen Street- und Planning-Akten ohne Baupläne. Prüfen Sie damit die verfügbare Historie und fordern Sie fehlende Pläne oder Erläuterungen gesondert an. Eine bauliche Objektprüfung ersetzt der Bericht nicht.', source: sources.sbRecords },
        { question: 'Wie erkenne ich, ob eine Immobilie in Santa Barbara innerhalb der Küstenzone liegt?', answer: 'Suchen Sie die Adresse in den städtischen Karten und prüfen Sie Küstenzone sowie Genehmigungszuständigkeit. Eine allgemeine Viertelbezeichnung reicht nicht aus, um den Status des Grundstücks oder die Genehmigungspflicht Ihrer konkreten Baumaßnahme festzustellen.', source: sources.sbMaps },
        { question: 'Sollte ich bei einem Haus in Lower Riviera oder an der Waterfront von Santa Barbara den historischen Status prüfen?', answer: 'Ja. Die Stadt veröffentlicht historische Erhebungen für diese Gebiete. Prüfen Sie die einzelne Adresse und lassen Sie deren aktuellen Status bestätigen, besonders wenn Ihr Kauf von einer Veränderung des Gebäudes abhängt.', source: sources.sbHistoric },
      ],
    },
  },
];
