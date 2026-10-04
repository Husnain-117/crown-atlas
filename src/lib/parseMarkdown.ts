/**
 * Converts raw markdown-style content (from city lifestyle API) to safe HTML.
 * Handles: **bold** title at start → <h3>, • bullets → <ul><li>, paragraphs, line breaks.
 * Used for Schools & Education and Lifestyle & Amenities sections.
 */

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (ch) => map[ch] ?? ch);
}

/** Escape HTML then replace **bold** with <strong>, *italic* with <em>, strip stray asterisks. */
function inlineFormat(segment: string): string {
  let s = escapeHtml(segment.trim());
  if (!s) return "";
  // **bold** (greedy, non-nested)
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // *italic* (single asterisk, not part of **)
  s = s.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  // Strip any leftover single or double asterisks
  s = s.replace(/\*+/g, "").trim();
  return s;
}

/**
 * Parse content in the form:
 * "**Section Title in City** Intro paragraph. • Bullet 1. • Bullet 2. Closing sentence."
 * Returns HTML string: <h3>...</h3><p>...</p><ul><li>...</li></ul><p>...</p>
 */
/** If content is already HTML (e.g. from future AI output), sanitize and return. */
function isLikelyHtml(s: string): boolean {
  const t = s.trim();
  return t.startsWith("<h3>") || t.startsWith("<p>") || t.startsWith("<ul>") || /^\s*<[a-z][\s\S]*>/i.test(t);
}

export function parseMarkdown(content: string | null | undefined): string {
  if (content == null || typeof content !== "string") return "";
  const raw = content.trim();
  if (!raw) return "";

  if (isLikelyHtml(raw)) {
    return escapeHtml(raw)
      .replace(/&lt;h3&gt;/gi, "<h3>")
      .replace(/&lt;\/h3&gt;/gi, "</h3>")
      .replace(/&lt;p&gt;/gi, "<p>")
      .replace(/&lt;\/p&gt;/gi, "</p>")
      .replace(/&lt;ul&gt;/gi, "<ul>")
      .replace(/&lt;\/ul&gt;/gi, "</ul>")
      .replace(/&lt;li&gt;/gi, "<li>")
      .replace(/&lt;\/li&gt;/gi, "</li>")
      .replace(/&lt;strong&gt;/gi, "<strong>")
      .replace(/&lt;\/strong&gt;/gi, "</strong>")
      .replace(/&lt;em&gt;/gi, "<em>")
      .replace(/&lt;\/em&gt;/gi, "</em>");
  }

  const parts: string[] = [];
  let rest = raw;

  // 1. Optional opening **title** → <h3>
  const boldMatch = rest.match(/^\*\*([^*]+)\*\*\s*/);
  if (boldMatch) {
    const title = escapeHtml(boldMatch[1].trim());
    parts.push(`<h3>${title}</h3>`);
    rest = rest.slice(boldMatch[0].length).trim();
  }

  // 2. Split by bullet delimiter "• " (allow space after •)
  const bulletSplit = rest.split(/\s*•\s+/).map((s) => s.trim()).filter(Boolean);
  if (bulletSplit.length === 0) {
    // No bullets: treat whole rest as one or more paragraphs
    const paras = rest.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
    paras.forEach((p) => {
      const formatted = inlineFormat(p);
      if (formatted) parts.push(`<p>${formatted}</p>`);
    });
    return parts.join("");
  }

  // First segment is intro (before first bullet); last might be closing sentence
  const firstChunk = bulletSplit[0];
  const lastChunk = bulletSplit[bulletSplit.length - 1];
  const closingPhrases = ["Crown Coastal Homes", "contact Crown Coastal", "we can help", "reach out"];
  const isClosing = closingPhrases.some((phrase) => lastChunk.includes(phrase));

  let intro = firstChunk;
  let bullets: string[] = [];
  let closing = "";

  if (bulletSplit.length === 1) {
    // Only one segment: either intro or single bullet
    if (firstChunk.includes(".") && !firstChunk.startsWith("Verify") && !firstChunk.startsWith("Inquire") && !firstChunk.startsWith("Research") && !firstChunk.startsWith("Check")) {
      intro = firstChunk;
    } else {
      bullets = [firstChunk];
    }
  } else {
    if (isClosing && bulletSplit.length > 1) {
      closing = lastChunk;
      bullets = bulletSplit.slice(1, -1);
    } else {
      bullets = bulletSplit.slice(1);
    }
  }

  if (intro) {
    const formatted = inlineFormat(intro);
    if (formatted) parts.push(`<p>${formatted}</p>`);
  }
  if (bullets.length > 0) {
    const items = bullets.map((b) => `<li>${inlineFormat(b)}</li>`).join("");
    parts.push(`<ul>${items}</ul>`);
  }
  if (closing) {
    const formatted = inlineFormat(closing);
    if (formatted) parts.push(`<p>${formatted}</p>`);
  }

  return parts.join("");
}
