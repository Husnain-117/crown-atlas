"use client"

/**
 * Crown Coastal Homes — Professional Mobile Header
 * 
 * FEATURES:
 * - ✅ Semantic HTML5 (header role="banner")
 * - ✅ Stable class names (no fragile selectors)
 * - ✅ Professional spacing & typography
 * - ✅ Accessible touch targets (44×44px min)
 * - ✅ Safe-area-inset for notched devices
 * - ✅ Proper ARIA labels & roles
 * - ✅ Actual Crown Coastal logo (same as desktop), resized for mobile
 * - ✅ Dark mode support
 */

import Link from "next/link"
import Image from "next/image"
import { Menu, Sun, Moon } from "lucide-react"
import { useState, useEffect } from "react"

interface ProfessionalMobileHeaderProps {
  onMenuClick?: () => void
  isMobileMenuOpen?: boolean
}

export default function ProfessionalMobileHeader({
  onMenuClick,
  isMobileMenuOpen = false,
}: ProfessionalMobileHeaderProps) {
  const [mounted, setMounted] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    setMounted(true)

    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true)
    } else {
      setIsDarkMode(false)
    }
  }, [])

  const toggleTheme = () => {
    const next = !isDarkMode
    setIsDarkMode(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <header
      id="mobile-header-container"
      className="site-header"
      role="banner"
      data-component="mobile-header"
    >
      {/* Logo Section - LEFT (actual Crown Coastal logo, same as desktop) */}
      <Link href="/" id="mobile-logo-section" className="flex items-center min-w-0 flex-1">
        <div id="mobile-logo-image-wrapper" className="relative h-9 w-[120px] sm:h-10 sm:w-[140px] flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Crown Coastal Homes"
            fill
            sizes="(max-width: 640px) 120px, 140px"
            className={`object-contain object-left opacity-95 transition-all duration-300 brightness-0 ${mounted && isDarkMode ? 'invert' : ''}`}
            priority
          />
        </div>
      </Link>

      {/* Right-side action buttons */}
      <div id="mobile-header-actions">
        {/* Theme Toggle Button */}
        <button
          id="mobile-theme-toggle-btn"
          aria-label={mounted && isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          type="button"
          onClick={toggleTheme}
        >
          {mounted && isDarkMode
            ? <Moon size={18} className="text-slate-300" />
            : <Sun size={18} className="text-amber-500" />}
        </button>

        {/* Hamburger Button */}
        <button
          id="mobile-hamburger-btn"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu-panel"
          type="button"
          onClick={onMenuClick}
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  )
}
