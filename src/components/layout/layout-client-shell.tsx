"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { isCanadaLanderPath } from '@/lib/canada-lander-content';
import { CanadaLanderHeader, CanadaLanderFooter } from '@/components/international-buyers/canada-lander-chrome';

// Keep unused global navigation and property tools out of the five paid-page bundles.
// The normal site layout retains server rendering on every other route.
const StandardSiteLayout = dynamic(() => import('./standard-site-layout'));

interface LayoutClientShellProps {
  children: React.ReactNode;
}

export default function LayoutClientShell({
  children,
}: LayoutClientShellProps) {
  const pathname = usePathname();
  if (isCanadaLanderPath(pathname)) {
    return <div className="canada-lander-shell flex flex-col"><CanadaLanderHeader /><main>{children}</main><CanadaLanderFooter /></div>;
  }
  return <StandardSiteLayout pathname={pathname}>{children}</StandardSiteLayout>;
}
