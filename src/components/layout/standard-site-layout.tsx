"use client";

import Navbar from "./navbar";
import Footer from "./footer";
import ComparisonBar from "@/components/comparison/comparison-bar";
import MobileBottomNav from "./mobile-bottom-nav";

export default function StandardSiteLayout({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const isMapPage = pathname === "/map";
  const isComparePage = pathname === "/compare";
  const isDashboardPage = pathname === "/dashboard";
  const isBuyerFunnel = /^\/international-buyers\/(?:uk|germany|canada)(?:\/|$)/.test(pathname);

  return (
    <div className="flex flex-col min-h-screen backgroundSand">
      <Navbar />
      <main className={`flex-grow ${isDashboardPage ? "pb-32 md:pb-40" : !isComparePage ? "pb-0" : ""}`}>
        {children}
      </main>
      {!isMapPage && <Footer />}
      {!isBuyerFunnel && <ComparisonBar />}
      {!isBuyerFunnel && <MobileBottomNav />}
    </div>
  );
}
