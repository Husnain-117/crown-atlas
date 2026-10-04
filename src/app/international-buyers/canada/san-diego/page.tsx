import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Clock3, MapPin, Video } from 'lucide-react';
import { BuyerEnquirySection, BuyerFaqs, FunnelSchema, type BuyerFaq } from '@/components/international-buyers/funnel-sections';
import { FunnelCta, MobileFunnelCta } from '@/components/international-buyers/funnel-actions';
import { absoluteUrl } from '@/lib/constants/site';
import { buyerFunnelLanguages } from '@/lib/international-buyer-markets';

const path = '/international-buyers/canada/san-diego';
const source = 'canada_san_diego_funnel';
const title = 'Buying a San Diego Home from Canada | Crown Coastal Homes';
const description = 'Compare San Diego homes from Canada with Reza. Explore La Jolla, Del Mar and Coronado, request video tours and plan care for the home between visits.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path, languages: buyerFunnelLanguages(true) },
  openGraph: {
    title, description, url: path, type: 'website', locale: 'en_CA',
    images: [{ url: absoluteUrl('/city/san-diego-county/san-diego-ca.webp'), width: 1200, height: 800, alt: 'San Diego skyline beside the waterfront' }],
  },
  twitter: {
    card: 'summary_large_image', title, description,
    images: [absoluteUrl('/city/san-diego-county/san-diego-ca.webp')],
  },
};

const areas = [
  {
    name: 'La Jolla', label: 'A San Diego community', image: '/city/san-diego-county/la-jolla-ca.webp', href: '/buy/san-diego/la-jolla-ca',
    text: 'Look at how the home meets the street as well as the coastline in the photographs. Compare the approach, stairs, outdoor space and the route to your everyday stops.',
    checks: ['Ask for a continuous video from parking to the front door.', 'Identify who maintains outdoor and shared areas.', 'Use the city’s plan and maps to investigate the address.'],
    source: { label: 'City of San Diego: La Jolla community plan', href: 'https://www.sandiego.gov/planning/community-plans/la-jolla' },
  },
  {
    name: 'Del Mar', label: 'Check the exact jurisdiction', image: '/city/san-diego-county/del-mar-ca.webp', href: '/buy/san-diego/del-mar-ca',
    text: 'Put any intended changes to the home on your research list early. Compare the existing layout with what you need, and establish which authority handles the property before exploring alterations.',
    checks: ['Request records for work already completed.', 'Ask planning staff about the changes you are considering.', 'Walk the routes you would use, including access and parking.'],
    source: { label: 'City of Del Mar: planning and development', href: 'https://www.delmar.ca.us/156/Planning-Community-Development' },
  },
  {
    name: 'Coronado', label: 'Village and Cays research', image: '/city/san-diego-county/coronado-ca.webp', href: '/buy/san-diego/coronado-ca',
    text: 'Give a Village address and a Cays address separate evaluations. Coronado publishes maps for both; use the correct one and compare how each property would work during visits and while you are away.',
    checks: ['Check the applicable zoning map and permitted use.', 'Build a list of property-specific maintenance and insurance questions.', 'Try the journey to the mainland destinations on your itinerary.'],
    source: { label: 'City of Coronado: planning, zoning and maps', href: 'https://www.coronado.ca.us/269/Planning-Zoning' },
  },
];

const faqs: BuyerFaq[] = [
  {
    question: 'How can I compare La Jolla, Del Mar and Coronado from Canada?',
    answer: 'Choose a few real addresses and give each the same brief: expected use, rooms, outdoor space, parking, everyday routes and upkeep. Request details that are missing from the listing. The area cards here link to current homes and the relevant planning sources so your comparison can move beyond an area name.',
  },
  {
    question: 'Would a condo be easier to look after between visits?',
    answer: 'Compare the responsibilities in the actual association documents. Ask what maintenance is included in the dues, what you must arrange yourself, how access works for contractors and whether any assessments are planned. A condo and a detached home can involve different tasks; the documents and condition of the individual property matter more than the label.',
  },
  {
    question: 'What should I ask to see during a live video tour?',
    answer: 'Request the arrival route, entry, storage, outdoor areas and the equipment or spaces you would need someone to maintain. Have a checklist ready and note anything the camera cannot settle. Arrange an independent home inspection as part of the purchase investigation; a video tour helps you shortlist but does not replace that inspection.',
    source: { label: 'CFPB: arranging a home inspection', href: 'https://www.consumerfinance.gov/owning-a-home/close/schedule-a-home-inspection/' },
  },
  {
    question: 'What should I tell an insurer about my plans for the home?',
    answer: 'Describe the intended use, how often you expect to be there and the periods when nobody would be staying. Ask for a property-specific quote and written clarification of any conditions for absences, home checks or maintenance. Resolve those questions while reviewing the property and your purchase deadlines, rather than assuming another home’s policy will apply.',
  },
  {
    question: 'Can I include rental income in my ownership plan?',
    answer: 'First establish whether the exact use you have in mind is allowed by the relevant city and any homeowners’ association. The City of San Diego’s short-term residential occupancy guidance applies within that city; Del Mar and Coronado require separate research. Ask your tax advisers how a rental plan would affect your circumstances before building a budget around it.',
    source: { label: 'City of San Diego: short-term residential occupancy', href: 'https://www.sandiego.gov/treasurer/short-term-residential-occupancy' },
  },
  {
    question: 'How should I keep my Canadian-dollar estimate up to date?',
    answer: 'Record the USD figures for each home and the dated CAD estimate you used to compare them. Confirm the actual rate, charges and transfer timing with your provider when you need to move funds. The Bank of Canada’s indicative rates can provide context, but they are not a quote for your transaction.',
    source: { label: 'Bank of Canada: indicative exchange rates', href: 'https://www.bankofcanada.ca/rates/exchange/daily-exchange-rates/' },
  },
];

export default function CanadaSanDiegoBuyerPage() {
  return <>
    <FunnelSchema market="canada" path={path} title={title} description={description} faqs={faqs} />
    <section className="uk-hero uk-shell" aria-labelledby="canada-sd-hero-title">
      <div className="uk-hero-copy">
        <nav className="uk-breadcrumb" aria-label="Breadcrumb"><Link href="/international-buyers/canada">Buying from Canada</Link><span aria-hidden="true">/</span><span aria-current="page">San Diego</span></nav>
        <p className="uk-eyebrow">A San Diego search from Canada</p>
        <h1 id="canada-sd-hero-title">Picture your days<br />in San Diego.<br /><em>Then check the details.</em></h1>
        <p className="uk-body">The view is a beginning. Work through the location, condition and care of a home with Reza, a real estate agent based in San Diego, before deciding which places deserve a closer look.</p>
        <div className="uk-hero-actions" id="funnel-intro-actions">
          <FunnelCta source={source}>Discuss a San Diego shortlist</FunnelCta>
          <a href="#compare-areas" className="uk-text-link">Explore three coastal areas <ArrowRight size={17} aria-hidden="true" /></a>
        </div>
        <p className="uk-hero-note"><Check size={15} aria-hidden="true" />Start in Canada. Investigate the actual address.</p>
      </div>
      <figure className="uk-hero-image">
        <Image src="/city/san-diego-county/san-diego-ca.webp" alt="San Diego waterfront with the downtown skyline beyond" fill priority sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) 45vw, 535px" />
        <figcaption><div><strong>Get to know the place behind the picture.</strong>San Diego, California</div><MapPin size={22} aria-hidden="true" /></figcaption>
      </figure>
    </section>

    <div className="uk-strip uk-shell" aria-label="Your San Diego search from Canada">
      <div><MapPin size={23} aria-hidden="true" />Research the exact address</div>
      <div><Video size={23} aria-hidden="true" />Request a closer look on video</div>
      <div><Clock3 size={23} aria-hidden="true" />Plan for visits and time away</div>
    </div>

    <section className="uk-section uk-shell" id="compare-areas" aria-labelledby="canada-sd-areas-title">
      <div className="uk-section-heading">
        <div><p className="uk-eyebrow">Three places, three investigations</p><h2 id="canada-sd-areas-title">Look at the home.<br />Look at what comes with it.</h2></div>
        <p className="uk-body">Use the same questions at each viewing, then add the ones that belong to that address. These are starting points for research, with links to the relevant city resources.</p>
      </div>
      <div className="uk-area-grid">
        {areas.map(area => <article key={area.name} className="uk-area-card">
          <div className="uk-area-photo"><Image src={area.image} alt={`${area.name} coastal setting in California`} fill sizes="(max-width: 767px) calc(100vw - 40px), 33vw" /></div>
          <div className="uk-area-content">
            <p className="uk-eyebrow">{area.label}</p><h3>{area.name}</h3><p>{area.text}</p>
            <ul>{area.checks.map(check => <li key={check}>{check}</li>)}</ul>
            <Link href={area.href} className="uk-text-link">Browse {area.name} homes <ArrowRight size={16} aria-hidden="true" /></Link>
            <div><a href={area.source.href} className="uk-source">{area.source.label} ↗</a></div>
          </div>
        </article>)}
      </div>
      <p className="uk-local-note">A wider search may reveal a better fit for your plans. <Link href="/buy/san-diego" className="uk-text-link">Compare homes across San Diego County <ArrowRight size={15} aria-hidden="true" /></Link>.</p>
    </section>

    <section className="uk-process uk-section" aria-labelledby="canada-sd-trip-title">
      <div className="uk-shell uk-itinerary">
        <div><p className="uk-eyebrow">Get more from a viewing visit</p><h2 id="canada-sd-trip-title">Arrive with questions.<br />Leave with a comparison.</h2><p className="uk-body">Organize a trip around the homes that warrant a visit, then give yourself time to investigate what a video cannot show you.</p><FunnelCta source={source} className="uk-trip-cta">Prepare a viewing visit</FunnelCta></div>
        <ol className="uk-preparation-list">
          <li><span>01</span><div><h3>Start the work in Canada</h3><p>Share a shortlist, request useful documents and discuss representation. Send your city, time zone and possible travel dates so appointments can be considered together.</p></div></li>
          <li><span>02</span><div><h3>Make space for ordinary errands</h3><p>After viewing the property, try the journeys you would repeat: groceries, parking, visits and a walk from the front door. Record the same observations for each home.</p></div></li>
          <li><span>03</span><div><h3>Close the gaps in your notes</h3><p>Identify the documents, inspection findings and cost estimates you still need. Assign each question to the right professional and confirm how you will receive answers after returning to Canada.</p></div></li>
        </ol>
      </div>
    </section>

    <section className="uk-section uk-shell uk-preparation" aria-labelledby="canada-sd-care-title">
      <div><p className="uk-eyebrow">Think about ownership as well as arrival</p><h2 id="canada-sd-care-title">A home that works<br />between visits, too.</h2><p className="uk-body">If your time will be split between places, the care plan belongs in your buying brief. Compare the work involved before narrowing the shortlist.</p></div>
      <ul className="uk-preparation-list">
        <li><h3>Make responsibility explicit</h3><p>For each task, identify who would handle it and how they would reach you. Include routine checks, urgent repairs and access to the home. Confirm costs and availability with the people you choose.</p></li>
        <li><h3>Keep a usable ownership file</h3><p>Bring together warranties, service contacts, association documents and insurance information. Ask what needs to be updated when a service provider or your pattern of use changes.</p></li>
        <li><h3>Put dates in the right time zone</h3><p>Use named time zones on appointments and deadlines. Tell Reza if you are in Canada or travelling when a conversation is scheduled, and confirm the local times on the invitation.</p></li>
      </ul>
    </section>
    <BuyerEnquirySection market="canada" source={source} defaultRegion="San Diego / La Jolla" defaultLocation="San Diego" />
    <nav className="uk-shell uk-related-locations" aria-label="More locations"><Link className="uk-text-link" href="/international-buyers/canada#agent-locations">Compare more California locations <ArrowRight size={16} aria-hidden="true" /></Link></nav>
    <BuyerFaqs market="canada" faqs={faqs} regional />
    <MobileFunnelCta source={source} label="Discuss your San Diego plans" ariaLabel="Plan a San Diego home search from Canada" />
  </>;
}
