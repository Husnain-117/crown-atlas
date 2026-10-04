"use client"

/**
 * MobileBottomNav — Crown Coastal Homes
 *
 * Fixed 5-item bottom navigation bar visible only on mobile (≤ 768px).
 * Rendered inside the global Layout so it appears on every page.
 *
 * CSS is handled by:  src/styles/crown-coastal-mobile.css  (#cc-mobile-bottom-nav)
 * The component itself is display:none on desktop via the @media block.
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, DollarSign, TrendingUp, Info } from "lucide-react"

const NAV_ITEMS = [
  { label: "Buy", href: "/buy", Icon: Search },
  { label: "Rent", href: "/rent", Icon: DollarSign },
  { label: "Home", href: "/", Icon: Home, cta: true },
  { label: "Sell", href: "/sell", Icon: TrendingUp },
  { label: "About", href: "/about", Icon: Info },
] as const

export default function MobileBottomNav() {
  const pathname = usePathname()
  const isPropertyDetail = /^\/properties\/(?:property\/[^/]+|[^/]+\/[^/]+)\/?$/.test(pathname)

  if (isPropertyDetail) {
    return null
  }

  return (
    <nav
      id="cc-mobile-bottom-nav"
      aria-label="Mobile navigation"
      // Hidden on desktop — shown only via the @media (max-width: 768px) CSS block.
      // We set display:none here so it never flashes on desktop before hydration.
      style={{ display: "none" }}
    >
      {NAV_ITEMS.map((item, i) => {
        const isActive = pathname === item.href

        if ('cta' in item && item.cta) {
          return (
            <Link
              key={i}
              href={item.href}
              className={`bnav-cta${isActive ? " active" : ""}`}
              aria-label={item.label ?? "Home"}
              aria-current={isActive ? "page" : undefined}
            >
              <item.Icon
                size={24}
                strokeWidth={2.5}
                color="#C9A84C"
                aria-hidden="true"
              />
            </Link>
          )
        }

        return (
          <Link
            key={i}
            href={item.href}
            prefetch={item.href === "/rent" ? false : undefined}
            className={`bnav-item${isActive ? " active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <item.Icon
              className="bnav-icon"
              size={20}
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span className="bnav-label">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
