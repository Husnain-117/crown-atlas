export type FAQItem = { question: string; answer: string }
type RichFAQItem = { q: string; longAnswer: string; shortAnswer?: string }
export type SEOMeta = { title?: string; description?: string; keywords?: string[]; jsonLd?: any }

// ============================================================================
// Keep a useful baseline without padding pages with excessive boilerplate.
// ============================================================================
export const MIN_FAQS = 8;

/**
 * Fallback FAQs for when cached FAQs are missing or insufficient.
 * These are buyer-focused, generic enough to work for any California city,
 * but include agent mention for E-E-A-T.
 * 
 * CRITICAL: At least one FAQ MUST reference Reza Barghlameno and DRE #02211952
 * This is EXPORTED for use by the rendering layer as a deterministic fallback.
 */
export function getFallbackFAQs(city: string): FAQItem[] {
  const cityTitle = city
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  return [
    {
      question: `How does Reza Barghlameno (DRE #02211952) help buyers review HOA documents?`,
      answer: `Reza Barghlameno can help buyers obtain and organize available HOA documents, identify transaction deadlines, and raise questions with the appropriate parties. Buyers should review governing documents, budgets, reserves, insurance, minutes, litigation, assessments, and use restrictions, and seek qualified legal or financial advice when needed.`
    },
    {
      question: `What should I know about home inspections in ${cityTitle}?`,
      answer: `Use qualified inspectors to evaluate the systems and conditions relevant to the specific property. The scope, timing, and cost vary. Review disclosures and discuss whether specialty inspections, permit research, insurance review, or other due diligence are appropriate before contractual deadlines.`
    },
    {
      question: `How long does it take to close on a home in ${cityTitle}?`,
      answer: `The closing timeline depends on the signed contract, financing, appraisal, title and escrow work, inspections, document delivery, and any negotiated changes. Confirm each deadline in the transaction calendar rather than relying on a citywide estimate.`
    },
    {
      question: `What are typical closing costs when buying in ${cityTitle}?`,
      answer: `Closing costs are transaction-specific and can include lender, escrow, title, insurance, tax, inspection, recording, HOA, and other charges or credits. Ask the lender and escrow or title professionals for current written estimates before committing funds.`
    },
    {
      question: `How do I know if a ${cityTitle} home is priced fairly?`,
      answer: `Compare recent nearby sales with similar property type, location, condition, size, features, and closing date. Also review current competition, listing history, disclosures, and needed work. A Comparative Market Analysis supports the discussion but is not an appraisal or a promise of market value.`
    },
    {
      question: `What mortgage options are available for ${cityTitle} homes?`,
      answer: `Available loan programs, eligibility, rates, insurance, down payment, reserves, and costs depend on the borrower, property, lender, and current rules. Compare written scenarios with qualified lenders and verify program requirements with the responsible program source.`
    },
    {
      question: `What should I look for in ${cityTitle} neighborhood research?`,
      answer: `Verify the factors important to you at the specific address, such as commute routes, transit, parking, public services, planning activity, insurance, taxes, and HOA rules. Use official district sources for school boundaries and official public agencies for local data. Visit the location at relevant times when possible.`
    },
    {
      question: `How competitive is the ${cityTitle} real estate market?`,
      answer: `Competition varies by property type, condition, location, price range, and current inventory. Review recent comparable sales, days on market, price changes, active alternatives, and the listing representative's instructions before deciding offer terms.`
    },
    {
      question: `When is the best time to buy a home in ${cityTitle}?`,
      answer: `The practical time to buy is when your finances, financing, housing needs, and ability to complete due diligence are aligned. Inventory and borrowing costs change, so use current information instead of a fixed seasonal rule.`
    },
    {
      question: `What property types are available for purchase in ${cityTitle}?`,
      answer: `Current inventory may include different building and ownership types. Verify the legal ownership form, maintenance responsibility, insurance, HOA obligations, land or unit boundaries, use restrictions, and financing eligibility for each property.`
    },
    {
      question: `How do property taxes work in California?`,
      answer: `Property taxes and assessments depend on the property, transaction, and current rules. Review county records and written transaction estimates, and consult the county or a qualified tax professional for authoritative guidance about your situation.`
    },
    {
      question: `What questions should I ask before making an offer?`,
      answer: `Review the listing history, comparable sales, disclosures, included items, property condition, financing, insurance, title, HOA documents when applicable, and seller instructions. Discuss price, contingencies, deadlines, possession, and other terms with your agent before signing.`
    },
  ];
}

/**
 * Pad sparse FAQ sets with reviewed, deterministic questions.
 * This is a DETERMINISTIC operation (no AI calls).
 */
export function padFAQsToMinimum(faqs: FAQItem[], city: string): FAQItem[] {
  if (faqs.length >= MIN_FAQS) {
    return faqs;
  }
  
  const fallbacks = getFallbackFAQs(city);
  const existingQuestions = new Set(faqs.map(f => f.question.toLowerCase().trim()));
  
  // Add fallback FAQs that don't duplicate existing questions
  const result = [...faqs];
  for (const fallback of fallbacks) {
    if (result.length >= MIN_FAQS) break;
    if (!existingQuestions.has(fallback.question.toLowerCase().trim())) {
      result.push(fallback);
      existingQuestions.add(fallback.question.toLowerCase().trim());
    }
  }
  
  return result;
}

/**
 * Ensure FAQs meet the minimum requirement for rendering.
 * This is the PRIMARY function for render-time FAQ guarantee.
 * Converts {q, a} format to {question, answer} format if needed.
 * Returns at least MIN_FAQS reviewed items, using fallbacks if necessary.
 * 
 * @param rawFaqs - FAQs from DB in either {q, a} or {question, answer} format
 * @param city - City name for generating fallbacks
 * @returns Array of FAQItem with at least MIN_FAQS items
 */
export function ensureFAQsForRender(
  rawFaqs: Array<{ q?: string; a?: string; question?: string; answer?: string }> | undefined,
  city: string
): FAQItem[] {
  if (!rawFaqs || rawFaqs.length === 0) {
    return getFallbackFAQs(city).slice(0, MIN_FAQS);
  }
  
  // Normalize to {question, answer} format
  const normalized: FAQItem[] = rawFaqs
    .map(f => ({
      question: f.question || f.q || '',
      answer: f.answer || f.a || ''
    }))
    .filter(f => f.question && f.answer);
  
  // Pad to minimum
  return padFAQsToMinimum(normalized, city);
}

export async function getOrGenerateFaqs(city: string, slug: string): Promise<{ faqs: FAQItem[]; markdown: string; jsonLd: any; meta?: SEOMeta } | null> {
  const pageName = slug
  const loweredCity = city.toLowerCase()
  const fallbackFaqs = getFallbackFAQs(city);
  return { 
    faqs: fallbackFaqs, 
    markdown: buildMarkdownFromFaqs(fallbackFaqs), 
    jsonLd: buildFAQJsonLd(loweredCity, pageName, fallbackFaqs) 
  }
}

function buildMarkdownFromFaqs(faqs: FAQItem[]): string {
  return (faqs || []).map(f => `### ${f.question}\n\n${f.answer}`).join('\n\n')
}

function buildFAQJsonLd(city: string, slug: string, faqs: FAQItem[], rich?: RichFAQItem[]) {
  const shortMap = new Map<string, string>()
  if (rich && Array.isArray(rich)) {
    for (const r of rich) {
      const q = String(r.q || '').trim()
      const s = String(r.shortAnswer || '').trim()
      if (q && s) shortMap.set(q, s)
    }
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': (faqs || []).map(f => ({
      '@type': 'Question',
      'name': f.question,
      'acceptedAnswer': { '@type': 'Answer', 'text': shortMap.get(f.question) || f.answer }
    }))
  }
}
