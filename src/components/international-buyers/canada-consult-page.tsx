import Image from "next/image"
import Link from "next/link"
import CaliforniaLifestyleCollage from "@/components/international-buyers/california-lifestyle-collage"
import CanadaCampaignSchema from "@/components/international-buyers/canada-campaign-schema"
import { canadaCampaignMetadata, canadaConsultFaqs, CANADA_REGIONAL_PLANNING } from "@/lib/canada-campaign-seo"
import CanadaConsultForm from "@/components/international-buyers/canada-consult-form"
import { FunnelCta, MobileFunnelCta } from "@/components/international-buyers/funnel-actions"
import { CONTACT } from "@/lib/constants/contact"
import { CANADA_CONSULT_REGIONS, type CanadaConsultRegion } from "@/lib/canada-consult-regions"
import { CANADA_LANDER_CTA, CANADA_LANDER_PROOF, CANADA_SERVICE_PATH } from '@/lib/canada-lander-content'
import "@/app/international-buyers/canada/california-homes/campaign.css"
import "@/app/international-buyers/canada/san-diego-consult/consult.css"

export const canadaConsultMetadata = canadaCampaignMetadata

export default function CanadaConsultPage({ region }: { region: CanadaConsultRegion }) {
  const config = CANADA_CONSULT_REGIONS[region]
  const source = config.source
  const planning = CANADA_REGIONAL_PLANNING[region]
  const faqs = canadaConsultFaqs(region)
  return <div className="canada-campaign canada-sd-consult" lang="en-CA">
    <CanadaCampaignSchema region={region} />
    <div className="campaign-shell campaign-hero">
      <div className="campaign-intro">
        <p className="uk-funnel-eyebrow">FROM CANADA TO {config.label.toUpperCase()}</p>
        <h1>Buying a home in {config.label} from Canada?</h1>
        <p className="consult-proof">{CANADA_LANDER_PROOF}</p>
        <p className="campaign-lead">{config.lead}</p>
        <div id="funnel-intro-actions"><FunnelCta source={source}>{CANADA_LANDER_CTA}</FunnelCta><p className="consult-cta-note">20 minutes, time agreed by email</p></div>
        <CaliforniaLifestyleCollage prioritiseHero />
        <ul className="campaign-benefits"><li>Compare areas that fit your plans</li><li>Discuss budget and viewing options</li><li>Start from Canada, in your time zone</li></ul>
        <div className="campaign-agent"><Image src="/reza-photo.jpg" alt={CONTACT.agent.name} width={64} height={64} /><div><strong><Link href="/team/reza-barghlameno">{CONTACT.agent.name}</Link></strong><span>California real estate agent · Based in San Diego</span><span>Crown Coastal Homes · eXp of California</span><span>DRE #{CONTACT.agent.dre}</span></div></div>
      </div>
      <div className="campaign-form"><CanadaConsultForm region={region} /></div>
    </div>
    <section className="campaign-shell consult-service" aria-labelledby="service-route"><h2 id="service-route">Start your file with Reza.</h2><p>{CANADA_SERVICE_PATH}</p><FunnelCta source={source}>{CANADA_LANDER_CTA}</FunnelCta></section>
    <section className="campaign-shell consult-fit" aria-labelledby="consult-fit"><p className="uk-funnel-eyebrow">WHAT YOUR FIRST CALL COVERS</p><h2 id="consult-fit">Know what to explore before you travel.</h2><div className="campaign-steps">
      <article><h3>Your starting area</h3><p>Compare neighbourhoods around how you will use the home, your everyday routes and the setting you want.</p></article>
      <article><h3>Your viewing plan</h3><p>Discuss video tours and the arrangements needed for an in-person trip. Confirm local access before booking travel.</p></article>
      <article><h3>Your next steps</h3><p>Talk through timing, representation and the questions to raise with your lender or cross-border advisers.</p></article>
    </div></section>
    <section className="campaign-process"><div className="campaign-shell"><p className="uk-funnel-eyebrow">BEFORE THE VIEWING TRIP</p><h2>A clear plan for your first conversation.</h2><div className="campaign-steps">
      <article><span>01</span><h3>Share your brief</h3><p>Tell Reza your preferred area, USD budget, timing and how you plan to use the home.</p></article>
      <article><span>02</span><h3>Agree a time to talk</h3><p>Reza reviews the enquiry and replies to arrange a 20-minute conversation in your time zone. Discuss fit, representation and compensation.</p></article>
      <article><span>03</span><h3>Plan the next steps</h3><p>Discuss a focused property search and video or in-person viewings. Access and appointments are confirmed separately.</p></article>
    </div></div></section>
    <section className="campaign-shell consult-areas" aria-labelledby="consult-areas"><p className="uk-funnel-eyebrow">AREAS TO COMPARE</p><h2 id="consult-areas">Find the area that fits your life.</h2><p className="consult-section-intro">{config.areaIntro}</p><div className="consult-area-grid">{config.areaDescriptions.map((text, index) => <article key={config.areas[index]}><h3>{config.areas[index]}</h3><p>{text}</p></article>)}</div></section>
    <section className="campaign-shell consult-planning" aria-labelledby="regional-planning"><p className="uk-funnel-eyebrow">YOUR {config.label.toUpperCase()} SEARCH FROM CANADA</p><h2 id="regional-planning">{planning.question}</h2><p>{planning.answer}</p><ul>{planning.checklist.map(item => <li key={item}>{item}</li>)}</ul><div className="consult-resource-links"><Link href={`/international-buyers/canada/${region}`}>Read the {config.label} buyer guide</Link><Link href={planning.listingPath}>Browse current {config.label} homes</Link></div></section>
    <section className="campaign-shell campaign-faq" aria-labelledby="consult-questions"><h2 id="consult-questions">Questions before you start</h2>
      {faqs.map(faq => <article className="consult-faq-answer" key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p>{faq.source && <a className="consult-source" href={faq.source.href}>{faq.source.label} ↗</a>}</article>)}
      <div className="campaign-final"><h3>Make your next step a conversation.</h3><p>Share your buying plans and request a 20-minute call with Reza.</p><FunnelCta source={source}>{CANADA_LANDER_CTA}</FunnelCta><p>Prefer email? <a href={CONTACT.email.href}>{CONTACT.email.display}</a></p></div>
    </section>
    <section className="campaign-shell campaign-related" aria-labelledby="consult-more"><h2 id="consult-more">Explore other Southern California destinations</h2><nav aria-label="Other Southern California destinations" className="consult-destinations">{(Object.keys(CANADA_CONSULT_REGIONS) as CanadaConsultRegion[]).filter(destination => destination !== region).map(destination => <Link key={destination} href={`/international-buyers/canada/${destination}-consult`}>{CANADA_CONSULT_REGIONS[destination].label}</Link>)}</nav><Link href="/international-buyers/canada" className="campaign-guide-link">Read the Canada buyer guide</Link></section>
    <MobileFunnelCta source={source} label={CANADA_LANDER_CTA} afterScroll ariaLabel={`Plan a ${config.label} purchase with Reza`} />
  </div>
}
