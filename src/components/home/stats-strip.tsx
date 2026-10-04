import React from 'react';

const stats = [
  { value: "CRMLS", label: "LISTING DATA" },
  { value: "58", label: "COUNTIES" },
  { value: "02211952", label: "CA DRE" },
];

export default function StatsStrip() {
  return (
    <section className="stats-strip w-full bg-white" aria-label="company statistics">
      <div className="grid grid-cols-3 gap-0 px-2 py-4 relative">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center justify-center text-center relative group">
            {/* Vertical Divider (Mobile Only) */}
            {index < stats.length - 1 && (
              <div className="lg:hidden absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-gray-100" />
            )}
            
            <div className="font-display text-base sm:text-xl lg:text-2xl font-bold text-[#0F2A44] leading-none mb-1 break-all">
              {/* Visual value: keep only this span visible to avoid double-rendering like "50K+50K+". */}
              <span>{stat.value}</span>
            </div>
            <div className="text-[10px] font-bold text-[#5B6674] uppercase lg:text-xs">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
