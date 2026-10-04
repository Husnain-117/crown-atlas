'use client';

interface CitySeoHeroProps {
  h1Title: string;
  introParagraph: string;
}

export default function CitySeoHero({ h1Title, introParagraph }: CitySeoHeroProps) {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-[var(--coastal-primary)]/5 to-[var(--surface)] theme-transition">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* H1 Title */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--coastal-text)] mb-6 theme-transition">
            {h1Title}
          </h1>

          {/* Intro Paragraph */}
          <div className="prose prose-lg max-w-none text-[var(--coastal-muted-text)] leading-relaxed theme-transition">
            <p className="text-lg md:text-xl whitespace-pre-line">
              {introParagraph}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
