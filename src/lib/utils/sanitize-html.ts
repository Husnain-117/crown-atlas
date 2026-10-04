/**
 * HTML Sanitization Utility for Landing Pages
 * 
 * Provides safe rendering of AI-generated HTML content.
 * Strips potentially dangerous elements while preserving formatting.
 * 
 * CRITICAL: All AI-generated HTML MUST go through this sanitizer
 * before being passed to dangerouslySetInnerHTML.
 */

import sanitizeHtmlLibrary from 'sanitize-html';

/**
 * Allowed HTML tags for landing page content.
 * This whitelist ensures only safe formatting elements are rendered.
 */
const ALLOWED_TAGS = [
  // Text formatting
  'p', 'br', 'hr',
  'strong', 'b', 'em', 'i', 'u', 's', 'mark',
  // Headings (h2-h6 allowed, h1 reserved for page title)
  'h2', 'h3', 'h4', 'h5', 'h6',
  // Lists
  'ul', 'ol', 'li',
  // Tables (for price_breakdown)
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  // Links (href sanitized separately)
  'a',
  // Block elements
  'div', 'span', 'blockquote',
];

/**
 * Allowed attributes for each tag type.
 * Everything else is stripped.
 */
const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ['href', 'title', 'target', 'rel'],
  table: ['class'],
  th: ['scope', 'colspan', 'rowspan', 'class'],
  td: ['colspan', 'rowspan', 'class'],
  div: ['class'],
  span: ['class'],
};

/**
 * Dangerous URL patterns that should be stripped.
 */
const DANGEROUS_URL_PATTERNS = [
  /^javascript:/i,
  /^data:/i,
  /^vbscript:/i,
  /^file:/i,
];

/**
 * Check if a URL is safe (http, https, relative, or mailto)
 */
function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  
  // Allow relative URLs
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return true;
  }
  
  // Allow http/https
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return true;
  }
  
  // Allow mailto (for contact links)
  if (trimmed.startsWith('mailto:')) {
    return true;
  }
  
  // Block dangerous patterns
  for (const pattern of DANGEROUS_URL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return false;
    }
  }
  
  // Block anything else that looks like a protocol
  if (/^[a-z]+:/i.test(trimmed)) {
    return false;
  }
  
  return true;
}

/**
 * Sanitize HTML string by removing dangerous elements and attributes.
 * 
 * This is a simple regex-based sanitizer for server-side use.
 * For more robust sanitization, consider using DOMPurify in the browser.
 * 
 * @param html - Raw HTML string from AI generation
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  return sanitizeHtmlLibrary(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attributes) => {
        const href = attributes.href || '';
        if (!isSafeUrl(href)) {
          return { tagName: 'span', attribs: {} } as sanitizeHtmlLibrary.Tag;
        }

        const target = attributes.target === '_blank' ? '_blank' : undefined;
        return {
          tagName: 'a',
          attribs: {
            href,
            ...(attributes.title ? { title: attributes.title } : {}),
            ...(target ? { target, rel: 'noopener noreferrer' } : {}),
          },
        } as sanitizeHtmlLibrary.Tag;
      },
    },
  });
}

/**
 * Strip duplicate heading from body content.
 * AI sometimes generates the heading inside the body HTML as well.
 * 
 * @param body - HTML body content
 * @param heading - Section heading to strip if duplicated
 * @returns Body with duplicate heading removed
 */
export function stripDuplicateHeading(body: string, heading?: string): string {
  if (!heading || !body) return body || '';
  
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^\\s*<h2[^>]*>\\s*${escaped}\\s*</h2>`, 'i');
  
  return body.replace(regex, '').trim();
}

/**
 * Sanitize and strip duplicate heading in one operation.
 * Use this for all AI-generated section bodies.
 * 
 * @param body - Raw HTML body from AI
 * @param heading - Section heading to strip
 * @returns Safe HTML for dangerouslySetInnerHTML
 */
export function safeHtml(body: string, heading?: string): string {
  const withoutDuplicate = stripDuplicateHeading(body, heading);
  return sanitizeHtml(withoutDuplicate);
}

export default sanitizeHtml;
