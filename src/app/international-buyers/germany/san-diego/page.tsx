import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Compass, MapPin, Video } from 'lucide-react';
import { BuyerEnquirySection, BuyerFaqs, FunnelSchema, type BuyerFaq } from '@/components/international-buyers/funnel-sections';
import { FunnelCta, MobileFunnelCta } from '@/components/international-buyers/funnel-actions';
import { absoluteUrl } from '@/lib/constants/site';
import { buyerFunnelLanguages } from '@/lib/international-buyer-markets';

const path = '/international-buyers/germany/san-diego';
const source = 'germany_san_diego_funnel';
const title = 'Immobilienmakler San Diego: Hauskauf aus Deutschland';
const description = 'Immobilienmakler in San Diego suchen: La Jolla, Del Mar und Coronado vergleichen und deutschsprachige Begleitung für Ihren Hauskauf anfragen.';

export const metadata: Metadata = {
  title, description, alternates: { canonical: path, languages: buyerFunnelLanguages(true) },
  openGraph: {
    title, description, url: path, locale: 'de_DE', type: 'website',
    images: [{ url: absoluteUrl('/city/san-diego-county/san-diego-ca.webp'), width: 1200, height: 800, alt: 'Ufer und Skyline von San Diego in Kalifornien' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: [absoluteUrl('/city/san-diego-county/san-diego-ca.webp')] },
};

const areas = [
  {
    name: 'La Jolla', label: 'Ein Stadtteil von San Diego', image: '/city/san-diego-county/la-jolla-ca.webp', href: '/buy/san-diego/la-jolla-ca',
    text: 'Küste, Hügel und die genaue Straße prägen die Lage. Vergleichen Sie bei jedem Haus den Zugang, die Wege zu Ihren Zielen und die Räume, die Sie tatsächlich nutzen möchten.',
    checks: ['Zufahrt, Steigungen und Stellplätze vor Ort ansehen.', 'Wege zum Strand und zu eigenen Zielen ausprobieren.', 'Geplante Umbauten mit der zuständigen Stelle klären.'],
    source: { label: 'Stadt San Diego: Plan für La Jolla (Englisch)', href: 'https://www.sandiego.gov/planning/community-plans/la-jolla' },
  },
  {
    name: 'Del Mar', label: 'Eine eigenständige Küstenstadt', image: '/city/san-diego-county/del-mar-ca.webp', href: '/buy/san-diego/del-mar-ca',
    text: 'Wie nah möchten Sie dem Ortskern und der Küste sein? Prüfen Sie Wege und Umgebung an der konkreten Adresse. Del Mar hat eigene Planungsregeln und Karten für Grundstücke und Zonen.',
    checks: ['Die Adresse auf der offiziellen Stadtkarte zuordnen.', 'Fußwege, Parkmöglichkeiten und Umgebung vergleichen.', 'Vor Umbauplänen nach Genehmigungen und Designprüfung fragen.'],
    source: { label: 'Del Mar: Karten und Zonen (Englisch)', href: 'https://www.delmar.ca.us/168/Maps-Zoning' },
  },
  {
    name: 'Coronado', label: 'Village und Cays im Vergleich', image: '/city/san-diego-county/coronado-ca.webp', href: '/buy/san-diego/coronado-ca',
    text: 'Coronado führt eigene Zonenkarten für Village und Cays. Beginnen Sie mit der genauen Lage und Ihren regelmäßigen Wegen; ergänzen Sie die Auswahl um Kosten und Pflegebedarf des Hauses.',
    checks: ['Die geplanten Fahrten zu eigenen Zielen testen.', 'Versicherung und Instandhaltung für das Haus erfragen.', 'Bei einem Condo die HOA-Unterlagen durchsehen lassen.'],
    source: { label: 'Coronado: Planung und Zonen (Englisch)', href: 'https://www.coronado.ca.us/269/Planning-Zoning' },
  },
];

const faqs: BuyerFaq[] = [
  { question: 'Kann ich einen deutschsprachigen Makler in San Diego anfragen?', answer: 'Teilen Sie Reza Ihren Wunsch nach Begleitung auf Deutsch mit und wählen Sie Deutsch im Formular. Besprechen Sie vorab, wer die Betreuung übernehmen kann und in welcher Sprache sie erfolgt. Prüfen Sie bei der Wahl eines deutschen oder deutschsprachigen Immobilienmaklers auch die kalifornische Lizenz und die konkreten Leistungen.' },
  {
    question: 'Wie grenze ich meine Suche rund um San Diego ein?',
    answer: 'Beginnen Sie mit Nutzung, Budget in US-Dollar, Haustyp und den Orten, die Sie regelmäßig erreichen möchten. Vergleichen Sie dann wenige konkrete Adressen in La Jolla, Del Mar oder Coronado. Notieren Sie dieselben Kriterien zu jeder Immobilie, damit Bilder und erste Eindrücke durch nachvollziehbare Angaben ergänzt werden.',
  },
  {
    question: 'Gehören La Jolla, Del Mar und Coronado zur selben Stadt?',
    answer: 'La Jolla gehört zur Stadt San Diego. Del Mar und Coronado sind eigenständige Städte mit eigenen Planungsstellen. Prüfen Sie deshalb zunächst die genaue Adresse und Zuständigkeit, wenn Sie Fragen zu Umbauten, Genehmigungen oder der geplanten Nutzung haben.',
    source: { label: 'Stadt San Diego: La Jolla (Englisch)', href: 'https://www.sandiego.gov/planning/community-plans/la-jolla' },
  },
  {
    question: 'Was sollte ich mir bei einer Videobesichtigung zeigen lassen?',
    answer: 'Bitten Sie um einen zusammenhängenden Rundgang: Zugang, Räume, Fenster, Stauraum, Außenbereich und Stellplätze. Fragen Sie nach Geräuschen und erkennbaren Schäden. Halten Sie offene Punkte fest. Ein Video hilft bei der Auswahl; für eine fachliche Beurteilung des Zustands planen Sie eine unabhängige Home Inspection.',
    source: { label: 'CFPB: Home Inspection vorbereiten (Englisch)', href: 'https://www.consumerfinance.gov/owning-a-home/close/schedule-a-home-inspection/' },
  },
  {
    question: 'Welche Unterlagen sind bei einem Condo wichtig?',
    answer: 'Fragen Sie nach den Regeln der Homeowners’ Association, dem Budget, Rücklagen sowie regulären und besonderen Beiträgen. Klären Sie außerdem Stellplätze, Abstellflächen und Zuständigkeiten für Reparaturen. Lassen Sie die aktuellen Unterlagen der konkreten Anlage erläutern, bevor Sie sich vertraglich festlegen.',
    source: { label: 'California DRE: Wohnen in einer HOA (Englisch, PDF)', href: 'https://www.dre.ca.gov/files/pdf/re39.pdf' },
  },
  {
    question: 'Wie plane ich eine Besichtigungsreise aus Deutschland?',
    answer: 'Teilen Sie Reza Reisedaten und Prioritäten früh mit und lassen Sie einzelne Termine bestätigen. Bündeln Sie Besichtigungen nach Gegend. Reservieren Sie Zeit für die Straßen rund um das Haus, Ihre eigenen Fahrwege und einen zweiten Blick. Stimmen Sie Vertretung, Leistungen und Vergütung vor privaten Besichtigungen ab.',
  },
  {
    question: 'Wie geht die Suche nach meiner Rückkehr nach Deutschland weiter?',
    answer: 'Führen Sie Ihre Auswahl mit offenen Fragen und den dazugehörigen Unterlagen weiter. Vereinbaren Sie bei Bedarf ein Folgegespräch mit Angabe der Berliner Zeitzone. Bei einem möglichen Angebot klären Sie Untersuchungen, Vertragsfristen und akzeptierte Unterschriftsverfahren früh mit den zuständigen Fachleuten.',
    source: { label: 'Kaufabschluss vorbereiten (Englisch)', href: '/buyers-guide#buying-from-abroad' },
  },
];

export default function GermanySanDiegoBuyerPage() {
  return <>
    <FunnelSchema market="germany" path={path} title={title} description={description} faqs={faqs} />
    <section className="uk-hero uk-shell" aria-labelledby="germany-sd-hero-title">
      <div className="uk-hero-copy">
        <nav className="uk-breadcrumb" aria-label="Brotkrumennavigation"><Link href="/international-buyers/germany">Kaufen aus Deutschland</Link><span aria-hidden="true">/</span><span aria-current="page">San Diego</span></nav>
        <p className="uk-eyebrow">San Diego · Deutschsprachige Begleitung anfragen</p>
        <h1 id="germany-sd-hero-title">Hauskauf in<br />San Diego.<br /><em>Geplant aus<br />Deutschland.</em></h1>
        <p className="uk-body">Vom Küstenfoto zur passenden Adresse: Vergleichen Sie La Jolla, Del Mar und Coronado anhand Ihrer Pläne. Reza ist Ihr Kontakt in San Diego, um die Auswahl und mögliche Besichtigungen zu besprechen.</p>
        <div className="uk-hero-actions" id="funnel-intro-actions">
          <FunnelCta source={source}>Suche besprechen</FunnelCta>
          <a href="#kuestenorte-vergleichen" className="uk-text-link">Orte vergleichen <ArrowRight size={17} aria-hidden="true" /></a>
        </div>
        <p className="uk-hero-note"><Check size={15} aria-hidden="true" />Erst die Fragen klären, dann Termine planen.</p>
      </div>
      <figure className="uk-hero-image">
        <Image src="/city/san-diego-county/san-diego-ca.webp" alt="San Diegos Skyline am Wasser" fill priority sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) 45vw, 535px" />
        <figcaption><div><strong>Welche Lage passt zu Ihrem Alltag?</strong>San Diego, Kalifornien</div><MapPin size={22} aria-hidden="true" /></figcaption>
      </figure>
    </section>

    <div className="uk-strip uk-shell" aria-label="Ihre Vorbereitung für San Diego">
      <div><MapPin size={23} aria-hidden="true" />Drei Küstenorte im Vergleich</div>
      <div><Video size={23} aria-hidden="true" />Videobesichtigung anfragen</div>
      <div><Compass size={23} aria-hidden="true" />Die Reise gezielt vorbereiten</div>
    </div>

    <section className="uk-section uk-shell" id="kuestenorte-vergleichen" aria-labelledby="germany-sd-areas-title">
      <div className="uk-section-heading">
        <div><p className="uk-eyebrow">La Jolla · Del Mar · Coronado</p><h2 id="germany-sd-areas-title">Drei Orte.<br />Ihre eigenen<br />Maßstäbe.</h2></div>
        <p className="uk-body">La Jolla liegt in der Stadt San Diego; Del Mar und Coronado sind eigene Städte. Nutzen Sie diese Fragen für Ihren Vergleich und prüfen Sie Details an der jeweiligen Adresse.</p>
      </div>
      <div className="uk-area-grid">{areas.map(area => <article key={area.name} className="uk-area-card">
        <div className="uk-area-photo"><Image src={area.image} alt={`Küstenlandschaft bei ${area.name} in Kalifornien`} fill sizes="(max-width: 767px) calc(100vw - 40px), 33vw" /></div>
        <div className="uk-area-content">
          <p className="uk-eyebrow">{area.label}</p><h3>{area.name}</h3><p>{area.text}</p>
          <ul>{area.checks.map(check => <li key={check}>{check}</li>)}</ul>
          <Link href={area.href} className="uk-text-link">Häuser in {area.name} <ArrowRight size={16} aria-hidden="true" /></Link>
          <div><a href={area.source.href} className="uk-source">{area.source.label} ↗</a></div>
        </div>
      </article>)}</div>
      <p className="uk-local-note">Die verlinkten Behördeninformationen dienen als Einstieg. Kosten, Zustand, Genehmigungen und Nutzung müssen für das konkrete Haus geprüft werden. Weitere Orte finden Sie in der <Link href="/buy/san-diego" className="uk-text-link">Immobiliensuche für San Diego County <ArrowRight size={15} aria-hidden="true" /></Link> auf Englisch.</p>
    </section>

    <section className="uk-process uk-section" aria-labelledby="germany-sd-trip-title">
      <div className="uk-shell uk-itinerary">
        <div><p className="uk-eyebrow">Die Besichtigungsreise</p><h2 id="germany-sd-trip-title">Mit einer Auswahl<br />ankommen.</h2><p className="uk-body">Bereiten Sie die ersten Vergleiche in Deutschland vor. Vor Ort bleibt dann Zeit für das Haus selbst, die Umgebung und die Fragen, die sich erst beim zweiten Blick ergeben.</p><FunnelCta source={source} className="uk-trip-cta">Reise besprechen</FunnelCta></div>
        <ol className="uk-preparation-list">
          <li><span>01</span><div><h3>Vor der Reise</h3><p>Wünsche und Budget in US-Dollar festhalten, aktuelle Angebote vergleichen und bei Bedarf Videos anfragen. Termine, Zugang und die Zusammenarbeit vorab abstimmen.</p></div></li>
          <li><span>02</span><div><h3>In San Diego</h3><p>Besichtigungen nach Gegend bündeln. Zufahrten, Außenflächen und Stellplätze ansehen. Eigene Wege testen und Beobachtungen direkt zur jeweiligen Immobilie notieren.</p></div></li>
          <li><span>03</span><div><h3>Nach den Besichtigungen</h3><p>Offene Fragen mit Unterlagen abgleichen. Kosten und Zustand genauer prüfen lassen. Vor einem Angebot Vertragsbedingungen, Untersuchungen und Fristen besprechen.</p></div></li>
        </ol>
      </div>
    </section>

    <section className="uk-section uk-shell uk-preparation" aria-labelledby="germany-sd-distance-title">
      <div><p className="uk-eyebrow">Zwischen Deutschland und Kalifornien</p><h2 id="germany-sd-distance-title">Die wichtigen<br />Details festhalten.</h2><p className="uk-body">Ein übersichtlicher Stand zur Auswahl hilft, auch aus der Entfernung informiert weiterzuplanen.</p></div>
      <ul className="uk-preparation-list">
        <li><h3>Ein Fragenblatt pro Haus</h3><p>Halten Sie Grundriss, Zustand, Kosten und offene Punkte zusammen. Lassen Sie unklare Bereiche bei einem Video genauer zeigen und planen Sie die unabhängige Inspektion gesondert.</p></li>
        <li><h3>Beide Ortszeiten bestätigen</h3><p>Geben Sie für Gespräche Berlin als Zeitzone an. Prüfen Sie Datum und Uhrzeit auf der Einladung für Deutschland und San Diego.</p></li>
        <li><h3>Den nächsten Termin kennen</h3><p>Notieren Sie, wer welche Unterlagen liefert und welche Fragen noch geklärt werden müssen. Bei einem Vertrag gehören seine konkreten Fristen in diese Übersicht.</p></li>
      </ul>
    </section>
    <BuyerEnquirySection market="germany" source={source} defaultRegion="San Diego / La Jolla" defaultLocation="San Diego" />
    <nav className="uk-shell uk-related-locations" aria-label="Weitere Standorte"><Link className="uk-text-link" href="/international-buyers/germany#agent-locations">Weitere Standorte in Kalifornien vergleichen <ArrowRight size={16} aria-hidden="true" /></Link></nav>
    <BuyerFaqs market="germany" faqs={faqs} regional />
    <MobileFunnelCta source={source} label="Mit Reza planen" ariaLabel="Ihre Immobiliensuche in San Diego besprechen" />
  </>;
}
