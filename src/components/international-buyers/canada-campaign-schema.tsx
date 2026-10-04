import { buildCanadaCampaignSchema } from '@/lib/canada-campaign-seo';
import type { CanadaConsultRegion } from '@/lib/canada-consult-regions';

export default function CanadaCampaignSchema({ region }: { region?: CanadaConsultRegion }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildCanadaCampaignSchema(region)).replace(/</g, '\\u003c') }} />;
}
