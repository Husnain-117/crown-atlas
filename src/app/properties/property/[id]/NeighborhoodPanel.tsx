"use client";

import { useEffect, useState } from "react";

interface NeighborhoodScore {
  walkScore?: number;
  transitScore?: number;
  bikeScore?: number;
}

interface School {
  name: string;
  level: "e" | "m" | "h" | string;
  rating: number;
  dist: number;
}

interface NeighborhoodResponse extends NeighborhoodScore {
  schools?: School[];
}

interface NeighborhoodPanelProps {
  lat: number;
  lng: number;
  zip?: string;
}

function ScoreBar({
  score,
  label,
  color,
}: {
  score: number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-xs font-medium text-[var(--coastal-text)]">
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="w-10 text-xs font-semibold text-right text-[var(--coastal-text)]">
        {score}
      </span>
    </div>
  );
}

export function NeighborhoodPanel({ lat, lng, zip }: NeighborhoodPanelProps) {
  const [data, setData] = useState<NeighborhoodResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lat || !lng) {
      setLoading(false);
      return;
    }
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
    });
    if (zip) params.append("zip", zip);

    fetch(`/api/neighborhood?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d ?? null);
        setLoading(false);
      })
      .catch(() => {
        setData(null);
        setLoading(false);
      });
  }, [lat, lng, zip]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 rounded-[1rem] bg-[var(--surface)] border border-[var(--coastal-border)] animate-pulse">
        <div className="h-4 w-32 bg-[var(--surface-muted)] rounded mb-4" />
        <div className="space-y-3">
          <div className="h-3 w-full bg-[var(--surface-muted)] rounded" />
          <div className="h-3 w-[85%] bg-[var(--surface-muted)] rounded" />
          <div className="h-3 w-[70%] bg-[var(--surface-muted)] rounded" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { walkScore, transitScore, bikeScore, schools } = data;

  const levelLabel: Record<string, string> = {
    e: "Elementary",
    m: "Middle",
    h: "High",
  };

  const ratingColor = (rating: number) => {
    if (rating >= 8) return "#1E8449";
    if (rating >= 5) return "#D68910";
    return "#C0392B";
  };

  return (
    <section className="p-4 sm:p-6 md:p-8 rounded-[1rem] bg-[var(--surface)] shadow-md border border-[var(--coastal-border)]">
      <h2 className="text-xl sm:text-2xl font-bold text-[var(--coastal-text)] mb-4 sm:mb-6">
        Neighborhood
      </h2>

      {/* Scores */}
      <div className="space-y-3 mb-6">
        {typeof walkScore === "number" && (
          <ScoreBar score={walkScore} label="Walk Score" color="#1E8449" />
        )}
        {typeof transitScore === "number" && (
          <ScoreBar score={transitScore} label="Transit Score" color="#1A6FAD" />
        )}
        {typeof bikeScore === "number" && (
          <ScoreBar score={bikeScore} label="Bike Score" color="#D68910" />
        )}
      </div>

      {/* Schools */}
      {schools && schools.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm sm:text-base font-semibold text-[var(--coastal-text)] mb-3">
            Nearby Schools
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-[var(--coastal-muted-text)] border-b border-[var(--coastal-border)]">
                  <th className="py-2 pr-3 font-medium">School</th>
                  <th className="py-2 pr-3 font-medium">Level</th>
                  <th className="py-2 pr-3 font-medium">Rating</th>
                  <th className="py-2 pr-3 font-medium text-right">Distance</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((s, i) => (
                  <tr
                    key={`${s.name}-${i}`}
                    className="border-b border-[var(--coastal-border)] last:border-0"
                  >
                    <td className="py-2 pr-3 text-[var(--coastal-text)]">
                      {s.name}
                    </td>
                    <td className="py-2 pr-3 text-[var(--coastal-muted-text)]">
                      {levelLabel[s.level] || s.level}
                    </td>
                    <td className="py-2 pr-3">
                      <span
                        className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                        style={{ background: ratingColor(s.rating) }}
                      >
                        {s.rating}/10
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--coastal-muted-text)]">
                      {s.dist} mi
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

