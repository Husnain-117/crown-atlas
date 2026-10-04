import type { ReactNode } from 'react';
import '../uk/funnel.css';

export default function GermanyBuyerLayout({ children }: { children: ReactNode }) {
  return <div className="uk-funnel" lang="de-DE">{children}</div>;
}
