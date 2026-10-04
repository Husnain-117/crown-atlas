import Image from 'next/image';
import Link from 'next/link';
import CanadaConsultForm from '@/components/international-buyers/canada-consult-form';
import { FunnelCta, MobileFunnelCta } from '@/components/international-buyers/funnel-actions';
import { CONTACT } from '@/lib/constants/contact';
import CaliforniaLifestyleCollage from '@/components/international-buyers/california-lifestyle-collage';
import CanadaCampaignSchema from '@/components/international-buyers/canada-campaign-schema';
import { canadaCampaignMetadata, CANADA_GENERAL_FAQS } from '@/lib/canada-campaign-seo';
import { CANADA_CONSULT_REGIONS, type CanadaConsultRegion } from '@/lib/canada-consult-regions';
import { CANADA_LANDER_CTA, CANADA_LANDER_PROOF, CANADA_SERVICE_PATH } from '@/lib/canada-lander-content';
import './campaign.css';
import '../san-diego-consult/consult.css';

const source = 'canada_california_hub';
export const metadata = canadaCampaignMetadata();

export default function CanadaCampaignPage() {
  return <div className="canada-campaign canada-sd-consult" lang="en-CA">
    <CanadaCampaignSchema />
    <div className="campaign-shell campaign-hero">
      <div className="campaign-intro">
        <p className="uk-funnel-eyebrow">FROM CANADA TO CALIFORNIA</p>
        <h1>Buying a home in California from Canada?</h1>
        <p className="consult-proof">{CANADA_LANDER_PROOF}</p>
        <p className="campaign-lead">Start with a conversation about the right area, your budget and how to plan your search from home.</p>
        <div id="funnel-intro-actions"><FunnelCta source={source}>{CANADA_LANDER_CTA}</FunnelCta><p className="consult-cta-note">20 minutes, time agreed by email</p></div>
        <CaliforniaLifestyleCollage prioritiseHero />
        <ul className="campaign-benefits">
          <li>Compare locations around your plans for the home</li>
          <li>Discuss video tours before arranging a viewing trip</li>
          <li>Coordinate a conversation in your Canadian time zone</li>
        </ul>
        <div className="campaign-agent">
          <Image src="/reza-photo.jpg" alt="Reza Barghlameno" width={64} height={64} />
          <div><strong><Link href="/team/reza-barghlameno">{CONTACT.agent.name}</Link></strong><span>California real estate agent · Based in San Diego</span><span>eXp of California · DRE #{CONTACT.agent.dre}</span></div>
        </div>
      </div>
      <div className="campaign-form">
        <CanadaConsultForm />
      </div>
    </div>
    <section className="campaign-shell consult-service" aria-labelledby="service-route"><h2 id="service-route">Start your file with Reza.</h2><p>{CANADA_SERVICE_PATH}</p><FunnelCta source={source}>{CANADA_LANDER_CTA}</FunnelCta></section>
    <section className="campaign-shell campaign-destinations" aria-labelledby="campaign-areas">
      <p className="uk-funnel-eyebrow">FIND YOUR STARTING POINT</p><h2 id="campaign-areas">Which California fits your plans?</h2>
      <p>Compare San Diego, Los Angeles, Orange County and Santa Barbara, then request a 20-minute conversation with Reza about your priorities, USD budget and travel plans.</p>
      <div className="campaign-region-cards">{(Object.keys(CANADA_CONSULT_REGIONS) as CanadaConsultRegion[]).map(region => <article key={region}><h3><Link href={`/international-buyers/canada/${region}-consult`}>{CANADA_CONSULT_REGIONS[region].label}</Link></h3><p>{CANADA_CONSULT_REGIONS[region].lead}</p><Link href={`/international-buyers/canada/${region}-consult`}>Plan your {CANADA_CONSULT_REGIONS[region].label} search →</Link></article>)}</div>
    </section>
    <section className="campaign-process"><div className="campaign-shell">
      <p className="uk-funnel-eyebrow">A CLEAR NEXT STEP</p><h2>Plan the search before the trip.</h2>
      <div className="campaign-steps">
        <article><span>01</span><h3>Share your brief</h3><p>Tell us your preferred area, buying timeline and how you plan to use the home. Add a budget in US dollars if you have one.</p></article>
        <article><span>02</span><h3>Discuss the options</h3><p>Agree a time to talk. Compare locations and discuss representation, compensation and the support needed for your search.</p></article>
        <article><span>03</span><h3>Prepare your viewings</h3><p>Discuss a shortlist and requests for video or in-person tours. Property access and appointments must be confirmed.</p></article>
      </div>
    </div></section>
    <section className="campaign-shell campaign-faq" aria-labelledby="campaign-questions">
      <h2 id="campaign-questions">Before you enquire</h2>
      {CANADA_GENERAL_FAQS.map(faq => <article className="consult-faq-answer" key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p>{faq.question === 'Who receives my enquiry?' && <p>Read our <Link href="/privacy">privacy policy</Link>.</p>}</article>)}
      <p><Link href="/international-buyers/canada">Read the full Canada buyer guide</Link> for currency planning, caring for a home between visits and questions to discuss with your cross-border advisers.</p>
      <div className="campaign-final"><FunnelCta source={source}>{CANADA_LANDER_CTA}</FunnelCta><p>Prefer email? <a href={CONTACT.email.href}>{CONTACT.email.display}</a></p></div>
    </section>
    <MobileFunnelCta source={source} label={CANADA_LANDER_CTA} afterScroll />
  </div>;
}
