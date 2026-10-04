import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Building2, Check, Home, Key, MapPin, MessageCircle, Search, TrendingUp } from "lucide-react"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

// Static services page — revalidate once per day.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Real Estate Services | California Coastal Properties | Crown Coastal Homes",
  description: "California real estate support for buying, selling, renting, relocation, property research, and transaction coordination.",
  alternates: { canonical: "/services" },
}

const services = [
  {
    title: "Sell Your Home",
    description: "Pricing research, marketing coordination, offer review, and transaction guidance for a home sale.",
    icon: Home,
    href: "/sell",
    image: "/service/Tailored-Landing-Solutions.png",
    features: [
      "Professional market analysis",
      "Property-specific pricing strategy",
      "Photography and presentation plan",
      "Listing distribution",
      "Offer and negotiation guidance"
    ]
  },
  {
    title: "Buy a Home",
    description: "Current listing search, property tours, offer guidance, and transaction coordination.",
    icon: Key,
    href: "/properties",
    image: "/service/Concierge_Home_Buying.png",
    features: [
      "Personalized property search",
      "Comparable-sale research",
      "Lender coordination",
      "Inspection coordination",
      "Closing support"
    ]
  },
  {
    title: "Rent Properties",
    description: "Search current CRMLS rentals and coordinate property questions, tours, and applications.",
    icon: Building2,
    href: "/properties?status=for_rent",
    image: "/service/Investment-Management.png",
    features: [
      "Current CRMLS rental search",
      "Application coordination",
      "Listing-term clarification",
      "Property tours",
      "Move-in support"
    ]
  },
  {
    title: "Investment Analysis",
    description: "Property research and scenario analysis for investment-oriented purchase decisions.",
    icon: TrendingUp,
    href: "/services/investment",
    image: "/service/Investment-Management-1.png",
    features: [
      "Comparable-sale research",
      "Cash-flow scenarios",
      "Property due diligence",
      "Management-provider referrals",
      "Tax and legal referrals"
    ]
  },
  {
    title: "Concierge Home Buying",
    description: "A coordinated buying process from property criteria and private tours through closing.",
    icon: Search,
    href: "/services/concierge-home-buying",
    image: "/service/Concierge-Home-Buying-1.png",
    features: [
      "Current listing research",
      "Private viewings",
      "Personalized service",
      "Offer strategy",
      "Complete transaction management"
    ]
  },
  {
    title: "Relocation Services",
    description: "Area research, property search, tours, and transaction coordination for a California move.",
    icon: MapPin,
    href: "/services/relocation",
    image: "/service/World-Class-Affiliates-1.png",
    features: [
      "Area orientation tours",
      "Official school and community resources",
      "Temporary-housing search",
      "Independent provider referrals",
      "Transaction coordination"
    ]
  }
]

export default function ServicesPage() {
  return (
    <div className="pt-24 pb-16 bg-[var(--surface)] dark:bg-[var(--bg)] theme-transition">
      {/* Hero Section */}
      <section className="coastal-section-light py-20 md:py-24 relative overflow-hidden theme-transition">
        <div className="container mx-auto px-4 relative z-10">
          <Breadcrumbs items={[{ label: "Services", href: "/services" }]} className="mb-6" />
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-[var(--coastal-primary)] rounded-full"></div>
              <span className="text-[var(--coastal-primary)] font-semibold text-sm uppercase tracking-wider">Our Services</span>
              <div className="w-8 h-[2px] bg-[var(--coastal-primary)] rounded-full"></div>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--coastal-text)] mb-6 text-balance theme-transition">
              Comprehensive Real Estate
              <span className="block text-[var(--coastal-accent)]">Services</span>
            </h1>
            <p className="text-xl md:text-2xl text-[var(--coastal-muted-text)] mb-8 leading-relaxed max-w-3xl mx-auto text-balance theme-transition">
              Compare current listings and get licensed guidance for buying, selling, renting, relocation, and property-specific research.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-24 bg-[var(--surface)] dark:bg-[var(--bg)] theme-transition">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <article
                key={service.title}
                className="group overflow-hidden rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] transition-shadow duration-300 hover:shadow-lg"
              >
                <Link href={service.href} className="relative block h-48 w-full overflow-hidden" aria-label={`View ${service.title}`}>
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--surface)]/95 shadow-medium transition-transform duration-300 group-hover:scale-105">
                      <service.icon className="h-6 w-6 text-[var(--coastal-primary)]" aria-hidden="true" />
                    </div>
                  </div>
                </Link>
                <div className="p-6">
                  <h3 className="text-xl font-display font-bold text-[var(--coastal-text)] mb-3 theme-transition group-hover:text-[var(--coastal-primary)] transition-colors">
                    <Link href={service.href}>{service.title}</Link>
                  </h3>
                  <p className="text-[var(--coastal-muted-text)] mb-4 leading-relaxed theme-transition">
                    {service.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-[var(--coastal-muted-text)]">
                        <Check className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--coastal-secondary)]" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full rounded-md bg-[var(--coastal-primary)] font-semibold text-white shadow-medium hover:bg-[var(--primary-hover)]">
                    <Link href={service.href} aria-label={`Learn more about ${service.title}`}>
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 dark-gradient-bg text-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-[var(--coastal-accent)] rounded-full"></div>
              <span className="text-[var(--coastal-accent)] font-semibold text-sm uppercase tracking-wider">Get Started</span>
              <div className="w-8 h-[2px] bg-[var(--coastal-accent)] rounded-full"></div>
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-balance">
              Ready to Begin Your
              <span className="block text-[var(--coastal-accent)]">Real Estate Journey?</span>
            </h2>
            <p className="text-[var(--coastal-muted-text)] text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed text-balance">
              Tell us what you are planning, and we will explain the relevant real estate services and next steps.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button asChild
                  size="lg"
                  className="w-full rounded-md bg-[var(--coastal-primary)] px-8 py-4 font-semibold text-white shadow-medium hover:bg-[var(--primary-hover)] sm:w-auto"
                >
                  <Link href="/contact" className="flex items-center justify-center gap-3">
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    Contact Us
                  </Link>
              </Button>
              <Button asChild
                  size="lg"
                  variant="outline"
                  className="w-full rounded-md border-[var(--coastal-border)]/30 bg-[var(--surface)]/10 px-8 py-4 font-semibold text-white shadow-medium backdrop-blur-sm hover:border-[var(--coastal-border)]/50 hover:bg-[var(--surface)]/20 sm:w-auto"
                >
                  <Link href="/properties" className="flex items-center justify-center gap-3">
                    <Home className="h-5 w-5" aria-hidden="true" />
                    Browse Properties
                  </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
