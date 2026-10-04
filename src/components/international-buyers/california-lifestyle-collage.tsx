import './california-lifestyle-collage.css';
import Image from 'next/image';
import { CANADA_LIFESTYLE_ALT, CANADA_LIFESTYLE_IMAGE } from '@/lib/canada-campaign-seo';

export default function CaliforniaLifestyleCollage({ prioritiseHero = false }: { prioritiseHero?: boolean }) {
  return <figure className="california-lifestyle-collage">
    {prioritiseHero && <>
      <link rel="preload" as="image" href="/images/canada/clients-kaushal-mobile.webp" media="(max-width: 760px)" fetchPriority="high" />
      <link rel="preload" as="image" href={CANADA_LIFESTYLE_IMAGE} media="(min-width: 761px)" fetchPriority="high" />
    </>}
    <div className="california-lifestyle-grid">
      <picture className="california-lifestyle-main">
        <source media="(max-width: 760px)" srcSet="/images/canada/clients-kaushal-mobile.webp" type="image/webp" />
        <Image src={CANADA_LIFESTYLE_IMAGE} alt={CANADA_LIFESTYLE_ALT} width={1024} height={1024} unoptimized loading="eager" fetchPriority={prioritiseHero ? 'high' : undefined} />
      </picture>
      <picture className="california-lifestyle-coast">
        <source media="(max-width: 760px)" srcSet="/images/canada/laguna-beach-coast-mobile.webp" type="image/webp" />
        <Image src="/images/canada/laguna-beach-coast.webp" alt="Palm trees overlooking the Pacific Ocean in Laguna Beach, California" width={600} height={900} unoptimized loading="eager" />
      </picture>
      <picture>
        <source media="(max-width: 760px)" srcSet="/images/canada/clients-jacobo-mobile.webp" type="image/webp" />
        <Image src="/images/canada/clients-jacobo.webp" alt="Mario and Sylvia Jacobo smiling in a garden with a sold sign" width={600} height={1066} unoptimized loading="eager" />
      </picture>
    </div>
    <figcaption>Real client moments · California coast</figcaption>
  </figure>;
}
