import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { ArrowRight, ChartNoAxesCombined, Handshake, Home, MapPinned, Search } from "lucide-react"
import dynamic from "next/dynamic"

import SearchBar from "@/components/home/search-bar"
import StatsStrip from "@/components/home/stats-strip"
import BackgroundCarousel from "@/components/background-carousel"
import { ClientTestimonialsBadge } from "@/components/client-testimonials-badge"
import { WhatOurClientsSayHeading } from "@/components/testimonials/WhatOurClientsSayHeading"
import CountiesSectionServer from "./_components/CountiesSectionServer"
import FeaturedPropertiesServer from "./_components/FeaturedPropertiesServer"

const CustomerReviewLazy = dynamic(
  () => import("@/components/customer-review"),
  {
    loading: () => null,
  }
)

/* ── Suspense fallback skeletons ── */
function FeaturedPropertiesSkeleton() {
  return (
    <section className="py-20 md:py-24 coastal-section-light">
      <div className="container mx-auto px-4">
        <div className="h-8 w-48 bg-[var(--surface)]/80 rounded-full mb-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-[var(--surface)]/80 border border-[var(--coastal-border)] animate-pulse"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function CountiesSectionSkeleton() {
  return (
    <section className="pt-20 md:pt-24 pb-12 md:pb-16 coastal-section-alt">
      <div className="container mx-auto px-4">
        <div className="h-8 w-64 bg-[var(--surface)]/80 rounded-full mb-4 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-56 rounded-2xl bg-[var(--surface)]/80 border border-[var(--coastal-border)] animate-pulse"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export const metadata: Metadata = {
  title: "Luxury Coastal Homes California | Crown Coastal Homes",
  description: "Explore luxury coastal homes across California with CRMLS-backed listing search, local market pages, and private tour scheduling.",
  verification: {
    google: ['pLW_0gU_9lDr1wdae6iEsXZLFO-h_Be9SFyoLAtXJ2c', '39wH-rnXqx0UvujoDm_WWYy6Q6btzzqcmkFkEhdc3Q0'],
  },
  openGraph: {
    title: "Luxury Coastal Homes California | Crown Coastal Homes",
    description: "Explore luxury coastal homes in California with CRMLS-backed listings and licensed real estate guidance.",
  },
  alternates: {
    canonical: '/',
  },
}

// Content changes infrequently; sync-driven data caches are invalidated separately.
export const revalidate = 3600

const carouselImages = [
  "/coursel.webp",
  "/coursel2.webp",
  "/coursel3.webp"
];

export default async function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative lg:h-[calc(100vh-6rem)] flex flex-col justify-start lg:justify-center overflow-hidden pb-20 md:pb-24 lg:pb-0 pt-20 sm:pt-24 md:pt-28 lg:pt-0">
        <BackgroundCarousel images={carouselImages} interval={5000} />
        {/* Gradient Overlay - ALWAYS the same regardless of theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F2A44]/90 via-[#0F2A44]/70 to-[#0F2A44]/90 z-10" />

        <div className="relative z-20 w-full px-4 sm:px-6 flex flex-col items-start lg:items-center lg:justify-center lg:text-center py-6">
          <div className="animate-fade-in-up max-w-5xl mx-auto w-full">
            <div className="hidden lg:inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-px bg-white/30 rounded-full" />
              <span className="text-[#C9A84C] font-semibold text-xs uppercase tracking-[0.2em]">
                California Coastal Real Estate
              </span>
              <div className="w-10 h-px bg-white/30 rounded-full" />
            </div>

            <span className="block lg:hidden text-white text-base sm:text-lg font-medium mb-2">
              Homes for Sale in California
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-md">
              Luxury Coastal Homes in California
              <span className="hidden lg:block mt-3 text-gradient-luxury bg-clip-text text-transparent drop-shadow-2xl">
                Find a Home That Fits
              </span>
            </h1>
            <p className="text-white/90 lg:text-white/75 text-sm sm:text-base lg:text-lg max-w-lg lg:max-w-2xl lg:mx-auto font-light mb-2 leading-relaxed text-balance">
              Browse luxury coastal properties across California, review current listing details, and request a private tour with a licensed agent.
            </p>
            <p className="text-white/80 lg:text-white/55 text-sm sm:text-base font-light mb-5 lg:mb-5">
              Start with current listings and property details.
            </p>

            <div className="hidden lg:flex mb-5 justify-center">
              <ClientTestimonialsBadge />
            </div>

            <div className="hidden lg:block max-w-3xl mx-auto mb-5">
              <SearchBar variant="unified" showToggle={true} hideTitle={true} hideFilters={true} className="" />
            </div>

            <div className="flex gap-3 lg:justify-center lg:gap-6 mb-8 lg:mb-6 w-full max-w-md lg:max-w-none">
              <Link
                href="/properties"
                className="group relative flex flex-1 items-center justify-center gap-3 rounded-lg bg-[#C9A84C] px-6 py-3.5 text-sm font-bold text-[#0F2340] shadow-lg transition-all hover:bg-[#b09342] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F2A44] active:scale-95 sm:text-base lg:flex-none lg:bg-[#7AA59B] lg:px-8 lg:py-4 lg:text-white lg:shadow-xl lg:hover:scale-105 lg:hover:bg-[#68948a]"
              >
                <Home aria-hidden="true" className="h-5 w-5" />
                <span className="lg:hidden">View Homes</span>
                <span className="hidden lg:inline">View California Homes for Sale</span>
              </Link>
              <Link
                href="/contact"
                className="group relative flex flex-1 items-center justify-center gap-3 rounded-lg border border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.15)] px-6 py-3.5 text-sm font-bold text-white shadow-lg backdrop-blur-md transition-all hover:bg-[rgba(255,255,255,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F2A44] active:scale-95 sm:text-base lg:flex-none lg:border-white/40 lg:bg-white/10 lg:px-8 lg:py-4 lg:shadow-xl lg:hover:scale-105 lg:hover:bg-white/20"
              >
                <span className="lg:hidden">Schedule Tour</span>
                <span className="hidden lg:inline">Request a Private Tour</span>
              </Link>
            </div>

            <div className="hidden lg:flex justify-center gap-8 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#7AA59B]"></div>
                <span className="text-white/60 font-medium text-xs uppercase tracking-wider">CRMLS Listing Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#D7C39A]"></div>
                <span className="text-white/60 font-medium text-xs uppercase tracking-wider">Expert Guidance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#7AA59B]"></div>
                <span className="text-white/60 font-medium text-xs uppercase tracking-wider">Luxury Focus</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Floating Search Card & Stats Section (Mobile Only) */}
      <div className="relative z-30 -mt-16 sm:-mt-20 px-4 sm:px-6 mb-12 lg:hidden">
        <div className="mx-auto w-full max-w-4xl space-y-4">
          <SearchBar />
          <div className="!bg-white dark:!bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <StatsStrip />
          </div>
        </div>
      </div>

      {/* Featured Properties Section (streamed via Suspense) */}
      <Suspense fallback={<FeaturedPropertiesSkeleton />}>
        <FeaturedPropertiesServer />
      </Suspense>

      {/* Premium Services Section - Server Component */}
      <>
        {/* Mobile View — same card structure, site typography and theme */}
        <section className="lg:hidden py-16 bg-[var(--surface)] relative overflow-hidden theme-transition">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-left mb-12 px-2">
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="w-6 h-[2px] bg-[var(--coastal-accent)] rounded-full" />
                <span className="font-semibold text-xs uppercase text-[#0F2A44] dark:text-[#A8D7D2] theme-transition">
                  Premium Services
                </span>
                <div className="w-6 h-[2px] bg-[var(--coastal-accent)] rounded-full" />
              </div>
              <h2 className="font-display text-3xl font-bold text-[var(--coastal-text)] leading-tight theme-transition">
                Concierge-Level
                <span className="block text-gradient-luxury bg-clip-text text-transparent mt-1">Real Estate Services</span>
              </h2>
            </div>

            <div className="space-y-6 max-w-2xl">
              {[
                {
                  title: "Concierge House Hunting",
                  description: "A coordinated buying process from property criteria through closing.",
                  link: "/services/concierge-home-buying",
                  icon: Search
                },
                {
                  title: "Tailored Relocation",
                  description: "Area research, property search, tours, and transaction coordination.",
                  link: "/services/relocation",
                  icon: MapPinned
                },
                {
                  title: "Investment Strategy",
                  description: "Property research and scenario analysis for investment decisions.",
                  link: "/services/investment",
                  icon: ChartNoAxesCombined
                }
              ].map((service, index) => {
                const IconComponent = service.icon;
                return (
                <div key={index} className="flex gap-4 items-start bg-[var(--surface)] p-5 rounded-xl border border-[var(--coastal-border)] shadow-soft hover:shadow-medium transition-all duration-300 theme-transition">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[var(--coastal-primary)] rounded-xl flex items-center justify-center flex-shrink-0 theme-transition">
                    <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg sm:text-xl font-bold text-[var(--coastal-text)] mb-2 theme-transition">
                      {service.title}
                    </h3>
                    <p className="text-[var(--coastal-muted-text)] text-sm mb-3 leading-relaxed theme-transition">
                      {service.description}
                    </p>
                    <Link
                      href={service.link}
                      className="inline-flex items-center gap-1.5 font-semibold text-sm text-[#0F2A44] hover:text-[#285473] dark:text-[#A8D7D2] dark:hover:text-white transition-colors theme-transition"
                    >
                      <span>Explore {service.title}</span>
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </section>

        {/* Desktop View (Original Design) */}
        <section className="hidden lg:block coastal-section-alt py-28 relative overflow-hidden theme-transition">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-8 h-[2px] bg-[var(--coastal-accent)] rounded-full"></div>
                <span className="text-[var(--coastal-primary)] font-semibold text-sm uppercase tracking-wider theme-transition">Premium Services</span>
                <div className="w-8 h-[2px] bg-[var(--coastal-accent)] rounded-full"></div>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-[var(--coastal-text)] mb-6 text-balance theme-transition">
                Concierge-Level
                <span className="block text-gradient-luxury bg-clip-text text-transparent">Real Estate Services</span>
              </h2>
              <p className="text-[var(--coastal-muted-text)] text-xl max-w-3xl mx-auto leading-relaxed text-balance theme-transition">
                Property search, relocation planning, provider referrals, and investment scenario analysis for California real estate decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Service Cards */}
              {[
                {
                  title: "Concierge House Hunting",
                  icon: Search,
                  image: "/service/Concierge-Home-Buying-1.png",
                  description: "A coordinated buying process from property criteria and showings through offers, escrow, and closing.",
                  link: "/services/concierge-home-buying",
                  features: ["Personalized property selection", "Private viewings", "Negotiation expertise", "Transaction management", "Post-purchase support"]
                },
                {
                  title: "Tailored Relocation",
                  icon: MapPinned,
                  image: "/service/Tailored-Landing-Solutions-1.png",
                  description: "Area research, property search, tours, and transaction coordination for a move to coastal California.",
                  link: "/services/relocation",
                  features: ["Personalized property search", "Area orientation tours", "School and community info", "Temporary housing assistance", "Service provider connections"]
                },
                {
                  title: "Provider Referrals",
                  icon: Handshake,
                  image: "/service/affiliates-handshake.jpeg",
                  description: "Introductions to independent service providers based on project type, location, and availability.",
                  link: "/services/affiliates",
                  features: ["Interior design referrals", "Property management referrals", "Home service providers", "Legal and financial referrals", "Independent provider quotes"]
                },
                {
                  title: "Investment Strategy",
                  icon: ChartNoAxesCombined,
                  image: "/service/Investment-Management-1.png",
                  description: "Property-specific research and scenario analysis for investment-oriented purchase decisions.",
                  link: "/services/investment",
                  features: ["Comparable-sale research", "Cash-flow scenarios", "Property due diligence", "Management referrals", "Tax and legal professional referrals"]
                }
              ].map((service, index) => (
                <div key={index} className="group glass-card rounded-[16px] p-8 flex flex-col h-full hover-lift border border-[var(--coastal-border)] bg-[var(--surface)] backdrop-blur-xl theme-transition">
                  <div className="relative overflow-hidden rounded-xl mb-6 h-40">
                    <Image src={service.image} alt={service.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--coastal-primary)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                      <service.icon className="w-5 h-5 text-white" aria-hidden />
                    </div>
                    <h3 className="font-display text-xl font-bold text-[var(--coastal-text)] theme-transition">{service.title}</h3>
                  </div>
                  <p className="text-[var(--coastal-muted-text)] mb-6 leading-relaxed flex-grow theme-transition">{service.description}</p>
                  <ul className="text-[var(--coastal-muted-text)] text-sm mb-6 space-y-2 theme-transition">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[var(--coastal-secondary)] rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={service.link} className="inline-flex items-center gap-2 text-[var(--coastal-primary)] font-semibold hover:text-[var(--coastal-link)] transition-colors group/link theme-transition">
                    <span>Explore {service.title}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" aria-hidden />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>

      {/* Counties Section (streamed via Suspense) */}
      <Suspense fallback={<CountiesSectionSkeleton />}>
        <CountiesSectionServer />
      </Suspense>

      {/* Testimonials Section */}
      <section className="pt-12 md:pt-16 pb-20 md:pb-24 bg-[var(--surface)] theme-transition">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-gradient-primary rounded-full"></div>
              <span className="font-semibold text-sm uppercase text-[#0F2A44] dark:text-[#A8D7D2]">Honest Reviews</span>
              <div className="w-8 h-[2px] bg-gradient-primary rounded-full"></div>
            </div>
            <WhatOurClientsSayHeading />
          </div>
          <CustomerReviewLazy limit={3} />
          <div className="mt-8 flex justify-center">
            <Link
              href="/testimonials"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#0F2A44] px-5 py-2 text-sm font-semibold text-[#0F2A44] transition-colors hover:bg-[#0F2A44] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F2A44] focus-visible:ring-offset-2 dark:border-[#A8D7D2] dark:text-[#A8D7D2] dark:hover:bg-[#A8D7D2] dark:hover:text-[#1B2430]"
            >
              Read all client stories
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
