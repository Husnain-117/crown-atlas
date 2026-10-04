"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

export default function ScrollButton() {
  return (
    <>
         <button
              type="button"
              aria-label="Scroll right"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 rounded-full shadow-lg hover:shadow-xl p-2.5 sm:p-3 z-20 transition-all duration-300 hover:scale-110 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-slate-600"
              onClick={() => {
                const container = document.querySelector('.scrollbar-hide');
                if (container) {
                  (container as HTMLElement).scrollBy({ left: 350, behavior: 'smooth' });
                }
              }}
            >
              <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              type="button"
              aria-label="Scroll left"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 rounded-full shadow-lg hover:shadow-xl p-2.5 sm:p-3 z-20 transition-all duration-300 hover:scale-110 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-slate-600"
              onClick={() => {
                const container = document.querySelector('.scrollbar-hide');
                if (container) {
                  (container as HTMLElement).scrollBy({ left: -350, behavior: 'smooth' });
                }
              }}
            >
              <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
    </>
  )
}