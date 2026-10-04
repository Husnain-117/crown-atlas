/**
 * Parses raw markdown from the neighborhood/city AI content into clean HTML.
 * Handles ### headings, **bold** at start as h3, • bullets, and inline ** / *.
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

function wrapIntro(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const h3Match = trimmed.match(/^(<h3>.*?<\/h3>)([\s\S]*)$/);
  if (h3Match) {
    const heading = h3Match[1];
    const rest = h3Match[2].trim();
    if (!rest) return heading;
    return heading + `<p>${rest}</p>`;
  }
  return `<p>${trimmed}</p>`;
}

export function parseNeighborhoodContent(raw: string | null | undefined): string {
  if (raw == null || typeof raw !== "string" || raw.trim() === "") return "";

  let text = raw.trim();

  // Handle: "### Title CityName, California rest of paragraph..." (no newline between heading and paragraph)
  if (text.startsWith("#")) {
    const withoutHash = text.replace(/^#{1,3}\s+/, "");
    const cityPattern = /^(.+?)\s+([A-Z][a-zA-Z\s]+,\s+California)/;
    const match = withoutHash.match(cityPattern);

    if (match) {
      const headingText = match[1].trim();
      const rest = withoutHash.slice(headingText.length).trim();
      text = `<h3>${escapeHtml(headingText)}</h3>${rest ? escapeHtml(rest) : ""}`;
    } else {
      const lines = withoutHash.split("\n");
      const headingText = lines[0].trim();
      const rest = lines.slice(1).join("\n").trim();
      text = `<h3>${escapeHtml(headingText)}</h3>${rest ? escapeHtml(rest) : ""}`;
    }
  }

  // STEP A — Any remaining ### or ## or # at start of line (e.g. after we already had ###)
  text = text.replace(/^#{1,3}\s+(.+?)(?=\n|(?=[A-Z][a-z]+ [A-Z][a-z]+,\s+California))/m, (_, g) => `<h3>${escapeHtml(g.trim())}</h3>`);

  // STEP B — **bold** at start of string as h3
  if (!text.startsWith("<")) {
    text = text.replace(/^\*\*(.+?)\*\*/, (_, g) => `<h3>${escapeHtml(g.trim())}</h3>`);
  }

  // STEP C — Remaining **bold** anywhere as <strong>
  text = text.replace(/\*\*(.+?)\*\*/g, (_, g) => `<strong>${escapeHtml(g)}</strong>`);

  // STEP D — *italic*
  text = text.replace(/\*([^*]+)\*/g, (_, g) => `<em>${escapeHtml(g)}</em>`);

  // STEP E — Split on bullet (• or - at start of line, or space+• after text)
  const bulletRegex = /(?:^|\n)\s*[•\-]\s+|\s+•\s+/;
  const bulletSplit = text.split(bulletRegex);

  if (bulletSplit.length > 1) {
    const intro = bulletSplit[0].trim();
    const bullets = bulletSplit.slice(1).map((b) => b.trim()).filter(Boolean);
    const introHtml = wrapIntro(intro);
    const listHtml = `<ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`;
    return introHtml + listHtml;
  }

  return wrapIntro(text);
}
