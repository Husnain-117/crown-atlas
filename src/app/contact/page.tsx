import type { Metadata } from "next"
import { Suspense } from "react"
import Image from "next/image"
import ContactForm from "./contact-form"
import OfficeLocation from "./office-location"
import SocialMediaLinks from "./social-media-links"
import CustomerReviewCarousel from "@/components/customer-review-carousel"
import { Phone, Mail, MessageCircle, ChevronRight, ArrowRight } from "lucide-react"
import { CONTACT } from "@/lib/constants/contact"
import Link from "next/link"
import WhatsAppButton from "@/components/whatsapp-button"
import { absoluteUrl } from "@/lib/constants/site"

export const metadata: Metadata = {
  title: "Contact a Local Agent | Crown Coastal Homes | California",
  description: `Contact Crown Coastal Homes to schedule a tour, request property details, or discuss California real estate. Call ${CONTACT.phone.display} or email ${CONTACT.email.display}.`,
  alternates: {
    canonical: absoluteUrl("/contact"),
  },
}

// ContactForm reads query parameters inside a client Suspense boundary, so the
// route shell stays static while property-specific form values still hydrate.
export const revalidate = 86400;

export default function ContactPage() {
  return (
    <div className="bg-[var(--bg)] min-h-screen theme-transition">
      {/* Premium Hero Section with Integrated Breadcrumb */}
      <section className="relative h-[50vh] min-h-[450px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <Image
          src="/service/Concierge_Home_Buying.png"
          alt="Contact Crown Coastal Homes"
          fill
          className="object-cover object-center"
          priority
        />

        {/* Dark Gradient Overlay for Better Readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40" />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb - Subtle Pill Style Inside Hero */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 hover:bg-white/20 hover:text-white transition-all duration-200"
                >
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight aria-hidden="true" className="h-4 w-4 text-white/60" />
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white font-medium">
                  Contact
                </span>
              </li>
            </ol>
          </nav>

          {/* Hero Content - Centered with Max Width */}
          <div className="max-w-3xl mx-auto text-center">
            {/* Small Label Above Heading */}
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/40"></div>
              <span className="text-sm font-semibold tracking-wider uppercase text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                Get In Touch
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/40"></div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight font-heading text-white">
              Contact Our Team
            </h1>

            {/* Supporting Line */}
            <p className="text-lg sm:text-xl md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
              Let's discuss your California coastal real estate goals. We're here to help you every step of the way.
            </p>

            {/* Primary CTA Button */}
            <div className="flex justify-center">
              <a
                href="#contact-form"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-white/95 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 group"
              >
                Start a Conversation
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Contact Cards Section */}
      <section className="bg-[var(--bg)] py-12 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Call Us Card */}
            <a
              href={CONTACT.phone.href}
              className="group relative bg-[var(--surface)] rounded-2xl p-8 border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-all duration-300 hover:shadow-xl flex flex-col items-center text-center h-full"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--coastal-primary)]/20 to-[var(--coastal-primary)]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Phone className="h-7 w-7 text-[var(--coastal-primary)]" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--coastal-muted-text)] uppercase tracking-wider mb-2">
                Call Us
              </h3>
              <p className="text-xl font-bold text-[var(--coastal-text)] group-hover:text-[var(--coastal-primary)] transition-colors">
                {CONTACT.phone.display}
              </p>
              <p className="text-sm text-[var(--coastal-muted-text)] mt-3">
                Direct line to Reza
              </p>
            </a>

            {/* Email Us Card */}
            <a
              href={CONTACT.email.href}
              className="group relative bg-[var(--surface)] rounded-2xl p-8 border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-all duration-300 hover:shadow-xl flex flex-col items-center text-center h-full"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--coastal-primary)]/20 to-[var(--coastal-primary)]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Mail className="h-7 w-7 text-[var(--coastal-primary)]" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--coastal-muted-text)] uppercase tracking-wider mb-2">
                Email Us
              </h3>
              <p className="text-xl font-bold text-[var(--coastal-text)] group-hover:text-[var(--coastal-primary)] transition-colors break-all">
                {CONTACT.email.display}
              </p>
              <p className="text-sm text-[var(--coastal-muted-text)] mt-3">
                Send property details and questions
              </p>
            </a>

            {/* WhatsApp Card */}
            <a
              href={`${CONTACT.whatsApp.href}?text=${encodeURIComponent("Hi Reza, I'd like to learn more about your services. Can we chat?")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-[var(--surface)] rounded-2xl p-8 border border-[var(--coastal-border)] hover:border-[#25D366] transition-all duration-300 hover:shadow-xl flex flex-col items-center text-center h-full"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#25D366]/20 to-[#25D366]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="h-7 w-7 text-[#25D366]" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--coastal-muted-text)] uppercase tracking-wider mb-2">
                WhatsApp
              </h3>
              <p className="text-xl font-bold text-[var(--coastal-text)] group-hover:text-[#25D366] transition-colors">
                Message Us
              </p>
              <p className="text-sm text-[var(--coastal-muted-text)] mt-3">
                Send a direct message
              </p>
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Main Content Section */}
        <div className="grid lg:grid-cols-2 gap-16 mb-20">
          {/* Left Column - Contact Form */}
          <div id="contact-form" className="space-y-6 scroll-mt-28">
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-8 h-[2px] bg-gradient-primary rounded-full"></div>
                <span className="text-[var(--coastal-primary)] font-semibold text-sm uppercase tracking-wider">Send a Message</span>
                <div className="w-8 h-[2px] bg-gradient-primary rounded-full"></div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4 theme-transition">
                How Can We <span className="text-gradient-primary bg-clip-text text-transparent">Help You?</span>
              </h2>
              <p className="text-[var(--coastal-muted-text)] text-lg leading-relaxed theme-transition">
                Share the property, location, timing, or decision you would like to discuss.
              </p>
            </div>
            <Suspense fallback={
              <div className="animate-pulse bg-[var(--surface)] rounded-2xl h-[500px] border border-[var(--coastal-border)]" />
            }>
              <ContactForm />
            </Suspense>

            <div className="rounded-2xl border border-[var(--coastal-border)] bg-[var(--surface)] p-6">
              <h3 className="text-lg font-semibold text-[var(--coastal-text)]">Plan your purchase with Reza</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--coastal-muted-text)]">Buying from the UK or elsewhere abroad? We can discuss your search, virtual viewing requests and a practical plan for visiting California.</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm underline underline-offset-4">
                <Link href="/team/reza-barghlameno">Meet Reza Barghlameno</Link>
                <Link href="/buyers-guide">Read the California buyer’s guide</Link>
              </div>
            </div>

            {/* Client Reviews Carousel */}
            <div className="mt-8">
              <CustomerReviewCarousel />
            </div>
          </div>

          {/* Right Column - Office Location & Info */}
          <div className="space-y-6">
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-8 h-[2px] bg-gradient-primary rounded-full"></div>
                <span className="text-[var(--coastal-primary)] font-semibold text-sm uppercase tracking-wider">Visit Us</span>
                <div className="w-8 h-[2px] bg-gradient-primary rounded-full"></div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4 theme-transition">
                Our <span className="text-gradient-primary bg-clip-text text-transparent">Office</span>
              </h2>
              <p className="text-[var(--coastal-muted-text)] text-lg leading-relaxed theme-transition">
                Visit our San Diego office for an in-person consultation. We'd love to meet you!
              </p>
            </div>
            <OfficeLocation />

            {/* Why Choose Us Section */}
            <div className="glass-card rounded-2xl p-8 border border-[var(--coastal-border)] bg-[var(--surface)] shadow-medium">
              <h3 className="text-2xl font-bold text-[var(--coastal-text)] mb-6 flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-[var(--coastal-primary)]" />
                Why Choose Crown Coastal?
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--coastal-primary)]/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[var(--coastal-primary)]"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--coastal-text)] mb-1">Market Research</h4>
                    <p className="text-sm text-[var(--coastal-muted-text)]">CRMLS listings and comparable-sale context for informed decisions</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--coastal-primary)]/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[var(--coastal-primary)]"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--coastal-text)] mb-1">Personalized Service</h4>
                    <p className="text-sm text-[var(--coastal-muted-text)]">Tailored approach to meet your unique real estate needs</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--coastal-primary)]/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[var(--coastal-primary)]"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--coastal-text)] mb-1">Licensed Representation</h4>
                    <p className="text-sm text-[var(--coastal-muted-text)]">California real estate guidance from Reza Barghlameno, DRE #{CONTACT.agent.dre}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--coastal-primary)]/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[var(--coastal-primary)]"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--coastal-text)] mb-1">Direct Contact</h4>
                    <p className="text-sm text-[var(--coastal-muted-text)]">Call, email, or message using the contact method that fits your inquiry</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12 rounded-3xl border border-[var(--coastal-border)] shadow-strong bg-[var(--surface)]">
            <SocialMediaLinks />
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <WhatsAppButton
            message="Hi Reza, I found your listing on Crown Coastal Homes. Can we chat?"
            variant="full"
          />
        </div>
      </div>
    </div>
  )
}
