"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp } from "lucide-react"

interface PricePoint {
  date: string
  price: number
  event?: string
}

interface PriceHistoryChartProps {
  priceHistory: PricePoint[]
  currentPrice: number
  previousListPrice?: number | null
  priceChangeTimestamp?: string | null
  listingContractDate?: string
  onMarketTimestamp?: string
}

function formatShortPrice(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toLocaleString()}`
}

function formatFullPrice(value: number): string {
  return `$${value.toLocaleString()}`
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

function formatShortDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    })
  } catch {
    return dateStr
  }
}

function eventLabel(event?: string): string {
  if (!event) return ""
  switch (event.toLowerCase()) {
    case "list": return "Listed"
    case "reduce": return "Price reduced"
    case "increase": return "Price increased"
    case "sold": return "Sold"
    default: return event.charAt(0).toUpperCase() + event.slice(1)
  }
}

export default function PriceHistoryChart({
  priceHistory,
  currentPrice,
  previousListPrice,
  priceChangeTimestamp,
  listingContractDate,
  onMarketTimestamp,
}: PriceHistoryChartProps) {
  const chartData = useMemo(() => {
    if (priceHistory && priceHistory.length >= 2) {
      return priceHistory
        .map((p) => ({ ...p, dateObj: new Date(p.date).getTime() }))
        .sort((a, b) => a.dateObj - b.dateObj)
    }

    if (
      previousListPrice != null &&
      priceChangeTimestamp &&
      previousListPrice > currentPrice
    ) {
      const startDate =
        listingContractDate || onMarketTimestamp || priceChangeTimestamp
      return [
        { date: startDate, price: previousListPrice, event: "list", dateObj: new Date(startDate).getTime() },
        { date: priceChangeTimestamp, price: currentPrice, event: "reduce", dateObj: new Date(priceChangeTimestamp).getTime() },
      ].sort((a, b) => a.dateObj - b.dateObj)
    }

    return []
  }, [priceHistory, currentPrice, previousListPrice, priceChangeTimestamp, listingContractDate, onMarketTimestamp])

  if (chartData.length < 2) return null

  const minPrice = Math.min(...chartData.map((d) => d.price))
  const maxPrice = Math.max(...chartData.map((d) => d.price))
  const padding = (maxPrice - minPrice) * 0.15 || maxPrice * 0.05
  const yMin = Math.floor((minPrice - padding) / 1000) * 1000
  const yMax = Math.ceil((maxPrice + padding) / 1000) * 1000

  return (
    <div className="p-4 sm:p-6 md:p-8 rounded-lg bg-[var(--surface)] shadow-md border border-[var(--coastal-border)]">
      <h2 className="text-xl sm:text-2xl font-bold text-[var(--coastal-text)] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-[var(--coastal-primary)] flex-shrink-0" />
        Price History
      </h2>

      <div className="w-full h-64 sm:h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--coastal-border)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              tick={{ fontSize: 12, fill: "var(--coastal-muted-text)" }}
            />
            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={formatShortPrice}
              tick={{ fontSize: 12, fill: "var(--coastal-muted-text)" }}
              width={70}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null
                const point = payload[0].payload as PricePoint & { dateObj: number }
                return (
                  <div className="bg-[var(--surface)] border border-[var(--coastal-border)] rounded-lg px-3 py-2 shadow-lg text-sm">
                    <p className="font-semibold text-[var(--coastal-text)]">
                      {formatFullPrice(point.price)}
                    </p>
                    <p className="text-[var(--coastal-muted-text)]">
                      {formatDate(point.date)}
                    </p>
                    {point.event && (
                      <p className="text-xs text-[var(--coastal-primary)] font-medium mt-0.5">
                        {eventLabel(point.event)}
                      </p>
                    )}
                  </div>
                )
              }}
            />
            <Line
              type="stepAfter"
              dataKey="price"
              stroke="var(--coastal-primary)"
              strokeWidth={2.5}
              dot={{ r: 5, fill: "var(--coastal-primary)", strokeWidth: 2, stroke: "var(--surface)" }}
              activeDot={{ r: 7, fill: "var(--coastal-primary)", strokeWidth: 2, stroke: "var(--surface)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--coastal-muted-text)]">
        {chartData.map((point, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 bg-[var(--surface-muted)] px-3 py-1.5 rounded-full"
          >
            <span className="font-semibold text-[var(--coastal-text)]">
              {formatShortPrice(point.price)}
            </span>
            <span className="text-xs">
              {formatDate(point.date)}
              {point.event ? ` · ${eventLabel(point.event)}` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
