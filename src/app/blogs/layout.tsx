/**
 * Blogs layout: wraps the list page in Suspense so the loading UI
 * renders in the main content slot (above the footer) while data loads.
 * Ensures hero/article grid always render above footer (no streaming reorder).
 */
import { Suspense } from "react";
import Loading from "./loading";

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}
