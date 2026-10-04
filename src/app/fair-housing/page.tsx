import type { Metadata } from 'next'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { CONTACT } from "@/lib/constants/contact"

// Revalidate page once per day
export const revalidate = 86400

export const metadata: Metadata = {
  title: "Fair Housing Policy | Crown Coastal Homes",
  description: "Crown Coastal Homes is committed to fair housing practices and providing equal housing opportunities to all. Learn about our non-discrimination policy.",
  openGraph: {
    title: "Fair Housing Policy | Crown Coastal Homes",
    description: "Committed to providing equal housing opportunities and following all fair housing laws.",
  },
  alternates: {
    canonical: '/fair-housing',
  },
}

export default function FairHousingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] theme-transition">
      {/* ── Organization JSON-LD with Fair Housing Policy ──────────────────────────────── */}
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
            nondiscriminationPolicy: "https://crowncoastalhomes.com/fair-housing",
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
        <div className="relative z-10 min-h-[40vh] flex items-center justify-center pt-8 pb-12 md:pt-12 md:pb-16">
          <div className="container mx-auto px-4">
            <Breadcrumbs items={[{ label: "Fair Housing", href: "/fair-housing" }]} className="mb-4" />
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-[2px] bg-gradient-primary rounded-full"></div>
                <span className="text-[#C5A46D] font-semibold text-sm uppercase tracking-[0.2em]">Our Commitment</span>
                <div className="w-12 h-[2px] bg-gradient-primary rounded-full"></div>
              </div>
              <h1 
                className="text-5xl md:text-7xl lg:text-8xl font-bold font-display text-[var(--coastal-text)] mb-6 text-balance theme-transition leading-[1.1]"
              >
                Equal Housing <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A46D] via-[#D4B574] to-[#C5A46D]">Opportunity</span>
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-[var(--coastal-muted-text)] leading-relaxed max-w-4xl mx-auto text-balance theme-transition font-light">
                Crown Coastal Homes is committed to providing equal housing opportunities to all. We adhere to all federal, state, and local fair housing laws.
              </p>
              
            </div>
          </div>
        </div>
      </section>

      {/* Fair Housing Statement Section */}
      <section className="bg-[var(--surface)] theme-transition py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-6 h-[2px] bg-gradient-accent rounded-full"></div>
                <span className="text-[#C5A46D] font-semibold text-sm uppercase tracking-[0.15em]">Our Policy</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-display text-[var(--coastal-text)] mb-8 theme-transition">
                Fair Housing <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A46D] to-[#D4B574]">Commitment</span>
              </h2>
            </div>

            <div className="space-y-8">
              <div className="bg-[var(--bg)] rounded-3xl p-8 md:p-12 border border-[var(--coastal-border)]">
                <p className="text-lg text-[var(--coastal-muted-text)] leading-relaxed mb-6">
                  At Crown Coastal Homes, we are dedicated to providing equal housing opportunities and ensuring that all individuals are treated with dignity and respect. We strictly adhere to the Fair Housing Act, which prohibits discrimination in housing-related transactions based on:
                </p>
                
                {/* Protected Classes */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  {[
                    "Race",
                    "Color",
                    "National Origin",
                    "Religion",
                    "Sex",
                    "Familial Status",
                    "Disability",
                    "Sexual Orientation",
                    "Gender Identity",
                    "Source of Income",
                    "Marital Status",
                    "Age"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#C5A46D] rounded-full"></div>
                      <span className="text-[var(--coastal-text)] font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--bg)] rounded-3xl p-8 md:p-12 border border-[var(--coastal-border)]">
                <h3 className="text-2xl md:text-3xl font-bold font-display text-[var(--coastal-text)] mb-6">
                  Our Promise
                </h3>
                <p className="text-lg text-[var(--coastal-muted-text)] leading-relaxed mb-4">
                  We pledge to:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#C5A46D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[var(--coastal-text)]">Market and provide housing without discrimination</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#C5A46D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[var(--coastal-text)]">Educate our team on fair housing laws and best practices</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#C5A46D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[var(--coastal-text)]">Ensure all clients receive equal professional service</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#C5A46D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[var(--coastal-text)]">Maintain a welcoming and inclusive environment for everyone</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Report Section */}
      <section className="coastal-section-alt relative overflow-hidden theme-transition py-24 md:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-[2px] bg-gradient-accent rounded-full"></div>
              <span className="text-[#C5A46D] font-semibold text-sm uppercase tracking-[0.2em]">Report Discrimination</span>
              <div className="w-12 h-[2px] bg-gradient-accent rounded-full"></div>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-[var(--coastal-text)] mb-8 text-balance theme-transition">
              How to File a
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#C5A46D] to-[#D4B574]">Complaint</span>
            </h2>
            <p className="text-[var(--coastal-muted-text)] text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-balance theme-transition">
              If you believe you have experienced housing discrimination, we encourage you to file a complaint.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            <div className="bg-[var(--surface)] rounded-3xl p-8 md:p-10 border border-[var(--coastal-border)] shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C5A46D] to-[#D4B574] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold font-display text-[var(--coastal-text)] mb-4">
                Department of Housing and Urban Development (HUD)
              </h3>
              <p className="text-[var(--coastal-muted-text)] mb-6">
                File a complaint directly with HUD within one year of the alleged discrimination.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-[var(--coastal-text)]">
                  <strong>Phone:</strong> 1-800-669-9777
                </p>
                <p className="text-sm text-[var(--coastal-text)]">
                  <strong>TTY:</strong> 1-800-877-8339
                </p>
                <p className="text-sm text-[var(--coastal-text)]">
                  <strong>Website:</strong> hud.gov/fairhousing
                </p>
              </div>
              <Link 
                href="https://www.hud.gov/program_offices/fair_housing_equal_opp/online-complaint"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6"
              >
                <Button
                  variant="outline"
                  className="px-6 py-3 border-2 border-[#C5A46D] text-[#C5A46D] hover:bg-[#C5A46D] hover:text-white rounded-xl font-semibold transition-all duration-300"
                >
                  File Online Complaint
                </Button>
              </Link>
            </div>

            <div className="bg-[var(--surface)] rounded-3xl p-8 md:p-10 border border-[var(--coastal-border)] shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6FA8A3] to-[#5F9792] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold font-display text-[var(--coastal-text)] mb-4">
                California Department of Real Estate (DRE)
              </h3>
              <p className="text-[var(--coastal-muted-text)] mb-6">
                The DRE investigates complaints against real estate licensees in California.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-[var(--coastal-text)]">
                  <strong>Phone:</strong> 1-877-373-4542
                </p>
                <p className="text-sm text-[var(--coastal-text)]">
                  <strong>Website:</strong> dre.ca.gov
                </p>
              </div>
              <Link 
                href="https://www.dre.ca.gov/file-a-complaint/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6"
              >
                <Button
                  variant="outline"
                  className="px-6 py-3 border-2 border-[#6FA8A3] text-[#6FA8A3] hover:bg-[#6FA8A3] hover:text-white rounded-xl font-semibold transition-all duration-300"
                >
                  File DRE Complaint
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Resources Section */}
      <section className="bg-[var(--surface)] theme-transition py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-[2px] bg-gradient-primary rounded-full"></div>
              <span className="text-[#C5A46D] font-semibold text-sm uppercase tracking-[0.2em]">Resources</span>
              <div className="w-12 h-[2px] bg-gradient-primary rounded-full"></div>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold font-display text-[var(--coastal-text)] mb-8 text-balance theme-transition">
              Helpful
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#C5A46D] to-[#D4B574]">Resources</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "HUD Fair Housing",
                description: "Comprehensive information about fair housing laws and rights",
                link: "https://www.hud.gov/program_offices/fair_housing_equal_opp",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                )
              },
              {
                title: "California DRE",
                description: "State-specific real estate regulations and consumer information",
                link: "https://www.dre.ca.gov/",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              },
              {
                title: "Housing Rights Center",
                description: "Local organization providing fair housing education and advocacy",
                link: "https://housingrightscenter.org/",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              }
            ].map((resource, index) => (
              <Link
                key={index}
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="bg-[var(--bg)] rounded-3xl p-8 border border-[var(--coastal-border)] hover:border-[#C5A46D]/50 transition-all duration-300 h-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#C5A46D] to-[#D4B574] rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                    {resource.icon}
                  </div>
                  <h3 className="text-xl font-bold font-display text-[var(--coastal-text)] mb-3">
                    {resource.title}
                  </h3>
                  <p className="text-[var(--coastal-muted-text)] leading-relaxed">
                    {resource.description}
                  </p>
                </div>
              </Link>
            ))}
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
              If you have any questions about our fair housing policy or need assistance, please don't hesitate to contact us.
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
