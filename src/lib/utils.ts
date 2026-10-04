import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`
  } else if (price >= 1000) {
    return `$${(price / 1000).toFixed(0)}K`
  } else {
    return `$${price}`
  }
}

export function formatPriceWithCommas(price: number): string {
  return `$${price.toLocaleString("en-US")}`
}

export function formatPriceWithCommasAndDecimals(price: number): string {
  const hasCents = !Number.isInteger(price)

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(price)
}
