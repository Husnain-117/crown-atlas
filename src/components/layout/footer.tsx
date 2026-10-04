import { FC, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ExternalLink } from "lucide-react";
import { CONTACT } from "@/lib/constants/contact";
import { FOOTER_COUNTY_LINKS } from "@/config/footerLinks";
import { PRIORITY_COUNTY_SLUGS } from "@/lib/seo/priority-locations";
import FooterDisclosure from "./footer-disclosure";

const PRIORITY_FOOTER_COUNTIES = Object.entries(FOOTER_COUNTY_LINKS).filter(
  ([slug]) => (PRIORITY_COUNTY_SLUGS as readonly string[]).includes(slug),
);

interface FooterNavGroupProps {
  title: string;
  children: ReactNode;
}

function FooterNavGroup({ title, children }: FooterNavGroupProps) {
  return (
    <nav
      aria-label={`${title} links`}
      className="border-b border-white/10 text-left lg:border-0 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center"
    >
      <FooterDisclosure>
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-display text-base font-bold text-white [&::-webkit-details-marker]:hidden lg:hidden">
          {title}
          <ChevronDown
            aria-hidden="true"
            className="h-4 w-4 transition-transform group-open:rotate-180"
          />
        </summary>
        <h3 className="mb-8 hidden font-display text-xl font-bold text-white lg:block">
          {title}
        </h3>
        <div className="hidden pb-3 group-open:block lg:!block lg:pb-0">{children}</div>
      </FooterDisclosure>
    </nav>
  );
}

const Footer: FC = () => {
  return (
    <footer className="dark-gradient-bg text-[#94A3B8] theme-transition relative overflow-hidden mt-0 font-sans">
      <div className="max-w-screen-xl mx-auto px-4 pt-8 pb-8 relative z-10">
        {/* Footer content grid - shows simplified on mobile, full grid on desktop */}
        <div className="mb-8 grid grid-cols-1 gap-3 lg:mb-12 lg:grid-cols-4 lg:gap-12">
          {/* BRAND */}
          <section className="flex flex-col items-center md:items-center text-center md:col-span-1">
            <div className="flex items-center justify-center mb-7">
              <Link href="/" className="flex items-center justify-center group">
                <div className="relative w-48 h-16 md:w-56 md:h-20">
                  <Image
                    src="/logo.png"
                    alt="Crown Coastal Homes Logo"
                    fill
                    sizes="(max-width: 768px) 192px, 224px"
                    className="brightness-0 invert transition-transform duration-300 group-hover:scale-105 object-contain"
                    style={{ 
                      filter: 'brightness(0) invert(1) drop-shadow(0 2px 12px rgba(255, 255, 255, 0.2))'
                    }}
                  />
                </div>
              </Link>
            </div>
            <p className="text-[#94A3B8] text-sm mb-6 leading-relaxed max-w-xs mx-auto text-center">
              California coastal property search with CRMLS listing data and licensed real estate guidance.
            </p>
            <div className="flex items-center justify-center gap-5 mb-4 mx-auto" aria-label="Social Media Links">
              <a href="https://www.instagram.com/crown.coastal/" target="_blank" rel="noopener noreferrer me" className="inline-flex size-11 items-center justify-center rounded-md transition-opacity duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Visit our Instagram profile">
                <Image src="/client/instagram.png" alt="" width={32} height={32} className="hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="https://www.linkedin.com/company/crown-coastal-homes/" target="_blank" rel="noopener noreferrer me" className="inline-flex size-11 items-center justify-center rounded-md transition-opacity duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Visit our LinkedIn company page">
                <Image src="/client/linkedin.ico" alt="" width={32} height={32} className="hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="https://www.homes.com/real-estate-agents/reza-barghlameno/wkjt4yj/" target="_blank" rel="noopener noreferrer" className="inline-flex size-11 items-center justify-center rounded-md transition-opacity duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="View our listings on Homes.com">
                <Image src="/client/homes.ico" alt="" width={32} height={32} className="hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="https://www.zillow.com/profile/RezaSoCal" target="_blank" rel="noopener noreferrer" className="inline-flex size-11 items-center justify-center rounded-md transition-opacity duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="See our Zillow reviews and profile">
                <Image src="/client/zillow.png" alt="" width={32} height={32} className="hover:scale-110 transition-transform duration-300" />
              </a>
            </div>
            <p className="text-xs text-[#64748B] font-medium mx-auto md:mx-0">CA DRE # 02211952</p>
            <div className="mt-3 flex flex-col items-center text-sm text-[#C4D1DE] lg:hidden">
              <a href={CONTACT.email.href} className="inline-flex min-h-11 items-center break-all underline underline-offset-4">{CONTACT.email.display}</a>
              <a href={CONTACT.phone.href} className="inline-flex min-h-11 items-center">{CONTACT.phone.display}</a>
            </div>
          </section>

          {/* EXPLORE */}
          <FooterNavGroup title="Explore">
            <ul className="space-y-1 lg:space-y-5">
              <li><Link href="/" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Home</Link></li>
              <li><Link href="/buy/houses" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">California Homes for Sale</Link></li>
              <li><Link href="/neighborhoods" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Explore Neighborhoods</Link></li>
              <li><Link href="/properties" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Luxury California Properties</Link></li>
              <li><Link href="/buy/condos" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Luxury Condos for Sale in CA</Link></li>
              <li><Link href="/buy/townhouses" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Townhouses for Sale California</Link></li>

              <li><Link href="/new-listings" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">New Listings</Link></li>
              <li><Link href="/new-construction" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">New Construction</Link></li>
              <li><Link href="/map" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Map</Link></li>
              <li><Link href="/market-reports" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Market Reports</Link></li>
              <li><Link href="/sold" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Recent Sales &amp; CMA</Link></li>
            </ul>
          </FooterNavGroup>

          {/* COMPANY */}
          <FooterNavGroup title="Company">
            <ul className="space-y-1 lg:space-y-5">
              <li><Link href="/about" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">About Us</Link></li>
              <li><Link href="/blogs" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Market Insights</Link></li>
              <li><Link href="/services" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Services</Link></li>
              <li><Link href="/services/concierge-home-buying" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Concierge Buying</Link></li>
              <li><Link href="/services/investment" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Investment</Link></li>
              <li><Link href="/services/relocation" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Relocation</Link></li>
              <li><Link href="/agents" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Agents</Link></li>
              <li><Link href="/testimonials" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Testimonials</Link></li>
            </ul>
          </FooterNavGroup>

          {/* SUPPORT */}
          <FooterNavGroup title="Support">
            <ul className="space-y-1 lg:space-y-5">
              <li><Link href="/buyers-guide" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-colors">California Buyer’s Guide</Link></li>
              <li><Link href="/international-buyers/uk" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-colors">Buying from the UK</Link></li>
              <li><Link href="/international-buyers/germany" lang="de-DE" hrefLang="de-DE" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-colors">Kaufen aus Deutschland</Link></li>
              <li><Link href="/international-buyers/canada" hrefLang="en-CA" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-colors">Buying from Canada</Link></li>
              <li><Link href="/contact" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Contact</Link></li>
              <li><Link href="/sell" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Sell Your Home</Link></li>
              <li><Link href="/home-valuation" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">What&apos;s My Home Worth?</Link></li>
              <li><Link href="/rent" prefetch={false} className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Rentals in California</Link></li>
              <li><Link href="/mortgage-calculator" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">Mortgage Calculator</Link></li>
              <li><Link href="/faq" className="text-[#94A3B8] hover:text-[var(--coastal-link)] text-base transition-all duration-300 hover:translate-x-1 inline-block">FAQ</Link></li>
            </ul>
          </FooterNavGroup>
        </div>

        {/* ── City Quick Links by County ── */}
        <section className="border-t border-[var(--coastal-border)] pt-3 lg:mt-12 lg:pt-12">
          <FooterDisclosure>
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-display text-base font-bold text-white [&::-webkit-details-marker]:hidden lg:hidden">
              Browse by location
              <ChevronDown
                aria-hidden="true"
                className="h-4 w-4 transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="hidden pt-4 group-open:block lg:!block lg:pt-0">
          <div className="mb-5 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between md:gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-sans font-bold text-white mb-2 leading-tight">Explore Real Estate by City</h2>
              <p className="text-[#AFC0D2] text-sm sm:text-[15px] leading-relaxed max-w-[38ch]">
                Property search by city across California coastal counties.
              </p>
            </div>
          </div>
          {/* City Links Grid */}
          <div className="mb-8 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-3 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center lg:[&_a]:min-h-0">
            <div className="w-full">
              <h4 className="text-white font-semibold text-base mb-3">Buy by City</h4>
              <ul className="space-y-1.5">
                {FOOTER_COUNTY_LINKS["san-diego"].topCities.map((city) => (
                  <li key={city.slug}>
                    <Link href={`/buy/san-diego/${city.slug}`} className="text-[#C4D1DE] hover:text-white text-xs transition-colors">
                      {city.name}
                    </Link>
                  </li>
                ))}
                {FOOTER_COUNTY_LINKS["orange"].topCities.slice(0, 3).map((city) => (
                  <li key={city.slug}>
                    <Link href={`/buy/orange/${city.slug}`} className="text-[#C4D1DE] hover:text-white text-xs transition-colors">
                      {city.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full">
              <h4 className="text-white font-semibold text-base mb-3">Key Counties</h4>
              <ul className="space-y-1.5">
                {["san-diego", "orange", "los-angeles"].map((slug) => {
                  const county = FOOTER_COUNTY_LINKS[slug];
                  return (
                    <li key={slug}>
                      <Link
                        href={`/buy/${slug}`}
                        className="text-[#C4D1DE] hover:text-[var(--coastal-link)] text-xs transition-colors"
                      >
                        {county.displayName}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="w-full">
              <h4 className="text-white font-semibold text-base mb-3">Rent</h4>
              <ul className="space-y-1.5">
                <li><Link href="/rent" prefetch={false} className="text-[#C4D1DE] hover:text-[var(--coastal-link)] text-xs transition-colors">Luxury Rentals in California</Link></li>
                <li><Link href="/rent/los-angeles" className="text-[#C4D1DE] hover:text-[var(--coastal-link)] text-xs transition-colors">Los Angeles Rentals</Link></li>
                <li><Link href="/rent/san-diego" className="text-[#C4D1DE] hover:text-[var(--coastal-link)] text-xs transition-colors">San Diego Rentals</Link></li>
                <li><Link href="/rent/orange" className="text-[#C4D1DE] hover:text-[var(--coastal-link)] text-xs transition-colors">Orange County Rentals</Link></li>
                <li><Link href="/rent/san-francisco" className="text-[#C4D1DE] hover:text-[var(--coastal-link)] text-xs transition-colors">Bay Area Rentals</Link></li>
              </ul>
            </div>
          </div>

          <nav aria-label="Homes for Sale by County and City" className="[&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center lg:[&_a]:min-h-0">
            <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-[var(--coastal-accent)]"></span>
              Homes for Sale
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 mb-16">
              {PRIORITY_FOOTER_COUNTIES.map(([slug, county]) => (
                <div key={slug} className="group">
                  <h4 className="text-sm font-bold text-white mb-4 pb-2 border-b border-white/5 group-hover:border-[var(--coastal-accent)]/30 transition-colors uppercase tracking-wider">
                    {county.displayName}
                  </h4>
                  <ul className="flex flex-wrap gap-x-3 gap-y-2">
                    {county.topCities.map((city) => (
                      <li key={city.slug}>
                        <Link
                          href={`/buy/${slug}/${city.slug}`}
                          className="inline-block px-2 py-1 text-[#94A3B8] hover:text-white hover:bg-white/5 rounded text-xs transition-all border border-transparent hover:border-white/10"
                          title={`Homes for sale in ${city.name}, CA`}
                        >
                          {city.name}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href={`/buy/${slug}`}
                        className="inline-block px-2 py-1 text-white hover:text-[var(--coastal-link)] rounded text-xs font-semibold"
                      >
                        View all {county.totalCities} cities →
                      </Link>
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </nav>
            </div>
          </FooterDisclosure>
        </section>

        {/* Business Information Section - Google Ads Compliance - HIDDEN ON MOBILE */}
        <div className="hidden lg:block border-t border-[var(--coastal-border)] mt-16 pt-12">
          <address className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-8 not-italic">
            <div>
              <h4 className="text-white font-semibold mb-6">Business Details</h4>
              <div className="space-y-3 text-sm text-[#94A3B8]">
                <p className="font-bold text-white text-base">{CONTACT.business.name}</p>
                <p className="flex items-center gap-2">
                  <span className="p-1.5 bg-white/5 rounded-md text-[var(--coastal-accent)]">DRE</span>
                  CA DRE # {CONTACT.agent.dre}
                </p>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">Hours</p>
                  <p className="mt-1">Mon-Fri: 9am - 5pm PT</p>
                  <p className="text-[10px] opacity-70 mt-1">Messages can be sent at any time</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6">Contact Us</h4>
              <div className="space-y-4 text-sm text-[#94A3B8]">
                <a href={CONTACT.phone.href} className="group flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-[#D7C39A] transition-all">
                  <div className="p-2 bg-[#D7C39A]/10 rounded-lg text-[#D7C39A]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#64748B]">Phone</p>
                    <p className="font-semibold group-hover:text-[var(--coastal-link)] transition-colors">{CONTACT.phone.display}</p>
                  </div>
                </a>
                <a href={CONTACT.email.href} className="group flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-[#D7C39A] transition-all">
                  <div className="p-2 bg-[#D7C39A]/10 rounded-lg text-[#D7C39A]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-[#64748B]">Email</p>
                    <p className="break-all font-semibold group-hover:text-[var(--coastal-link)] transition-colors">{CONTACT.email.display}</p>
                  </div>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6">Headquarters</h4>
              <div className="space-y-4 text-sm text-[#94A3B8]">
                <div className="flex gap-3">
                  <div className="mt-1 text-[#D7C39A]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-white">{CONTACT.business.fullAddress.street}</p>
                    <p>{CONTACT.business.fullAddress.city}, {CONTACT.business.fullAddress.state} {CONTACT.business.fullAddress.zip}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${CONTACT.business.fullAddress.street} ${CONTACT.business.fullAddress.city} ${CONTACT.business.fullAddress.state} ${CONTACT.business.fullAddress.zip}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-[#D7C39A] font-semibold hover:underline group"
                    >
                      Get Directions
                      <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs italic opacity-60">Serving all luxury coastal markets across California including Malibu, Newport Beach, Lajolla, Monterey & Napa.</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6">Legal & Policy</h4>
              <nav aria-label="Legal navigation">
                <ul className="space-y-4 text-sm">
                  <li>
                    <Link href="/privacy" className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--coastal-accent)]"></span>
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--coastal-accent)]"></span>
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/accessibility" className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--coastal-accent)]"></span>
                      Accessibility
                    </Link>
                  </li>
                  <li>
                    <Link href="/fair-housing" className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--coastal-accent)]"></span>
                      Fair Housing
                    </Link>
                  </li>
                  <li>
                    <Link href="/about/data-methodology" className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--coastal-accent)]"></span>
                      Data Methodology
                    </Link>
                  </li>
                  <li>
                    <Link href="/photo-credits" className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--coastal-accent)]"></span>
                      Photo Credits
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </address>
        </div>

        {/* Enhanced Bottom Bar */}
        <div className="border-t border-[var(--coastal-border)] mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-[#B7C7D6] text-sm font-medium text-center md:text-left">
            &copy; {new Date().getFullYear()} {CONTACT.business.name}. All rights reserved.
            <span className="hidden md:inline ml-2">California Real Estate Platform.</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 grayscale opacity-70 md:opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <Image src="/crml-logo.png" alt="CRMLS" width={32} height={32} className="object-contain" />
              <Image src="/exp-realty-logo.webp" alt="EXP Realty" width={48} height={24} className="object-contain" />
            </div>
            <div className="flex items-center gap-2 text-[#B7C7D6] text-xs font-medium">
              <span>Handcrafted with</span>
              <span className="text-red-500 animate-pulse-soft text-base">♥</span>
              <span>San Diego</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
