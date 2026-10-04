import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Globe2 } from 'lucide-react';
import { ArticleMarkdown } from '@/components/blog/article-markdown';

export const metadata: Metadata = {
  title: "California Home Buyer's Guide | Crown Coastal Homes",
  description: 'Plan your California home purchase: budgets, buyer representation, virtual tours, offers, inspections, escrow and closing, including guidance for buyers abroad.',
  alternates: { canonical: '/buyers-guide' },
  openGraph: {
    title: "California Home Buyer's Guide | Crown Coastal Homes",
    description: 'Eight practical steps from your first shortlist to collecting the keys, including arrangements for UK and international buyers.',
    url: '/buyers-guide',
  },
};

const steps = [
  {
    "id": "budget",
    "title": "Define your search and total budget",
    "body": "Start with a short buying brief: preferred locations, intended use, property type, essential features and target timing. Include places you need to reach regularly. Compare neighbourhoods against these requirements before narrowing your search to individual homes.\n\nBudget for the purchase and ongoing ownership. Ask for property-specific estimates of closing costs, insurance, property taxes, any homeowners’ association (HOA) charges and maintenance. Keep room for repairs and moving costs. The [California Department of Real Estate’s homebuyer resources](https://www.dre.ca.gov/Consumers/FirstHomeCalifornia.html) can help you prepare.\n\nIf you need a mortgage, speak with lenders early about your circumstances and required documents. For UK funds, ask your bank about transfer arrangements and currency costs before committing to payment deadlines."
  },
  {
    "id": "representation",
    "title": "Understand who represents you",
    "body": "Before arranging private tours, discuss buyer representation with your agent. Review the written agreement, including services, duration, cancellation terms, compensation and when payment is due. Ask whether the agent or brokerage also represents the seller in a transaction you are considering.\n\nCompensation is negotiable; establish what you could owe and whether any seller contribution has actually been agreed. Keep a copy of everything you sign. [DRE buyer-representation guidance](https://www.dre.ca.gov/Licensees/Advisory_2024_11_14_Changes_to_Buyer_Representation.html) and its [2026 legislative update](https://www.dre.ca.gov/Newsroom/DRE_Updates/2026_05_06_EOY_Bill_Summaries_2025.html) explain this framework."
  },
  {
    "id": "shortlist",
    "title": "Build and test your shortlist",
    "body": "Review current availability with your agent. Compare homes using the same criteria: layout, condition, outdoor space, access, surroundings and likely ownership costs. Request recent comparable sales and an explanation of relevant differences.\n\nIf you are abroad, ask Reza about virtual tours. Prepare questions that photographs cannot answer: natural light, storage, street noise, access and visible condition. Request follow-up views of anything unclear. A virtual tour helps you evaluate a property; arrange independent inspections separately.\n\nAgree a communication channel and put appointments in both your local time and California time. If you plan a viewing trip, confirm access before booking your itinerary."
  },
  {
    "id": "offer",
    "title": "Make an informed offer",
    "body": "Ask your agent to walk through the proposed price, deposit, included items, closing date and any contingencies. A contingency is a contractual condition; its wording and deadline matter. Discuss inspection, financing and appraisal provisions that are relevant to your purchase.\n\nUnderstand what happens if a condition is not met, and how deposit treatment depends on the agreement. Read counteroffers carefully. When terms are accepted, create a shared calendar of deadlines and required actions. [DRE: Information for Homebuyers](https://www.dre.ca.gov/consumers/informationforhomebuyers.html)"
  },
  {
    "id": "investigations",
    "title": "Investigate the property and ownership costs",
    "body": "Schedule an independent home inspection promptly. Read the report, ask the inspector to explain findings and arrange specialist follow-up where needed. An appraisal assesses value and serves a different purpose from an inspection of physical condition. Discuss repairs or other responses with your agent before applicable deadlines. [CFPB: Home inspections](https://www.consumerfinance.gov/owning-a-home/close/schedule-a-home-inspection/)\n\nReview seller disclosures and relevant property, title and HOA documents. Keep an open-questions list and ask the appropriate professional to resolve each item before making decisions about contractual protections.\n\nRequest insurance quotes for the actual property early. Compare coverage, exclusions and deductibles as well as price, and confirm availability. [California Department of Insurance: Residential insurance](https://www.insurance.ca.gov/01-consumers/105-type/95-guides/03-res/res-ins-guide.cfm)"
  },
  {
    "id": "escrow",
    "title": "Coordinate escrow and financing",
    "body": "Escrow is the neutral process for holding and handling transaction funds and documents under agreed instructions. Confirm your escrow contact, outstanding requirements and anticipated closing arrangements. [DRE: Escrow and title](https://www.dre.ca.gov/consumers/informationforhomebuyers.html)\n\nFor a financed purchase, respond promptly to lender requests and track remaining approval conditions. Review changes to loan estimates and ask about anything unfamiliar. [CFPB: Getting ready to close](https://www.consumerfinance.gov/owning-a-home/close/)\n\nIf signing from the UK, ask escrow and your lender which identification, signing and notarisation arrangements they accept. Confirm whether original documents or an in-person appointment are needed, and build those arrangements into the schedule."
  },
  {
    "id": "closing",
    "title": "Review documents and confirm payment instructions",
    "body": "Read closing documents before signing. For most home-purchase mortgages, a Closing Disclosure sets out final loan terms and costs and must be provided at least three business days before closing. Compare it with your latest Loan Estimate and resolve differences with your lender. [CFPB: Closing Disclosure](https://www.consumerfinance.gov/ask-cfpb/what-is-a-closing-disclosure-en-1983/)\n\nBefore transferring funds, verify the recipient and instructions by calling a trusted contact on a number established independently in advance. Treat emailed changes as something to verify, including any replacement phone number. [CFPB: Protecting closing funds](https://www.consumerfinance.gov/archive/blog/mortgage-closing-scams-how-protect-yourself-and-your-closing-funds/)"
  },
  {
    "id": "handover",
    "title": "Confirm completion and plan the handover",
    "body": "Arrange the final walkthrough and raise unresolved issues. Confirm with your agent and escrow when closing is complete and when possession and keys are available under the contract.\n\nPrepare utilities, insurance, access arrangements and maintenance contacts. Keep your signed documents and inspection reports together. If you will remain overseas, decide who will check the property and handle urgent issues locally."
  }
];

export default function BuyersGuidePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--coastal-text)]">
      <section className="coastal-section-light border-b border-[var(--coastal-border)] px-5 pt-28 pb-14 sm:pt-36 sm:pb-20">
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-9 text-sm text-[var(--coastal-muted-text)]">
            <Link href="/" className="hover:underline">Home</Link>
            <span aria-hidden="true" className="mx-3">/</span>
            <span aria-current="page">Buyer's guide</span>
          </nav>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--coastal-primary)]">Your California buying plan</p>
          <h1 className="max-w-4xl font-display text-4xl leading-tight sm:text-6xl lg:text-7xl">Your guide to buying<br className="hidden sm:block" /> a home in California.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--coastal-muted-text)]">A good purchase starts with clear priorities, reliable information and a plan for each deadline. Follow these eight steps to buying a home in California, whether you are nearby or searching from the UK.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--coastal-primary)] px-6 py-3 font-semibold text-white hover:opacity-90">Discuss your search with Reza <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <a href="#budget" className="inline-flex min-h-12 items-center rounded-xl border border-[var(--coastal-border)] px-6 py-3 font-semibold hover:bg-[var(--surface)]">Read the guide</a>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16 lg:py-16">
        <aside>
          <nav aria-label="Steps in the buying guide" className="rounded-2xl border border-[var(--coastal-border)] bg-[var(--surface)] p-5 lg:sticky lg:top-28">
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-[var(--coastal-muted-text)]">In this guide</p>
            <ol className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {steps.map((step, index) => (
                <li key={step.id}><a href={`#${step.id}`} className="flex min-h-11 items-start gap-3 rounded-lg py-2 text-sm leading-relaxed hover:text-[var(--coastal-primary)]">
                  <span className="shrink-0 font-semibold text-[var(--coastal-primary)]">{String(index + 1).padStart(2, '0')}</span>{step.title}
                </a></li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="min-w-0">
          <div id="buying-from-abroad" className="mb-10 flex scroll-mt-28 gap-4 rounded-2xl border border-[var(--coastal-border)] bg-[var(--surface)] p-6">
            <Globe2 className="mt-1 h-6 w-6 shrink-0 text-[var(--coastal-primary)]" aria-hidden="true" />
            <div><h2 className="mb-2 text-lg font-semibold">Planning from abroad?</h2><p className="leading-relaxed text-[var(--coastal-muted-text)]">Keep a shared deadline calendar, confirm time zones and ask about virtual tours. Arrange property inspections and accepted signing methods with the appropriate professionals before committing to a closing schedule.</p></div>
          </div>
          {steps.map((step, index) => (
            <section key={step.id} id={step.id} className="scroll-mt-28 border-b border-[var(--coastal-border)] pb-8 mb-10 last:mb-0">
              <div className="mb-5 flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-sm font-semibold text-[var(--coastal-primary)]">{String(index + 1).padStart(2, '0')}</span>
                <h2 className="font-display text-3xl leading-tight sm:text-4xl">{step.title}</h2>
              </div>
              <ArticleMarkdown>{step.body}</ArticleMarkdown>
            </section>
          ))}
          <p className="text-sm leading-relaxed text-[var(--coastal-muted-text)]">For questions about your ownership structure, tax position, financing eligibility or immigration plans, involve appropriately qualified advisers alongside your property search.</p>
        </article>
      </div>

      <section className="border-t border-[var(--coastal-border)] bg-[var(--surface)] px-5 py-14 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div><p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--coastal-primary)]">Your next step</p><h2 className="font-display text-4xl sm:text-5xl">Make your search a little clearer.</h2><p className="mt-4 leading-relaxed text-[var(--coastal-muted-text)]">Talk with Reza about your preferred location, shortlist and viewing options. Bring these three details to start a useful conversation.</p></div>
          <div className="rounded-2xl border border-[var(--coastal-border)] bg-[var(--bg)] p-6 sm:p-8">
            <ul className="mb-6 space-y-3">{['Preferred locations and property type', 'Approximate budget and purchase timing', 'Where you are based and any travel plans'].map((item) => <li key={item} className="flex gap-3 text-sm"><Check className="h-5 w-5 shrink-0 text-[var(--coastal-primary)]" aria-hidden="true" />{item}</li>)}</ul>
            <Link href="/contact" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--coastal-primary)] px-5 py-3 text-center font-semibold text-white hover:opacity-90">Discuss your home search <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link href="/team/reza-barghlameno" className="mt-4 block text-center text-sm text-[var(--coastal-primary)] underline underline-offset-4">Meet Reza</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
