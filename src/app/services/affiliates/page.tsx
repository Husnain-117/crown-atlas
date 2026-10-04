import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Users,
  Palette,
  Home,
  Scale,
  Crown,
  Mail,
  Calendar,
  Shield,
  Network,
  Sparkles,
} from "lucide-react"
import CustomerReview from "@/components/customer-review"
import AffiliateButtons from "./AffiliateButtons"
import { AffiliateServiceCards } from "@/components/AffiliateServiceCards"
import { AFFILIATES } from "@/lib/constants/affiliates"

export const metadata: Metadata = {
  title: "Service Provider Referrals | Crown Coastal Homes",
  description:
    "Request introductions to independent interior designers, property managers, contractors, legal professionals, and other California service providers.",
  alternates: { canonical: "/services/affiliates" },
}

const affiliateCategories = [
  {
    title: "Interior Design Referrals",
    description: "Introductions to designers whose services may fit coastal homes, renovations, and furnishing projects.",
    icon: Palette,
    services: [
      "Full-service interior design",
      "Luxury furniture and decor sourcing",
      "Custom millwork and built-ins",
      "Art curation and placement",
      "Smart home integration design",
    ],
    partners: "Matched by project fit",
  },
  {
    title: "Property Management Referrals",
    description: "Introductions to independent property managers for long-term rentals, second homes, and vacation properties.",
    icon: Home,
    services: [
      "Full-service property management",
      "Vacation rental management",
      "Maintenance and repair coordination",
      "Tenant screening and placement",
      "Financial reporting and analysis",
    ],
    partners: "Local service options",
  },
  {
    title: "Home Service Referrals",
    description: "Connections to contractors, landscapers, and maintenance providers based on the scope and location of the work.",
    icon: Users,
    services: [
      "Licensed general contractors",
      "Landscape design and maintenance",
      "Pool and spa services",
      "Security system installation",
      "Luxury home automation",
    ],
    partners: "Scope-based introductions",
  },
  {
    title: "Legal and Financial Referrals",
    description: "Introductions to independent professionals for matters outside the scope of real estate brokerage services.",
    icon: Scale,
    services: [
      "Real estate attorneys",
      "Tax planning specialists",
      "Wealth management advisors",
      "Estate planning attorneys",
      "1031 exchange facilitators",
    ],
    partners: "Independent professionals",
  },
  {
    title: "Lifestyle Service Referrals",
    description: "Introductions for event, hospitality, travel, and other household needs when suitable providers are available.",
    icon: Crown,
    services: [
      "Private chef and catering services",
      "Yacht and boat charter arrangements",
      "Exclusive event planning",
      "Personal shopping and styling",
      "Travel and vacation planning",
    ],
    partners: "Availability varies",
  },
]

const partnerBenefits = [
  {
    title: "Project-Fit Shortlist",
    description:
      "We start with your location, scope, timing, and priorities before suggesting a provider.",
    icon: Shield,
    stat: "Relevant introductions",
  },
  {
    title: "Credential Questions",
    description: "Where applicable, we help identify the licenses, insurance, and references you should verify.",
    icon: Network,
    stat: "Verify before hiring",
  },
  {
    title: "Direct Provider Quotes",
    description: "Providers set their own scope, pricing, schedule, warranties, and contract terms directly with you.",
    icon: Mail,
    stat: "Transparent comparison",
  },
  {
    title: "Independent Selection",
    description: "You decide whom to interview and hire; requesting a referral creates no obligation.",
    icon: CheckCircle,
    stat: "Client-controlled choice",
  },
]

const partnershipProcess = [
  {
    step: 1,
    title: "Needs Assessment",
    description: "We discuss your specific requirements and preferences for service providers.",
  },
  {
    step: 2,
    title: "Partner Matching",
    description: "When suitable providers are available, we suggest a short list based on your project.",
  },
  {
    step: 3,
    title: "Introduction & Consultation",
    description: "We facilitate introductions and initial consultations with your selected partners.",
  },
  {
    step: 4,
    title: "Project Coordination",
    description: "If requested, we help keep introductions and real estate milestones coordinated.",
  },
]

export default function AffiliatesPage() {
  return (
    <div className="bg-brand-californiaSand dark:bg-slate-900 pt-10 min-h-screen theme-transition">
      {/* Hero Section */}
      <section className="relative h-[72svh] min-h-[620px] lg:min-h-[760px] flex items-center justify-center text-center text-white overflow-hidden">
        <Image
          src="/service/World-Class-Affiliates.png"
          alt="Coastal home interior representing local service provider referrals"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <Badge className="mb-4 bg-brand-goldenHour text-white px-4 py-2 text-sm font-semibold">
            Local Referral Network
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight font-heading text-brand-white shadow-text">
            Service Provider
            <span className="block text-brand-goldenHour drop-shadow-md">Referrals</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto shadow-text leading-relaxed">
            Get introductions to independent providers whose location and services may fit your property project.
          </p>
          <AffiliateButtons />
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <AffiliateServiceCards services={AFFILIATES.map((a) => a.id as string)} />
        </div>
        {/* Affiliate Categories */}
        <section id="network-section" className="mb-20 scroll-mt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-midnightCove dark:text-neutral-100 mb-6 theme-transition">Our Premium Partner Network</h2>
            <p className="text-xl text-gray-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed theme-transition">
              Explore the types of independent providers we may be able to introduce for a coastal property project.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {affiliateCategories.map((category, index) => (
              <Card key={index} className="bg-brand-white dark:bg-slate-800 shadow-medium hover:shadow-strong transition-shadow border border-neutral-200 dark:border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-brand-pacificTeal/10 dark:bg-brand-pacificTeal/20 rounded-lg p-3 mr-4">
                        <category.icon className="h-8 w-8 text-brand-pacificTeal dark:text-brand-pacificTeal" />
                      </div>
                      <CardTitle className="text-xl text-brand-midnightCove dark:text-neutral-100 theme-transition">{category.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs border-neutral-300 dark:border-slate-600 text-neutral-700 dark:text-neutral-300">
                      {category.partners}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-neutral-300 text-base mb-4 leading-relaxed theme-transition">
                    {category.description}
                  </CardDescription>
                  <ul className="space-y-2">
                    {category.services.map((service, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-neutral-300 theme-transition">
                        <CheckCircle className="h-4 w-4 text-brand-pacificTeal dark:text-brand-pacificTeal mr-2 mt-0.5 flex-shrink-0" />
                        {service}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Partner Benefits */}
        <section className="mb-20 bg-brand-white dark:bg-slate-800 p-8 sm:p-12 rounded-xl shadow-medium border border-neutral-200 dark:border-slate-700 theme-transition">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-midnightCove dark:text-neutral-100 mb-6 theme-transition">
              Benefits of Our Affiliate Network
            </h2>
            <p className="text-xl text-gray-600 dark:text-neutral-300 max-w-3xl mx-auto theme-transition">
              A practical referral process that keeps the provider decision, contract, and payment in your hands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {partnerBenefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-brand-sunsetBlush/10 dark:bg-brand-sunsetBlush/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-brand-sunsetBlush dark:text-brand-sunsetBlush" />
                </div>
                <h3 className="text-xl font-semibold text-brand-midnightCove dark:text-neutral-100 mb-2 theme-transition">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-neutral-300 mb-3 theme-transition">{benefit.description}</p>
                <div className="text-base font-semibold text-brand-pacificTeal dark:text-brand-pacificTeal theme-transition">{benefit.stat}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Partnership Process */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-midnightCove dark:text-neutral-100 mb-6 theme-transition">
              How Our Referral Process Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-neutral-300 max-w-3xl mx-auto theme-transition">
              A straightforward way to identify and compare providers for your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnershipProcess.map((step, index) => (
              <Card key={index} className="bg-brand-white dark:bg-slate-800 shadow-medium text-center border border-neutral-200 dark:border-slate-700">
                <CardHeader>
                  <div className="bg-brand-sunsetBlush dark:bg-brand-sunsetBlush rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                    {step.step}
                  </div>
                  <CardTitle className="text-lg text-brand-midnightCove dark:text-neutral-100 theme-transition">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-neutral-300 leading-relaxed theme-transition">{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Success Stories */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-midnightCove dark:text-neutral-100 mb-6 theme-transition">What Clients Say</h2>
            <p className="text-xl text-gray-600 dark:text-neutral-300 theme-transition">Published client feedback about working with Reza and Crown Coastal Homes.</p>
          </div>

            <CustomerReview />
        </section>

        {/* CTA Section */}
        <section>
          <Card className="bg-brand-midnightCove dark:bg-slate-800 text-brand-white dark:text-neutral-100 shadow-strong border border-neutral-200 dark:border-slate-700 theme-transition">
            <CardContent className="p-12 text-center">
              <Sparkles className="h-16 w-16 text-brand-goldenHour dark:text-brand-goldenHour mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6 theme-transition">Need a Service Provider Introduction?</h2>
              <p className="text-xl text-brand-californiaSand/90 dark:text-neutral-300 mb-8 max-w-2xl mx-auto theme-transition">
                Tell us about the property, scope, location, and timing so we can check for relevant referral options.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                    asChild
                    size="lg"
                    className="bg-[var(--coastal-primary)] hover:bg-[var(--primary-hover)] text-white px-10 py-6 text-lg font-bold shadow-2xl transition-all duration-300 hover:scale-105 border-0 min-w-[280px]"
                  >
                    <Link href="/contact?message=I%27d%20like%20to%20discuss%20a%20service%20provider%20referral.">
                      <Calendar className="h-6 w-6 mr-2" />
                      Discuss Your Project
                    </Link>
                </Button>
                <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-2 border-white bg-white/20 backdrop-blur-sm text-black hover:bg-white hover:text-[var(--coastal-text)] px-10 py-6 text-lg font-bold shadow-2xl transition-all duration-300 hover:scale-105 min-w-[280px]"
                  >
                    <Link href="/contact?message=Please%20send%20me%20available%20provider%20referral%20options.">
                      <Mail className="h-6 w-6 mr-2" />
                      Request Referral Options
                    </Link>
                </Button>
              </div>
              <p className="text-sm text-brand-californiaSand/70 dark:text-neutral-400 mt-6 theme-transition">
                Referred providers are independent businesses. Verify licensing, insurance, references, scope, pricing,
                and contract terms before hiring. Crown Coastal Homes does not guarantee third-party work.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
