'use client'

import Image from "next/image"
import Link from "next/link"
import { motion, easeOut } from "framer-motion"
import { Button } from "@/components/ui/button"
import ZillowReviewsCarousel from "@/components/zillow-reviews-carousel"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Phone, Mail } from "lucide-react"
import "@/styles/sell-hero.css"
import { CONTACT } from "@/lib/constants/contact"
import { SITE_NAME, absoluteUrl } from "@/lib/constants/site"
import { SITE_SCHEMA_IDS } from "@/lib/seo/site-schema"
import { CLIENT_TESTIMONIALS } from "@/lib/client-testimonials"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: easeOut },
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

const zillowReviews = CLIENT_TESTIMONIALS.map((testimonial, index) => ({
  id: String(index + 1),
  author: testimonial.name,
  rating: 5,
  review: testimonial.text,
  avatar: testimonial.avatar,
}))

// Device detection hook
function useDeviceDetection() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      // Check if it's a mobile device
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : ''
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isSmallScreen = window.innerWidth < 768

      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return isMobile
}

// About Hero Section Component
function AboutHeroSection() {
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [isDesktop, setIsDesktop] = useState(false)
  const isMobile = useDeviceDetection()

  const carouselImages = [
    "/luxury-modern-house-exterior.avif",
    "/coursel.webp",
    "/modern-beach-house.avif"
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

  return (
    <section id="ccAboutPageHero" className="cc-sell-hero-section">
      {/* Background Carousel */}
      <div className="cc-sell-hero-bg">
        {carouselImages.map((image, index) => (
          <div
            key={image}
            className={`cc-sell-hero-slide ${index === carouselIndex ? 'cc-active' : ''}`}
          >
            <Image
              src={image}
              alt="Crown Coastal luxury properties"
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
          <Breadcrumbs items={[{ label: "About Us", href: "/about" }]} />
        </div>

        {/* Main Content */}
        <div className="cc-sell-hero-content">
          <h1 className="cc-sell-hero-heading">
            Top Real Estate Agents in San Diego, CA
          </h1>

          <p className="cc-sell-hero-description">
            California's boutique real estate team specializing in coastal markets with thoughtful guidance and clear communication.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="cc-sell-hero-cta">
          <Button
            size="lg"
            className="cc-sell-hero-btn cc-sell-hero-btn-primary"
            onClick={() => window.location.href = '/contact'}
            style={{
              fontWeight: 700,
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
            <Mail className="h-5 w-5 mr-2" />
            <span>Contact Us</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="cc-sell-hero-btn cc-sell-hero-btn-secondary"
            onClick={() => {
              if (isMobile) {
                window.location.href = CONTACT.phone.href
              } else {
                window.location.href = '/contact'
              }
            }}
            style={{
              fontWeight: 600,
              backdropFilter: 'blur(12px)',
              boxShadow: '0 2px 8px rgba(255, 255, 255, 0.15)'
            }}
          >
            <Phone className="h-5 w-5 mr-2" />
            <span>Call Us</span>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <div className="bg-[var(--bg)] theme-transition">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "@id": `${absoluteUrl("/about")}#webpage`,
            url: absoluteUrl("/about"),
            name: `About ${SITE_NAME}`,
            isPartOf: { "@id": SITE_SCHEMA_IDS.website },
            publisher: { "@id": SITE_SCHEMA_IDS.organization },
            about: [
              { "@id": SITE_SCHEMA_IDS.organization },
              { "@id": SITE_SCHEMA_IDS.localBusiness },
              { "@id": SITE_SCHEMA_IDS.agent },
            ],
          }),
        }}
      />
      {/* Hero Section - About Crown Coastal */}
      <AboutHeroSection />

      {/* Enhanced Our Mission - Full Height */}
      <section className="min-h-screen flex items-center py-20 md:py-24 bg-[var(--surface)] theme-transition">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div {...fadeInUp}>
              <div className="space-y-8">
                <div>
                  <p className="text-lg text-[var(--coastal-muted-text)] leading-relaxed theme-transition mb-6">
                    Buying or selling a home—especially in a competitive coastal market—requires more than just access to listings. It requires local insight, strategic thinking, and an advisor who understands both the numbers and the lifestyle behind the decision. That's where we come in.
                  </p>
                </div>

                <div>
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-6 h-[2px] bg-gradient-accent rounded-full"></div>
                    <span className="text-[#C5A46D] font-semibold text-sm uppercase tracking-[0.15em]">Our Purpose</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold font-display text-[var(--coastal-text)] mb-6 theme-transition">
                    Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A46D] to-[#D4B574]">Purpose</span>
                  </h2>
                  <p className="text-lg text-[var(--coastal-muted-text)] leading-relaxed theme-transition">
                    We help clients make confident real estate decisions by combining local market expertise with a practical, client-first approach.
                  </p>
                  <p className="text-lg text-[var(--coastal-muted-text)] leading-relaxed theme-transition mt-4">
                    Purchasing a primary residence, selling a coastal property, or exploring real estate as an investment all require clear guidance—our role is to simplify the process, protect your interests, and support you every step of the way.
                  </p>
                </div>

                <div>
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-6 h-[2px] bg-gradient-accent rounded-full"></div>
                    <span className="text-[#C5A46D] font-semibold text-sm uppercase tracking-[0.15em]">Our Mission</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold font-display text-[var(--coastal-text)] mb-6 theme-transition">
                    Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A46D] to-[#D4B574]">Mission</span>
                  </h2>
                  <p className="text-lg text-[var(--coastal-muted-text)] leading-relaxed theme-transition">
                    Our mission is to deliver real estate services grounded in integrity, professionalism, and attention to detail.
                  </p>
                  <p className="text-lg text-[var(--coastal-muted-text)] leading-relaxed theme-transition mt-4">
                    We believe the best results come from honest advice, realistic expectations, and a commitment to your success.
                  </p>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                viewport={{ once: true }}
                className="mt-10 p-8 glass-card rounded-2xl border border-[var(--coastal-border)] bg-gradient-to-br from-[#C5A46D]/5 to-transparent"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#C5A46D] to-[#D4B574] rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-[var(--coastal-text)] theme-transition">Trusted by Many Families</div>
                    <div className="text-[var(--coastal-muted-text)] theme-transition">Excellence in every transaction</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative hidden lg:block"
            >
              <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
                <Image
                  src="/luxury-modern-house-exterior.avif"
                  alt="Our modern office space"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-[#C5A46D] to-[#D4B574] rounded-3xl opacity-20 blur-xl"></div>
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-accent rounded-2xl opacity-30 blur-xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Why Choose Us - Full Height */}
      <section className="min-h-screen flex items-center py-20 md:py-24 coastal-section-alt relative overflow-hidden theme-transition">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-[2px] bg-gradient-accent rounded-full"></div>
              <span className="text-[#C5A46D] font-semibold text-sm uppercase tracking-[0.2em]">Our Advantages</span>
              <div className="w-12 h-[2px] bg-gradient-accent rounded-full"></div>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-[var(--coastal-text)] mb-8 text-balance theme-transition">
              Why Choose
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#C5A46D] to-[#D4B574]">Our Team</span>
            </h2>
            <p className="text-[var(--coastal-muted-text)] text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-balance theme-transition">
              Work with a team focused on clear communication, current listing data, and property-specific guidance.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-10"
          >
            {[
              {
                title: "Local Expertise",
                description: "Our team has deep knowledge of the local real estate market and neighborhoods.",
                image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
                imageAlt: "Real estate agent with map showing local neighborhoods",
                icon: (
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                gradient: "bg-gradient-to-br from-[#C5A46D] to-[#D4B574]"
              },
              {
                title: "Client-Focused Approach",
                description: "We prioritize your needs and work tirelessly to achieve your real estate goals.",
                image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
                imageAlt: "Professional handshake between real estate agent and client",
                icon: (
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                gradient: "bg-gradient-to-br from-[#6FA8A3] to-[#5F9792]"
              },
              {
                title: "Research-Driven Guidance",
                description: "We combine listing data, comparable sales, property documents, and local context to support each decision.",
                image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
                imageAlt: "Successful business transaction and achievement",
                icon: (
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                gradient: "bg-gradient-to-br from-[#C5A46D] to-[#6FA8A3]"
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -15, scale: 1.02 }}
                className="relative glass-card rounded-3xl transition-all duration-500 border border-[var(--coastal-border)] overflow-hidden bg-[var(--surface)] group cursor-pointer shadow-lg hover:shadow-2xl"
              >
                {/* Professional Image with Zoom Effect */}
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    priority={index === 0}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                  {/* Icon Badge Overlay with Animation */}
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="absolute top-6 right-6"
                  >
                    <div className={`w-20 h-20 ${item.gradient} rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-sm`}>
                      {item.icon}
                    </div>
                  </motion.div>
                </div>

                {/* Content Section */}
                <div className="p-10">
                  <h3 className="text-2xl md:text-3xl font-bold font-display text-[var(--coastal-text)] mb-4 theme-transition">
                    {item.title}
                  </h3>
                  <p className="text-[var(--coastal-muted-text)] leading-relaxed theme-transition text-lg">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Zillow Reviews Carousel Section - Full Height */}
      <section className="min-h-screen flex items-center py-20 md:py-24 bg-[var(--surface)] theme-transition">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-[2px] bg-gradient-primary rounded-full"></div>
              <span className="text-[#C5A46D] font-semibold text-sm uppercase tracking-[0.2em]">Client Reviews</span>
              <div className="w-12 h-[2px] bg-gradient-primary rounded-full"></div>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-[var(--coastal-text)] mb-8 text-balance theme-transition">
              What Our Clients Say
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#C5A46D] to-[#D4B574]">On Zillow</span>
            </h2>
            <p className="text-[var(--coastal-muted-text)] text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-balance theme-transition">
              Read authentic reviews from our satisfied clients who have worked with us on their real estate journey.
            </p>
          </motion.div>

          <ZillowReviewsCarousel reviews={zillowReviews} />
        </div>
      </section>

      {/* Enhanced Call to Action - Full Height */}
      <section className="min-h-screen flex items-center py-20 md:py-24 bg-gradient-to-br from-[#102A3F] via-[#12324A] to-[#0F2A3E] text-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-[#C5A46D] to-transparent rounded-full"></div>
              <span className="text-[#C5A46D] font-semibold text-sm uppercase tracking-[0.2em]">Get Started</span>
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-[#C5A46D] to-transparent rounded-full"></div>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display mb-8 text-balance">
              Ready to Find Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#C5A46D] to-[#D4B574]">Dream Home?</span>
            </h2>
            <p className="text-white/80 text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-balance">
              Browse our curated listings or get in touch with our expert team to start your California coastal real estate journey today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link href="/properties">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto px-10 py-6 text-lg bg-gradient-to-r from-[#C5A46D] to-[#D4B574] hover:from-[#D4B574] hover:to-[#C5A46D] text-white rounded-2xl font-bold transition-all duration-500 shadow-2xl hover:shadow-[0_20px_60px_rgba(197,164,109,0.4)] flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Browse Properties
                  </Button>
                </motion.div>
              </Link>
              <Link href="/contact">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto px-10 py-6 text-lg bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-[#C5A46D] backdrop-blur-sm rounded-2xl font-bold transition-all duration-500 shadow-2xl hover:shadow-[0_20px_60px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Contact Us
                  </Button>
                </motion.div>
              </Link>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center items-center gap-8 md:gap-12 text-white/80 mt-16"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-[#C5A46D] rounded-full animate-pulse-soft shadow-lg shadow-[#C5A46D]/50"></div>
                <span className="text-base md:text-lg font-semibold">Many Happy Clients</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-[#6FA8A3] rounded-full animate-pulse-soft animation-delay-2000 shadow-lg shadow-[#6FA8A3]/50"></div>
                <span className="text-base md:text-lg font-semibold">Expert Guidance</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-[#C5A46D] rounded-full animate-pulse-soft animation-delay-4000 shadow-lg shadow-[#C5A46D]/50"></div>
                <span className="text-base md:text-lg font-semibold">Luxury Focus</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
