import type { Metadata } from 'next';
import { BuyerLocationDirectory } from '@/components/international-buyers/location-directory';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, Clock3, CircleDollarSign, MapPin } from 'lucide-react';
import { BuyerEnquirySection, BuyerFaqs, FunnelSchema, type BuyerFaq } from '@/components/international-buyers/funnel-sections';
import { FunnelCta, MobileFunnelCta } from '@/components/international-buyers/funnel-actions';
import { absoluteUrl } from '@/lib/constants/site';
import CaliforniaLifestyleCollage from '@/components/international-buyers/california-lifestyle-collage';
import './canada.css';
import { CANADA_CONSULT_REGIONS, type CanadaConsultRegion } from '@/lib/canada-consult-regions';
import { CANADA_LIFESTYLE_IMAGE, CANADA_LIFESTYLE_ALT } from '@/lib/canada-campaign-seo';
import { buyerFunnelLanguages } from '@/lib/international-buyer-markets';

const path = '/international-buyers/canada';
const source = 'canada_buyer_funnel';
const title = 'Buying a California Home from Canada | Crown Coastal Homes';
const description = 'Plan a California home purchase from Canada. Compare locations, prepare your CAD-to-USD budget and discuss video tours and ownership plans with Reza.';
const exchangeRatesUrl = 'https://www.bankofcanada.ca/rates/exchange/daily-exchange-rates/';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path, languages: buyerFunnelLanguages() },
  openGraph: {
    title, description, url: path, locale: 'en_CA', type: 'website',
    images: [{ url: absoluteUrl(CANADA_LIFESTYLE_IMAGE), width: 1024, height: 1024, alt: CANADA_LIFESTYLE_ALT }],
  },
  twitter: {
    card: 'summary_large_image', title, description,
    images: [absoluteUrl(CANADA_LIFESTYLE_IMAGE)],
  },
};

const faqs: BuyerFaq[] = [
  {
    question: 'How should I compare a California asking price with my Canadian budget?',
    answer: 'Keep your property shortlist in US dollars and a separate estimate of the Canadian funds required. Include closing costs and money-transfer charges, then update the estimate when you receive an actual currency quote. Bank of Canada rates are indicative reference rates; ask your provider what rate and fees would apply to your transfer.',
    source: { label: 'Bank of Canada: daily exchange rates', href: exchangeRatesUrl },
  },
  {
    question: 'Can we arrange a call in my Canadian time zone?',
    answer: 'Yes. Include your city or named time zone and a few suitable windows in your enquiry. A Vancouver schedule may be different from one in Calgary, Toronto or Halifax. Confirm the date and both local times when arranging a conversation, especially if you will be travelling. Your enquiry requests a follow-up; it does not book a call.',
  },
  {
    question: 'What should I consider if the home will be empty between visits?',
    answer: 'Discuss your expected pattern of use with the insurer and ask what conditions apply while you are away. Plan who can check the home, respond to a leak, admit a repair professional and handle routine maintenance. For a condo, establish what the association takes care of and what remains your responsibility before comparing it with a house.',
  },
  {
    question: 'Should I ask about Canadian reporting before choosing a property?',
    answer: 'Raise the intended use with an adviser familiar with Canadian and US tax matters before deciding how to buy. CRA guidance on Form T1135 distinguishes personal-use property from other foreign property and includes examples involving rentals. The answer depends on the facts; this guide does not determine your reporting obligations or tax treatment.',
    source: { label: 'Canada Revenue Agency: Form T1135 questions and answers', href: 'https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/information-been-moved/foreign-reporting/questions-answers-about-form-t1135.html' },
  },
  {
    question: 'How can I make an initial shortlist while I am still in Canada?',
    answer: 'Send a few listings along with the features you want to compare: layout, outdoor space, parking, maintenance and access to your regular destinations. Reza can discuss your search area and requests for video tours. Before a viewing trip, clarify representation, confirm property access and leave time to inspect the surrounding streets yourself.',
  },
  {
    question: 'Do I need to understand the whole California buying process before contacting Reza?',
    answer: 'No. Start with a region, an approximate budget and the stage you have reached. Use the buyer’s guide to get familiar with representation, offers, inspections and escrow. Your first conversation can identify the decisions to make next and the questions to take to your lender, escrow provider or other advisers.',
    source: { label: 'California buyer’s guide', href: '/buyers-guide' },
  },
];

const regions = [
  { name: 'Los Angeles', href: '/international-buyers/canada/los-angeles', text: 'Explore the city of Los Angeles, check the address and compare the places you will travel between.' },
  { name: 'Orange County', href: '/international-buyers/canada/orange-county', text: 'Compare current homes around Newport Beach, Laguna Beach and Irvine, including the space and upkeep each would require.' },
  { name: 'San Francisco & the Bay Area', href: '/international-buyers/canada/san-francisco', text: 'Browse San Francisco first, then name any other Bay Area communities you want to investigate with local support.' },
];

export default function CanadaBuyerPage() {
  return <>
    <FunnelSchema market="canada" path={path} title={title} description={description} faqs={faqs} />
    <section className="uk-hero uk-shell" aria-labelledby="canada-hero-title">
      <div className="uk-hero-copy">
        <p className="uk-eyebrow">Canadian buyers · California homes</p>
        <h1 id="canada-hero-title">Make room<br />for California.<br /><em>Plan it from Canada.</em></h1>
        <p className="uk-body">A home for the way you want to spend your time. Bring your California ideas into focus with a search that accounts for your budget, your schedule and the practical side of owning a home across the border.</p>
        <div className="uk-hero-actions" id="funnel-intro-actions">
          <FunnelCta source={source}>Discuss your California plans</FunnelCta>
          <a href="#choose-your-area" className="uk-text-link">Find a place to start <ArrowRight size={17} aria-hidden="true" /></a>
        </div>
        <p className="uk-hero-note"><Check size={15} aria-hidden="true" />Your priorities first. A useful conversation next.</p>
      </div>
      <div className="canada-guide-collage"><CaliforniaLifestyleCollage /></div>
    </section>

    <div className="uk-strip uk-shell" aria-label="Planning your purchase from Canada">
      <div><CircleDollarSign size={23} aria-hidden="true" />CAD-to-USD budget planning</div>
      <div><Clock3 size={23} aria-hidden="true" />Your Canadian time zone</div>
      <div><MapPin size={23} aria-hidden="true" />A contact based in San Diego</div>
    </div>

    <section className="uk-section uk-shell" id="choose-your-area" aria-labelledby="canada-locations-title">
      <div className="uk-section-heading">
        <div><p className="uk-eyebrow">Turn a broad idea into a search</p><h2 id="canada-locations-title">Where would<br />your days unfold?</h2></div>
        <p className="uk-body">Think about an ordinary week, the people you will visit and the trips you will make. Compare places against that picture before choosing a property type.</p>
      </div>
      <div className="uk-region-grid">
        <Link href="/international-buyers/canada/san-diego" className="uk-region-feature">
          <div className="uk-region-photo"><Image src="/city/san-diego-county/san-diego-ca.webp" alt="San Diego waterfront and downtown skyline" fill sizes="(max-width: 767px) calc(100vw - 40px), 55vw" /></div>
          <div className="uk-region-feature-content">
            <p className="uk-eyebrow">Explore Reza’s home region</p><h3>San Diego, address by address</h3>
            <p>Look closely at La Jolla, Del Mar and Coronado. Compare everyday access, the documents to request and how each home would be cared for between visits.</p>
            <span className="uk-text-link">Read the San Diego guide for Canadian buyers <ArrowRight size={17} aria-hidden="true" /></span>
          </div>
        </Link>
        <div className="uk-region-options">
          {regions.map((region, index) => <Link key={region.name} href={region.href} className="uk-region-option">
            <span className="uk-region-number">0{index + 2}</span><div><h3>{region.name}</h3><p>{region.text}</p></div><ArrowUpRight size={19} aria-hidden="true" />
          </Link>)}
          <p>These guides help you compare local buyer questions and current homes. For locations outside San Diego, discuss the local support available with Reza before planning viewings.</p>
        </div>
      </div>
    </section>

    <section className="uk-section uk-shell" aria-labelledby="canada-consultations-title"><div className="uk-section-heading"><div><p className="uk-eyebrow">Ready to focus your search?</p><h2 id="canada-consultations-title">Plan a Southern California purchase.</h2></div><p className="uk-body">Choose an area for a focused conversation about your budget, timing and viewings. Or <Link href="/international-buyers/canada/california-homes" className="uk-text-link">start with a California-wide enquiry</Link>.</p></div><div className="canada-consult-grid">{(Object.keys(CANADA_CONSULT_REGIONS) as CanadaConsultRegion[]).map(region => <article className="canada-consult-card" key={region}><h3><Link href={`/international-buyers/canada/${region}-consult`}>{CANADA_CONSULT_REGIONS[region].label}</Link></h3><p>{CANADA_CONSULT_REGIONS[region].lead}</p><Link className="uk-text-link" href={`/international-buyers/canada/${region}-consult`}>Plan your purchase <ArrowRight size={17} aria-hidden="true" /></Link></article>)}</div></section>

    <section className="uk-process uk-section" aria-labelledby="canada-process-title">
      <div className="uk-shell">
        <p className="uk-eyebrow">Give each decision its own space</p><h2 id="canada-process-title">A shortlist you can<br />actually compare.</h2>
        <div className="uk-steps">
          {[
            ['Set the buying brief', 'Write down your preferred areas, budget in US dollars and likely pattern of use. Share the trade-offs you are willing to make, along with the ones you are not.'],
            ['Investigate a few homes', 'Review listings against the same questions. Request video tours and documents, identify what needs an in-person visit and discuss representation before arranging private viewings.'],
            ['Connect the practical pieces', 'Coordinate the property investigation with financing, if needed, currency transfers and escrow deadlines. Ask each professional what they need from you while you are in Canada.'],
          ].map(([heading, text], index) => <div className="uk-step" key={heading}><span className="uk-step-number">0{index + 1}</span><h3>{heading}</h3><p>{text}</p></div>)}
        </div>
        <Link href="/buyers-guide" className="uk-text-link">Follow the California buying process <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
    </section>

    <section className="uk-section uk-shell uk-preparation" aria-labelledby="canada-preparation-title">
      <div><p className="uk-eyebrow">Plan beyond the purchase price</p><h2 id="canada-preparation-title">Two currencies.<br />One considered plan.</h2><p className="uk-body">The right home should fit the time and resources you want to give it. Start a short ownership checklist alongside your saved listings.</p></div>
      <ul className="uk-preparation-list">
        <li><h3>A budget in both currencies</h3><p>Keep the USD purchase budget separate from your CAD funding estimate. Ask your bank or transfer provider about the total conversion cost and timing; revisit the estimate as your search develops.</p><a className="uk-source" href={exchangeRatesUrl}>Bank of Canada: reference exchange rates ↗</a></li>
        <li><h3>A plan for the weeks you are away</h3><p>List maintenance tasks, emergency contacts and access arrangements. Discuss the expected occupancy with your insurer and review any association rules that affect your plans for the home.</p></li>
        <li><h3>Travel plans that stand on their own</h3><p>Check current entry requirements and travel-health arrangements before booking a trip or planning an extended stay. Confirm the requirements for your circumstances separately from the property transaction.</p><a className="uk-source" href="https://travel.gc.ca/destinations/united-states">Government of Canada: United States travel advice ↗</a></li>
      </ul>
    </section>
    <BuyerLocationDirectory market="canada" />
    <BuyerEnquirySection market="canada" source={source} defaultRegion="Still comparing" />
    <BuyerFaqs market="canada" faqs={faqs} />
    <MobileFunnelCta source={source} label="Discuss your California plans" ariaLabel="Plan your California purchase from Canada" />
  </>;
}
