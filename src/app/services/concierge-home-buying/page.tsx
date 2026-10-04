import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Clock,
  Shield,
  Home,
  Search,
  FileText,
  Key,
  Phone,
  Mail,
  Calendar,
  Target,
  Heart,
} from "lucide-react"
import CustomerReview from "@/components/customer-review"
import { CONTACT } from "@/lib/constants/contact"

export const metadata: Metadata = {
  title: "Concierge Home Buying Services | Crown Coastal Homes",
  description:
    "Personalized California home search support, property comparisons, private tour requests, offer guidance, and transaction coordination.",
  alternates: { canonical: "/services/concierge-home-buying" },
}

const conciergeServices = [
  {
    title: "Personalized Property Selection",
    description: "Property recommendations based on the location, price, size, features, and other criteria you provide.",
    icon: Search,
    details: [
      "Detailed lifestyle and preference consultation",
      "Criteria-based listing recommendations",
      "MLS inventory and available private opportunities",
      "Comprehensive property research and analysis",
    ],
  },
  {
    title: "Private Viewings",
    description: "Exclusive, private showings scheduled at your convenience with dedicated agent accompaniment.",
    icon: Key,
    details: [
      "Showing appointment coordination",
      "Access subject to seller and listing-agent approval",
      "Detailed property walkthroughs with expert insights",
      "Virtual tour options for remote clients",
    ],
  },
  {
    title: "Negotiation Expertise",
    description: "Offer analysis and negotiation support aligned with the property, market, and your priorities.",
    icon: Target,
    details: [
      "Market analysis and pricing strategy",
      "Professional offer preparation and presentation",
      "Skilled negotiation of terms and contingencies",
      "Multiple offer situation management",
    ],
  },
  {
    title: "Transaction Management",
    description: "Complete oversight of all transaction details from contract to closing.",
    icon: FileText,
    details: [
      "Contract timeline and document coordination",
      "Inspection and appraisal coordination",
      "Escrow and title company liaison",
      "Timeline management and milestone tracking",
    ],
  },
  {
    title: "Post-Purchase Support",
    description: "Continued assistance after closing to ensure a smooth transition to your new home.",
    icon: Home,
    details: [
      "Utility setup and transfer assistance",
      "Local service provider recommendations",
      "Warranty and maintenance guidance",
      "Ongoing client relationship management",
    ],
  },
]

const processSteps = [
  {
    step: 1,
    title: "Initial Consultation",
    description: "Comprehensive discussion of your needs, preferences, timeline, and budget.",
    duration: "Discovery",
  },
  {
    step: 2,
    title: "Property Curation",
    description: "Selection of available properties matching your criteria and purchase plan.",
    duration: "Search",
  },
  {
    step: 3,
    title: "Private Showings",
    description: "Scheduled private viewings with detailed property analysis and market insights.",
    duration: "Touring",
  },
  {
    step: 4,
    title: "Offer Strategy",
    description: "Development of competitive offer strategy and professional negotiation.",
    duration: "Offer",
  },
  {
    step: 5,
    title: "Transaction Management",
    description: "Complete oversight of escrow, inspections, and closing process.",
    duration: "Escrow",
  },
  {
    step: 6,
    title: "Post-Closing Support",
    description: "Continued assistance with move-in and local area orientation.",
    duration: "After closing",
  },
]

const clientBenefits = [
  {
    title: "Focused Coordination",
    description: "Research, showing requests, and transaction milestones are organized in one process.",
    icon: Clock,
    stat: "One point of contact",
  },
  {
    title: "Available Inventory",
    description: "Search MLS listings plus private or pre-market opportunities when they are lawfully shared and available.",
    icon: Search,
    stat: "Availability-based search",
  },
  {
    title: "Licensed Guidance",
    description: "California brokerage support from initial criteria through closing and handoff.",
    icon: Target,
    stat: `DRE #${CONTACT.agent.dre}`,
  },
  {
    title: "Visible Milestones",
    description: "Contingencies, inspections, appraisal, escrow, and next actions are tracked throughout the transaction.",
    icon: Shield,
    stat: "Clear next steps",
  },
]

export default function ConciergeBuyingPage() {
  return (
    <div className="bg-[var(--bg)] pt-20 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[72svh] min-h-[620px] lg:min-h-[760px] flex items-center justify-center text-center text-white overflow-hidden">
        <Image
          src="/service/Concierge_Home_Buying.png"
          alt="Happy couple receiving keys to their new home with professional concierge service"
          fill
          className="object-cover object-left"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-left">
          <Badge className="mb-4 bg-[var(--coastal-accent)] text-[var(--coastal-text)] px-4 py-2 text-sm font-semibold">
            Buyer Representation
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight font-heading text-white shadow-text">
            Concierge Home Buying
            Services
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 text-white max-w-2xl shadow-text leading-relaxed">
            A coordinated buying process from search criteria and showings through offer strategy, escrow, and closing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
                asChild
                size="lg"
                className="bg-[var(--coastal-primary)] hover:bg-[var(--primary-hover)] text-white px-10 py-6 text-lg font-bold shadow-2xl transition-all duration-300 hover:scale-105 border-0"
              >
                <Link href="/contact?message=I%27d%20like%20to%20discuss%20buyer%20representation.">
                  <Calendar className="h-6 w-6 mr-2" />
                  Schedule Consultation
                </Link>
            </Button>
            <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-[var(--coastal-border)] bg-[var(--surface)]/10 backdrop-blur-sm text-white hover:bg-[var(--surface)] hover:text-[var(--coastal-text)] px-10 py-6 text-lg font-bold shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <a href={CONTACT.phone.href}>
                  <Phone className="h-6 w-6 mr-2" />
                  Call {CONTACT.phone.display}
                </a>
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Service Overview */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-6">
              Comprehensive Concierge Services
            </h2>
            <p className="text-xl text-[var(--coastal-muted-text)] max-w-3xl mx-auto leading-relaxed">
              Our concierge home buying service provides personalized search, tour, offer, and transaction support
              based on the criteria and priorities you provide.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {conciergeServices.map((service, index) => (
              <Card key={index} className="bg-[var(--surface)] shadow-medium hover:shadow-strong transition-shadow border border-[var(--coastal-border)]">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="bg-[var(--coastal-primary)]/10 rounded-lg p-3 mr-4">
                      <service.icon className="h-8 w-8 text-[var(--coastal-primary)]" />
                    </div>
                    <CardTitle className="text-xl text-[var(--coastal-text)]">{service.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[var(--coastal-muted-text)] text-base mb-4 leading-relaxed">
                    {service.description}
                  </CardDescription>
                  <ul className="space-y-2">
                    {service.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start text-sm text-[var(--coastal-muted-text)]">
                        <CheckCircle className="h-4 w-4 text-[var(--coastal-primary)] mr-2 mt-0.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Process Timeline */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-6">Our Concierge Process</h2>
            <p className="text-xl text-[var(--coastal-muted-text)] max-w-3xl mx-auto">
              A clear sequence of decisions and milestones that adapts to the property and contract.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processSteps.map((step, index) => (
              <Card key={index} className="bg-[var(--surface)] shadow-medium relative border border-[var(--coastal-border)]">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-[var(--coastal-primary)] rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg">
                      {step.step}
                    </div>
                    <Badge variant="outline" className="text-xs border-[var(--coastal-border)] text-[var(--coastal-muted-text)]">
                      {step.duration}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-[var(--coastal-text)]">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[var(--coastal-muted-text)] leading-relaxed">{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-5 text-center text-xs text-[var(--coastal-muted-text)]">
            Search and escrow timing varies with inventory, financing, contingencies, and negotiated contract terms.
          </p>
        </section>

        {/* Client Benefits */}
        <section className="mb-20 bg-[var(--surface)] p-8 sm:p-12 rounded-xl shadow-medium border border-[var(--coastal-border)]">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-6">
              Why Choose Our Concierge Service
            </h2>
            <p className="text-xl text-[var(--coastal-muted-text)] max-w-3xl mx-auto">
              Experience the advantages of professional, personalized home buying assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {clientBenefits.map((benefit, index) => (
              <div key={index} className="text-center">
                  <div className="bg-[var(--coastal-primary)]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-8 w-8 text-[var(--coastal-primary)]" />
                  </div>
                <h3 className="text-xl font-semibold text-[var(--coastal-text)] mb-2">{benefit.title}</h3>
                <p className="text-[var(--coastal-muted-text)] mb-3">{benefit.description}</p>
                <div className="text-base font-semibold text-[var(--coastal-primary)]">{benefit.stat}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-6">What Clients Say</h2>
            <p className="text-xl text-[var(--coastal-muted-text)]">Published feedback about working with Reza on real estate decisions and transactions.</p>
          </div>

            <CustomerReview />
        </section>

        {/* CTA Section */}
        <section>
          <Card className="dark-gradient-bg text-white shadow-strong border-0">
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-[var(--coastal-accent)] mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Experience Concierge Service?</h2>
              <p className="text-xl text-[var(--coastal-muted-text)] mb-8 max-w-2xl mx-auto">
                Let our experienced team handle every detail of your home purchase while you focus on what matters most.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-[var(--coastal-primary)] hover:bg-[var(--primary-hover)] text-white px-10 py-6 text-lg font-bold shadow-2xl transition-all duration-300 hover:scale-105 border-0 min-w-[280px]"
                >
                  <Link href="/contact?message=I%27d%20like%20to%20schedule%20a%20buyer%20consultation.">
                    <Calendar className="h-6 w-6 mr-2" />
                    Schedule Consultation
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-[var(--coastal-border)] bg-[var(--surface)]/10 backdrop-blur-sm text-white hover:bg-[var(--surface)] hover:text-[var(--coastal-text)] px-10 py-6 text-lg font-bold shadow-2xl transition-all duration-300 hover:scale-105 min-w-[280px]"
                >
                  <Link href="/contact?message=Please%20send%20me%20information%20about%20buyer%20representation.">
                    <Mail className="h-6 w-6 mr-2" />
                    Request Information
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-[var(--coastal-muted-text)] mt-6">
                California real estate guidance from Reza Barghlameno, DRE #{CONTACT.agent.dre}.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
