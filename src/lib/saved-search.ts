import { z } from "zod"

const optionalNumber = (max: number) =>
  z.preprocess(
    (value) => value === "" || value === null || value === undefined ? undefined : Number(value),
    z.number().finite().nonnegative().max(max).optional()
  )

const savedSearchFiltersSchema = z.object({
  city: z.string().trim().max(160).optional(),
  county: z.string().trim().max(160).optional(),
  neighborhood: z.string().trim().max(160).optional(),
  minPrice: optionalNumber(1_000_000_000),
  maxPrice: optionalNumber(1_000_000_000),
  beds: optionalNumber(100),
  baths: optionalNumber(100),
  minSqft: optionalNumber(10_000_000),
  maxSqft: optionalNumber(10_000_000),
  minLot: optionalNumber(1_000_000_000),
  maxLot: optionalNumber(1_000_000_000),
  minYear: optionalNumber(3000),
  maxYear: optionalNumber(3000),
  maxHoa: optionalNumber(1_000_000),
  hasGarage: z.boolean().optional(),
  hasPool: z.boolean().optional(),
  isWaterfront: z.boolean().optional(),
  priceReduced: z.boolean().optional(),
  openHouseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  type: z.string().trim().max(100).optional(),
  propertyType: z.string().trim().max(100).optional(),
  propertyCategory: z.enum(["house", "condo", "townhouse", "manufactured"]).optional(),
  keywords: z.string().trim().max(100).optional(),
  action: z.enum(["buy", "rent"]).default("buy"),
}).superRefine((filters, ctx) => {
  if (filters.minPrice !== undefined && filters.maxPrice !== undefined && filters.minPrice > filters.maxPrice) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["maxPrice"], message: "Maximum price must be at least the minimum price" })
  }
  if (filters.minSqft !== undefined && filters.maxSqft !== undefined && filters.minSqft > filters.maxSqft) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["maxSqft"], message: "Maximum square footage must be at least the minimum" })
  }
  if (filters.minLot !== undefined && filters.maxLot !== undefined && filters.minLot > filters.maxLot) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["maxLot"], message: "Maximum lot size must be at least the minimum" })
  }
  if (filters.minYear !== undefined && filters.maxYear !== undefined && filters.minYear > filters.maxYear) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["maxYear"], message: "Maximum year must be at least the minimum" })
  }
})

export const savedSearchSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(254),
  label: z.string().trim().max(160).optional(),
  filters: savedSearchFiltersSchema,
  company: z.string().max(200).optional().default(""),
  __top: z.coerce.number().nonnegative().optional(),
})
