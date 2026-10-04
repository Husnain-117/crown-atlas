"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import "@/styles/sell-hero.css"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import {
  TrendingUp,
  Clock,
  Users,
  Camera,
  FileText,
  Home,
  CheckCircle,
  Calculator,
  MapPin,
  Phone,
  Mail,
  Shield,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import CustomerReview from "@/components/customer-review"
import { WhatOurClientsSayHeading } from "@/components/testimonials/WhatOurClientsSayHeading"
import { CONTACT } from "@/lib/constants/contact"

const sellingProcess = [
  {
    step: 1,
    title: "Comprehensive Property Evaluation",
    description:
      "We compare recent sales, competing inventory, property condition, and current demand to frame a listing strategy.",
    icon: Calculator,
    details: "The comparative market analysis is a broker price opinion, not a licensed appraisal.",
  },
  {
    step: 2,
    title: "Professional Marketing Strategy",
    description:
      "We create a customized marketing plan featuring professional photography, digital marketing, and targeted outreach.",
    icon: Camera,
    details: "Recommended channels and media are documented for the property before launch.",
  },
  {
    step: 3,
    title: "Offer Review & Transaction Coordination",
    description:
      "We review offers with you, discuss terms, and coordinate the transaction process.",
    icon: FileText,
    details: "We review all offers, negotiate terms, and coordinate inspections and appraisals.",
  },
  {
    step: 4,
    title: "Closing Coordination",
    description:
      "We explain the closing steps and coordinate documentation with the parties involved in the transaction.",
    icon: Home,
    details: "Complete support through escrow, final walkthrough, and key transfer.",
  },
]

const serviceAdvantages = [
  {
    title: "Comparable-Sale Context",
    description: "Recent CRMLS sales and current competition inform the initial pricing discussion.",
    icon: MapPin,
    stats: "CRMLS market inputs",
  },
  {
    title: "Property-Specific Marketing",
    description:
      "Photography, listing copy, distribution, and showing plans are selected for the property and target buyer.",
    icon: Target,
    stats: "Plan before launch",
  },
  {
    title: "Direct Communication",
    description: "Showing feedback, offer terms, deadlines, and next actions are explained throughout the listing.",
    icon: Users,
    stats: "Named point of contact",
  },
  {
    title: "Terms in Writing",
    description: "Services, compensation, estimated seller costs, and contract responsibilities are reviewed before signing.",
    icon: Shield,
    stats: "Documented representation",
  },
]

const marketPerformance = [
  {
    title: "Pricing",
    value: "",
    subtitle: "Comparable-sale analysis",
    description: "Recent sales, active competition, condition, and seller timing",
    icon: TrendingUp,
  },
  {
    title: "Marketing",
    value: "",
    subtitle: "Property-specific launch plan",
    description: "Media, listing presentation, distribution, and showing access",
    icon: Camera,
  },
  {
    title: "Negotiation",
    value: "",
    subtitle: "Offer-by-offer comparison",
    description: "Price, financing, contingencies, timing, and estimated net proceeds",
    icon: FileText,
  },
  {
    title: "Closing",
    value: "",
    subtitle: "Milestone coordination",
    description: "Disclosures, inspections, appraisal, contingencies, escrow, and handoff",
    icon: Clock,
  },
]

const frequentlyAskedQuestions = [
  {
    question: "How do you determine the optimal listing price for my property?",
    answer:
      "We prepare a Comparative Market Analysis (CMA) using recent sales, competing listings, current market conditions, and the property's features and condition. A CMA supports the pricing discussion but is not a licensed appraisal or a guarantee of the final sale price.",
  },
  {
    question: "What are your commission rates and fee structure?",
    answer:
      "Our commission structure is competitive and transparent, varying based on property value and required services. We provide a detailed breakdown of all costs upfront, including marketing expenses, and offer flexible commission options for luxury properties. There are no hidden fees, and all costs are clearly outlined in our listing agreement.",
  },
  {
    question: "What is the typical timeline for selling a property?",
    answer:
      "The timeline depends on property type, location, condition, pricing, buyer demand, financing, contingencies, and seasonality. We review current comparable listings and recent sales before discussing a realistic range for preparation, marketing, escrow, and closing.",
  },
  {
    question: "Do you provide professional staging and photography services?",
    answer:
      "We can recommend a property-preparation and media plan that may include staging consultation, professional photography, video, virtual tours, or drone footage when appropriate and lawful. Scope, provider, timing, and cost are confirmed in writing for each listing.",
  },
  {
    question: "What marketing strategies do you employ to sell properties?",
    answer:
      "The plan may include professional media, MLS distribution, major consumer listing portals, targeted digital outreach, email, print, broker outreach, and showing events. The final mix depends on the property, seller instructions, budget, and applicable advertising rules.",
  },
  {
    question: "Can you assist with simultaneous buying and selling transactions?",
    answer:
      "Absolutely. We specialize in coordinating simultaneous transactions and can provide various solutions including bridge financing options, strategic contingency planning, and timeline coordination. Our team works to minimize stress and ensure smooth transitions between properties.",
  },
  {
    question: "What support do you provide during the closing process?",
    answer:
      "We provide comprehensive support throughout the entire closing process, including coordination with escrow companies, title companies, and other professionals. We review all documentation, facilitate inspections and appraisals, and ensure all contractual obligations are met. Our team remains available to address any questions or concerns until the transaction is complete.",
  },
]

function ScrollAnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

// Scroll-animated advantages component with professional styling
function ScrollAnimatedAdvantages({ advantages }: { advantages: typeof serviceAdvantages }) {
  return (
    <section className="mb-12 sm:mb-16 md:mb-20 relative">
      {/* Section header with animation */}
      <ScrollAnimatedSection className="text-center mb-16">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-[var(--coastal-secondary)] rounded-full" />
          <span className="text-[var(--coastal-secondary)] font-semibold text-sm uppercase tracking-wider">
            Our Advantages
          </span>
          <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-[var(--coastal-secondary)] rounded-full" />
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--coastal-text)] mb-6">
          Why Choose Crown Coastal Homes
        </h2>
        <p className="text-lg sm:text-xl text-[var(--coastal-muted-text)] max-w-3xl mx-auto leading-relaxed">
          We combine current market research, a documented marketing plan, and personalized communication throughout
          the listing process.
        </p>
      </ScrollAnimatedSection>

      {/* Animated cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {advantages.map((advantage) => (
          <div
            key={advantage.title}
          >
            <Card className="
              h-full group relative overflow-hidden
              bg-[var(--surface)] 
              border border-[var(--coastal-border)]
              shadow-lg hover:shadow-2xl
              transition-all duration-500 ease-out
              hover:-translate-y-2 hover:border-[var(--coastal-secondary)]/30
            ">
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--coastal-secondary)]/0 via-transparent to-[var(--coastal-accent)]/0 group-hover:from-[var(--coastal-secondary)]/5 group-hover:to-[var(--coastal-accent)]/5 transition-all duration-500" />
              
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-[-1px] rounded-lg bg-gradient-to-r from-[var(--coastal-secondary)]/20 via-[var(--coastal-accent)]/20 to-[var(--coastal-secondary)]/20 blur-sm" />
              </div>

              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-start gap-4">
                  {/* Animated icon container */}
                  <div className="
                    relative flex-shrink-0
                    bg-[var(--coastal-secondary)]/10
                    rounded-2xl p-4
                    group-hover:scale-110 group-hover:rotate-3
                    transition-all duration-500 ease-out
                    shadow-sm group-hover:shadow-lg group-hover:shadow-[var(--coastal-secondary)]/20
                  ">
                    <advantage.icon className="h-8 w-8 text-[var(--coastal-secondary)] group-hover:text-[var(--coastal-secondary)] transition-colors duration-300" />
                    
                    {/* Pulse effect */}
                    <div className="absolute inset-0 rounded-2xl bg-[var(--coastal-secondary)]/20 animate-ping opacity-0 group-hover:opacity-75" style={{ animationDuration: '2s' }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-bold text-[var(--coastal-text)] mb-2 transition-colors duration-300">
                      {advantage.title}
                    </CardTitle>
                    
                    {/* Stats badge */}
                    <div className="
                      inline-flex items-center gap-2 
                      px-3 py-1.5 rounded-full 
                      bg-[var(--chip-active)]
                      border border-[var(--coastal-secondary)]/20
                      group-hover:border-[var(--coastal-secondary)]/40
                      transition-all duration-300
                    ">
                      <CheckCircle className="h-4 w-4 text-[var(--coastal-secondary)]" />
                      <span className="text-sm font-semibold text-[var(--coastal-secondary)]">
                        {advantage.stats}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 pt-0">
                <CardDescription className="
                  text-[var(--coastal-muted-text)]
                  text-base leading-relaxed
                  transition-colors duration-300
                ">
                  {advantage.description}
                </CardDescription>

                {/* Bottom accent line */}
                <div className="
                  mt-6 h-1 rounded-full overflow-hidden
                  bg-[var(--surface-muted)]
                ">
                  <div className="
                    h-full w-0 group-hover:w-full 
                    bg-gradient-to-r from-[var(--coastal-secondary)] to-[var(--coastal-accent)]
                    transition-all duration-700 ease-out
                  " />
                </div>
              </CardContent>

            </Card>
          </div>
        ))}
      </div>
    </section>
  )
}

// Scroll-animated steps component (like Severstal website)
function ScrollAnimatedSteps({ steps }: { steps: typeof sellingProcess }) {
  const [activeStep, setActiveStep] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const sectionTop = sectionRef.current.offsetTop
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight

      // Calculate which step should be active based on scroll position
      stepRefs.current.forEach((stepEl, index) => {
        if (!stepEl) return
        
        const stepTop = stepEl.offsetTop + sectionTop
        const stepHeight = stepEl.offsetHeight
        const triggerPoint = scrollY + windowHeight * 0.4

        if (triggerPoint >= stepTop && triggerPoint < stepTop + stepHeight + 100) {
          setActiveStep(index)
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="mb-12 sm:mb-16 md:mb-20" ref={sectionRef}>
      <ScrollAnimatedSection className="text-center mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-6">Our Professional Process</h2>
        <p className="text-lg sm:text-xl text-[var(--coastal-muted-text)] max-w-3xl mx-auto">
          A four-phase approach for preparing, presenting, negotiating, and closing a property sale.
        </p>
      </ScrollAnimatedSection>
      
      {/* Scroll-animated steps container */}
      <div className="relative max-w-3xl mx-auto">
        {/* Vertical progress line */}
        <div className="absolute left-6 sm:left-8 md:left-12 top-0 bottom-0 w-1 bg-[var(--coastal-border)] rounded-full overflow-hidden">
          <div
            className="w-full bg-gradient-to-b from-[var(--coastal-primary)] to-[var(--coastal-secondary)] transition-all duration-500 ease-out rounded-full"
            style={{
              height: `${((activeStep + 1) / steps.length) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isActive = index === activeStep
            const isPast = index < activeStep
            
            return (
              <div
                key={index}
                ref={(el) => { stepRefs.current[index] = el }}
                className={`
                  relative pl-16 sm:pl-20 md:pl-28 transition-all duration-500 ease-out
                  ${isActive ? 'transform scale-100' : 'transform scale-[0.98]'}
                `}
              >
                {/* Step number circle */}
                <div
                  className={`
                    absolute left-0 top-6 w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center
                    transition-all duration-500 ease-out z-10
                    ${isActive
                      ? 'bg-[var(--coastal-primary)] text-white shadow-xl scale-110'
                      : isPast
                        ? 'bg-[var(--coastal-secondary)] text-white border-2 border-[var(--coastal-secondary)] shadow-lg'
                        : 'bg-[var(--surface)] text-[var(--coastal-text)] border-2 border-[var(--coastal-primary)] shadow-md'
                    }
                  `}
                >
                  <span className={`font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl ${isActive ? 'text-3xl sm:text-4xl md:text-5xl' : ''}`}>
                    {step.step}
                  </span>
                </div>

                {/* Card content */}
                <div 
                  className={`
                    rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 transition-all duration-500 ease-out relative
                    ${isActive 
                      ? 'bg-[var(--coastal-primary)] shadow-2xl' 
                      : 'bg-[var(--surface)] shadow-md border border-[var(--coastal-border)]'
                    }
                  `}
                >
                  {/* Step label */}
                  <span className={`
                    text-xs font-bold uppercase tracking-widest mb-3 block
                    ${isActive ? 'text-white' : 'text-[var(--coastal-secondary)]'}
                  `}>
                    Step {step.step}
                  </span>

                  {/* Title */}
                  <h3 className={`
                    text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 leading-tight
                    ${isActive ? 'text-white' : 'text-[var(--coastal-text)]'}
                  `}>
                    {step.title}
                  </h3>

                  {/* Description - only show expanded content for active step */}
                  <div className={`
                    overflow-hidden transition-all duration-500 ease-out
                    ${isActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 md:max-h-96 md:opacity-100'}
                  `}>
                    <p className={`
                      text-base md:text-lg mb-4 leading-relaxed
                      ${isActive ? 'text-white/80' : 'text-[var(--coastal-muted-text)]'}
                    `}>
                      {step.description}
                    </p>
                    
                    <p className={`
                      text-sm md:text-base leading-relaxed border-l-4 pl-4 italic
                      ${isActive 
                        ? 'text-white/70 border-[var(--coastal-accent)]' 
                        : 'text-[var(--coastal-muted-text)] border-[var(--coastal-accent)]/50'
                      }
                    `}>
                      {step.details}
                    </p>
                  </div>

                  {/* Icon badge */}
                  <div className={`
                    absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${isActive 
                      ? 'bg-[var(--coastal-accent)]/20' 
                      : 'bg-[var(--coastal-secondary)]/10'
                    }
                  `}>
                    <step.icon className={`
                      h-5 w-5 md:h-6 md:w-6
                      ${isActive ? 'text-[var(--coastal-accent)]' : 'text-[var(--coastal-secondary)]'}
                    `} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function SellPageClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    propertyType: "",
    timeframe: "",
    currentValue: "",
    message: "",
    company: "",
  })

  const [formSubmitted, setFormSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const formStartedAt = useRef(Date.now())

  // Hero carousel (simple, SSR-friendly)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [isDesktop, setIsDesktop] = useState(false)

  // Carousel images
  const carouselImages = [
    "/coursel.png",
    "/coursel2.png",
    "/coursel3.png"
  ]

  // Track screen size for conditional rendering
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
    if (carouselImages.length <= 1) return
    const timer = window.setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselImages.length)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [carouselImages.length])

  const goPrev = () => {
    const len = carouselImages.length
    if (len <= 1) return
    setCarouselIndex((prev) => (prev - 1 + len) % len)
  }

  const goNext = () => {
    const len = carouselImages.length
    if (len <= 1) return
    setCarouselIndex((prev) => (prev + 1) % len)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    const message = [
      "Seller market analysis request",
      `Property address: ${formData.address}`,
      `Property type: ${formData.propertyType || "Not provided"}`,
      `Preferred timeline: ${formData.timeframe || "Not provided"}`,
      `Estimated value range: ${formData.currentValue || "Not provided"}`,
      `Additional information: ${formData.message || "None"}`,
    ].join("\n")

    try {
      const response = await fetch("/api/contact-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message,
          source: "seller_market_analysis",
          pageUrl: window.location.href,
          company: formData.company,
          __top: Date.now() - formStartedAt.current,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "We could not send your request.")
      }

      setFormSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We could not send your request.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-[var(--bg)] min-h-screen transition-colors duration-300">
      {/* Hero Section - Sell Your Home */}
      <section id="ccSellPageHero" className="cc-sell-hero-section">
        {/* Background Carousel */}
        <div className="cc-sell-hero-bg">
          {carouselImages.map((image, index) => (
            <div
              key={image}
              className={`cc-sell-hero-slide ${index === carouselIndex ? 'cc-active' : ''}`}
            >
              <Image
                src={image}
                alt="Luxury coastal homes"
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
            </div>
          ))}

          {/* Navigation Arrows - Only show on desktop */}
          {isDesktop && (
            <>
              <button
                type="button"
                aria-label="Previous slide"
                onClick={goPrev}
                className="cc-sell-hero-arrow cc-sell-hero-arrow-left"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={goNext}
                className="cc-sell-hero-arrow cc-sell-hero-arrow-right"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Carousel Dots - Only show on desktop */}
          {isDesktop && (
            <div className="cc-sell-hero-dots">
              {carouselImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setCarouselIndex(i)}
                  className={`cc-sell-hero-dot ${i === carouselIndex ? 'cc-active' : ''}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Gradient Overlay */}
        <div className="cc-sell-hero-overlay" />

        {/* Content Container */}
        <div className="cc-sell-hero-container">
          {/* Breadcrumbs */}
          <div className="cc-sell-hero-breadcrumbs">
            <Breadcrumbs items={[{ label: "Sell Your Home", href: "/sell" }]} />
          </div>

          {/* Main Content */}
          <div className="cc-sell-hero-content">
            <h1 className="cc-sell-hero-heading">
              Sell Your Coastal Home
            </h1>
            
            <p className="cc-sell-hero-description">
              Comparable-sale analysis, property-specific marketing, offer review, and closing coordination.
            </p>
          </div>
          <div className="cc-sell-hero-cta">
            <Button
              size="lg"
              className="cc-sell-hero-btn cc-sell-hero-btn-primary"
              onClick={() => document.getElementById("valuation-form")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                fontWeight: 700,
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)'
              }}
            >
              <Calculator className="h-5 w-5 mr-2" />
              <span>Request Market Analysis</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="cc-sell-hero-btn cc-sell-hero-btn-secondary"
              onClick={() => document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                fontWeight: 600,
                backdropFilter: 'blur(12px)',
                boxShadow: '0 2px 8px rgba(255, 255, 255, 0.15)'
              }}
            >
              <Phone className="h-5 w-5 mr-2" />
              <span>Schedule Consultation</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Seller strategy overview */}
      <section className="py-16 sm:py-20 bg-[var(--coastal-primary)] text-white transition-colors duration-300">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">How We Build the Selling Strategy</h2>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto">
              Decisions are tied to current market evidence, the property, and the seller's priorities.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {marketPerformance.map((metric, index) => (
              <Card key={index} className="bg-white/10 border-white/20 text-center transition-colors duration-300 h-full flex flex-col">
                <CardContent className="pt-4 sm:pt-6 flex flex-col flex-grow">
                  <metric.icon className="h-10 w-10 sm:h-12 sm:w-12 text-[var(--coastal-accent)] mx-auto mb-3 sm:mb-4" />
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--coastal-accent)] mb-2">{metric.title}</div>
                  {metric.value && (
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--coastal-accent)] mb-2">{metric.value}</div>
                  )}
                  {metric.subtitle && (
                    <div className="text-white/80 text-sm sm:text-base mb-2 font-semibold">{metric.subtitle}</div>
                  )}
                  {metric.description && (
                    <div className="text-white/60 text-xs sm:text-sm mt-2">{metric.description}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        {/* Service Advantages Section - Scroll Animated */}
        <ScrollAnimatedAdvantages advantages={serviceAdvantages} />

        {/* Selling Process Section - Scroll Animated */}
        <ScrollAnimatedSteps steps={sellingProcess} />

        {/* Property Valuation Form Section */}
        <ScrollAnimatedSection>
          <section id="valuation-form" className="mb-12 sm:mb-16 md:mb-20">
          <Card className="bg-[var(--surface)] shadow-strong transition-colors duration-300">
            <CardHeader className="text-center pb-6 sm:pb-8 px-4 sm:px-6 md:px-8 lg:px-12 pt-6 sm:pt-8">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4">
                Request a Comparative Market Analysis
              </CardTitle>
              <CardDescription className="text-base sm:text-lg text-[var(--coastal-muted-text)] max-w-3xl mx-auto leading-relaxed">
                Request a broker-prepared estimate using comparable sales, competing listings, property details, and
                current market conditions. This is not a licensed appraisal.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 md:px-8 lg:px-12 pb-8 sm:pb-10 md:pb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                <div className="pr-2 sm:pr-4 lg:pr-8">
                  <h3 className="text-xl sm:text-2xl font-semibold text-[var(--coastal-text)] mb-4 sm:mb-6">What You'll Receive:</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-[var(--coastal-secondary)] mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-[var(--coastal-text)]">Detailed Market Analysis</span>
                        <p className="text-[var(--coastal-muted-text)] text-sm">
                          Comprehensive evaluation based on recent comparable sales
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-[var(--coastal-secondary)] mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-[var(--coastal-text)]">Strategic Pricing Recommendations</span>
                        <p className="text-[var(--coastal-muted-text)] text-sm">Optimal pricing strategy for current market conditions</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-[var(--coastal-secondary)] mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-[var(--coastal-text)]">Initial Seller Discussion</span>
                        <p className="text-[var(--coastal-muted-text)] text-sm">Review goals, timing, condition, and next steps before any listing agreement</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-[var(--coastal-secondary)] mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-[var(--coastal-text)]">Personalized Marketing Strategy</span>
                        <p className="text-[var(--coastal-muted-text)] text-sm">Customized approach for your specific property</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--surface-muted)] p-6 sm:p-8 md:p-10 lg:p-12 rounded-xl transition-colors duration-300">
                  {!formSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="absolute left-[-10000px] h-px w-px overflow-hidden" aria-hidden="true">
                        <Label htmlFor="seller-company">Company</Label>
                        <Input
                          id="seller-company"
                          name="company"
                          value={formData.company}
                          onChange={(e) => handleChange("company", e.target.value)}
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-sm font-semibold text-[var(--coastal-text)]">
                            Full Name *
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-sm font-semibold text-[var(--coastal-text)]">
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className="mt-1"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone" className="text-sm font-semibold text-[var(--coastal-text)]">
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="propertyType" className="text-sm font-semibold text-[var(--coastal-text)]">
                            Property Type
                          </Label>
                          <Select onValueChange={(value) => handleChange("propertyType", value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single-family">Single Family Residence</SelectItem>
                              <SelectItem value="condo">Condominium</SelectItem>
                              <SelectItem value="townhouse">Townhouse</SelectItem>
                              <SelectItem value="multi-family">Multi-Family Property</SelectItem>
                            <SelectItem value="luxury-estate">Luxury Estate</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="land">Land / Lot</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address" className="text-sm font-semibold text-[var(--coastal-text)]">
                          Property Address *
                        </Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleChange("address", e.target.value)}
                          placeholder="Street address, city, state, ZIP code"
                          className="mt-1"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="timeframe" className="text-sm font-semibold text-[var(--coastal-text)]">
                            Preferred Timeline
                          </Label>
                          <Select onValueChange={(value) => handleChange("timeframe", value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="When would you like to sell?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Immediately</SelectItem>
                              <SelectItem value="3-months">Within 3 months</SelectItem>
                              <SelectItem value="6-months">Within 6 months</SelectItem>
                              <SelectItem value="1-year">Within 1 year</SelectItem>
                              <SelectItem value="exploring">Exploring options</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="currentValue" className="text-sm font-semibold text-[var(--coastal-text)]">
                            Estimated Property Value
                          </Label>
                          <Select onValueChange={(value) => handleChange("currentValue", value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Estimated current value" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="under-500k">Under $500,000</SelectItem>
                              <SelectItem value="500k-1m">$500,000 - $1,000,000</SelectItem>
                              <SelectItem value="1m-2m">$1,000,000 - $2,000,000</SelectItem>
                              <SelectItem value="2m-5m">$2,000,000 - $5,000,000</SelectItem>
                              <SelectItem value="over-5m">Over $5,000,000</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-sm font-semibold text-[var(--coastal-text)]">
                          Additional Information
                        </Label>
                        <Textarea
                          id="message"
                          rows={4}
                          value={formData.message}
                          onChange={(e) => handleChange("message", e.target.value)}
                          placeholder="Please share any unique features, recent improvements, or specific goals for your property sale..."
                          className="mt-1"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-[var(--coastal-primary)] hover:bg-[var(--primary-hover)] text-white py-3 text-sm sm:text-sm font-semibold"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Sending Request..." : "Request Market Analysis"}
                      </Button>
                      {submitError && (
                        <p className="text-sm text-red-600 dark:text-red-400 text-center" role="alert">
                          {submitError} Call {CONTACT.phone.display} or email {CONTACT.email.display}.
                        </p>
                      )}
                      <p className="text-xs text-[var(--coastal-muted-text)] text-center">
                        By submitting, you agree to be contacted about this property request. See our{" "}
                        <a href="/privacy" className="underline underline-offset-2 hover:text-[var(--coastal-primary)]">
                          privacy policy
                        </a>{" "}
                        for details.
                      </p>
                    </form>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-[var(--coastal-secondary)] mx-auto mb-4" />
                      <h3 className="text-2xl font-semibold text-[var(--coastal-text)] mb-2">Thank You!</h3>
                      <p className="text-[var(--coastal-muted-text)] mb-4">
                        Your market analysis request was delivered. We will review the property details and follow up
                        using the contact information you provided.
                      </p>
                      <Button
                        onClick={() => {
                          setFormSubmitted(false)
                          setSubmitError(null)
                          formStartedAt.current = Date.now()
                        }}
                        variant="outline"
                        className="border-[var(--coastal-secondary)] text-[var(--coastal-secondary)]"
                      >
                        Submit Another Request
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        </ScrollAnimatedSection>

        {/* Enhanced Testimonials Section */}
        <ScrollAnimatedSection>
          <section className="py-16 sm:py-20 md:py-24 bg-[var(--surface)] theme-transition mb-12 sm:mb-16 md:mb-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-8 h-[2px] bg-gradient-primary rounded-full"></div>
                  <span className="text-[var(--coastal-primary)] font-semibold text-sm uppercase tracking-wider">Honest Reviews</span>
                  <div className="w-8 h-[2px] bg-gradient-primary rounded-full"></div>
                </div>
                <WhatOurClientsSayHeading
                  h2ClassName="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--coastal-text)] mb-6 text-balance theme-transition"
                />
              </div>

              <CustomerReview />
            </div>
          </section>
        </ScrollAnimatedSection>

        {/* Contact Section */}
        <ScrollAnimatedSection>
          <section id="contact-section" className="mb-12 sm:mb-16 md:mb-20">
          <Card className="bg-[var(--surface)] shadow-strong transition-colors duration-300">
            <CardHeader className="text-center pb-6 sm:pb-8">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4">
                Ready to Begin Your Property Sale?
              </CardTitle>
              <CardDescription className="text-base sm:text-lg text-[var(--coastal-muted-text)] max-w-3xl mx-auto">
                Contact Reza to discuss your property, timing, and the evidence needed for an informed listing plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-center">
                <div className="p-4 sm:p-6">
                  <Phone className="h-10 w-10 sm:h-12 sm:w-12 text-[var(--coastal-secondary)] mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-[var(--coastal-text)] mb-2">Phone Consultation</h3>
                  <p className="text-[var(--coastal-muted-text)] mb-3 text-sm">Speak directly with a licensed agent</p>
                  <a href={CONTACT.phone.href} className="text-[var(--coastal-secondary)] hover:underline font-semibold text-base sm:text-lg">
                  {CONTACT.phone.display}
                  </a>
                </div>
                <div className="p-4 sm:p-6">
                  <Mail className="h-10 w-10 sm:h-12 sm:w-12 text-[var(--coastal-secondary)] mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-[var(--coastal-text)] mb-2">Email Inquiry</h3>
                  <p className="text-[var(--coastal-muted-text)] mb-3 text-sm">Receive detailed information via email</p>
                  <a
                    href={CONTACT.email.href}
                    className="text-[var(--coastal-secondary)] hover:underline font-semibold text-base sm:text-lg"
                  >
                   {CONTACT.email.display}
                  </a>
                </div>
                <div className="p-4 sm:p-6">
                  <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-[var(--coastal-secondary)] mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-[var(--coastal-text)] mb-2">Office Visit</h3>
                  <p className="text-[var(--coastal-muted-text)] mb-3 text-sm">Schedule an in-person consultation</p>
                  <p className="text-[var(--coastal-secondary)] font-semibold text-base sm:text-lg">CA DRE #02211952</p>
                </div>
                {/* <div className="p-6">
                  <FileText className="h-12 w-12 text-brand-pacificTeal mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-brand-midnightCove mb-2">Free Resources</h3>
                  <p className="text-gray-600 mb-3 text-sm">Download helpful guides and checklists</p>
                  <Link href="/sell/resources" className="text-brand-pacificTeal hover:underline font-semibold">
                    Browse Resources
                  </Link>
                </div> */}
              </div>
            </CardContent>
          </Card>
        </section>
        </ScrollAnimatedSection>

        {/* FAQ Section */}
        <ScrollAnimatedSection>
          <section>
          <Card className="bg-[var(--surface)] shadow-medium transition-colors duration-300">
            <CardHeader className="text-center px-4 sm:px-6">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4">
                Frequently Asked Questions
              </CardTitle>
              <CardDescription className="text-base sm:text-lg text-[var(--coastal-muted-text)]">
                Find answers to common questions about our property selling services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {frequentlyAskedQuestions.map((faq, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-lg text-left hover:text-[var(--coastal-secondary)] text-[var(--coastal-text)] font-semibold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[var(--coastal-muted-text)] leading-relaxed pt-2 text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>
        </ScrollAnimatedSection>
      </div>
    </div>
  )
}
