"use client";

import type { ReactNode } from "react";
import { parseNeighborhoodContent } from "@/lib/parseNeighborhoodContent";

export interface Props {
  title: string;
  content: string | null | undefined;
  className?: string;
  icon?: ReactNode;
  fallback?: string;
}

/**
 * Renders a neighborhood/city content card (e.g. Schools & Education, Lifestyle & Amenities).
 * Parses raw markdown from the API into HTML and renders it. Safe because we control the parser.
 */
export function NeighborhoodContentCard({ title, content, className = "", icon, fallback }: Props) {
  const parsedHTML = parseNeighborhoodContent(content);
  const id = title.toLowerCase().replace(/\s+&?\s+/g, "-").replace(/\s+/g, "-");
  const hasContent = parsedHTML.length > 0;

  if (!hasContent && !fallback) return null;

  return (
    <section
      className={`rounded-xl border border-[var(--coastal-border)] p-6 bg-[var(--surface)] shadow-sm ${className}`.trim()}
      aria-labelledby={id}
    >
      <h2
        id={id}
        className="text-xl font-semibold text-[var(--coastal-text)] mb-3 flex items-center gap-2"
      >
        {icon}
        {title}
      </h2>
      {!hasContent && fallback && (
        <p className="text-[var(--coastal-muted-text)] leading-relaxed text-sm">
          {fallback}
        </p>
      )}
      {hasContent && (
      <div
        className="prose prose-sm max-w-none prose-content
          [&_h3]:font-semibold [&_h3]:text-base [&_h3]:text-[var(--coastal-text)] [&_h3]:mb-2 [&_h3]:mt-0
          [&_p]:text-sm [&_p]:md:text-base [&_p]:text-[var(--coastal-muted-text)] [&_p]:leading-relaxed [&_p]:mb-3 [&_p]:last:mb-0
          [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:list-disc [&_ul]:text-sm [&_ul]:text-[var(--coastal-muted-text)] [&_ul]:my-3
          [&_li]:leading-relaxed [&_strong]:font-semibold [&_strong]:text-[var(--coastal-text)]
        "
        dangerouslySetInnerHTML={{ __html: parsedHTML }}
      />
      )}
    </section>
  );
}
