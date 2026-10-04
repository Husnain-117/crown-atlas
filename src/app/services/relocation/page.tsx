import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  MapPin,
  School,
  Home,
  Clock,
  Users,
  Phone,
  Mail,
  Calendar,
  Compass,
  Heart,
  Shield,
  Target,
} from "lucide-react"
import CustomerReview from "@/components/customer-review"
import { CONTACT } from "@/lib/constants/contact"

export const metadata: Metadata = {
  title: "Tailored Relocation Solutions | Crown Coastal Homes",
  description:
    "Personalized relocation services for moving to California's coast. Property search, area orientation, school information, and comprehensive moving support.",
  alternates: { canonical: "/services/relocation" },
}

const relocationServices = [
  {
    title: "Personalized Property Search",
    description: "Customized property search based on your lifestyle preferences, budget, and specific requirements.",
    icon: Home,
    features: [
      "Detailed lifestyle consultation",
      "Custom property matching criteria",
      "Virtual and in-person property tours",
      "Neighborhood compatibility analysis",
      "Market timing and pricing strategy",
    ],
  },
  {
    title: "Area Orientation Tours",
    description:
      "Comprehensive guided tours of potential neighborhoods and communities to help you make informed decisions.",
    icon: Compass,
    features: [
      "Personalized neighborhood tours",
      "Local amenities and attractions overview",
      "Transportation and commute analysis",
      "Shopping and dining recommendations",
      "Recreation and entertainment options",
    ],
  },
  {
    title: "School and Community Information",
    description: "Links to official school, community-service, and local amenity resources for independent review.",
    icon: School,
    features: [
      "Links to public district and independent school resources",
      "Published enrollment contacts and requirements",
      "Publicly available program information",
      "Community centers and libraries",
      "Local recreation resources",
    ],
  },
  {
    title: "Temporary Housing Assistance",
    description: "Short-term housing solutions while you search for your permanent home or during transition periods.",
    icon: Clock,
    features: [
      "Corporate housing arrangements",
      "Extended stay hotel negotiations",
      "Furnished rental options",
      "Pet-friendly accommodations",
      "Flexible lease terms",
    ],
  },
  {
    title: "Local Service Provider Connections",
    description: "Introductions to trusted local professionals and service providers to ease your transition.",
    icon: Users,
    features: [
      "Healthcare provider referrals",
      "Legal and financial advisors",
      "Home maintenance services",
      "Childcare and eldercare options",
      "Professional networking opportunities",
    ],
  },
]

const relocationBenefits = [
  {
    title: "Coordinated Transition",
    description: "We organize the real estate research, tours, and transaction milestones around your move.",
    icon: Shield,
    stat: "One coordinated plan",
  },
  {
    title: "Comparable Local Data",
    description: "We compare listings, recent sales, commute inputs, and public community resources.",
    icon: Target,
    stat: "Side-by-side context",
  },
  {
    title: "Focused Research",
    description: "Your criteria guide the research and scheduling so attention stays on relevant options.",
    icon: Clock,
    stat: "Research and scheduling",
  },
  {
    title: "Needs-Based Search",
    description: "Budget, housing needs, location, and timing shape the search without steering by demographics.",
    icon: Heart,
    stat: "Criteria-led guidance",
  },
]

const relocationProcess = [
  {
    step: 1,
    title: "Initial Consultation",
    description: "Comprehensive discussion of your relocation needs, timeline, and preferences.",
    duration: "Discovery",
  },
  {
    step: 2,
    title: "Area Research & Planning",
    description: "Detailed research and planning based on your specific requirements and lifestyle.",
    duration: "Research",
  },
  {
    step: 3,
    title: "Orientation Visit",
    description: "Guided tour of recommended areas with property viewings and community exploration.",
    duration: "Orientation",
  },
  {
    step: 4,
    title: "Property Selection",
    description: "Assistance with property selection, negotiation, and purchase or lease agreements.",
    duration: "Search",
  },
  {
    step: 5,
    title: "Move Coordination",
    description: "Support with moving logistics, utility setup, and local service connections.",
    duration: "Coordination",
  },
  {
    step: 6,
    title: "Post-Move Support",
    description: "Ongoing assistance with settling in and connecting with the local community.",
    duration: "After the move",
  },
]

const popularDestinations = [
  {
    city: "San Diego",
    description: "A large coastal market with urban, suburban, and beach-area housing options.",
    highlights: ["Major employment centers", "Regional transit options", "Coastal recreation"],
  },
  {
    city: "Los Angeles",
    description: "A broad metropolitan market where commute patterns and neighborhood inventory vary widely.",
    highlights: ["Multiple employment hubs", "Large housing market", "Regional transit network"],
  },
  {
    city: "San Francisco",
    description: "A compact Bay Area market with distinct housing types, transit access, and pricing patterns.",
    highlights: ["Bay Area employment", "Public transportation", "Urban housing options"],
  },
  {
    city: "Santa Barbara",
    description: "A smaller coastal market with limited inventory and access to regional amenities.",
    highlights: ["Coastal setting", "Regional amenities", "Outdoor recreation"],
  },
]

export default function RelocationPage() {
  return (
    <div className="bg-[var(--bg)] min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] lg:min-h-[700px] flex items-center justify-center text-center text-white overflow-hidden">
        <Image
          src="/service/Tailored-Landing-Solutions.png"
          alt="Happy family with SOLD sign celebrating successful relocation to California"
          fill
          className="object-cover object-right"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-left">
          <Badge className="mb-3 sm:mb-4 bg-[var(--coastal-accent)] text-[var(--coastal-text)] px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold">
            California Relocation Guidance
          </Badge>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight font-heading text-white text-center shadow-text">
            Tailored Relocation
            <span className="block text-[var(--coastal-primary)] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"></span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl mb-6 sm:mb-8 text-white max-w-2xl ml-auto shadow-text leading-relaxed">
            Research, property search, tours, and transaction coordination for a move to coastal California.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-[var(--coastal-secondary)] hover:bg-[var(--secondary-hover)] text-[#083133] px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
              >
                <Link href="/contact?message=I%27d%20like%20to%20plan%20a%20California%20relocation." className="w-full sm:w-auto">
                  <MapPin className="h-5 w-5 mr-2" />
                  Start Your Relocation
                </Link>
            </Button>
            <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-transparent border-2 border-white/60 text-white hover:bg-white/10 hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
              >
                <a href={CONTACT.phone.href} className="w-full sm:w-auto">
                  <Phone className="h-5 w-5 mr-2" />
                  Call {CONTACT.phone.display}
                </a>
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        {/* Relocation Services */}
        <section className="mb-12 md:mb-20">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4 sm:mb-6">
              Comprehensive Relocation Services
            </h2>
            <p className="text-base sm:text-xl text-[var(--coastal-muted-text)] max-w-3xl mx-auto leading-relaxed">
              Practical support for researching, comparing, and moving into California coastal communities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
            {relocationServices.map((service, index) => (
              <Card key={index} className="bg-[var(--surface)] shadow-medium hover:shadow-strong transition-shadow border border-[var(--coastal-border)]">
                <CardHeader className="pb-2 sm:pb-4">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="bg-[var(--coastal-secondary)]/10 rounded-lg p-2 sm:p-3 mr-3 sm:mr-4 flex-shrink-0">
                      <service.icon className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--coastal-secondary)]" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl text-[var(--coastal-text)]">{service.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[var(--coastal-muted-text)] text-sm sm:text-base mb-3 sm:mb-4 leading-relaxed">
                    {service.description}
                  </CardDescription>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-xs sm:text-sm text-[var(--coastal-muted-text)]">
                        <CheckCircle className="h-4 w-4 text-[var(--coastal-secondary)] mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="mb-12 md:mb-20 bg-[var(--surface)] p-4 sm:p-8 md:p-12 rounded-xl shadow-medium border border-[var(--coastal-border)]">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4 sm:mb-6">
              Popular Relocation Destinations
            </h2>
            <p className="text-base sm:text-xl text-[var(--coastal-muted-text)] max-w-3xl mx-auto">
              Start with neutral market, transportation, housing, and public-resource information for each area.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {popularDestinations.map((destination, index) => (
              <Card key={index} className="bg-[var(--surface-muted)] shadow-subtle border border-[var(--coastal-border)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg text-[var(--coastal-text)] flex items-center">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[var(--coastal-secondary)] flex-shrink-0" />
                    {destination.city}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[var(--coastal-muted-text)] mb-3 sm:mb-4 leading-relaxed text-sm">
                    {destination.description}
                  </CardDescription>
                  <ul className="space-y-1">
                    {destination.highlights.map((highlight, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-[var(--coastal-secondary)] font-medium">
                        • {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Relocation Process */}
        <section className="mb-12 md:mb-20">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4 sm:mb-6">Our Relocation Process</h2>
            <p className="text-base sm:text-xl text-[var(--coastal-muted-text)] max-w-3xl mx-auto">
              A clear process that adapts to your search criteria, availability, and transaction timeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {relocationProcess.map((step, index) => (
              <Card key={index} className="bg-[var(--surface)] shadow-medium border border-[var(--coastal-border)]">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="bg-[var(--coastal-primary)] rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                      {step.step}
                    </div>
                    <Badge variant="outline" className="text-xs border-[var(--coastal-border)] text-[var(--coastal-muted-text)]">
                      {step.duration}
                    </Badge>
                  </div>
                  <CardTitle className="text-base sm:text-lg text-[var(--coastal-text)]">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[var(--coastal-muted-text)] leading-relaxed text-sm sm:text-base">{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-5 text-center text-xs text-[var(--coastal-muted-text)]">
            Timing depends on inventory, travel availability, financing, and contract terms.
          </p>
        </section>

        {/* Benefits */}
        <section className="mb-12 md:mb-20">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4 sm:mb-6">
              Why Choose Our Relocation Services
            </h2>
            <p className="text-base sm:text-xl text-[var(--coastal-muted-text)] max-w-3xl mx-auto">
              Experience the benefits of working with relocation specialists who understand your unique needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {relocationBenefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-[var(--coastal-secondary)]/20 border border-[var(--coastal-secondary)]/40 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <benefit.icon className="h-6 w-6 sm:h-7 sm:w-7 text-[var(--coastal-secondary)]" />
                </div>
                <h3 className="text-base sm:text-xl font-semibold text-[var(--coastal-text)] mb-2">{benefit.title}</h3>
                <p className="text-xs sm:text-base text-[var(--coastal-muted-text)] mb-2 sm:mb-3">{benefit.description}</p>
                <div className="text-base font-semibold text-[var(--coastal-primary)]">{benefit.stat}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-12 md:mb-20">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4 sm:mb-6">What Clients Say</h2>
            <p className="text-base sm:text-xl text-[var(--coastal-muted-text)]">
              Published feedback about working with Reza on real estate decisions and transactions.
            </p>
          </div>
          <CustomerReview limit={3} />
        </section>

        {/* CTA Section */}
        <section>
          <Card className="dark-gradient-bg text-white shadow-strong border-0">
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-[var(--coastal-accent)] mx-auto mb-4 sm:mb-6" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white">Ready to Make California Your Home?</h2>
              <p className="text-base sm:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                Start with your target area, budget, timing, and housing needs. We will map the next practical steps.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button asChild size="lg" className="w-full sm:w-auto bg-[var(--coastal-secondary)] hover:bg-[var(--secondary-hover)] text-[#083133] px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base">
                  <Link href="/contact?message=I%27d%20like%20to%20schedule%20a%20relocation%20consultation." className="w-full sm:w-auto">
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule Relocation Consultation
                  </Link>
                </Button>
                <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto bg-transparent border-2 border-white/60 text-white hover:bg-white/10 hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base"
                  >
                    <Link href="/contact?message=Please%20help%20me%20build%20a%20relocation%20plan." className="w-full sm:w-auto">
                      <Mail className="h-5 w-5 mr-2" />
                      Request a Relocation Plan
                    </Link>
                </Button>
              </div>
              <p className="text-xs sm:text-sm text-white/60 mt-4 sm:mt-6">
                California real estate guidance from Reza Barghlameno, DRE #{CONTACT.agent.dre}.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
