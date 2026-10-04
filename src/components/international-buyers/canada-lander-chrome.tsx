import Image from 'next/image';
import Link from 'next/link';
import { FunnelCta } from './funnel-actions';
import { CANADA_LANDER_CTA, CANADA_LANDER_IDENTITY } from '@/lib/canada-lander-content';
import { CONTACT } from '@/lib/constants/contact';
import './canada-lander-chrome.css';

export function CanadaLanderHeader() {
  return <header className="canada-lander-header"><div className="canada-lander-chrome-inner">
    <Image src="/logo.png" alt="Crown Coastal Homes" width={180} height={48} unoptimized />
    <FunnelCta source="canada-lander">{CANADA_LANDER_CTA}</FunnelCta>
  </div></header>;
}

export function CanadaLanderFooter() {
  return <footer className="canada-lander-footer"><div className="canada-lander-chrome-inner">
    <p>{CANADA_LANDER_IDENTITY}</p>
    <p>Prefer email? <a href={CONTACT.email.href}>{CONTACT.email.display}</a></p>
    <nav aria-label="Legal links"><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link><Link href="/accessibility">Accessibility</Link><Link href="/fair-housing">Fair Housing</Link></nav>
    <p>© {new Date().getFullYear()} Crown Coastal Homes. All rights reserved.</p>
  </div></footer>;
}
