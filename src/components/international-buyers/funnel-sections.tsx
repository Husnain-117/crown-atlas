import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Mail } from 'lucide-react';
import { CONTACT } from '@/lib/constants/contact';
import { SITE_URL, absoluteUrl } from '@/lib/constants/site';
import { SITE_SCHEMA_IDS } from '@/lib/seo/site-schema';
import { BUYER_MARKETS } from '@/lib/international-buyer-markets';
import type { BuyerMarket } from '@/lib/uk-buyer-inquiry';
import BuyerEnquiryForm from './buyer-enquiry-form';

export type BuyerFaq = { question: string; answer: string; source?: { label: string; href: string } };

export function FunnelSchema({ path, title, description, faqs, market = 'uk', locationName }: {
  path: string; title: string; description: string; faqs: BuyerFaq[]; market?: BuyerMarket; locationName?: string;
}) {
  const url = absoluteUrl(path);
  const country = BUYER_MARKETS[market];
  const breadcrumbs = [
    { '@type': 'ListItem', position: 1, name: market === 'germany' ? 'Startseite' : 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: country.label, item: absoluteUrl(country.path) },
    ...(locationName || path.endsWith('/san-diego') ? [{ '@type': 'ListItem', position: 3, name: locationName || 'San Diego', item: url }] : []),
  ];
  const graph = {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description,
        inLanguage: country.language, isPartOf: { '@id': SITE_SCHEMA_IDS.website },
        publisher: { '@id': SITE_SCHEMA_IDS.organization }, about: { '@id': SITE_SCHEMA_IDS.agent } },
      { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumbs`, itemListElement: breadcrumbs },
      { '@type': 'FAQPage', '@id': `${url}#questions`, inLanguage: country.language,
        mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, '\\u003c') }} />;
}

export function BuyerFaqs({ faqs, market = 'uk', regional = false }: { faqs: BuyerFaq[]; market?: BuyerMarket; regional?: boolean | string }) {
  const german = market === 'germany';
  const origin = market === 'canada' ? 'Canada' : 'England';
  const suffix = typeof regional === 'string' ? `/${regional}` : regional ? '/san-diego' : '';
  return <><section className="uk-section uk-shell uk-faq-section" aria-labelledby="uk-questions">
    <div><p className="uk-eyebrow">{german ? 'Gut vorbereitet starten' : 'Before you begin'}</p><h2 id="uk-questions">{german ? <>Ihre Fragen.<br />Ein klarer Anfang.</> : <>A few good<br />questions.</>}</h2><p className="uk-body">{german ? 'Praktische Antworten für Ihren Immobilienkauf in Kalifornien aus Deutschland.' : `Practical answers for planning your California purchase from ${origin}.`}</p><Link href="/buyers-guide" hrefLang="en" className="uk-text-link">{german ? 'Kaufratgeber lesen (Englisch)' : 'Read the full buyer’s guide'} <ArrowRight size={17} aria-hidden="true" /></Link></div>
    <div className="uk-faq-list">{faqs.map(faq => <details key={faq.question}>
      <summary>{faq.question}<span aria-hidden="true">+</span></summary>
      <div><p>{faq.answer}</p>{faq.source ? <a href={faq.source.href} className="uk-source">{faq.source.label} ↗</a> : null}</div>
    </details>)}</div>
  </section><nav className="uk-shell uk-market-links" aria-label={german ? 'Informationen nach Herkunftsland' : 'Buyer guides by country'}><p>{german ? 'Sie planen Ihren Kauf von einem anderen Land aus?' : 'Planning your purchase from another country?'}</p><div>{Object.entries(BUYER_MARKETS).map(([key, country]) => <Link key={key} href={country.path + suffix} hrefLang={country.language} lang={country.language} className="uk-text-link" aria-current={key === market ? 'page' : undefined} data-active={key === market ? 'true' : undefined}>{country.switchLabel}</Link>)}</div></nav></>;
}

export function BuyerEnquirySection({ source, defaultRegion, defaultLocation, market = 'uk' }: { source: string; defaultRegion?: string; defaultLocation?: string; market?: BuyerMarket }) {
  const german = market === 'germany';
  const origin = market === 'canada' ? 'Canada' : 'England';
  const checklist = german ? ['Ein fester Ansprechpartner in San Diego', 'Per E-Mail starten oder ein Videogespräch anfragen', 'Vertretung und Vergütung vor einer Bindung besprechen'] : ['A named contact based in San Diego', 'Email first, or request a video conversation', 'Discuss representation and fees before committing'];
  return <section className="uk-enquiry-section" aria-label={german ? 'Mit Reza den Hauskauf aus Deutschland planen' : `Speak with Reza about buying from ${origin}`}>
    <div className="uk-shell uk-enquiry-grid">
      <div className="uk-enquiry-intro">
        <p className="uk-eyebrow">{german ? 'Von Deutschland nach Kalifornien' : `${origin} to California, with a plan`}</p>
        <h2>{german ? <>Ihr nächster Schritt.<br />Gemeinsam geplant.</> : <>Let’s make your<br />next move clearer.</>}</h2>
        <p className="uk-body">{german ? 'Teilen Sie Reza mit, wo Sie suchen und was Ihnen wichtig ist. Ihre Anfrage ist der Anfang eines Gesprächs über passende Orte, Ihre Vorstellungen und die nächsten Schritte.' : 'Tell Reza where you are looking and what matters to you. Your enquiry starts a conversation about your search, the area and the next practical step.'}</p>
        <div className="uk-agent">
          <Image src="/reza-photo.jpg" alt={CONTACT.agent.name} width={88} height={88} sizes="88px" />
          <div><h3>{CONTACT.agent.name}</h3><p>{german ? 'Immobilienmakler in Kalifornien' : 'California real estate agent'}</p><p>eXp of California · DRE #{CONTACT.agent.dre}</p></div>
        </div>
        <ul className="uk-checklist">{checklist.map(item => <li key={item}><Check size={17} aria-hidden="true" />{item}</li>)}</ul>
        <Link href="/team/reza-barghlameno" className="uk-text-link">{german ? 'Reza kennenlernen (Englisch)' : 'Meet Reza'} <ArrowRight size={16} aria-hidden="true" /></Link>
        <a href={CONTACT.email.href} className="uk-direct-email"><Mail size={17} aria-hidden="true" />{CONTACT.email.display}</a>
      </div>
      <BuyerEnquiryForm key={source} source={source} defaultRegion={defaultRegion} defaultLocation={defaultLocation} market={market} />
    </div>
  </section>;
}
