import type { ReactNode } from 'react';
import '../uk/funnel.css';

export default function CanadaBuyerLayout({ children }: { children: ReactNode }) {
  return <div className="uk-funnel" lang="en-CA">{children}</div>;
}
