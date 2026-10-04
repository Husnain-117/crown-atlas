import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  TrendingUp,
  Calculator,
  PieChart,
  Building,
  Scale,
  Phone,
  Mail,
  Calendar,
  Target,
  Shield,
  DollarSign,
  BarChart3,
} from "lucide-react"
import CustomerReview from "@/components/customer-review"

export const metadata: Metadata = {
  title: "Real Estate Investment Guidance | Crown Coastal Homes",
  description:
    "California investment-property guidance with listing research, comparable sales, cash-flow scenarios, due diligence, and transaction support.",
  alternates: { canonical: "/services/investment" },
}

const investmentServices = [
  {
    title: "Market Analysis and Trends",
    description: "Comprehensive analysis of California coastal real estate markets with detailed trend forecasting.",
    icon: TrendingUp,
    features: [
      "Local market trend analysis",
      "Comparative market studies",
      "Economic impact assessments",
      "Future growth projections",
      "Seasonal market variations",
    ],
  },
  {
    title: "Financial Scenario Analysis",
    description: "Property-specific cash-flow and cost scenarios based on assumptions you can review and adjust.",
    icon: Calculator,
    features: [
      "Cash flow analysis",
      "Financing and operating-cost scenarios",
      "Sensitivity analysis",
      "Risk assessment modeling",
      "Break-even analysis",
    ],
  },
  {
    title: "Property and Market Comparison",
    description: "Side-by-side research across locations, property types, price points, and intended holding periods.",
    icon: PieChart,
    features: [
      "Comparable property research",
      "Geographic diversification",
      "Property type comparison",
      "Risk tolerance assessment",
      "Investment timeline planning",
    ],
  },
  {
    title: "Property Management Coordination",
    description: "Introductions and diligence support when evaluating third-party property management options.",
    icon: Building,
    features: [
      "Tenant screening and placement",
      "Rent collection and accounting",
      "Maintenance coordination",
      "Property inspections",
      "Financial reporting",
    ],
  },
  {
    title: "Tax and Legal Coordination",
    description: "Identification of questions to take to qualified tax and legal professionals before closing.",
    icon: Scale,
    features: [
      "1031 exchange facilitation",
      "Tax-professional coordination",
      "Ownership-structure questions",
      "Depreciation discussion topics",
      "Document and deadline tracking",
    ],
  },
]

const investmentBenefits = [
  {
    title: "Comparable Research",
    description: "Review sold comparables, active competition, rents, and property-specific costs before making an offer.",
    icon: Calculator,
    stat: "Sales + cash-flow context",
  },
  {
    title: "Risk Review",
    description: "Organize inspection findings, disclosures, HOA documents, and operating assumptions for review.",
    icon: Shield,
    stat: "Documents + due diligence",
  },
  {
    title: "Licensed Guidance",
    description: "Work directly with a California-licensed real estate professional throughout the transaction.",
    icon: Target,
    stat: "CA DRE #02211952",
  },
  {
    title: "Comprehensive Service",
    description: "Coordinated property search, offer preparation, diligence, and closing support.",
    icon: BarChart3,
    stat: "Search through closing",
  },
]

const investmentTypes = [
  {
    type: "Single-Family Rentals",
    description: "High-quality rental properties in desirable coastal neighborhoods.",
    benefits: ["Rent scenario review", "Resale comparables", "Operating-cost research"],
    focus: "Income + resale analysis",
  },
  {
    type: "Vacation Rentals",
    description: "Short-term rental properties in prime tourist destinations.",
    benefits: ["Local permit review", "Seasonality assumptions", "Management-cost research"],
    focus: "Rules + seasonality",
  },
  {
    type: "Multi-Family Properties",
    description: "Apartment buildings and multi-unit properties for diversified income.",
    benefits: ["Unit-level rent review", "Shared-cost analysis", "Management planning"],
    focus: "Units + operating costs",
  },
  {
    type: "Commercial Real Estate",
    description: "Office buildings, retail spaces, and mixed-use developments.",
    benefits: ["Lease review coordination", "Tenant and vacancy questions", "Specialist referrals"],
    focus: "Lease + tenant diligence",
  },
]

const marketInsights = [
  {
    metric: "Purchase Costs",
    value: "Acquisition",
    description: "Price, financing, inspections, escrow, reserves, and immediate repairs",
  },
  {
    metric: "Operating Scenario",
    value: "Cash flow",
    description: "Potential rent, vacancy, maintenance, management, taxes, and insurance",
  },
  {
    metric: "Property Risk",
    value: "Due diligence",
    description: "Condition, disclosures, HOA rules, permits, and local rental restrictions",
  },
  {
    metric: "Exit Assumptions",
    value: "Resale",
    description: "Comparable sales, holding period, transaction costs, and downside scenarios",
  },
]

const investmentProcess = [
  {
    step: 1,
    title: "Investment Consultation",
    description: "Comprehensive review of your investment goals, risk tolerance, and financial situation.",
  },
  {
    step: 2,
    title: "Market Analysis",
    description: "Comparison of target markets, active listings, sold comparables, and relevant local rules.",
  },
  {
    step: 3,
    title: "Property Selection",
    description: "Shortlisting properties that match your budget, use case, risk tolerance, and review criteria.",
  },
  {
    step: 4,
    title: "Due Diligence",
    description: "Thorough property analysis including inspections, financial review, and risk assessment.",
  },
  {
    step: 5,
    title: "Acquisition Support",
    description: "Complete transaction management from offer negotiation through closing.",
  },
  {
    step: 6,
    title: "Post-Closing Coordination",
    description: "Introductions to relevant property-management, insurance, maintenance, and tax professionals as needed.",
  },
]

export default function InvestmentPage() {
  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <section className="relative h-[70vh] min-h-[480px] sm:min-h-[580px] md:min-h-[720px] flex items-center justify-center text-center text-white overflow-hidden">
        <Image
          src="/service/Investment-Management.png"
          alt="Successful real estate investors with SOLD sign celebrating investment property acquisition"
          fill
          className="object-cover object-right"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Badge className="bg-[var(--coastal-accent)] text-[var(--coastal-text)] px-4 py-2 text-sm font-semibold">
              Investment Property Guidance
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-white text-center">
            Investment Property
            Guidance
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            Property research, financial scenarios, due diligence, and transaction support for California real estate investors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button
                size="lg"
                className="bg-[var(--coastal-secondary)] hover:bg-[var(--secondary-hover)] text-[#083133] px-5 sm:px-8 py-3 sm:py-4 text-sm sm:text-base"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Explore Investment Options
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-2 border-white/60 text-white hover:bg-white/10 hover:text-white px-5 sm:px-8 py-3 sm:py-4 text-sm sm:text-base"
              >
                <Phone className="h-5 w-5 mr-2" />
                Speak with Advisor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Investment analysis framework */}
        <section className="mb-12 rounded-lg bg-[var(--coastal-primary)] p-5 text-white shadow-strong sm:mb-16 sm:p-8 md:mb-20 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white">What We Analyze</h2>
            <p className="text-sm sm:text-base md:text-lg text-white/75 max-w-3xl mx-auto">
              A transparent framework for evaluating a specific property. Every output depends on the assumptions and source data reviewed with you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {marketInsights.map((insight, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--coastal-accent)] mb-2">{insight.value}</div>
                <div className="text-white/85 text-sm sm:text-base mb-1 sm:mb-2 font-semibold">{insight.metric}</div>
                <div className="text-white/65 text-xs sm:text-sm">{insight.description}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Investment Services */}
        <section className="mb-12 sm:mb-16 md:mb-20">
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4 sm:mb-6">
              Comprehensive Investment Services
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[var(--coastal-muted-text)] max-w-3xl mx-auto leading-relaxed">
              Real estate guidance throughout the search, comparison, diligence, offer, and closing process.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {investmentServices.map((service, index) => (
              <Card key={index} className="bg-[var(--surface)] shadow-medium hover:shadow-strong transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="bg-[var(--coastal-secondary)]/10 rounded-lg p-3 mr-4">
                      <service.icon className="h-8 w-8 text-[var(--coastal-secondary)]" />
                    </div>
                    <CardTitle className="text-xl text-[var(--coastal-text)]">{service.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[var(--coastal-muted-text)] text-base mb-4 leading-relaxed">
                    {service.description}
                  </CardDescription>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-[var(--coastal-muted-text)]">
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

        {/* Investment Types */}
        <section className="mb-12 sm:mb-16 md:mb-20 bg-[var(--surface)] p-5 sm:p-8 md:p-12 rounded-xl shadow-medium">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4 sm:mb-6">Investment Opportunities</h2>
            <p className="text-sm sm:text-base md:text-lg text-[var(--coastal-muted-text)] max-w-3xl mx-auto">
              Explore different types of real estate investments available in California's coastal markets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {investmentTypes.map((type, index) => (
              <Card key={index} className="bg-[var(--surface-muted)] shadow-subtle">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-lg text-[var(--coastal-text)]">{type.type}</CardTitle>
                    <Badge className="bg-[var(--coastal-primary)] text-white">{type.focus}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[var(--coastal-muted-text)] mb-4 leading-relaxed">{type.description}</CardDescription>
                  <ul className="space-y-2">
                    {type.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start text-sm text-[var(--coastal-muted-text)]">
                        <CheckCircle className="h-4 w-4 text-[var(--coastal-secondary)] mr-2 mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Investment Process */}
        <section className="mb-12 sm:mb-16 md:mb-20">
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4 sm:mb-6">Our Investment Process</h2>
            <p className="text-sm sm:text-base md:text-lg text-[var(--coastal-muted-text)] max-w-3xl mx-auto">
              A structured approach to comparing and acquiring investment property without promising a particular return.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investmentProcess.map((step, index) => (
              <Card key={index} className="bg-[var(--surface)] shadow-medium">
                <CardHeader>
                <div className="bg-[var(--coastal-primary)] rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg">
                      {step.step}
                    </div>
                  
                  <CardTitle className="text-lg text-[var(--coastal-text)]">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[var(--coastal-muted-text)] leading-relaxed">{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-12 sm:mb-16 md:mb-20">
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4 sm:mb-6">
              Why Choose Our Investment Services
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[var(--coastal-muted-text)] max-w-3xl mx-auto">
              Practical support for reviewing property facts, assumptions, and transaction risks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {investmentBenefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-[var(--coastal-primary)]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-[var(--coastal-primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--coastal-text)] mb-2">{benefit.title}</h3>
                <p className="text-[var(--coastal-muted-text)] mb-3">{benefit.description}</p>
                <div className="text-2xl font-bold text-[var(--coastal-secondary)]">{benefit.stat}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Client experiences */}
        <section className="mb-12 sm:mb-16 md:mb-20">
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4 sm:mb-6">Client Experiences</h2>
            <p className="text-sm sm:text-base md:text-lg text-[var(--coastal-muted-text)]">Read named testimonials about the guidance and transaction experience.</p>
          </div>

            <CustomerReview />
        </section>

        {/* CTA Section */}
        <section>
          <Card className="dark-gradient-bg text-white shadow-strong border-0">
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <DollarSign className="h-16 w-16 text-[var(--coastal-accent)] mx-auto mb-6" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white">Ready to Build Your Investment Portfolio?</h2>
              <p className="text-sm sm:text-base md:text-lg text-white/75 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Compare California investment properties with clear assumptions, current listing data, and licensed transaction guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-[var(--coastal-secondary)] hover:bg-[var(--secondary-hover)] text-[#083133] px-5 sm:px-8 py-3 sm:py-4 text-sm sm:text-base w-full sm:w-auto">
                  <Link href="/contact?message=I%27d%20like%20to%20discuss%20an%20investment%20property.">
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule a Consultation
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-transparent border-2 border-white/60 text-white hover:bg-white/10 hover:text-white px-5 sm:px-8 py-3 sm:py-4 text-sm sm:text-base w-full sm:w-auto">
                  <Link href="/properties">
                    <Mail className="h-5 w-5 mr-2" />
                    Browse Current Listings
                  </Link>
                </Button>
              </div>
              <p className="text-xs sm:text-sm text-white/55 mt-4 sm:mt-6">
                Complimentary consultation includes market analysis and investment opportunity assessment.
              </p>
            </CardContent>
          </Card>
        </section>

        <p className="mt-6 text-center text-sm leading-6 text-[var(--coastal-muted-text)]">
          Financial scenarios are estimates, not promises of income or appreciation. Consult qualified tax, legal,
          lending, insurance, and property-management professionals for advice in their respective fields.
        </p>
      </div>
    </div>
  )
}
