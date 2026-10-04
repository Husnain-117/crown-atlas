import Image from "next/image";
import Link from "next/link";
import { MORTGAGE_PARTNER } from "@/lib/constants/partners";

export function MortgageCTA({ variant = "inline" }: { variant: "inline" | "banner" }) {
  return (
    <section className={`rounded-xl border p-3 sm:p-4 ${variant === "banner" ? "bg-[#12324A] text-white" : "bg-[var(--surface)]"}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Image 
              src={MORTGAGE_PARTNER.logo} 
              alt={MORTGAGE_PARTNER.name} 
              width={48} 
              height={48} 
              className={`transition-transform duration-300 group-hover:scale-105 sm:w-14 sm:h-14 ${
                variant === "banner" 
                  ? "brightness-0 invert" 
                  : "dark:brightness-0 dark:invert"
              }`}
              style={{ 
                filter: variant === "banner"
                  ? 'drop-shadow(0 2px 8px rgba(255, 255, 255, 0.15))'
                  : undefined
              }}
            />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm sm:text-base text-[var(--coastal-text)]">Ready to buy? Get pre-approved in minutes.</p>
          </div>
        </div>
        <Link 
          href="/contact" 
          className={`rounded px-4 py-2 font-medium text-sm sm:text-base text-center w-full sm:w-auto ${variant === "banner" ? "bg-white text-[#12324A]" : "bg-[var(--coastal-primary)] text-white hover:opacity-90 transition-opacity"}`}
        >
          Get pre-approved
        </Link>
      </div>
    </section>
  );
}


