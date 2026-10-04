import sanitizeHtml from "sanitize-html"

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "ul",
  "ol",
  "li",
  "h3",
  "h4",
  "blockquote",
  "a",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
]

export function sanitizeContentHtml(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href"],
      th: ["scope", "colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attributes) => {
        const href = attributes.href || ""
        const isInternal = href.startsWith("/") && !href.startsWith("//")
        const isOwnedUrl = href.startsWith("https://crowncoastalhomes.com/")
        const isMailto = href.startsWith("mailto:")

        if (!isInternal && !isOwnedUrl && !isMailto) {
          return { tagName: "span", attribs: {} } as sanitizeHtml.Tag
        }

        return { tagName: "a", attribs: { href } } as sanitizeHtml.Tag
      },
    },
  })
}
