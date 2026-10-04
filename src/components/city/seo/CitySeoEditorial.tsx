'use client';

import { BookOpen } from 'lucide-react';

interface CitySeoEditorialProps {
  cityName: string;
  editorialContent: string;
}

export default function CitySeoEditorial({ cityName, editorialContent }: CitySeoEditorialProps) {
  // Split content into paragraphs
  const paragraphs = editorialContent
    .split('\n\n')
    .filter(p => p.trim().length > 0)
    .map(p => p.trim());

  return (
    <section className="py-16 md:py-20 bg-[var(--surface)] theme-transition">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-[var(--coastal-secondary)] rounded-full"></div>
              <span className="text-[var(--coastal-primary)] font-semibold text-sm uppercase tracking-wider">
                Local Insights
              </span>
              <div className="w-8 h-[2px] bg-[var(--coastal-secondary)] rounded-full"></div>
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--coastal-text)] theme-transition">
                Living in {cityName}
              </h2>
            </div>
            <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
          </div>

          {/* Editorial Content */}
          <div className="glass-card rounded-2xl p-8 md:p-10 border border-[var(--coastal-border)] theme-transition">
            <article className="prose prose-lg max-w-none">
              <div className="space-y-6 text-[var(--coastal-muted-text)] theme-transition">
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-base md:text-lg leading-relaxed first-letter:text-2xl first-letter:font-bold first-letter:text-[var(--coastal-primary)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
