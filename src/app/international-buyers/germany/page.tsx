import type { Metadata } from 'next';
import { BuyerLocationDirectory } from '@/components/international-buyers/location-directory';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, MapPin, MessageCircle, Video } from 'lucide-react';
import { BuyerEnquirySection, BuyerFaqs, FunnelSchema, type BuyerFaq } from '@/components/international-buyers/funnel-sections';
import { FunnelCta, MobileFunnelCta } from '@/components/international-buyers/funnel-actions';
import { absoluteUrl } from '@/lib/constants/site';
import { buyerFunnelLanguages } from '@/lib/international-buyer-markets';

const path = '/international-buyers/germany';
const source = 'germany_buyer_funnel';
const title = 'Haus in Kalifornien kaufen aus Deutschland | Crown Coastal Homes';
const description = 'Immobilienmakler in Kalifornien suchen, Regionen vergleichen und deutschsprachige Begleitung für Ihren Hauskauf aus Deutschland anfragen.';

export const metadata: Metadata = {
  title, description, alternates: { canonical: path, languages: buyerFunnelLanguages() },
  openGraph: {
    title, description, url: path, locale: 'de_DE', type: 'website',
    images: [{ url: absoluteUrl('/city/san-diego-county/la-jolla-ca.webp'), width: 1200, height: 800, alt: 'Küstenlandschaft von La Jolla in San Diego, Kalifornien' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: [absoluteUrl('/city/san-diego-county/la-jolla-ca.webp')] },
};

const faqs: BuyerFaq[] = [
  { question: 'Kann ich deutschsprachige Begleitung beim Hauskauf anfragen?', answer: 'Ja. Geben Sie Ihren Wunschort und Deutsch als gewünschte Sprache an. Klären Sie mit Reza, welche Begleitung auf Deutsch möglich ist und wer sie übernimmt. Für einen deutschen oder deutschsprachigen Immobilienmakler sind die kalifornische Lizenz, die tatsächliche Beratungssprache und die vereinbarten Leistungen entscheidend.' },
  {
    question: 'Wie beginne ich die Immobiliensuche aus Deutschland?',
    answer: 'Notieren Sie Ihre Wunschregionen, die geplante Nutzung, den Haustyp und Ihren zeitlichen Rahmen. Vergleichen Sie zunächst aktuelle Angebote und sammeln Sie Fragen. Teilen Sie Reza auch mit, ob Sie eine Reise planen oder zunächst eine Videobesichtigung anfragen möchten.',
  },
  {
    question: 'Wie plane ich mein Budget von Euro in US-Dollar?',
    answer: 'Halten Sie Ihr Suchbudget in US-Dollar fest und lassen Sie sich von Ihrer Bank den tatsächlich angebotenen Wechselkurs sowie Umrechnungs- und Überweisungskosten erläutern. Die Euro-Referenzkurse der EZB dienen der Information; sie sind kein verbindliches Angebot für Ihre Überweisung. Planen Sie Kaufpreis, Kaufnebenkosten und laufende Ausgaben getrennt.',
    source: { label: 'EZB: Euro-Referenzkurse (Englisch)', href: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html' },
  },
  {
    question: 'Worauf sollte ich bei der Wahl eines Maklers achten?',
    answer: 'Prüfen Sie die kalifornische Lizenz und fragen Sie nach Erfahrung mit der konkreten Region. Besprechen Sie Leistungen, Kommunikation über die Entfernung, Vergütung und Laufzeit der schriftlichen Vereinbarung. Klären Sie vor einer Beauftragung, wer Ihre Interessen im Kaufprozess vertritt.',
    source: { label: 'California DRE: Informationen für Käufer (Englisch)', href: 'https://www.dre.ca.gov/Consumers/FirstHomeCalifornia.html' },
  },
  {
    question: 'Was bedeutet Escrow beim Hauskauf in Kalifornien?',
    answer: 'Escrow bezeichnet die neutrale Abwicklung von Geld und Unterlagen nach vereinbarten Anweisungen. Lassen Sie sich vor einem Angebot die Vertragsbedingungen, Vorbehalte und Fristen erklären. Unser englischer Kaufleitfaden führt durch Angebot, Inspektionen, Unterlagen zum Eigentum und den Kaufabschluss, das sogenannte Closing.',
    source: { label: 'Kaufablauf in acht Schritten (Englisch)', href: '/buyers-guide' },
  },
  {
    question: 'Kann ich Unterlagen in Deutschland unterschreiben?',
    answer: 'Stimmen Sie Identitätsprüfung, Unterschriften und gegebenenfalls Beglaubigungen früh mit Ihrem Escrow- oder Title-Unternehmen und einem beteiligten Kreditgeber ab. Welche Verfahren akzeptiert werden, hängt von den Unterlagen und der Transaktion ab. Konsularische Beglaubigungen der USA erfordern einen persönlichen Termin; planen Sie dafür ausreichend Zeit ein.',
    source: { label: 'US-Außenministerium: Beglaubigungen im Ausland (Englisch)', href: 'https://travel.state.gov/content/travel/en/replace-certify-docs/authenticate-your-document/authentication-services-overseas.html' },
  },
  {
    question: 'Wie vereinbare ich ein Gespräch aus Deutschland?',
    answer: 'Senden Sie eine kurze Anfrage mit Ihrer Region und Ihren Fragen. Für ein gewünschtes Videogespräch können Sie die Berliner Zeitzone angeben. Der Termin wird anschließend abgestimmt. Für eine bestimmte Immobilie müssen zusätzlich Zugang und Verfügbarkeit bestätigt werden; eine Anfrage ist noch keine Buchung.',
  },
];

const otherRegions = [
  { name: 'Los Angeles', href: '/international-buyers/germany/los-angeles', text: 'Die Stadt Los Angeles kennenlernen, Zuständigkeiten prüfen und passende Angebote mit Ihren eigenen Wegen vergleichen.' },
  { name: 'Orange County', href: '/international-buyers/germany/orange-county', text: 'Immobilien unter anderem in Newport Beach, Laguna Beach und Irvine vergleichen.' },
  { name: 'San Francisco', href: '/international-buyers/germany/san-francisco', text: 'Mit Angeboten in San Francisco beginnen und weitere gewünschte Orte in der Bay Area in Ihrer Anfrage nennen.' },
];

const steps = [
  ['Wünsche eingrenzen', 'Welche Lage, welche Räume und welche Nutzung passen zu Ihrem Vorhaben? Geben Sie Reza einen ersten Überblick, auch wenn Budget oder Reisedaten noch offen sind.'],
  ['Häuser vergleichen', 'Stellen Sie eine kleine Auswahl zusammen. Besprechen Sie die Zusammenarbeit und fragen Sie Besichtigungen an. Halten Sie zu jedem Haus dieselben Fragen fest.'],
  ['Den Kauf vorbereiten', 'Klären Sie mit den zuständigen Fachleuten Kosten, Unterlagen und Fristen. Stimmen Sie Inspektionen sowie die akzeptierten Zahlungs- und Unterschriftsverfahren frühzeitig ab.'],
];

export default function GermanyBuyerPage() {
  return <>
    <FunnelSchema market="germany" path={path} title={title} description={description} faqs={faqs} />
    <section className="uk-hero uk-shell" aria-labelledby="germany-hero-title">
      <div className="uk-hero-copy">
        <p className="uk-eyebrow">Aus Deutschland · Deutschsprachige Begleitung anfragen</p>
        <h1 id="germany-hero-title">Ein Haus in<br />Kalifornien kaufen.<br /><em>Von Deutschland<br />aus planen.</em></h1>
        <p className="uk-body">Vielleicht zieht es Sie an die Küste. Vielleicht steht zunächst eine Erkundungsreise an. Machen Sie aus der Idee eine konkrete Suche: mit passenden Orten, einer überschaubaren Auswahl und Reza als Kontakt vor Ort.</p>
        <div className="uk-hero-actions" id="funnel-intro-actions">
          <FunnelCta source={source}>Mit Reza planen</FunnelCta>
          <a href="#regionen-vergleichen" className="uk-text-link">Regionen entdecken <ArrowRight size={17} aria-hidden="true" /></a>
        </div>
        <p className="uk-hero-note"><Check size={15} aria-hidden="true" />Ein erster Überblick reicht für Ihre Anfrage.</p>
      </div>
      <figure className="uk-hero-image">
        <Image src="/city/san-diego-county/la-jolla-ca.webp" alt="Häuser an der Pazifikküste von La Jolla in San Diego" fill priority sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) 45vw, 535px" />
        <figcaption><div><strong>Ein anderer Blick auf den Alltag.</strong>La Jolla, San Diego</div><MapPin size={22} aria-hidden="true" /></figcaption>
      </figure>
    </section>

    <div className="uk-strip uk-shell" aria-label="Ihre Suche aus Deutschland">
      <div><MessageCircle size={23} aria-hidden="true" />Ein Kontakt in San Diego</div>
      <div><Video size={23} aria-hidden="true" />Videobesichtigungen anfragen</div>
      <div><MapPin size={23} aria-hidden="true" />Orte und Häuser vergleichen</div>
    </div>

    <section className="uk-section uk-shell" id="regionen-vergleichen" aria-labelledby="germany-locations-title">
      <div className="uk-section-heading">
        <div><p className="uk-eyebrow">Welche Gegend passt zu Ihnen?</p><h2 id="germany-locations-title">Erst den Ort finden.<br />Dann das Zuhause.</h2></div>
        <p className="uk-body">Die Wege im Alltag, Ihr Platzbedarf und die geplante Nutzung helfen, Kaliforniens viele Möglichkeiten einzugrenzen.</p>
      </div>
      <div className="uk-region-grid">
        <Link href="/international-buyers/germany/san-diego" className="uk-region-feature">
          <div className="uk-region-photo"><Image src="/city/san-diego-county/san-diego-ca.webp" alt="Skyline und Ufer von San Diego" fill sizes="(max-width: 767px) calc(100vw - 40px), 55vw" /></div>
          <div className="uk-region-feature-content">
            <p className="uk-eyebrow">San Diego näher kennenlernen</p><h3>San Diego und die Küste</h3>
            <p>La Jolla, Del Mar und Coronado im Vergleich: konkrete Fragen zur Lage, zum einzelnen Haus und zur Planung Ihrer Besichtigungsreise.</p>
            <span className="uk-text-link">San Diego entdecken <ArrowRight size={17} aria-hidden="true" /></span>
          </div>
        </Link>
        <div className="uk-region-options">
          {otherRegions.map((area, index) => <Link key={area.name} href={area.href} className="uk-region-option">
            <span className="uk-region-number">0{index + 2}</span><div><h3>{area.name}</h3><p>{area.text}</p></div><ArrowUpRight size={19} aria-hidden="true" />
          </Link>)}
          <p>Diese Leitfäden verbinden örtliche Käuferfragen mit passenden Immobiliensuchen. Für Orte außerhalb von San Diego klären Sie mit Reza, welche Unterstützung vor Ort verfügbar ist, bevor Sie Besichtigungen planen.</p>
        </div>
      </div>
    </section>

    <section className="uk-process uk-section" aria-labelledby="germany-process-title">
      <div className="uk-shell">
        <p className="uk-eyebrow">Von der Idee zur Auswahl</p><h2 id="germany-process-title">Drei Schritte für<br />einen guten Anfang.</h2>
        <div className="uk-steps">{steps.map(([heading, text], index) => <div className="uk-step" key={heading}>
          <span className="uk-step-number">0{index + 1}</span><h3>{heading}</h3><p>{text}</p>
        </div>)}</div>
        <Link href="/buyers-guide#buying-from-abroad" className="uk-text-link">Kaufablauf auf Englisch lesen <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
    </section>

    <section className="uk-section uk-shell uk-preparation" aria-labelledby="germany-preparation-title">
      <div><p className="uk-eyebrow">Vorbereitung aus Deutschland</p><h2 id="germany-preparation-title">Entfernung lässt<br />sich organisieren.</h2><p className="uk-body">Ein gemeinsamer Fragenkatalog, ein nachvollziehbares Budget und bestätigte Termine machen die nächsten Entscheidungen leichter.</p></div>
      <ul className="uk-preparation-list">
        <li><h3>Kosten in US-Dollar erfassen</h3><p>Ergänzen Sie den Kaufpreis um Schätzungen für Kaufnebenkosten, Versicherung, Steuern, gegebenenfalls HOA-Beiträge und Instandhaltung. Lassen Sie die Beträge für das konkrete Haus ermitteln.</p><a className="uk-source" href="https://www.dre.ca.gov/Consumers/FirstHomeCalifornia.html">California DRE: Kostenplanung (Englisch) ↗</a></li>
        <li><h3>Berliner Zeit angeben</h3><p>Nennen Sie Ihre Zeitzone und passende Zeitfenster. Prüfen Sie bei jeder Einladung Datum und Uhrzeit für beide Orte, statt mit einem festen Zeitunterschied zu rechnen.</p></li>
        <li><h3>Unterlagen früh verstehen</h3><p>Sammeln Sie Begriffe und Fragen, die Ihnen im US-Kaufprozess neu sind. Lassen Sie Vertragsinhalte und persönliche Rechts- oder Steuerfragen von den jeweils zuständigen unabhängigen Fachleuten erläutern.</p></li>
      </ul>
    </section>
    <BuyerLocationDirectory market="germany" />
    <BuyerEnquirySection market="germany" source={source} defaultRegion="Still comparing" />
    <BuyerFaqs market="germany" faqs={faqs} />
    <MobileFunnelCta source={source} label="Mit Reza planen" ariaLabel="Ihre Immobiliensuche aus Deutschland besprechen" />
  </>;
}
