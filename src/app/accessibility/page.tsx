import type { Metadata } from 'next'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { CONTACT } from "@/lib/constants/contact"

// Revalidate page once per day
export const revalidate = 86400

export const metadata: Metadata = {
  title: "Accessibility Statement | Crown Coastal Homes",
  description: "Crown Coastal Homes is committed to ensuring digital accessibility for all users. Learn about our accessibility initiatives and how we're making our website inclusive.",
  openGraph: {
    title: "Accessibility Statement | Crown Coastal Homes",
    description: "Committed to digital accessibility and inclusive design for all users.",
  },
  alternates: {
    canonical: '/accessibility',
  },
}

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] theme-transition">
      {/* ── Organization JSON-LD with Accessibility Policy ──────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `https://crowncoastalhomes.com#organization`,
            name: "Crown Coastal Homes",
            url: "https://crowncoastalhomes.com",
            logo: "https://crowncoastalhomes.com/logo.svg",
            description: "California real estate platform specializing in luxury coastal properties. Expert guidance on buying, selling, and investing in California real estate.",
            accessibilityPolicy: "https://crowncoastalhomes.com/accessibility",
            address: {
              "@type": "PostalAddress",
              streetAddress: "702 Broadway",
              addressLocality: "San Diego",
              addressRegion: "CA",
              postalCode: "92101",
              addressCountry: "US",
            },
            contactPoint: {
              "@type": "ContactPoint",
              telephone: CONTACT.phone.href.replace(/^tel:/, ""),
              email: CONTACT.email.display,
              contactType: "Customer Service",
              areaServed: "US",
              availableLanguage: "English",
            },
            sameAs: [
              "https://www.instagram.com/crown.coastal/",
              "https://www.linkedin.com/company/crown-coastal-homes/",
              "https://www.zillow.com/profile/RezaSoCal",
            ],
          }),
        }}
      />

      {/* Hero Section */}
      <section className="coastal-section-light relative overflow-hidden theme-transition">
        <div className="relative z-10 min-h-[50vh] flex items-center justify-center py-16 md:py-20">
          <div className="container mx-auto px-4">
            <Breadcrumbs items={[{ label: "Accessibility", href: "/accessibility" }]} className="mb-6" />
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-[2px] bg-gradient-primary rounded-full"></div>
                <span className="text-[#C5A46D] font-semibold text-sm uppercase tracking-[0.2em]">Our Commitment</span>
                <div className="w-12 h-[2px] bg-gradient-primary rounded-full"></div>
              </div>
              <h1 
                className="text-5xl md:text-7xl lg:text-8xl font-bold font-display text-[var(--coastal-text)] mb-6 text-balance theme-transition leading-[1.1]"
              >
                Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A46D] via-[#D4B574] to-[#C5A46D]">Accessibility</span>
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-[var(--coastal-muted-text)] leading-relaxed max-w-4xl mx-auto text-balance theme-transition font-light">
                Crown Coastal Homes is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility Statement Section */}
      <section className="bg-[var(--surface)] theme-transition py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-6 h-[2px] bg-gradient-accent rounded-full"></div>
                <span className="text-[#C5A46D] font-semibold text-sm uppercase tracking-[0.15em]">Our Policy</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-display text-[var(--coastal-text)] mb-8 theme-transition">
                Accessibility <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A46D] to-[#D4B574]">Statement</span>
              </h2>
            </div>

            <div className="space-y-8">
              <div className="bg-[var(--bg)] rounded-3xl p-8 md:p-12 border border-[var(--coastal-border)]">
                <p className="text-lg text-[var(--coastal-muted-text)] leading-relaxed mb-6">
                  Crown Coastal Homes is committed to facilitating the accessibility and usability of its website, crowncoastalhomes.com, for all people with disabilities. Our goal is to comply with all applicable standards, including the World Wide Web Consortium's Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
                </p>
                
                <p className="text-lg text-[var(--coastal-muted-text)] leading-relaxed mb-6">
                  We work with accessibility consultants to implement best practices and ensure our website meets or exceeds accessibility requirements. We regularly review our site to identify and address accessibility barriers.
                </p>
              </div>

              <div className="bg-[var(--bg)] rounded-3xl p-8 md:p-12 border border-[var(--coastal-border)]">
                <h3 className="text-2xl md:text-3xl font-bold font-display text-[var(--coastal-text)] mb-6">
                  Accessibility Features
                </h3>
                <p className="text-lg text-[var(--coastal-muted-text)] leading-relaxed mb-6">
                  Our website includes the following accessibility features:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#C5A46D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[var(--coastal-text)]">Alt text for all meaningful images</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#C5A46D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[var(--coastal-text)]">Keyboard navigation support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#C5A46D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[var(--coastal-text)]">Clear headings and logical structure</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#C5A46D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[var(--coastal-text)]">High contrast color combinations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#C5A46D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[var(--coastal-text)]">Responsive design for all screen sizes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#C5A46D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[var(--coastal-text)]">Screen reader compatible content</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Third Party Section */}
      <section className="coastal-section-alt relative overflow-hidden theme-transition py-24 md:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-[2px] bg-gradient-accent rounded-full"></div>
              <span className="text-[#C5A46D] font-semibold text-sm uppercase tracking-[0.2em]">Third Party</span>
              <div className="w-12 h-[2px] bg-gradient-accent rounded-full"></div>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-[var(--coastal-text)] mb-8 text-balance theme-transition">
              Third-Party
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#C5A46D] to-[#D4B574]">Content</span>
            </h2>
            <p className="text-[var(--coastal-muted-text)] text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-balance theme-transition">
              Our commitment to accessibility extends to our third-party partners and content providers.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-[var(--surface)] rounded-3xl p-8 md:p-12 border border-[var(--coastal-border)] shadow-lg">
              <p className="text-lg text-[var(--coastal-muted-text)] leading-relaxed mb-6">
                Crown Coastal Homes works with third-party vendors, including MLS services, property listing platforms, and real estate portals. While we strive to ensure all third-party content meets accessibility standards, some content may be outside our direct control.
              </p>
              <p className="text-lg text-[var(--coastal-muted-text)] leading-relaxed mb-6">
                We are actively working with our partners to improve the accessibility of all integrated content and encourage them to follow WCAG 2.1 AA guidelines.
              </p>
              <p className="text-lg text-[var(--coastal-muted-text)] leading-relaxed">
                If you encounter any accessibility issues with third-party content on our website, please let us know so we can address the issue with our partners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="bg-[var(--surface)] theme-transition py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-[2px] bg-gradient-primary rounded-full"></div>
              <span className="text-[#C5A46D] font-semibold text-sm uppercase tracking-[0.2em]">Feedback</span>
              <div className="w-12 h-[2px] bg-gradient-primary rounded-full"></div>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold font-display text-[var(--coastal-text)] mb-8 text-balance theme-transition">
              We Value Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#C5A46D] to-[#D4B574]">Feedback</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            <div className="bg-[var(--bg)] rounded-3xl p-8 md:p-10 border border-[var(--coastal-border)]">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C5A46D] to-[#D4B574] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold font-display text-[var(--coastal-text)] mb-4">
                Report an Issue
              </h3>
              <p className="text-[var(--coastal-muted-text)] mb-6">
                If you encounter any accessibility barriers on our website, please let us know. We appreciate your feedback as we continuously improve.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-[var(--coastal-text)]">
                  <strong>Email:</strong>{" "}<a className="underline" href={CONTACT.email.href}>{CONTACT.email.display}</a>
                </p>
                <p className="text-sm text-[var(--coastal-text)]">
                  <strong>Phone:</strong>{" "}<a className="underline" href={CONTACT.phone.href}>{CONTACT.phone.display}</a>
                </p>
              </div>
              <Link 
                href="/contact"
                className="inline-block mt-6"
              >
                <Button
                  variant="outline"
                  className="px-6 py-3 border-2 border-[#C5A46D] text-[#C5A46D] hover:bg-[#C5A46D] hover:text-white rounded-xl font-semibold transition-all duration-300"
                >
                  Contact Us
                </Button>
              </Link>
            </div>

            <div className="bg-[var(--bg)] rounded-3xl p-8 md:p-10 border border-[var(--coastal-border)]">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6FA8A3] to-[#5F9792] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold font-display text-[var(--coastal-text)] mb-4">
                Ongoing Efforts
              </h3>
              <p className="text-[var(--coastal-muted-text)] mb-6">
                We regularly review our website for accessibility compliance and implement improvements based on user feedback and evolving standards.
              </p>
              <p className="text-[var(--coastal-muted-text)] mb-6">
                Our team receives ongoing accessibility training to ensure we maintain our commitment to digital inclusion.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-[var(--coastal-text)]">
                  Last reviewed: July 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-br from-[#102A3F] via-[#12324A] to-[#0F2A3E] text-white relative overflow-hidden py-24 md:py-32 mb-0">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-[#C5A46D] to-transparent rounded-full"></div>
              <span className="text-[#C5A46D] font-semibold text-sm uppercase tracking-[0.2em]">Questions?</span>
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-[#C5A46D] to-transparent rounded-full"></div>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold font-display mb-8 text-balance">
              We're Here to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#C5A46D] to-[#D4B574]">Help</span>
            </h2>
            <p className="text-white/80 text-xl md:text-2xl mb-12 leading-relaxed text-balance">
              If you have any questions about our accessibility policy or need assistance accessing our content, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-10 py-6 text-lg bg-gradient-to-r from-[#C5A46D] to-[#D4B574] hover:from-[#D4B574] hover:to-[#C5A46D] text-white rounded-2xl font-bold transition-all duration-500 shadow-2xl hover:shadow-[0_20px_60px_rgba(197,164,109,0.4)] flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Us
                </Button>
              </Link>
              <Link href={CONTACT.phone.href}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-10 py-6 text-lg bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-[#C5A46D] backdrop-blur-sm rounded-2xl font-bold transition-all duration-500 shadow-2xl hover:shadow-[0_20px_60px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call {CONTACT.phone.display}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
