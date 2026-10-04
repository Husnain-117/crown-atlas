export function formatCityName(slug: string): string {
  return slug
    .replace(/-ca$/i, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
