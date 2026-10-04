import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Globe2, MapPin, Video } from 'lucide-react';
import { BUYER_MARKETS } from '@/lib/international-buyer-markets';
import { relatedBuyerLocations } from '@/lib/international-buyer-locations';
import { buyerLocationFaqs, buyerLocationMetadata } from '@/lib/international-buyer-location-seo';
import { CALIFORNIA_CITY_IMAGES, CALIFORNIA_COUNTY_IMAGES } from '@/lib/california-location-images';
import type { BuyerLocation } from '@/lib/international-buyer-location-types';
import type { BuyerMarket } from '@/lib/uk-buyer-inquiry';
import { BuyerEnquirySection, BuyerFaqs, FunnelSchema } from './funnel-sections';
import { FunnelCta, MobileFunnelCta } from './funnel-actions';

export default function BuyerLocationPage({ location, market }: { location: BuyerLocation; market: BuyerMarket }) {
  const german = market === 'germany';
  const country = market === 'canada' ? 'Canada' : 'England';
  const content = german ? location.de : location.en;
  const path = `${BUYER_MARKETS[market].path}/${location.slug}`;
  const source = `${market}_${location.slug.replace(/-/g, '_')}_funnel`;
  const metadata = buyerLocationMetadata(location, market);
  const title = (metadata.title as { absolute: string }).absolute;
  const faqs = buyerLocationFaqs(location, market);
  const related = relatedBuyerLocations(location);
  const photo = [...Object.values(CALIFORNIA_CITY_IMAGES), ...Object.values(CALIFORNIA_COUNTY_IMAGES)].find(image => image.src === location.image);
  const planning = german ? [
    ['Die Zusammenarbeit klären', `Besprechen Sie die Betreuung in ${location.name}, Leistungen und Vergütung. Fragen Sie konkret, wer vor Ort tätig wird und welche deutschsprachige Begleitung möglich ist.`],
    ['Euro und US-Dollar einplanen', 'Halten Sie Kaufpreis und Nebenkosten in US-Dollar fest. Lassen Sie sich Umrechnung und Überweisungskosten von Ihrem Anbieter erklären und geben Sie Berlin als Zeitzone für Gespräche an.'],
    ['Die Reise vorbereiten', 'Erstellen Sie eine kurze Auswahl mit offenen Fragen. Bestätigen Sie Zugang und Termine vor der Reise und planen Sie unabhängige Inspektionen als eigenen Schritt.'],
  ] : market === 'canada' ? [
    ['Agree on local representation', `Discuss who can support your search in ${location.name}, the scope of local services, and the fees and duration of any agreement.`],
    ['Keep CAD and USD separate', 'Compare homes in US dollars. Ask your provider for an actual currency quote and choose the Canadian time zone that fits your schedule.'],
    ['Plan for time away', 'Confirm viewing access before travelling. Ask the insurer about your intended use and arrange who can check the home and handle maintenance between visits.'],
  ] : [
    ['Confirm your local contact', `Ask who would handle your ${location.name} search and viewings. Discuss the services, fees and duration in the written representation agreement.`],
    ['Prepare from the UK', 'Keep your shortlist budget in US dollars and ask your provider about converting pounds. Select London time when requesting a conversation.'],
    ['Make the viewing trip useful', 'Share your shortlist and questions before travelling. Confirm appointments and leave time to investigate the surroundings, with independent inspections arranged separately.'],
  ];

  return <>
    <FunnelSchema path={path} title={title} description={metadata.description || ''} faqs={faqs} market={market} locationName={location.name} />
    <section className="uk-hero uk-shell uk-location-hero" aria-labelledby="location-hero-title">
      <div className="uk-hero-copy">
        <nav className="uk-breadcrumb" aria-label={german ? 'Seitennavigation' : 'Breadcrumb'}><Link href={BUYER_MARKETS[market].path}>{BUYER_MARKETS[market].label}</Link><span aria-hidden="true">/</span><span aria-current="page">{location.name}</span></nav>
        <p className="uk-eyebrow">{german ? 'Immobilienmakler suchen · Deutschsprachige Begleitung anfragen' : `California real estate agents · Buying from ${country}`}</p>
        <h1 id="location-hero-title">{german ? <>Makler in<br />{location.name}<br /><em>finden.</em></> : <>Find an agent<br />in {location.name}.<br /><em>Start from {country}.</em></>}</h1>
        <p className="uk-body">{content.intro}</p>
        <div className="uk-hero-actions" id="funnel-intro-actions"><FunnelCta source={source}>{german ? 'Begleitung anfragen' : 'Discuss your search'}</FunnelCta><a href="#local-buyer-questions" className="uk-text-link">{german ? 'Den Standort prüfen' : 'Explore local questions'}<ArrowRight size={17} aria-hidden="true" /></a></div>
        <p className="uk-hero-note"><Check size={15} aria-hidden="true" />{german ? 'Ihr Wunschort und Ihre Wunschsprache zählen.' : 'Your location. Your priorities. A practical next step.'}</p>
      </div>
      <div>
        <figure className="uk-hero-image"><Image src={location.image} alt={german ? `${location.name}, Kalifornien` : location.imageAlt} fill priority sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) 45vw, 535px" /><figcaption><div><strong>{location.name}</strong>{german ? 'Kalifornien' : 'California'}</div><MapPin size={22} aria-hidden="true" /></figcaption></figure>
        {photo && <p className="uk-photo-credit">{german ? 'Foto' : 'Photo'}: <a href={photo.sourceUrl}>{photo.creator}</a> · <a href={photo.licenseUrl}>{photo.license}</a> · {german ? 'Bildausschnitt' : 'Cropped to fit'}</p>}
      </div>
    </section>

    <div className="uk-strip uk-shell" aria-label={german ? 'Ihre Suche vorbereiten' : 'Prepare your search'}><div><MapPin size={22} aria-hidden="true" />{location.name}</div><div><Video size={22} aria-hidden="true" />{german ? 'Besichtigungen vorbereiten' : 'Prepare useful viewings'}</div><div><Globe2 size={22} aria-hidden="true" />{german ? 'Sprachwunsch angeben' : `Plan from ${country}`}</div></div>

    <section id="local-buyer-questions" className="uk-section uk-shell" aria-labelledby="local-questions-heading">
      <div className="uk-section-heading"><div><p className="uk-eyebrow">{location.name} · {german ? 'Genauer hinsehen' : 'Look more closely'}</p><h2 id="local-questions-heading">{german ? <>Was Sie vor Ort<br />prüfen sollten.</> : <>The questions behind<br />the address.</>}</h2></div><p className="uk-body">{content.searchFocus}</p></div>
      <div className="uk-local-check-grid">{content.checks.map((check, index) => <article key={check.title}><span className="uk-step-number">0{index + 1}</span><h3>{check.title}</h3><p>{check.body}</p>{check.source && <a className="uk-source" href={check.source.href}>{check.source.label}{german ? ' (Englisch)' : ''} ↗</a>}</article>)}</div>
    </section>

    <section className="uk-process uk-section" aria-labelledby="local-search-heading"><div className="uk-shell">
      <div className="uk-section-heading"><div><p className="uk-eyebrow">{german ? 'Ihre Auswahl vertiefen' : 'Shape your shortlist'}</p><h2 id="local-search-heading">{german ? <>Orte und Angebote<br />zusammen betrachten.</> : <>Put places<br />beside properties.</>}</h2></div><p className="uk-body">{german ? 'Nutzen Sie diese Suchansichten als Ausgangspunkt. Die genaue Adresse, der Zustand und Ihre eigenen Wege entscheiden über die passende Auswahl.' : 'Use these searches as a starting point. Compare the actual address, condition and your own daily routes before narrowing the list.'}</p></div>
      <div className="uk-local-search-grid">{content.areas.map(area => <article key={area.name}><h3>{area.name}</h3><p>{area.description}</p><Link className="uk-text-link" href={area.href}>{german ? 'Angebote ansehen (Englisch)' : 'Explore current homes'}<ArrowRight size={16} aria-hidden="true" /></Link></article>)}</div>
      <Link className="uk-text-link uk-trip-cta" href={location.searchHref}>{german ? `Immobiliensuche: ${location.name} (Englisch)` : `Open the ${location.name} property search`}<ArrowRight size={17} aria-hidden="true" /></Link>
    </div></section>

    <section className="uk-section uk-shell uk-preparation" aria-labelledby="agent-search-heading"><div><p className="uk-eyebrow">{german ? 'Vom Suchbegriff zur Zusammenarbeit' : 'From an agent search to a useful plan'}</p><h2 id="agent-search-heading">{german ? <>Ihre Begleitung.<br />Klar besprochen.</> : <>Know who will<br />support your search.</>}</h2><p className="uk-body">{german ? `Sie suchen einen Immobilienmakler in ${location.name} und wünschen Begleitung auf Deutsch? Nennen Sie beides in Ihrer Anfrage. Besprechen Sie mit Reza, wie die Unterstützung am Standort organisiert werden kann.` : `Looking for a real estate agent in ${location.name} from ${country}? Share your preferred area and the stage you have reached. Discuss with Reza how support at that location can be arranged.`}</p><p className="uk-local-note">{german ? 'Reza ist in San Diego ansässig. Klären Sie vor einer Beauftragung, wer die Betreuung vor Ort und die gewünschte sprachliche Begleitung übernimmt.' : 'Reza is based in San Diego. Confirm who would provide local services before arranging viewings or engaging representation.'}</p></div><ol className="uk-preparation-list">{planning.map(([heading, body]) => <li key={heading}><h3>{heading}</h3><p>{body}</p></li>)}</ol></section>

    <BuyerEnquirySection source={source} market={market} defaultRegion={location.searchRegion} defaultLocation={location.name} />
    {related.length > 0 && <nav className="uk-shell uk-related-locations" aria-label={german ? 'Weitere Standorte in der Region' : 'More locations in this region'}><p>{german ? 'Auch diese Standorte vergleichen' : 'Compare other locations nearby'}</p><div>{related.map(other => <Link key={other.slug} className="uk-text-link" href={`${BUYER_MARKETS[market].path}/${other.slug}`}>{other.name}<ArrowRight size={15} aria-hidden="true" /></Link>)}</div></nav>}
    <BuyerFaqs faqs={faqs} market={market} regional={location.slug} />
    <MobileFunnelCta source={source} label={german ? 'Begleitung anfragen' : 'Discuss your search'} ariaLabel={german ? `Begleitung für ${location.name} anfragen` : `Discuss buying in ${location.name}`} />
  </>;
}
