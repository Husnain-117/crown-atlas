import Image from 'next/image';
import { getLandingHeroImage } from '@/lib/landing/image';

interface Props { city: string; kind: string; image?: string }

function kindToHeading(kind: string, city: string) {
  const pretty = kind.replace(/-/g, ' ')
  // Capitalize each word
  const cap = pretty.replace(/\b\w/g, c => c.toUpperCase())
  return `${cap} in ${city}`
}

export default async function Hero({ city, kind, image }: Props) {
  const title = kindToHeading(kind, city)
  // If no image prop provided, attempt dynamic fetch / cache lookup.
  let heroImage = image
  if (!heroImage) {
    try {
      heroImage = await getLandingHeroImage(city, kind)
      if (process.env.LANDING_TRACE) console.log('[landing.hero.component] fetched image', { city, kind, has: !!heroImage })
    } catch {
      // swallow errors; fallback to blank
      if (process.env.LANDING_TRACE) console.warn('[landing.hero.component] fetch exception', { city, kind })
    }
  }
  return (
    <section className="relative flex h-[44vh] min-h-[320px] max-h-[480px] w-full items-end overflow-hidden bg-slate-900 sm:h-[52vh] sm:min-h-[360px] sm:max-h-[560px]">
      {heroImage && (
        <Image
          src={heroImage}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
      <div className="relative z-10 mx-auto w-full max-w-screen-xl px-4 pb-8 text-white sm:px-6 md:pb-10 lg:px-8">
        <h1 className="max-w-4xl text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
          Review current listings, market snapshots, and neighborhood information for {city}. Verify material property details with the listing broker and relevant professionals.
        </p>
      </div>
    </section>
  );
}
