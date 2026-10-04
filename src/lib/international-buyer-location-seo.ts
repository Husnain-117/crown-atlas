import type { Metadata } from 'next';
import { absoluteUrl } from './constants/site';
import { BUYER_MARKETS, buyerFunnelLanguages } from './international-buyer-markets';
import type { BuyerLocation } from './international-buyer-location-types';
import type { BuyerMarket } from './uk-buyer-inquiry';

export function buyerLocationFaqs(location: BuyerLocation, market: BuyerMarket) {
  const german = market === 'germany';
  const country = market === 'canada' ? 'Canada' : 'the UK';
  const local = german ? location.de : location.en;
  return [...local.faqs, ...(german ? [
    { question: `Wie finde ich einen passenden Immobilienmakler in ${location.name}?`, answer: 'Prüfen Sie die kalifornische Lizenz, Erfahrung mit der konkreten Gegend und die schriftlich angebotenen Leistungen. Besprechen Sie, wer Sie vor Ort vertritt, wie Besichtigungen organisiert werden und welche Vergütung und Laufzeit vereinbart werden. Reza ist in San Diego ansässig; klären Sie die Betreuung am gewünschten Standort vor einer Beauftragung.', source: { label: 'California DRE: Maklerlizenz prüfen (Englisch)', href: 'https://www.dre.ca.gov/Licensees/VerifyLicense.html' } },
    { question: `Kann ich deutschsprachige Begleitung für ${location.name} anfragen?`, answer: 'Ja. Wählen Sie im Formular Deutsch als gewünschte Sprache und nennen Sie Ihren Wunschort. Besprechen Sie im Erstgespräch, welche Begleitung auf Deutsch möglich ist, wer sie übernimmt und wie die Arbeit mit den zuständigen Fachleuten abläuft. Die Sprachwahl ist zunächst eine Anfrage; Umfang und Verfügbarkeit werden vorab geklärt.' },
    { question: 'Deutscher oder deutschsprachiger Makler: Was sollte ich prüfen?', answer: 'Wenn Sie Unterstützung auf Deutsch suchen, fragen Sie konkret nach der Sprache der Beratung und der Rolle Ihrer Ansprechperson. Prüfen Sie unabhängig davon die kalifornische Maklerlizenz und die vereinbarten Leistungen. Für Übersetzungen von Vertragsunterlagen sowie Rechts- und Steuerfragen sollten Sie die jeweils zuständigen Fachleute einbeziehen.' },
    { question: 'Was bedeutet REALTOR® im Unterschied zu Real Estate Agent?', answer: 'Real Estate Agent bezeichnet im kalifornischen Kaufkontext einen entsprechend lizenzierten Immobilienmakler. REALTOR® ist dagegen eine Mitgliedschaftsbezeichnung der National Association of REALTORS®. Prüfen Sie eine gewünschte Mitgliedschaft gesondert; sie ersetzt die Prüfung der staatlichen Lizenz und der konkreten Leistungen nicht.', source: { label: 'NAR: Definition von REALTOR® (Englisch)', href: 'https://www.nar.realtor/membership-marks-manual/definition-of-realtor' } },
  ] : [
    { question: `How do I compare real estate agents in ${location.name}?`, answer: 'Verify the California licence, experience with the specific area and the services included in the written representation agreement. Ask who will handle local viewings, how you will communicate from abroad, and how fees and duration work. Reza is based in San Diego; confirm the arrangement for your preferred location before engaging services.', source: { label: 'California DRE: verify a real estate licence', href: 'https://www.dre.ca.gov/Licensees/VerifyLicense.html' } },
    { question: `How can I start a ${location.name} home search from ${country}?`, answer: market === 'canada' ? 'Start with the location, property type and intended use. Keep the search budget in US dollars and ask your provider about converting Canadian funds. Select your Canadian time zone for a conversation and discuss the home’s care between visits. Access, representation and appointments need to be confirmed separately.' : 'Share your preferred location, property type and intended use from the UK. Record the search budget in US dollars and ask your provider about converting pounds. Choose London time for a conversation, then discuss access and representation before arranging a viewing trip.' },
    { question: `What should I ask when searching for a REALTOR® in ${location.name}?`, answer: 'REALTOR® identifies membership in the National Association of REALTORS®; it is not a generic term for every real estate agent. If membership matters to you, verify it separately. Also check the California licence, local experience and written representation terms for the person you are considering.', source: { label: 'NAR: definition of REALTOR®', href: 'https://www.nar.realtor/membership-marks-manual/definition-of-realtor' } },
  ])];
}

export function buyerLocationMetadata(location: BuyerLocation, market: BuyerMarket): Metadata {
  const german = market === 'germany';
  const path = `${BUYER_MARKETS[market].path}/${location.slug}`;
  const title = german
    ? `Immobilienmakler ${location.name}: Begleitung auf Deutsch anfragen`
    : `${location.name} Real Estate Agent Guide for ${market === 'canada' ? 'Canadian' : 'UK'} Buyers`;
  const description = german
    ? `Immobilienmakler in ${location.name} suchen: lokale Käuferfragen, passende Angebote und deutschsprachige Begleitung für Ihren Hauskauf in Kalifornien anfragen.`
    : `Looking for a real estate agent in ${location.name} from ${market === 'canada' ? 'Canada' : 'the UK'}? Compare local buyer questions, explore homes and discuss how your search can be supported.`;
  return { title: { absolute: title }, description, alternates: { canonical: path, languages: buyerFunnelLanguages(location.slug) },
    openGraph: { title, description, url: path, type: 'website', locale: BUYER_MARKETS[market].language.replace('-', '_'), images: [{ url: absoluteUrl(location.image), width: 1200, height: 800, alt: german ? `${location.name}, Kalifornien` : location.imageAlt }] },
    twitter: { card: 'summary_large_image', title, description, images: [absoluteUrl(location.image)] },
  };
}
