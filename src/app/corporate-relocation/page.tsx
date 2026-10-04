'use client'

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertCircle, Phone, Mail, MapPin, Home, Users, FileText, Building2, CheckCircle, Loader2 } from "lucide-react"
import { useRef, useState } from "react"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { CONTACT } from "@/lib/constants/contact"

const EMPTY_FORM_DATA = {
  companyName: "",
  hrContactName: "",
  hrEmail: "",
  hrPhone: "",
  numberOfEmployees: "",
  relocationTimeline: "",
  destinationMarkets: "",
  serviceType: "",
  additionalNotes: ""
}

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
  viewport: { once: true, margin: "-100px" }
}

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.15
    }
  },
  viewport: { once: true }
}

export default function CorporateRelocationPage() {
  const [formData, setFormData] = useState(EMPTY_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const formStartedAt = useRef(Date.now())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setIsSubmitted(false)
    setSubmitError(null)

    const honeypot = String(new FormData(e.currentTarget as HTMLFormElement).get("website") || "")

    try {
      const response = await fetch("/api/corporate-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          website: honeypot,
          __top: Date.now() - formStartedAt.current,
          pageUrl: window.location.href,
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to send your inquiry.")
      }

      setFormData(EMPTY_FORM_DATA)
      setIsSubmitted(true)
      formStartedAt.current = Date.now()
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to send your inquiry. Please call or email us directly."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[var(--bg)] theme-transition">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#212B36] dark:bg-[#212B36] light:bg-[var(--bg)] theme-transition">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumbs */}
          <div className="mb-6 md:mb-8">
            <Breadcrumbs items={[{ label: "Corporate Relocation", href: "/corporate-relocation" }]} />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-8 md:w-12 h-[2px] bg-gradient-to-r from-transparent via-[#C5A46D] to-transparent rounded-full"></div>
              <span className="text-[#C5A46D] font-semibold text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.2em]">Corporate Relocation Services</span>
              <div className="w-8 md:w-12 h-[2px] bg-gradient-to-r from-transparent via-[#C5A46D] to-transparent rounded-full"></div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight text-white dark:text-white light:text-[var(--coastal-text)] theme-transition">
              Where <span className="italic text-[#C5A46D]">California</span><br />
              Becomes<br />
              Your Employees' Home
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 dark:text-white/80 light:text-[var(--coastal-muted-text)] mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed theme-transition px-4">
              Real estate support for HR teams and relocating professionals, from search criteria and tours through offer or lease coordination.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4">
              <Button
                size="lg"
                className="w-full sm:w-auto px-6 md:px-8 py-4 md:py-6 text-base md:text-lg bg-[#C5A46D] hover:bg-[#D4B574] text-white rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl"
                onClick={() => {
                  const element = document.getElementById('contact-form')
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }}
              >
                <Mail className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                <span className="whitespace-nowrap">Submit a Corporate Inquiry</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full sm:w-auto px-6 md:px-8 py-4 md:py-6 text-base md:text-lg bg-white/10 hover:bg-white/20 dark:bg-white/10 dark:hover:bg-white/20 light:bg-[var(--coastal-primary)]/10 light:hover:bg-[var(--coastal-primary)]/20 text-white dark:text-white light:text-[var(--coastal-primary)] border-2 border-white/30 dark:border-white/30 light:border-[var(--coastal-primary)]/30 hover:border-[#C5A46D] backdrop-blur-sm rounded-xl font-bold transition-all duration-300 theme-transition"
              >
                <a href={CONTACT.phone.href} className="flex items-center justify-center">
                  <Phone className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  <span className="whitespace-nowrap">{CONTACT.phone.display}</span>
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#212B36] text-white py-6 md:py-8 border-t border-white/10 theme-transition">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            <motion.div {...fadeInUp}>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#C5A46D] mb-1 md:mb-2">Buy &amp; Rent</div>
              <div className="text-xs sm:text-sm md:text-base text-white/80 uppercase tracking-wide md:tracking-wider px-2">Relocation Paths</div>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#C5A46D] mb-1 md:mb-2">CRMLS</div>
              <div className="text-xs sm:text-sm md:text-base text-white/80 uppercase tracking-wide md:tracking-wider px-2">Listing Source</div>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#C5A46D] mb-1 md:mb-2">California</div>
              <div className="text-xs sm:text-sm md:text-base text-white/80 uppercase tracking-wide md:tracking-wider px-2">Service Area</div>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#C5A46D] mb-1 md:mb-2">02211952</div>
              <div className="text-xs sm:text-sm md:text-base text-white/80 uppercase tracking-wide md:tracking-wider px-2">CA DRE License</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Crown Coastal Section */}
      <section className="py-20 md:py-24 bg-[var(--surface)] theme-transition">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Image */}
            <motion.div {...fadeInUp} className="relative order-2 lg:order-1">
              <div className="relative h-[400px] md:h-[500px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/luxury-modern-house-exterior.png"
                  alt="Luxury coastal California home exterior"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                
                {/* Floating badge */}
                <div className="absolute bottom-8 left-8 bg-[#C5A46D] text-white px-6 py-3 rounded-xl font-bold shadow-xl">
                  Coordinated Relocation Support
                </div>
              </div>
            </motion.div>

            {/* Right - Content */}
            <motion.div {...fadeInUp} className="space-y-6 md:space-y-8 order-1 lg:order-2">
              <div>
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-8 h-[2px] bg-gradient-to-r from-[#C5A46D] to-transparent rounded-full"></div>
                  <span className="text-[#C5A46D] font-semibold text-sm uppercase tracking-wider">Why Crown Coastal</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--coastal-text)] mb-6 theme-transition">
                  A Real Estate Partner<br />
                  Built for <span className="italic text-[#C5A46D]">Corporate Teams</span>
                </h2>
                <p className="text-lg text-[var(--coastal-muted-text)] leading-relaxed theme-transition">
                  We specialize in the single most stressful part of any corporate move: helping your employees find a home they love, fast. Our concierge-level service means no waiting and no uncertainty, just dedicated guidance from first call to keys in hand.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#C5A46D]/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-[#C5A46D]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--coastal-text)] mb-2 theme-transition">Direct Inquiry Review</h3>
                  <p className="text-[var(--coastal-muted-text)] theme-transition">Each corporate inquiry receives a direct follow-up to confirm priorities, timing, and the most useful next step.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#C5A46D]/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-[#C5A46D]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--coastal-text)] mb-2 theme-transition">School District & Neighborhood Guidance</h3>
                    <p className="text-[var(--coastal-muted-text)] theme-transition">We match employees to communities based on school ratings, commute lifestyle, and budget — not just listing availability.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#C5A46D]/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-[#C5A46D]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--coastal-text)] mb-2 theme-transition">Temporary Housing & Rental Assistance</h3>
                    <p className="text-[var(--coastal-muted-text)] theme-transition">Corporate rental placement and bridge housing coordination while permanent housing is secured — zero gap coverage means no missed days of work.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#C5A46D]/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-[#C5A46D]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--coastal-text)] mb-2 theme-transition">In-Person Area Orientation Tours</h3>
                    <p className="text-[var(--coastal-muted-text)] theme-transition">Before committing to any neighborhood, your employee gets a curated in-person tour with local insights unavailable online.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-[var(--bg)] theme-transition">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-8 md:w-12 h-[2px] bg-gradient-to-r from-transparent to-[#C5A46D] rounded-full"></div>
              <span className="text-[#C5A46D] font-semibold text-xs md:text-sm uppercase tracking-wider">Our Services</span>
              <div className="w-8 md:w-12 h-[2px] bg-gradient-to-l from-transparent to-[#C5A46D] rounded-full"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--coastal-text)] mb-4 md:mb-6 theme-transition px-4">
              Everything Your Team Needs,<br />
              <span className="italic text-[#C5A46D]">All in One Place</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-[var(--coastal-muted-text)] max-w-3xl mx-auto leading-relaxed theme-transition px-4">
              From HR briefing to closing day, our end-to-end relocation suite eliminates the friction of moving to California.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {[
              {
                icon: MapPin,
                title: "Property Search & Tours",
                description: "Curated listings matched to employee preferences, commute requirements, budget, and lifestyle. Includes virtual and in-person tour coordination across all California markets.",
                badge: "Buy · Rent · Lease",
                color: "#12324A"
              },
              {
                icon: Home,
                title: "Neighborhood Orientation",
                description: "In-person area tours covering schools, grocery, commute corridors, dining, parks, and community culture — so employees feel at home before they move in.",
                badge: "Included with Every Relocation",
                color: "#12324A"
              },
              {
                icon: Building2,
                title: "Temporary Housing",
                description: "Short-term furnished rental placement while your employee finds permanent housing. Zero-gap coverage means no missed days of work.",
                badge: "Short-Term · Bridge Housing",
                color: "#12324A"
              },
              {
                icon: Users,
                title: "School District Guidance",
                description: "Great Schools ratings, magnet programs, private school options — all mapped to every neighborhood under consideration.",
                badge: "K–12 · Private · Charter",
                color: "#12324A"
              },
              {
                icon: FileText,
                title: "Transaction Management",
                description: "Contract negotiation, disclosure review, inspection coordination, and escrow management — we guide every step through to a successful, on-time closing.",
                badge: "Purchase · Lease · Both",
                color: "#12324A"
              },
              {
                icon: Phone,
                title: "HR Coordinator Support",
                description: "Regular status updates to HR, direct invoicing to the company, and policy-aligned relocation packages. We speak your language and respect your timelines.",
                badge: "Reporting · Invoicing · Compliance",
                color: "#12324A"
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group bg-[var(--surface)] rounded-xl md:rounded-2xl p-6 md:p-8 border border-[var(--coastal-border)] hover:border-[#C5A46D]/30 transition-all duration-300 hover:shadow-xl theme-transition"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#212B36] flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="h-7 w-7 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-[var(--coastal-text)] mb-2 md:mb-3 theme-transition">{service.title}</h3>
                <p className="text-sm md:text-base text-[var(--coastal-muted-text)] leading-relaxed mb-3 md:mb-4 theme-transition">{service.description}</p>
                <div className="inline-block px-3 py-1.5 rounded-full bg-[#C5A46D]/10 border border-[#C5A46D]/20 text-xs md:text-sm font-semibold text-[#C5A46D]">
                  {service.badge}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-[#212B36] text-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div {...fadeInUp} className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-8 md:w-12 h-[2px] bg-gradient-to-r from-transparent via-[#C5A46D] to-transparent rounded-full"></div>
              <span className="text-[#C5A46D] font-semibold text-xs md:text-sm uppercase tracking-wider">How It Works</span>
              <div className="w-8 md:w-12 h-[2px] bg-gradient-to-r from-transparent via-[#C5A46D] to-transparent rounded-full"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 px-4">
              From First Contact to<br />
              <span className="italic text-[#C5A46D]">Keys in Hand</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed px-4">
              A documented four-step process that keeps the HR contact and relocating employee informed from inquiry through move coordination.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[
                {
                  step: "1",
                  title: "Company Inquiry",
                  description: "HR submits employee details, timeline, and budget. We review the request and follow up with a tailored next-step plan."
                },
                {
                  step: "2",
                  title: "Employee Introduction",
                  description: "Reza personally connects with the relocating employee — discovery call, preferences mapped, and a search strategy built."
                },
                {
                  step: "3",
                  title: "Curated Property Search",
                  description: "Neighborhood tours, curated listings, and school district walkthroughs until the right home is identified."
                },
                {
                  step: "4",
                  title: "Guided to Closing",
                  description: "Full transaction management through offer, inspections, and escrow. HR receives closing confirmation and status updates throughout."
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="text-center">
                    <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 rounded-full bg-[#C5A46D] flex items-center justify-center text-xl md:text-2xl font-bold shadow-xl">
                      {item.step}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 px-2">{item.title}</h3>
                    <p className="text-sm md:text-base text-white/70 leading-relaxed px-2">{item.description}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-8 left-[calc(100%+1rem)] w-8 h-[2px] bg-[#C5A46D]/30"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-[var(--bg)] theme-transition">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-8 md:w-12 h-[2px] bg-gradient-to-r from-transparent to-[#C5A46D] rounded-full"></div>
              <span className="text-[#C5A46D] font-semibold text-xs md:text-sm uppercase tracking-wider">For HR Teams</span>
              <div className="w-8 md:w-12 h-[2px] bg-gradient-to-l from-transparent to-[#C5A46D] rounded-full"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--coastal-text)] mb-4 md:mb-6 theme-transition px-4">
              Frequently Asked <span className="italic text-[#C5A46D]">Questions</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-[var(--coastal-muted-text)] max-w-3xl mx-auto leading-relaxed theme-transition px-4">
              Everything your HR department needs to know before partnering with Crown Coastal.
            </p>
          </motion.div>

          <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  question: "Is there a contract or minimum volume requirement?",
                  answer: "No. We work on a per-employee basis with no long-term contracts or minimum commitments. Whether you're relocating one employee or fifty, the service level remains the same."
                },
                {
                  question: "Can you invoice the company directly instead of the employee?",
                  answer: "Yes. We offer direct corporate billing and can structure invoicing to align with your relocation policy and reimbursement timelines."
                },
                {
                  question: "How quickly can you start after we submit an inquiry?",
                  answer: "After receiving the employee details, timeline, and destination markets, we follow up directly to confirm availability and schedule the first discovery call."
                },
                {
                  question: "What if the employee needs to rent first before buying?",
                  answer: "We handle both. Many relocating employees prefer to rent temporarily while they explore neighborhoods. We coordinate short-term rentals, bridge housing, and eventual purchase — all under one roof."
                },
                {
                  question: "What California markets do you serve?",
                  answer: "We support relocations across California, including San Diego, Los Angeles, Orange County, the Inland Empire, the Bay Area, and the Central Coast. Current inventory is searched through CRMLS-backed listing data."
                },
                {
                  question: "Do you provide progress updates to HR?",
                  answer: "Yes. We provide regular status updates throughout the relocation process and can customize reporting frequency based on your preferences. You'll always know where things stand."
                }
              ].map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-[var(--surface)] border border-[var(--coastal-border)] rounded-xl md:rounded-2xl px-4 md:px-6 theme-transition"
                >
                  <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-[var(--coastal-text)] hover:text-[#C5A46D] transition-colors theme-transition py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm md:text-base text-[var(--coastal-muted-text)] leading-relaxed pt-2 pb-4 theme-transition">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-16 md:py-20 lg:py-24 bg-[var(--surface)] theme-transition scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16">
            {/* Left - Form */}
            <motion.div {...fadeInUp}>
              <div className="inline-flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="w-6 md:w-8 h-[2px] bg-gradient-to-r from-[#C5A46D] to-transparent rounded-full"></div>
                <span className="text-[#C5A46D] font-semibold text-xs md:text-sm uppercase tracking-wider">Get Started</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4 md:mb-6 theme-transition">
                Submit a<br />
                <span className="italic text-[#C5A46D]">Corporate Inquiry</span>
              </h2>
              <p className="text-base md:text-lg text-[var(--coastal-muted-text)] mb-6 md:mb-8 leading-relaxed theme-transition">
                Tell us about your relocating employees, destination markets, and timeline. We will review the request and follow up with practical next steps.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                {isSubmitted && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
                  >
                    <CheckCircle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Inquiry sent</p>
                      <p className="mt-1 text-sm">Thank you. The team will review the details and follow up directly.</p>
                    </div>
                  </div>
                )}

                {submitError && (
                  <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                    <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">The inquiry could not be sent</p>
                      <p className="mt-1 text-sm">{submitError}</p>
                    </div>
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label htmlFor="companyName" className="text-[var(--coastal-text)] font-semibold mb-2 block theme-transition text-sm md:text-base">Company Name *</Label>
                    <Input
                      id="companyName"
                      required
                      placeholder="Acme Corporation"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="bg-[var(--bg)] border-[var(--coastal-border)] text-[var(--coastal-text)] theme-transition"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hrContactName" className="text-[var(--coastal-text)] font-semibold mb-2 block theme-transition text-sm md:text-base">HR Contact Name *</Label>
                    <Input
                      id="hrContactName"
                      required
                      placeholder="Jane Smith"
                      value={formData.hrContactName}
                      onChange={(e) => setFormData({ ...formData, hrContactName: e.target.value })}
                      className="bg-[var(--bg)] border-[var(--coastal-border)] text-[var(--coastal-text)] theme-transition"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label htmlFor="hrEmail" className="text-[var(--coastal-text)] font-semibold mb-2 block theme-transition text-sm md:text-base">HR Email *</Label>
                    <Input
                      id="hrEmail"
                      type="email"
                      required
                      placeholder="jane@company.com"
                      value={formData.hrEmail}
                      onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
                      className="bg-[var(--bg)] border-[var(--coastal-border)] text-[var(--coastal-text)] theme-transition"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hrPhone" className="text-[var(--coastal-text)] font-semibold mb-2 block theme-transition text-sm md:text-base">HR Phone</Label>
                    <Input
                      id="hrPhone"
                      type="tel"
                      placeholder="Phone number"
                      value={formData.hrPhone}
                      onChange={(e) => setFormData({ ...formData, hrPhone: e.target.value })}
                      className="bg-[var(--bg)] border-[var(--coastal-border)] text-[var(--coastal-text)] theme-transition"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label htmlFor="numberOfEmployees" className="text-[var(--coastal-text)] font-semibold mb-2 block theme-transition text-sm md:text-base">Number of Employees</Label>
                    <Select value={formData.numberOfEmployees} onValueChange={(value) => setFormData({ ...formData, numberOfEmployees: value })}>
                      <SelectTrigger className="bg-[var(--bg)] border-[var(--coastal-border)] text-[var(--coastal-text)] theme-transition">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2-5">2-5</SelectItem>
                        <SelectItem value="6-10">6-10</SelectItem>
                        <SelectItem value="11-25">11-25</SelectItem>
                        <SelectItem value="26+">26+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="relocationTimeline" className="text-[var(--coastal-text)] font-semibold mb-2 block theme-transition text-sm md:text-base">Relocation Timeline</Label>
                    <Select value={formData.relocationTimeline} onValueChange={(value) => setFormData({ ...formData, relocationTimeline: value })}>
                      <SelectTrigger className="bg-[var(--bg)] border-[var(--coastal-border)] text-[var(--coastal-text)] theme-transition">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate (0-30 days)</SelectItem>
                        <SelectItem value="1-3-months">1-3 months</SelectItem>
                        <SelectItem value="3-6-months">3-6 months</SelectItem>
                        <SelectItem value="6-12-months">6-12 months</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="destinationMarkets" className="text-[var(--coastal-text)] font-semibold mb-2 block theme-transition text-sm md:text-base">Destination Market(s)</Label>
                  <Input
                    id="destinationMarkets"
                    placeholder="Select primary market..."
                    value={formData.destinationMarkets}
                    onChange={(e) => setFormData({ ...formData, destinationMarkets: e.target.value })}
                    className="bg-[var(--bg)] border-[var(--coastal-border)] text-[var(--coastal-text)] theme-transition"
                  />
                </div>

                <div>
                  <Label htmlFor="serviceType" className="text-[var(--coastal-text)] font-semibold mb-2 block theme-transition text-sm md:text-base">Service Type Needed</Label>
                  <Select value={formData.serviceType} onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
                    <SelectTrigger className="bg-[var(--bg)] border-[var(--coastal-border)] text-[var(--coastal-text)] theme-transition">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="both">Both (rent first, then buy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="additionalNotes" className="text-[var(--coastal-text)] font-semibold mb-2 block theme-transition text-sm md:text-base">Additional Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Employee details, budget range, special requirements, start date..."
                    rows={4}
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    className="bg-[var(--bg)] border-[var(--coastal-border)] text-[var(--coastal-text)] theme-transition"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-[var(--coastal-muted-text)] theme-transition">
                    <CheckCircle className="h-4 w-4 text-[#C5A46D] mt-0.5 flex-shrink-0" />
                    <span>No commitment or contract required to get started</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-[var(--coastal-muted-text)] theme-transition">
                    <CheckCircle className="h-4 w-4 text-[#C5A46D] mt-0.5 flex-shrink-0" />
                    <span>Direct follow-up from the real estate team</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-[var(--coastal-muted-text)] theme-transition">
                    <CheckCircle className="h-4 w-4 text-[#C5A46D] mt-0.5 flex-shrink-0" />
                    <span>Direct invoicing to your company available</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-[var(--coastal-muted-text)] theme-transition">
                    <CheckCircle className="h-4 w-4 text-[#C5A46D] mt-0.5 flex-shrink-0" />
                    <span>Works for buy, rent, or both — no minimum volume</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-[#212B36] py-4 text-base font-bold text-white shadow-xl transition-all duration-300 hover:bg-[#1a2936] hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-70 md:py-6 md:text-lg"
                >
                  {isSubmitting ? (
                    <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin md:h-5 md:w-5" />
                  ) : (
                    <Mail aria-hidden="true" className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  )}
                  <span className="text-sm md:text-base lg:text-lg">
                    {isSubmitting ? "Sending inquiry..." : "Submit corporate inquiry"}
                  </span>
                </Button>

                <p className="text-xs md:text-sm text-center text-[var(--coastal-muted-text)] theme-transition">
                  By submitting, you agree to our <Link href="/privacy" className="font-semibold underline">Privacy Policy</Link>. CA DRE #02211952
                </p>
              </form>
            </motion.div>

            {/* Right - Agent Info */}
            <motion.div {...fadeInUp} className="space-y-6 md:space-y-8">
              <div className="bg-[#F1EEE7] dark:bg-[#3A475A] rounded-2xl md:rounded-3xl p-6 md:p-8 theme-transition">
                <div className="inline-flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="w-6 md:w-8 h-[2px] bg-gradient-to-r from-[#C5A46D] to-transparent rounded-full"></div>
                  <span className="text-[#C5A46D] font-semibold text-xs md:text-sm uppercase tracking-wider">Your Dedicated Agent</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-[var(--coastal-text)] mb-3 md:mb-4 theme-transition">Reza Barghlameno</h3>
                <p className="text-sm md:text-base text-[var(--coastal-muted-text)] mb-2 theme-transition">CA DRE # 02211952 · eXp Realty · CRMLS Member</p>
                
                <div className="space-y-3 md:space-y-4 mt-4 md:mt-6">
                  <a href={CONTACT.phone.href} className="flex items-center gap-3 group">
                    <Phone className="h-4 w-4 md:h-5 md:w-5 text-[#C5A46D] flex-shrink-0" />
                    <span className="text-sm md:text-base text-[var(--coastal-text)] group-hover:text-[#C5A46D] transition-colors theme-transition font-semibold">
                      {CONTACT.phone.display}
                    </span>
                  </a>
                  <a href={CONTACT.email.href} className="flex items-center gap-3 group">
                    <Mail className="h-4 w-4 md:h-5 md:w-5 text-[#C5A46D] flex-shrink-0" />
                    <span className="text-sm md:text-base text-[var(--coastal-text)] group-hover:text-[#C5A46D] transition-colors theme-transition font-semibold break-all">
                      {CONTACT.email.display}
                    </span>
                  </a>
                </div>
              </div>

              <div className="bg-[var(--bg)] rounded-2xl md:rounded-3xl p-6 md:p-8 border border-[var(--coastal-border)] theme-transition">
                <h3 className="text-lg md:text-xl font-bold text-[var(--coastal-text)] mb-3 md:mb-4 theme-transition">Why Companies Choose Crown Coastal</h3>
                <ul className="space-y-2 md:space-y-3">
                  {[
                    "CRMLS-backed California listing search",
                    "Buy and rent relocation paths",
                    "Direct coordination with HR contacts",
                    "Licensed California real estate guidance",
                    "Direct corporate billing available",
                    "No contracts or minimum volume"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 md:gap-3">
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-[#C5A46D] mt-0.5 flex-shrink-0" />
                      <span className="text-sm md:text-base text-[var(--coastal-muted-text)] theme-transition">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
