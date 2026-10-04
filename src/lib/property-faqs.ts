export interface PropertyFaq {
  question: string
  answer: string
}

export function parsePropertyFaqs(value: string | null | undefined): PropertyFaq[] {
  if (!value) return []

  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []

    return parsed.filter((item): item is PropertyFaq => {
      if (!item || typeof item !== "object") return false
      const candidate = item as Record<string, unknown>
      return typeof candidate.question === "string" &&
        candidate.question.trim().length > 0 &&
        typeof candidate.answer === "string" &&
        candidate.answer.trim().length > 0
    })
  } catch {
    return []
  }
}
