/**
 * Shared mortgage calculation utilities.
 * Used by /mortgage-calculator page, listing detail mini calculator, and the modal.
 */

export const CA_PROPERTY_TAX_RATE = 0.011 // 1.1% California average
export const DEFAULT_INSURANCE_MONTHLY = 150 // ~$150/mo homeowner's insurance
export const PMI_ANNUAL_RATE = 0.005 // 0.5% of loan per year when LTV > 80%

export interface MonthlyBreakdown {
  principalAndInterest: number
  propertyTax: number
  insurance: number
  pmi: number
  hoa: number
  total: number
}

export interface AmortizationYearRow {
  year: number
  principalPaid: number
  interestPaid: number
  endBalance: number
}

export function computeMonthlyPI(
  loanAmount: number,
  annualRatePercent: number,
  termYears: number
): number {
  if (loanAmount <= 0 || annualRatePercent <= 0 || termYears <= 0) return 0
  const r = annualRatePercent / 100 / 12
  const n = termYears * 12
  return (loanAmount * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1)
}

export function computePMI(
  loanAmount: number,
  homePrice: number
): number {
  if (homePrice <= 0) return 0
  const ltv = loanAmount / homePrice
  if (ltv <= 0.8) return 0
  return (loanAmount * PMI_ANNUAL_RATE) / 12
}

export function computeMonthlyBreakdown(
  homePrice: number,
  downPaymentPercent: number,
  annualRatePercent: number,
  termYears: number,
  hoaMonthly = 0,
  propertyTaxRate = CA_PROPERTY_TAX_RATE,
  insuranceMonthly = DEFAULT_INSURANCE_MONTHLY
): MonthlyBreakdown {
  const downPayment = homePrice * (downPaymentPercent / 100)
  const loanAmount = homePrice - downPayment
  const pi = computeMonthlyPI(loanAmount, annualRatePercent, termYears)
  const tax = (homePrice * propertyTaxRate) / 12
  const pmi = computePMI(loanAmount, homePrice)

  return {
    principalAndInterest: pi,
    propertyTax: tax,
    insurance: insuranceMonthly,
    pmi,
    hoa: hoaMonthly,
    total: pi + tax + insuranceMonthly + pmi + hoaMonthly,
  }
}

export function buildAmortizationByYear(
  loanAmount: number,
  annualRatePercent: number,
  termYears: number
): AmortizationYearRow[] {
  if (loanAmount <= 0 || annualRatePercent <= 0 || termYears <= 0) return []

  const r = annualRatePercent / 100 / 12
  const n = termYears * 12
  const monthlyPayment = computeMonthlyPI(loanAmount, annualRatePercent, termYears)

  let balance = loanAmount
  const rows: AmortizationYearRow[] = []

  for (let year = 1; year <= termYears; year++) {
    let yearPrincipal = 0
    let yearInterest = 0
    const monthsThisYear = Math.min(12, n - (year - 1) * 12)

    for (let m = 0; m < monthsThisYear; m++) {
      const interest = balance * r
      const principal = monthlyPayment - interest
      yearPrincipal += principal
      yearInterest += interest
      balance -= principal
    }

    rows.push({
      year,
      principalPaid: yearPrincipal,
      interestPaid: yearInterest,
      endBalance: Math.max(0, balance),
    })

    if (balance <= 0) break
  }

  return rows
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
