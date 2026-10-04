import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, MapPin, Video, Compass } from 'lucide-react';
import { BuyerEnquirySection, BuyerFaqs, FunnelSchema, type BuyerFaq } from '@/components/international-buyers/funnel-sections';
import { FunnelCta, MobileFunnelCta } from '@/components/international-buyers/funnel-actions';
import { absoluteUrl } from '@/lib/constants/site';
import { buyerFunnelLanguages } from '@/lib/international-buyer-markets';

const path = '/international-buyers/uk/san-diego';
const source = 'uk_san_diego_funnel';
const title = 'Buying in San Diego from the UK | Crown Coastal Homes';
const description = 'Find your San Diego home from England with Reza. Compare La Jolla, Del Mar and Coronado, plan video tours and prepare a focused California viewing trip.';
export const metadata: Metadata = {
  title, description, alternates: { canonical: path, languages: buyerFunnelLanguages(true) },
  openGraph: { title, description, url: path, type: 'website', locale: 'en_GB',
    images: [{ url: absoluteUrl('/city/san-diego-county/san-diego-ca.webp'), width: 1200, height: 800, alt: 'San Diego waterfront and skyline' }] },
  twitter: { card: 'summary_large_image', title, description, images: [absoluteUrl('/city/san-diego-county/san-diego-ca.webp')] },
};

const areas = [
  { name: 'La Jolla', label: 'Within the City of San Diego', image: '/city/san-diego-county/la-jolla-ca.webp', href: '/buy/san-diego/la-jolla-ca',
    text: 'Start with the exact setting: near the Village, around UC San Diego or on a quieter residential street. Your daily routes will help you narrow the options.',
    checks: ['Test the route to the places you’ll visit regularly.', 'For a condo, review parking, HOA documents and charges.', 'Check the planning rules before assuming you can remodel.'],
    source: { label: 'La Jolla community plan', href: 'https://www.sandiego.gov/planning/community-plans/la-jolla' } },
  { name: 'Del Mar', label: 'A separate coastal city', image: '/city/san-diego-county/del-mar-ca.webp', href: '/buy/san-diego/del-mar-ca',
    text: 'If access to the village and coast is part of your brief, compare the actual walk, gradient and parking at each address. Keep travel routes on your shortlist too.',
    checks: ['Confirm which city has authority over the address.', 'Check access and surroundings during your viewing.', 'Ask the city about permits and any design review.'],
    source: { label: 'Del Mar planning department', href: 'https://www.delmar.ca.us/156/Planning-Community-Development' } },
  { name: 'Coronado', label: 'Village and Cays comparisons', image: '/city/san-diego-county/coronado-ca.webp', href: '/buy/san-diego/coronado-ca',
    text: 'Compare the Village and Coronado Cays against the way you intend to use the home. Look at the property, its immediate surroundings and the routes you’ll rely on.',
    checks: ['Try your proposed route to mainland destinations.', 'Ask about property-specific insurance and maintenance.', 'Confirm zoning and your intended use with the city.'],
    source: { label: 'Coronado planning and zoning', href: 'https://www.coronado.ca.us/269/Planning-Zoning' } },
];

const faqs: BuyerFaq[] = [
  { question: 'Where should I begin my San Diego home search?', answer: 'Write down your intended use, budget, property type and the destinations you need to reach. La Jolla, Del Mar and Coronado offer useful starting points for a coastal search, but the best fit depends on the individual address and your priorities. Reza can discuss a shortlist around your brief.' },
  { question: 'Is La Jolla a separate city from San Diego?', answer: 'La Jolla is a community within the City of San Diego. Use the city’s community plan as a starting point, then confirm the zoning, permits and other requirements for the exact property. Del Mar and Coronado have their own city planning departments.', source: { label: 'City of San Diego: La Jolla community plan', href: 'https://www.sandiego.gov/planning/community-plans/la-jolla' } },
  { question: 'What can a video tour help me check from England?', answer: 'Ask to see the approach to the home, the layout, natural light, storage, outdoor space and any features that are unclear in photographs. Prepare questions about audible noise and visible condition. Video tours help with shortlisting; an independent home inspection is a separate step.', source: { label: 'CFPB: schedule a home inspection', href: 'https://www.consumerfinance.gov/owning-a-home/close/schedule-a-home-inspection/' } },
  { question: 'How should I plan a San Diego viewing trip?', answer: 'Share your travel dates and shortlist before booking appointments. Discuss representation and confirm property access, then group viewings by area with time to revisit the surrounding streets and test your own routes. Allow space for follow-up questions rather than filling every hour.' },
  { question: 'Can I rent out a San Diego-area home while I am in England?', answer: 'Do not assume that a home can be let for your intended duration. Rules depend on the city, the property and any homeowners’ association. Confirm permitted use, any required licences and restrictions with the relevant authority before relying on rental plans. The City of San Diego guidance linked here applies to that city; check Del Mar and Coronado separately.', source: { label: 'City of San Diego: short-term residential occupancy', href: 'https://www.sandiego.gov/treasurer/short-term-residential-occupancy' } },
  { question: 'What happens after I send my enquiry?', answer: 'Reza will review your region, timing and any details you choose to share, then follow up using your contact information. You can request a video conversation in London time. Dates and property access are confirmed separately; the form does not make a booking.' },
];

export default function UkSanDiegoBuyerPage() {
  return <>
    <FunnelSchema path={path} title={title} description={description} faqs={faqs} />
    <section className="uk-hero uk-shell" aria-labelledby="uk-hero-title">
      <div className="uk-hero-copy">
        <nav className="uk-breadcrumb" aria-label="Breadcrumb"><Link href="/international-buyers/uk">Buying from the UK</Link><span aria-hidden="true">/</span><span aria-current="page">San Diego</span></nav>
        <p className="uk-eyebrow">England to San Diego</p>
        <h1 id="uk-hero-title">Find your place<br />in San Diego.<br /><em>Start from England.</em></h1>
        <p className="uk-body">Get beyond the listing photos. Compare coastal locations, ask the practical questions and plan your home search with Reza, a San Diego-based real estate agent.</p>
        <div className="uk-hero-actions" id="funnel-intro-actions"><FunnelCta source={source}>Plan your San Diego search</FunnelCta><a href="#compare-areas" className="uk-text-link">Compare the coastal areas <ArrowRight size={17} aria-hidden="true" /></a></div>
        <p className="uk-hero-note"><Check size={15} aria-hidden="true" />Local guidance. A practical plan from the UK.</p>
      </div>
      <figure className="uk-hero-image"><Image src="/city/san-diego-county/san-diego-ca.webp" alt="San Diego skyline on the waterfront" fill priority sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) 45vw, 535px" /><figcaption><div><strong>A new view of everyday life.</strong>San Diego, California</div><MapPin size={22} aria-hidden="true" /></figcaption></figure>
    </section>
    <div className="uk-strip uk-shell" aria-label="Planning your San Diego purchase"><div><MapPin size={23} aria-hidden="true" />Reza’s home region</div><div><Video size={23} aria-hidden="true" />Start with video tour requests</div><div><Compass size={23} aria-hidden="true" />Plan a focused viewing trip</div></div>

    <section className="uk-section uk-shell" id="compare-areas" aria-labelledby="uk-areas-title">
      <div className="uk-section-heading"><div><p className="uk-eyebrow">Three starting points on the coast</p><h2 id="uk-areas-title">The right area is<br />a personal choice.</h2></div><p className="uk-body">Use these questions to compare addresses, then explore current homes. Each location deserves its own look before it becomes your shortlist.</p></div>
      <div className="uk-area-grid">{areas.map(area => <article key={area.name} className="uk-area-card"><div className="uk-area-photo"><Image src={area.image} alt={`${area.name}, California coastal setting`} fill sizes="(max-width: 767px) calc(100vw - 40px), 33vw" /></div><div className="uk-area-content"><p className="uk-eyebrow">{area.label}</p><h3>{area.name}</h3><p>{area.text}</p><ul>{area.checks.map(check => <li key={check}>{check}</li>)}</ul><Link href={area.href} className="uk-text-link">View {area.name} homes <ArrowRight size={16} aria-hidden="true" /></Link><div><a href={area.source.href} className="uk-source">{area.source.label} ↗</a></div></div></article>)}</div>
      <p className="uk-local-note">This is a starting point for research. Confirm costs, condition, permitted use and other material details for the exact home. For a broader search, <Link href="/buy/san-diego" className="uk-text-link">explore all San Diego County homes <ArrowRight size={15} aria-hidden="true" /></Link>.</p>
    </section>

    <section className="uk-process uk-section" aria-labelledby="uk-trip-title"><div className="uk-shell uk-itinerary"><div><p className="uk-eyebrow">Make your time here count</p><h2 id="uk-trip-title">A viewing trip<br />with a purpose.</h2><p className="uk-body">Do the early thinking from England. Arrive with a focused list, confirmed access and enough time to explore what photographs leave out.</p><FunnelCta source={source} className="uk-trip-cta">Discuss your viewing plans</FunnelCta></div><ol className="uk-preparation-list">
      <li><span>01</span><div><h3>Before you travel</h3><p>Share your buying brief. Review current homes, request video tours and discuss representation before arranging private viewings.</p></div></li>
      <li><span>02</span><div><h3>While you are here</h3><p>Group appointments by area. Walk the surrounding streets, test your own routes and record the same questions for every property.</p></div></li>
      <li><span>03</span><div><h3>Once you have a shortlist</h3><p>Ask about property-specific costs and documents. Discuss an offer only when you understand the terms, investigations and deadlines.</p></div></li>
    </ol></div></section>

    <section className="uk-section uk-shell uk-preparation" aria-labelledby="uk-remote-title"><div><p className="uk-eyebrow">Keep the distance manageable</p><h2 id="uk-remote-title">Small details.<br />A more useful search.</h2><p className="uk-body">Start with these arrangements before you get deep into individual homes. They help keep questions and decisions in one place.</p></div><ul className="uk-preparation-list"><li><h3>Use a shared viewing brief</h3><p>List the rooms, features and surroundings you want to see on video. Ask for another view when something is unclear.</p></li><li><h3>Confirm both time zones</h3><p>Choose London time for your request. Confirm the date and time on your invitation rather than relying on a fixed hour difference.</p></li><li><h3>Build a local support plan</h3><p>Arrange independent inspections, property-specific insurance quotes and accepted signing methods with the responsible professionals.</p></li></ul></section>
    <BuyerEnquirySection source={source} defaultRegion="San Diego / La Jolla" defaultLocation="San Diego" />
    <nav className="uk-shell uk-related-locations" aria-label="More locations"><Link className="uk-text-link" href="/international-buyers/uk#agent-locations">Compare more California locations <ArrowRight size={16} aria-hidden="true" /></Link></nav>
    <BuyerFaqs faqs={faqs} regional />
    <MobileFunnelCta source={source} />
  </>;
}
