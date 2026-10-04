// "use client"

// import Link from "next/link"
// import Image from "next/image"
// import { Phone, ArrowRight, BadgeCheck, Clock } from "lucide-react"

// interface Props {
//     action: "buy" | "rent"
//     city: string
//     county: string
//     citySlug: string
//     countySlug: string
// }

// export default function StickyMobileCTA({ action, city, county, citySlug, countySlug }: Props) {
//     const crossAction = action === "buy" ? "rent" : "buy"
//     const label = action === "buy" ? "Talk to Agent" : "Get Rental Help"
//     const crossLabel = action === "buy" ? "Rent instead" : "Buy instead"
//     const locationLabel = city || county || "California"
//     const persuasionText = action === "buy"
//         ? `Expert guidance for buying in ${locationLabel}`
//         : `Find the right rental in ${locationLabel}`

//     return (
//         <div
//             className="fixed left-0 right-0 z-50 md:hidden bg-[var(--surface)]/95 backdrop-blur-xl border-t border-[var(--coastal-border)] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-4 py-3.5 theme-transition"
//             style={{ bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}
//         >
//             <div className="flex flex-col gap-3.5">
//                 {/* Top Row: Agent Info */}
//                 <div className="flex items-center gap-3">
//                     <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-[var(--coastal-primary)] shadow-sm">
//                         <Image
//                             src="/agent without bg.png"
//                             alt="Reza Barghlameno"
//                             fill
//                             sizes="40px"
//                             className="object-cover object-top"
//                         />
//                     </div>
//                     <div className="flex flex-col min-w-0 flex-1">
//                         <div className="flex items-center gap-2">
//                             <span className="text-sm font-bold text-[var(--coastal-text)] leading-tight truncate">Reza Barghlameno</span>
//                             <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 shrink-0">
//                                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
//                                 <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-widest">Online</span>
//                             </span>
//                         </div>
//                         <span className="text-xs font-medium text-[var(--coastal-muted-text)] mt-0.5 truncate">
//                             ⭐ 4.9 · {persuasionText}
//                         </span>
//                     </div>
//                 </div>

//                 {/* Bottom Row: Action Buttons */}
//                 <div className="flex gap-2">
//                     <Link
//                         href="/contact"
//                         className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-xl bg-[var(--coastal-primary)] text-white text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all w-full"
//                     >
//                         <Phone className="h-[18px] w-[18px]" strokeWidth={2.5} />
//                         <span>{label}</span>
//                     </Link>
//                     <Link
//                         href={`/${crossAction}/${countySlug}/${citySlug}`}
//                         className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border-2 border-[var(--coastal-secondary)] text-[var(--coastal-text)] hover:bg-[var(--coastal-secondary)] hover:text-white font-bold text-sm transition-all shadow-sm active:scale-95 w-auto whitespace-nowrap"
//                     >
//                         <span>{crossLabel}</span>
//                         <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.5} />
//                     </Link>
//                 </div>
//             </div>
//         </div>
//     )
// }
