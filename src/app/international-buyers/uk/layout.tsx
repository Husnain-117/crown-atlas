import type { ReactNode } from 'react';
import './funnel.css';

export default function UkBuyerLayout({ children }: { children: ReactNode }) {
  return <div className="uk-funnel" lang="en-GB">{children}</div>;
}
