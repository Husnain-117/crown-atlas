"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  emitJsonLd?: boolean
}

export function Breadcrumbs({ items, className, emitJsonLd = true }: BreadcrumbsProps) {
  // Ensure Home is first
  const allItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    ...items
  ]

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className={cn("w-full", className)}
      >
        <ol
          className="inline-flex max-w-full items-center gap-1.5 sm:gap-2 rounded-full border border-white/30 dark:border-white/20 bg-white/55 dark:bg-[#25364d]/70 px-2.5 sm:px-3 py-1.5 backdrop-blur-md shadow-[0_8px_22px_rgba(12,28,48,0.18)] dark:shadow-[0_10px_26px_rgba(0,0,0,0.4)] overflow-x-auto"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1
            return (
              <li
                key={item.href}
                className="flex items-center shrink-0"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {isLast ? (
                  <span
                    aria-current="page"
                    className="text-[13px] sm:text-sm text-slate-500 dark:text-slate-200/90 font-medium"
                    itemProp="name"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 text-[13px] sm:text-sm text-slate-700 dark:text-slate-100/90 hover:text-[var(--coastal-primary)] dark:hover:text-[#D4B574] transition-colors"
                    itemProp="item"
                  >
                    {index === 0 && <Home className="h-3.5 w-3.5" aria-hidden="true" />}
                    <span itemProp="name">{item.label}</span>
                  </Link>
                )}
                <meta itemProp="position" content={String(index + 1)} />
                {!isLast && (
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 mx-1.5 text-slate-400 dark:text-slate-300/75" />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {emitJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: allItems.map((item, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: item.label,
                item: `https://crowncoastalhomes.com${item.href}`
              }))
            })
          }}
        />
      )}
    </>
  )
}

