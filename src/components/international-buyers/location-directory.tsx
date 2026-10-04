import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BUYER_LOCATIONS } from '@/lib/international-buyer-locations';
import { BUYER_MARKETS } from '@/lib/international-buyer-markets';
import type { BuyerMarket } from '@/lib/uk-buyer-inquiry';

export function BuyerLocationDirectory({ market }: { market: BuyerMarket }) {
  const german = market === 'germany';
  const groups = [
    { title: 'Los Angeles', region: 'Los Angeles' },
    { title: 'Orange County', region: 'Orange County' },
    { title: 'San Francisco & Bay Area', region: 'San Francisco / Bay Area' },
    { title: german ? 'Weitere Küstenorte' : 'More coastal locations', region: 'Santa Barbara' },
  ];
  return <section className="uk-section uk-shell" aria-labelledby="buyer-locations-directory" id="agent-locations">
    <div className="uk-section-heading"><div><p className="uk-eyebrow">{german ? 'Maklersuche nach Standort' : 'Find a real estate agent by location'}</p><h2 id="buyer-locations-directory">{german ? <>Ihr Ort.<br />Ihr nächster Schritt.</> : <>Your location.<br />Your next step.</>}</h2></div><p className="uk-body">{german ? 'Vergleichen Sie örtliche Käuferfragen und Angebote. Wünschen Sie deutschsprachige Begleitung, können Sie das bei Ihrer Anfrage angeben.' : 'Explore local buyer questions and current homes, then discuss the support available for the location you have in mind.'}</p></div>
    <nav className="uk-location-directory" aria-label={german ? 'Standorte für Ihre Immobiliensuche' : 'Locations for your home search'}>
      {groups.map(group => <details key={group.region}><summary>{group.title}<span aria-hidden="true">+</span></summary><ul>
        {BUYER_LOCATIONS.filter(location => location.searchRegion === group.region).map(location => <li key={location.slug}><Link href={`${BUYER_MARKETS[market].path}/${location.slug}`} className="uk-text-link">{location.name}<ArrowRight size={15} aria-hidden="true" /></Link></li>)}
        {group.region === 'Santa Barbara' && <li><Link href={`${BUYER_MARKETS[market].path}/san-diego`} className="uk-text-link">San Diego<ArrowRight size={15} aria-hidden="true" /></Link></li>}
      </ul></details>)}
    </nav>
  </section>;
}
