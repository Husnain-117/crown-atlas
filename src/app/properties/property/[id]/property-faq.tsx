"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface FAQItem {
  question: string
  answer: string
}

interface PropertyFAQProps {
  faqs: FAQItem[]
  propertyType: string
  propertyAddress: string
}

export default function PropertyFAQ({ faqs, propertyType, propertyAddress }: PropertyFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4 mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--coastal-text)]">
          Frequently Asked Questions About {propertyAddress || "This Property"}
        </h2>
        {propertyType && (
          <p className="mt-1 text-sm text-[var(--coastal-muted-text)]">
            Property type: {propertyType.replace(/([a-z])([A-Z])/g, "$1 $2")}
          </p>
        )}
      </div>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-[var(--coastal-border)] rounded-[var(--radius)] overflow-hidden bg-[var(--surface)]"
            itemScope
            itemType="https://schema.org/Question"
          >
            <button
              className={cn(
                "flex justify-between items-center w-full p-4 text-left font-medium focus:outline-none text-[var(--coastal-text)]",
                openIndex === index ? "bg-[var(--surface-muted)]" : "bg-[var(--surface)]",
              )}
              onClick={() => toggleFAQ(index)}
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span itemProp="name" className="text-lg">
                {faq.question}
              </span>
              {openIndex === index ? (
                <ChevronUp className="h-5 w-5 text-[var(--coastal-muted-text)] flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[var(--coastal-muted-text)] flex-shrink-0" />
              )}
            </button>
            <div
              id={`faq-answer-${index}`}
              className={cn(
                "px-4 overflow-hidden transition-all duration-200",
                openIndex === index ? "max-h-96 pb-4 bg-[var(--surface-muted)]" : "max-h-0",
              )}
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
            >
              <div itemProp="text" className="text-[var(--coastal-text)] leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
