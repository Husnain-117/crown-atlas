"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CRMLSDisclaimerProps {
  lastUpdated?: string
  compact?: boolean // For map page - shows minimal strip
}

function formatMlsTimestamp(lastUpdated?: string): string {
  if (!lastUpdated) return "the most recent data update available to this website"

  const parsed = new Date(lastUpdated)
  if (Number.isNaN(parsed.getTime())) return lastUpdated

  return `${parsed.toISOString().replace("T", " ").replace(".000Z", " UTC")}`
}

export default function CRMLSDisclaimer({ lastUpdated, compact = false }: CRMLSDisclaimerProps) {
  const formattedDate = formatMlsTimestamp(lastUpdated)
  const [isExpanded, setIsExpanded] = useState(false)

  // Compact mode for map page - shows minimal strip
  if (compact) {
    return (
      <div className="bg-neutral-50 dark:bg-slate-900 border-t border-neutral-200 dark:border-slate-700 theme-transition">
        {!isExpanded ? (
          // Collapsed state - minimal strip
          <div className="py-2 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Image
                  src="/crmls logo.png"
                  alt="CRMLS Logo"
                  width={80}
                  height={30}
                  className="object-contain filter hue-rotate-[320deg]"
                />
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  Data from California Regional MLS
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="text-xs text-[var(--coastal-secondary)] hover:text-[var(--secondary-hover)]"
              >
                View Details
                <ChevronUp className="h-3 w-3 ml-1 rotate-180" />
              </Button>
            </div>
          </div>
        ) : (
          // Expanded state - full disclaimer
          <div className="py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-end mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-xs text-[var(--coastal-secondary)] hover:text-[var(--secondary-hover)]"
                >
                  Hide
                  <ChevronUp className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                <div className="flex-shrink-0">
                  <Image
                    src="/crmls logo.png"
                    alt="CRMLS Logo"
                    width={120}
                    height={50}
                    className="object-contain filter hue-rotate-[320deg]"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed theme-transition">
                    The multiple listing data appearing on this website, or contained in reports produced therefrom, is owned and copyrighted by California Regional Multiple Listing Service, Inc. ("CRMLS") and is protected by all applicable copyright laws. Information provided is for viewer's personal, non-commercial use and may not be used for any purpose other than to identify prospective properties the viewer may be interested in purchasing. All listing data, including but not limited to square footage and lot size is believed to be accurate, but the listing Agent, listing Broker and CRMLS and its affiliates do not warrant or guarantee such accuracy. The viewer should independently verify the listed data prior to making any decisions based on such information by personal inspection and/or contacting a real estate professional. Based on information from California Regional Multiple Listing Service, Inc. as of {formattedDate} and /or other sources. All data, including all measurements and calculations of area, is obtained from various sources and has not been, and will not be, verified by broker or MLS. All information should be independently reviewed and verified for accuracy. Properties may or may not be listed by the office/agent presenting the information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Default full mode for other pages
  const fullText = `The multiple listing data appearing on this website, or contained in reports produced therefrom, is owned and copyrighted by California Regional Multiple Listing Service, Inc. ("CRMLS") and is protected by all applicable copyright laws. Information provided is for viewer's personal, non-commercial use and may not be used for any purpose other than to identify prospective properties the viewer may be interested in purchasing. All listing data, including but not limited to square footage and lot size is believed to be accurate, but the listing Agent, listing Broker and CRMLS and its affiliates do not warrant or guarantee such accuracy. The viewer should independently verify the listed data prior to making any decisions based on such information by personal inspection and/or contacting a real estate professional. Based on information from California Regional Multiple Listing Service, Inc. as of ${formattedDate} and /or other sources. All data, including all measurements and calculations of area, is obtained from various sources and has not been, and will not be, verified by broker or MLS. All information should be independently reviewed and verified for accuracy. Properties may or may not be listed by the office/agent presenting the information.`
  
  const shortText = `Data provided by California Regional Multiple Listing Service, Inc. ("CRMLS"). Information is for viewer's personal, non-commercial use. All data should be independently verified for accuracy.`

  return (
    <div className="bg-neutral-50 dark:bg-slate-900 border-t border-neutral-200 dark:border-slate-700 py-4 md:py-6 px-4 sm:px-6 lg:px-8 theme-transition">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-3 md:gap-6 items-start">
          {/* CRMLS Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/crmls logo.png"
              alt="CRMLS Logo"
              width={100}
              height={40}
              className="object-contain filter hue-rotate-[320deg] md:w-[120px] md:h-[50px]"
            />
          </div>

          {/* Disclaimer Text */}
          <div className="flex-1">
            {/* Mobile: Show short text with toggle */}
            <div className="md:hidden">
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed theme-transition">
                {isExpanded ? fullText : shortText}
              </p>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-xs font-semibold text-[var(--coastal-primary)] hover:text-[var(--coastal-secondary)] transition-colors"
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            </div>

            {/* Desktop: Always show full text */}
            <p className="hidden md:block text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed theme-transition">
              {fullText}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
