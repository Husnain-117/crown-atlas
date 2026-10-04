"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { X, ChevronDown, User, Search, Home, Building2, Building, Sparkles, Mail, CircleDollarSign, ChevronRight, Phone, Globe2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { navStyles } from "./navbar.styles"
import ThemeToggle from "@/components/theme-toggle"
import ProfessionalMobileHeader from "./professional-mobile-header"
import { CONTACT } from "@/lib/constants/contact"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  // Balanced nav items: 5 left, 3 right (excluding auth/theme)
  // Corporate Relocation moved to left for better weight distribution
  const leftNavItems = [
    { name: "Home", href: "/" },
    { name: "Buy", href: "/buy", isDropdown: true },
    { name: "Rent", href: "/rent", isDropdown: true },
    { name: "Sell", href: "/sell" },
    { name: "Corporate Relocation", href: "/corporate-relocation" },
  ];
  const rightNavItems = [
    { name: "Blogs", href: "/blogs" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Buy dropdown items per SEO audit: Homes for Sale, Luxury Homes, New Construction, Condos & Lofts, Townhomes
  const buyDropdownItems = [
    { label: "Homes for Sale", href: "/buy/houses" },
    { label: "Buyer’s Guide", href: "/buyers-guide" },
    { label: "Buying from the UK", href: "/international-buyers/uk", language: "en-GB" },
    { label: "Kaufen aus Deutschland", href: "/international-buyers/germany", language: "de-DE" },
    { label: "Buying from Canada", href: "/international-buyers/canada", language: "en-CA" },
    { label: "Luxury Homes", href: "/buy/luxury" },
    { label: "New Construction", href: "/new-construction" },
    { label: "Condos & Lofts", href: "/buy/condos" },
    { label: "Townhomes", href: "/buy/townhouses" },
  ];

  // Rent dropdown items matching Buy structure with clean routes
  const rentDropdownItems = [
    { label: "Homes for Rent", href: "/rent/houses" },
    { label: "Apartments for Rent", href: "/rent/condos" },
    { label: "Townhomes for Rent", href: "/rent/townhouses" },
    { label: "Commercial Lease", href: "/rent/commercial" },
    { label: "All Rentals", href: "/rent" },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setIsMobileMenuOpen(false)
      document.getElementById("mobile-hamburger-btn")?.focus()
    }

    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", closeOnEscape)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [isMobileMenuOpen])

  return (
    <>
      {/* MOBILE HEADER (visible on small screens) */}
      <ProfessionalMobileHeader
        onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Backdrop: tap to close (mobile only) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[9997] bg-black/40 lg:hidden"
          aria-hidden
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MOBILE DRAWER MENU - New design (mobile only): sections, icons, badges, footer */}
      <div
        id="mobile-menu-panel"
        className={isMobileMenuOpen ? "active" : ""}
        data-active={isMobileMenuOpen ? "true" : "false"}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
        aria-hidden={!isMobileMenuOpen}
        inert={!isMobileMenuOpen}
      >
        <div id="mobile-menu-content">
          {/* Header: brand + close */}
          <div id="mobile-menu-header">
            <div className="mobile-drawer-brand">
              <h2 id="mobile-menu-title">Crown Coastal</h2>
              <p id="mobile-menu-subtitle">CALIFORNIA COASTAL REAL ESTATE</p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              id="mobile-menu-close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
              className="mobile-drawer-close-btn"
            >
              <X className="w-5 h-5" aria-hidden />
            </button>
          </div>

          {/* EXPLORE */}
          <div className="mobile-drawer-section">
            <div className="mobile-drawer-section-line" />
            <h3 className="mobile-drawer-section-heading">EXPLORE</h3>
            <nav className="mobile-drawer-nav" aria-label="Explore">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={`mobile-drawer-item${pathname === "/" ? " active" : ""}`}>
                <span className="mobile-drawer-icon-wrap"><Home className="mobile-drawer-icon multi" aria-hidden /></span>
                <span className="mobile-drawer-label">Home</span>
                <ChevronRight className="mobile-drawer-chevron" aria-hidden />
              </Link>
              <Link href="/buyers-guide" onClick={() => setIsMobileMenuOpen(false)} className={`mobile-drawer-item${pathname === "/buyers-guide" ? " active" : ""}`}>
                <span className="mobile-drawer-icon-wrap"><Home className="mobile-drawer-icon" aria-hidden /></span>
                <span className="mobile-drawer-text"><span className="mobile-drawer-label">Buyer’s Guide</span><span className="mobile-drawer-sub">Local and international buyers</span></span>
                <ChevronRight className="mobile-drawer-chevron" aria-hidden />
              </Link>
              <Link href="/international-buyers/uk" onClick={() => setIsMobileMenuOpen(false)} className={`mobile-drawer-item min-h-11${pathname === "/international-buyers/uk" || pathname.startsWith("/international-buyers/uk/") ? " active" : ""}`} aria-current={pathname === "/international-buyers/uk" ? "page" : undefined}>
                <span className="mobile-drawer-icon-wrap"><Globe2 className="mobile-drawer-icon" aria-hidden /></span>
                <span className="mobile-drawer-label">Buying from the UK</span>
                <ChevronRight className="mobile-drawer-chevron" aria-hidden />
              </Link>
              {[
                { label: "Kaufen aus Deutschland", href: "/international-buyers/germany", language: "de-DE" },
                { label: "Buying from Canada", href: "/international-buyers/canada", language: "en-CA" },
              ].map(country => <Link key={country.href} href={country.href} lang={country.language} hrefLang={country.language} onClick={() => setIsMobileMenuOpen(false)} className={`mobile-drawer-item min-h-11${pathname === country.href || pathname.startsWith(country.href + "/") ? " active" : ""}`} aria-current={pathname === country.href ? "page" : undefined}>
                <span className="mobile-drawer-icon-wrap"><Globe2 className="mobile-drawer-icon" aria-hidden /></span>
                <span className="mobile-drawer-label">{country.label}</span>
                <ChevronRight className="mobile-drawer-chevron" aria-hidden />
              </Link>)}
              <Link href="/properties" onClick={() => setIsMobileMenuOpen(false)} className={`mobile-drawer-item${pathname === "/properties" ? " active" : ""}`}>
                <span className="mobile-drawer-icon-wrap"><Search className="mobile-drawer-icon" aria-hidden /></span>
                <span className="mobile-drawer-label">Properties</span>
                <span className="mobile-drawer-badge">NEW</span>
                <ChevronRight className="mobile-drawer-chevron" aria-hidden />
              </Link>
              <Link href="/buy/condos" onClick={() => setIsMobileMenuOpen(false)} className={`mobile-drawer-item${pathname === "/buy/condos" ? " active" : ""}`}>
                <span className="mobile-drawer-icon-wrap"><Building className="mobile-drawer-icon multi" aria-hidden /></span>
                <span className="mobile-drawer-text">
                  <span className="mobile-drawer-label">Luxury Condos</span>
                  <span className="mobile-drawer-sub">Coastal California</span>
                </span>
                <ChevronRight className="mobile-drawer-chevron" aria-hidden />
              </Link>
              <Link href="/buy/townhouses" onClick={() => setIsMobileMenuOpen(false)} className={`mobile-drawer-item${pathname === "/buy/townhouses" ? " active" : ""}`}>
                <span className="mobile-drawer-icon-wrap"><Building2 className="mobile-drawer-icon multi" aria-hidden /></span>
                <span className="mobile-drawer-label">Townhouses</span>
                <ChevronRight className="mobile-drawer-chevron" aria-hidden />
              </Link>
              <Link href="/new-listings" onClick={() => setIsMobileMenuOpen(false)} className={`mobile-drawer-item${pathname === "/new-listings" ? " active" : ""}`}>
                <span className="mobile-drawer-icon-wrap"><Sparkles className="mobile-drawer-icon multi" aria-hidden /></span>
                <span className="mobile-drawer-label">New Listings</span>
                <span className="mobile-drawer-badge">HOT</span>
                <ChevronRight className="mobile-drawer-chevron" aria-hidden />
              </Link>
            </nav>
          </div>

          {/* COMPANY */}
          <div className="mobile-drawer-section">
            <div className="mobile-drawer-section-line" />
            <h3 className="mobile-drawer-section-heading">COMPANY</h3>
            <nav className="mobile-drawer-nav" aria-label="Company">
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className={`mobile-drawer-item${pathname === "/about" ? " active" : ""}`}>
                <span className="mobile-drawer-icon-wrap"><User className="mobile-drawer-icon" aria-hidden /></span>
                <span className="mobile-drawer-text">
                  <span className="mobile-drawer-label">About</span>
                  <span className="mobile-drawer-sub">Meet the team</span>
                </span>
                <ChevronRight className="mobile-drawer-chevron" aria-hidden />
              </Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className={`mobile-drawer-item${pathname === "/contact" ? " active" : ""}`}>
                <span className="mobile-drawer-icon-wrap"><Mail className="mobile-drawer-icon" aria-hidden /></span>
                <span className="mobile-drawer-text">
                  <span className="mobile-drawer-label">Contact</span>
                  <span className="mobile-drawer-sub">Get in touch</span>
                </span>
                <ChevronRight className="mobile-drawer-chevron" aria-hidden />
              </Link>
              <Link href="/home-valuation" onClick={() => setIsMobileMenuOpen(false)} className={`mobile-drawer-item${pathname === "/home-valuation" ? " active" : ""}`}>
                <span className="mobile-drawer-icon-wrap"><CircleDollarSign className="mobile-drawer-icon multi" aria-hidden /></span>
                <span className="mobile-drawer-label">Home Valuation</span>
                <ChevronRight className="mobile-drawer-chevron" aria-hidden />
              </Link>
            </nav>
          </div>

          {/* Footer: Call Now + Email */}
          <div className="mobile-drawer-footer">
            <a href={CONTACT.phone.href} className="mobile-drawer-btn mobile-drawer-btn-primary" onClick={() => setIsMobileMenuOpen(false)}>
              <Phone className="w-5 h-5" aria-hidden />
              Call Now
            </a>
            <a href={CONTACT.email.href} className="mobile-drawer-btn mobile-drawer-btn-secondary" onClick={() => setIsMobileMenuOpen(false)}>
              <Mail className="w-5 h-5" aria-hidden />
              Email
            </a>
          </div>
        </div>
      </div>

      {/* DESKTOP HEADER (hidden on mobile) */}
      <header className={`${navStyles.header} hidden lg:block`}>
        <div className={navStyles.container}>
          <div className={navStyles.navContainer}>
            {/* LEFT NAVIGATION */}
            <nav className={navStyles.leftNav}>
              {leftNavItems.map((item) => {
                if (item.name === "Buy") {
                  return (
                    <DropdownMenu key={item.name}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={navStyles.navLink}>
                          Buy
                          <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className={navStyles.dropdownContent} sideOffset={4}>
                        <DropdownMenuLabel className={navStyles.dropdownLabel}>For Sale</DropdownMenuLabel>
                        {buyDropdownItems.map((dropItem) => (
                          <DropdownMenuItem key={dropItem.label} className={navStyles.dropdownItem} asChild>
                            <Link href={dropItem.href} lang={dropItem.language} hrefLang={dropItem.language}>{dropItem.label}</Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }
                if (item.name === "Rent") {
                  return (
                    <DropdownMenu key={item.name}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={navStyles.navLink}>
                          Rent
                          <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className={navStyles.dropdownContent} sideOffset={4}>
                        <DropdownMenuLabel className={navStyles.dropdownLabel}>For Rent</DropdownMenuLabel>
                        {rentDropdownItems.map((dropItem) => (
                          <DropdownMenuItem key={dropItem.label} className={navStyles.dropdownItem} asChild>
                            <Link href={dropItem.href}>{dropItem.label}</Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }
                return (
                  <Button
                    key={item.name}
                    asChild
                    variant="ghost"
                    className={`${navStyles.navLink} ${pathname === item.href ? navStyles.activeLink : ''}`}
                  >
                    <Link href={item.href}>
                      {item.name}
                    </Link>
                  </Button>
                );
              })}
            </nav>

            {/* CENTERED LOGO */}
            <div className={navStyles.logoContainer}>
              <Link href="/" className={navStyles.logoLink}>
                <div className={navStyles.logoImageContainer}>
                  <Image
                    src="/logo.png"
                    alt="Crown Coastal Logo"
                    width={200}
                    height={60}
                    className="object-contain w-full h-full dark:hidden brightness-0 opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                    priority
                  />
                  <Image
                    src="/logo.png"
                    alt="Crown Coastal Logo"
                    width={200}
                    height={60}
                    className="object-contain w-full h-full hidden dark:block brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* RIGHT NAVIGATION */}
            <nav className={navStyles.rightNav}>
              {rightNavItems.map((item) => (
                <Button
                  key={item.name}
                  asChild
                  variant="ghost"
                  className={`${navStyles.navLink} ${pathname === item.href ? navStyles.activeLink : ''}`}
                >
                  <Link href={item.href}>
                    {item.name}
                  </Link>
                </Button>
              ))}

              {/* Divider */}
              <div className={navStyles.divider} />

              {/* Theme Toggle */}
              <div className="flex items-center">
                <ThemeToggle />
              </div>

            </nav>
          </div>
        </div>
      </header>
    </>
  )
}
