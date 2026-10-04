import type { Metadata } from 'next';
import { BuyerLocationDirectory } from '@/components/international-buyers/location-directory';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, MapPin, MessageCircle, Video } from 'lucide-react';
import { BuyerEnquirySection, BuyerFaqs, FunnelSchema, type BuyerFaq } from '@/components/international-buyers/funnel-sections';
import { FunnelCta, MobileFunnelCta } from '@/components/international-buyers/funnel-actions';
import { absoluteUrl } from '@/lib/constants/site';
import { buyerFunnelLanguages } from '@/lib/international-buyer-markets';

const path = '/international-buyers/uk';
const source = 'uk_buyer_funnel';
const title = 'Buying a California Home from the UK | Crown Coastal Homes';
const description = 'Buying a home in California from England? Plan your search with Reza, compare locations, ask about video tours and prepare for the US buying process.';
export const metadata: Metadata = {
  title, description, alternates: { canonical: path, languages: buyerFunnelLanguages() },
  openGraph: { title, description, url: path, locale: 'en_GB', type: 'website',
    images: [{ url: absoluteUrl('/city/san-diego-county/la-jolla-ca.webp'), width: 1200, height: 800, alt: 'La Jolla coastline in San Diego, California' }] },
  twitter: { card: 'summary_large_image', title, description, images: [absoluteUrl('/city/san-diego-county/la-jolla-ca.webp')] },
};

const faqs: BuyerFaq[] = [
  { question: 'Can I start my California home search from England?', answer: 'Yes. Start with your preferred areas, intended use, budget in US dollars and timing. You can review listings from England and ask Reza about video tours before arranging a visit. Confirm property access and any agreements before planning viewings.' },
  { question: 'How do I choose a California buyer’s agent?', answer: 'Check the agent’s California licence and discuss their experience in the exact area you are considering. Ask who will represent you, which services are included, how you will communicate from the UK, and what the written representation agreement says about fees and duration.', source: { label: 'California DRE: check a real estate licence', href: 'https://www.dre.ca.gov/Licensees/VerifyLicense.html' } },
  { question: 'What should I budget beyond the asking price?', answer: 'Ask for property-specific estimates of closing costs, insurance, property taxes, HOA charges if applicable, maintenance and any repairs. If your funds are in pounds, include currency conversion and transfer costs in your planning. Financing terms depend on your lender and circumstances.', source: { label: 'California DRE: homebuyer resources', href: 'https://www.dre.ca.gov/Consumers/FirstHomeCalifornia.html' } },
  { question: 'Can we arrange a video tour or a call in UK time?', answer: 'You can request a video conversation here and select your time zone. For a specific home, use its Request a Tour option and choose Live video tour. Reza will confirm access and timing; submitting a request does not reserve an appointment.' },
  { question: 'How is buying in California different from buying in England?', answer: 'You will encounter buyer representation agreements, offers with contractual contingencies, escrow, title documents and specific deadlines. Start with our buyer’s guide, then ask your agent and the appropriate professionals to explain the documents for your transaction.', source: { label: 'Read the eight-step California buyer’s guide', href: '/buyers-guide' } },
  { question: 'Do I need to be in California to complete the purchase?', answer: 'Confirm the accepted signing, identification and notarisation arrangements with your escrow provider and, if applicable, your lender before setting a closing date. Requirements depend on the transaction. Plan independent inspections and the final walkthrough separately from your video tours.', source: { label: 'CFPB: prepare for closing', href: 'https://www.consumerfinance.gov/owning-a-home/close/' } },
];

export default function UkBuyerPage() {
  return <>
    <FunnelSchema path={path} title={title} description={description} faqs={faqs} />
    <section className="uk-hero uk-shell" aria-labelledby="uk-hero-title">
      <div className="uk-hero-copy">
        <p className="uk-eyebrow">For buyers in England · California real estate</p>
        <h1 id="uk-hero-title">A California home.<br /><em>A plan that starts<br />in England.</em></h1>
        <p className="uk-body">A coastal home, a new chapter, or simply a clearer idea of what’s possible. Start your California property search with a local contact and a plan you can follow from the UK.</p>
        <div className="uk-hero-actions" id="funnel-intro-actions"><FunnelCta source={source}>Plan your purchase with Reza</FunnelCta><a href="#choose-your-area" className="uk-text-link">Explore the locations <ArrowRight size={17} aria-hidden="true" /></a></div>
        <p className="uk-hero-note"><Check size={15} aria-hidden="true" />A short enquiry. A personal next step.</p>
      </div>
      <figure className="uk-hero-image"><Image src="/city/san-diego-county/la-jolla-ca.webp" alt="Coastal homes above the Pacific at La Jolla, San Diego" fill priority sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) 45vw, 535px" /><figcaption><div><strong>Room for a different everyday.</strong>La Jolla, San Diego</div><MapPin size={22} aria-hidden="true" /></figcaption></figure>
    </section>
    <div className="uk-strip uk-shell" aria-label="Your buying support"><div><MessageCircle size={23} aria-hidden="true" />A named local contact</div><div><Video size={23} aria-hidden="true" />Video tour requests</div><div><MapPin size={23} aria-hidden="true" />Location-led property search</div></div>

    <section className="uk-section uk-shell" id="choose-your-area" aria-labelledby="uk-locations-title">
      <div className="uk-section-heading"><div><p className="uk-eyebrow">First, find your California</p><h2 id="uk-locations-title">Start with a place.<br />Build around your life.</h2></div><p className="uk-body">Your daily routes, the kind of home you want and how you’ll use it are a better starting point than a photograph alone.</p></div>
      <div className="uk-region-grid">
        <Link href="/international-buyers/uk/san-diego" className="uk-region-feature"><div className="uk-region-photo"><Image src="/city/san-diego-county/san-diego-ca.webp" alt="San Diego skyline and waterfront" fill sizes="(max-width: 767px) calc(100vw - 40px), 55vw" /></div><div className="uk-region-feature-content"><p className="uk-eyebrow">A closer look · Reza’s home region</p><h3>San Diego &amp; the coast</h3><p>Get to know La Jolla, Del Mar and Coronado. Compare the practical details and plan your search from England.</p><span className="uk-text-link">Explore the San Diego buying guide <ArrowRight size={17} aria-hidden="true" /></span></div></Link>
        <div className="uk-region-options">
          {[
            { name: 'Los Angeles', href: '/international-buyers/uk/los-angeles', text: 'Explore the city of Los Angeles, check the address and distinguish city rules from the wider county.' },
            { name: 'Orange County', href: '/international-buyers/uk/orange-county', text: 'Explore current listings in Newport Beach, Laguna Beach, Irvine and the surrounding areas.' },
            { name: 'San Francisco & the Bay Area', href: '/international-buyers/uk/san-francisco', text: 'Start with San Francisco listings and tell Reza which other Bay Area locations you are considering.' },
          ].map((area, index) => <Link key={area.name} href={area.href} className="uk-region-option"><span className="uk-region-number">0{index + 2}</span><div><h3>{area.name}</h3><p>{area.text}</p></div><ArrowUpRight size={19} aria-hidden="true" /></Link>)}
          <p>These guides connect local buyer questions with property searches. For an area outside San Diego, ask Reza about the local support available before arranging viewings.</p>
        </div>
      </div>
    </section>

    <section className="uk-process uk-section" aria-labelledby="uk-process-title"><div className="uk-shell">
      <p className="uk-eyebrow">A clear way forward</p><h2 id="uk-process-title">From “where do I start?”<br />to a considered next move.</h2>
      <div className="uk-steps">{[
        ['Share your plans', 'Tell Reza where you are looking, your priorities and your timing. Start by email or request a video conversation in your time zone.'],
        ['Shape your shortlist', 'Compare areas and current homes. Discuss representation, request tours and use a shared list of questions to make each viewing useful.'],
        ['Prepare for the purchase', 'Work through offers, inspections and escrow with the appropriate professionals. Know your deadlines and confirm signing and funding arrangements early.'],
      ].map(([heading, text], index) => <div className="uk-step" key={heading}><span className="uk-step-number">0{index + 1}</span><h3>{heading}</h3><p>{text}</p></div>)}</div>
      <Link href="/buyers-guide" className="uk-text-link">Understand the California buying process <ArrowRight size={17} aria-hidden="true" /></Link>
    </div></section>

    <section className="uk-section uk-shell uk-preparation" aria-labelledby="uk-preparation-title"><div><p className="uk-eyebrow">A little preparation goes a long way</p><h2 id="uk-preparation-title">Bring your questions.<br />We’ll start there.</h2><p className="uk-body">You don’t need a finished plan to make contact. These three starting points help turn a broad search into a useful conversation.</p></div><ul className="uk-preparation-list"><li><h3>A budget in US dollars</h3><p>Consider the purchase price and ongoing costs. If your funds are in pounds, speak with your bank about currency conversion and transfers.</p><a className="uk-source" href="https://www.gov.uk/guidance/guidance-for-buying-property-abroad">GOV.UK: buying property abroad ↗</a></li><li><h3>A picture of everyday life</h3><p>A primary home or occasional stays? Space to work, access to the coast or a particular commute? Share the details that matter to you.</p></li><li><h3>A realistic time frame</h3><p>Tell Reza whether you are researching, planning a viewing trip or ready to shortlist. Include any dates you already need to work around.</p></li></ul></section>
    <BuyerLocationDirectory market="uk" />
    <BuyerEnquirySection source={source} defaultRegion="Still comparing" />
    <BuyerFaqs faqs={faqs} />
    <MobileFunnelCta source={source} />
  </>;
}
