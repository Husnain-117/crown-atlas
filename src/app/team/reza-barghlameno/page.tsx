import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin, Award, Home } from 'lucide-react';
import { CONTACT } from '@/lib/constants/contact';
import { ClientTestimonialsBadge } from '@/components/client-testimonials-badge';
import WhatsAppButton from '@/components/whatsapp-button';
import { SITE_URL, absoluteUrl } from '@/lib/constants/site';
import { SITE_SCHEMA_IDS } from '@/lib/seo/site-schema';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${CONTACT.agent.name} | California Real Estate Agent`,
  description: `Meet ${CONTACT.agent.name}, a licensed California real estate agent (DRE #${CONTACT.agent.dre}) serving San Diego and coastal California.`,
  openGraph: {
    title: `${CONTACT.agent.name} - Real Estate Agent`,
    description: `${CONTACT.agent.title} serving San Diego and coastal California. CA DRE #${CONTACT.agent.dre}.`,
    url: "/team/reza-barghlameno",
    images: [{ url: absoluteUrl(CONTACT.agent.avatarUrl), alt: CONTACT.agent.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${CONTACT.agent.name} - Real Estate Agent | Crown Coastal Homes`,
    description: `${CONTACT.agent.title} serving San Diego and coastal California. CA DRE #${CONTACT.agent.dre}.`,
    images: [absoluteUrl(CONTACT.agent.avatarUrl)],
  },
  // Absolute canonical URL (relative canonicals require metadataBase to resolve correctly)
  alternates: {
    canonical: '/team/reza-barghlameno',
  },
};

export default function RezaBarghlamenoPage() {
  const agent = CONTACT.agent;
  const phone = CONTACT.phone;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* ProfilePage references the same Person and business IDs as the site-wide graph. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "@id": `${absoluteUrl("/team/reza-barghlameno")}#webpage`,
            url: absoluteUrl("/team/reza-barghlameno"),
            name: `${agent.name} — Real Estate Agent Profile`,
            isPartOf: { "@id": SITE_SCHEMA_IDS.website },
            publisher: { "@id": SITE_SCHEMA_IDS.organization },
            mainEntity: {
              "@type": "Person",
              "@id": SITE_SCHEMA_IDS.agent,
              name: agent.name,
              jobTitle: agent.title,
              worksFor: { "@id": SITE_SCHEMA_IDS.localBusiness },
              telephone: phone.href.replace(/^tel:/, ""),
              email: CONTACT.email.display,
              image: absoluteUrl(agent.avatarUrl),
              identifier: {
                "@type": "PropertyValue",
                name: "California DRE License",
                value: agent.dre
              },
              knowsAbout: [
                "Residential Real Estate",
                "Luxury Properties",
                "Coastal Properties",
                "San Diego Real Estate Market",
                "Home Buying",
                "Home Selling"
              ],
              sameAs: [
                "https://www.zillow.com/profile/RezaSoCal",
                "https://www.homes.com/real-estate-agents/reza-barghlameno/wkjt4yj/",
              ],
            },
          })
        }}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-muted)] pt-32 sm:pt-36 lg:pt-40 pb-12 md:pb-16 border-b border-[var(--coastal-border)]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Agent Photo */}
            <div className="relative">
              <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-strong">
                <Image
                  src={agent.avatarUrl}
                  alt={agent.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Agent Info */}
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--coastal-text)] mb-4 leading-tight">
                {agent.name}
              </h1>
              <p className="text-xl md:text-2xl text-[var(--coastal-primary)] font-semibold mb-4">
                {agent.title}
              </p>
              <p className="text-lg text-[var(--coastal-muted-text)] mb-6">
                CA DRE # {agent.dre}
              </p>
              <p className="text-lg text-[var(--coastal-muted-text)] mb-8 leading-relaxed">
                Serving San Diego and coastal California with personalized service, local market knowledge, and property-specific transaction guidance.
              </p>

              <div className="mb-6">
                <ClientTestimonialsBadge showModal />
              </div>

              {/* Contact Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a
                  href={CONTACT.email.href}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--coastal-primary)] px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:opacity-90 hover:shadow-lg justify-center"
                >
                  <Mail className="h-5 w-5" />
                  <span>Email Me</span>
                </a>
                <a
                  href={phone.href}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-[var(--coastal-border)] bg-[var(--surface)] px-6 py-3 font-semibold text-[var(--coastal-text)] transition-all duration-300 hover:bg-[var(--surface-muted)] justify-center"
                >
                  <Phone className="h-5 w-5" />
                  <span>{phone.display}</span>
                </a>
                <WhatsAppButton message="Hi Reza, I found your profile on Crown Coastal Homes. Can we chat?" variant="full" />
              </div>

              {/* License Info */}
              <div className="flex items-center gap-2 text-sm text-[var(--coastal-muted-text)]">
                <Award className="h-4 w-4 text-[var(--coastal-primary)]" />
                <span>California Real Estate License: {agent.dre}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Removed placeholder stats to avoid trust issues */}
      {/* If real stats become available, add them here. Otherwise, testimonials and credentials are shown below. */}

      {/* About Section */}
      <section className="py-12 bg-[var(--bg)] border-b border-[var(--coastal-border)]">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-6">
            About {agent.name}
          </h2>
          <div className="prose prose-lg max-w-none text-[var(--coastal-muted-text)] space-y-4">
            <p>
              As a dedicated real estate professional serving San Diego and coastal California, I bring local market expertise, personalized attention, and a commitment to excellence in every transaction.
            </p>
            <p>
              Whether you're buying your first home, selling a property, or investing in real estate, I provide the guidance and support you need to make informed decisions and achieve your goals.
            </p>
            <p>
              My approach combines deep knowledge of San Diego's diverse neighborhoods with modern marketing strategies and personalized service. I'm here to make your real estate journey smooth, successful, and rewarding.
            </p>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-12 bg-[var(--surface)] border-b border-[var(--coastal-border)]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="h-8 w-8 text-[var(--coastal-primary)]" />
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--coastal-text)]">
              Service Areas
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'San Diego',
              'La Jolla',
              'Pacific Beach',
              'Ocean Beach',
              'Coronado',
              'Point Loma',
              'Downtown San Diego',
              'Little Italy',
              'North Park',
              'Hillcrest',
              'Carmel Valley',
              'Del Mar',
              'Encinitas',
              'Carlsbad',
              'Oceanside'
            ].map((area) => (
              <div
                key={area}
                className="flex items-center gap-2 p-3 bg-[var(--bg)] rounded-lg border border-[var(--coastal-border)]"
              >
                <div className="w-2 h-2 bg-[var(--coastal-primary)] rounded-full"></div>
                <span className="text-[var(--coastal-text)]">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section className="py-12 bg-[var(--bg)] border-b border-[var(--coastal-border)]">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-6">
            Areas of Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Buyer Representation',
                description: 'Expert guidance through the home buying process, from search to closing.'
              },
              {
                title: 'Seller Representation',
                description: 'Strategic marketing and pricing to maximize your property\'s value.'
              },
              {
                title: 'Luxury Properties',
                description: 'Specialized expertise in high-end coastal California real estate.'
              },
              {
                title: 'First-Time Buyers',
                description: 'Patient guidance and education for buyers entering the market.'
              },
              {
                title: 'Investment Properties',
                description: 'Market analysis and investment strategy for rental and flip properties.'
              },
              {
                title: 'Relocation Services',
                description: 'Comprehensive support for clients moving to San Diego from out of area.'
              }
            ].map((expertise, index) => (
              <div
                key={index}
                className="p-6 bg-[var(--surface)] rounded-xl border border-[var(--coastal-border)]"
              >
                <h3 className="text-xl font-bold text-[var(--coastal-text)] mb-2">
                  {expertise.title}
                </h3>
                <p className="text-[var(--coastal-muted-text)]">
                  {expertise.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[var(--surface)]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-[var(--coastal-muted-text)] mb-8">
            Let's discuss your real estate goals and how I can help you achieve them.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--coastal-primary)] text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Mail className="h-5 w-5" />
              <span>Contact Me</span>
            </Link>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--surface)] text-[var(--coastal-text)] border-2 border-[var(--coastal-border)] rounded-xl font-semibold hover:bg-[var(--surface-muted)] transition-all duration-300"
            >
              <Home className="h-5 w-5" />
              <span>View Properties</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
