import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/cormorant-garamond/latin-600.css";
import "@fontsource/cormorant-garamond/latin-600-italic.css";
import "@fontsource/cormorant-garamond/latin-700.css";
import "@fontsource/cormorant-garamond/latin-700-italic.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@/styles/globals.css";
import Layout from "@/components/layout";
import Providers from "@/components/providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import ContactSlidePanel from "@/components/ContactSlidePanel";
import ChatWidget from "@/components/chat-widget";
import { SITE_URL } from "@/lib/constants/site";
import CoreSiteSchema from "@/components/seo/CoreSiteSchema";

const FONT_VARS = {
  "--font-geist-sans": "'DM Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  "--font-geist-mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  "--font-inter": "'DM Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  "--font-playfair": "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
} as React.CSSProperties;

// Detect if we're on a preview/staging environment
const isPreview = process.env.VERCEL && process.env.VERCEL_ENV !== 'production'
const productionUrl = SITE_URL
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID
const SPEED_INSIGHTS_ENABLED = process.env.VERCEL === '1'

export const metadata: Metadata = {
  metadataBase: new URL(productionUrl),
  verification: { google: '39wH-rnXqx0UvujoDm_WWYy6Q6btzzqcmkFkEhdc3Q0' },
  title: "Homes for Sale in California | Crown Coastal Homes",
  description:
    "Browse current California coastal properties, compare listing details, request tours, and connect with a licensed real estate professional.",
  // NOTE: keywords meta tag deliberately omitted.
  // Google has ignored it since 2009 and Bing treats keyword stuffing as a spam
  // signal. Ranking relevance comes from page content, not this meta tag.
  icons: {
    icon: [
      { url: "/logo.svg", sizes: "16x16" },
      { url: "/logo.svg", sizes: "32x32" },
    ],
    apple: { url: "/logo.svg", sizes: "180x180" },
  },
  // Block indexing on preview/staging environments
  robots: isPreview ? {
    index: false,
    follow: false,
  } : {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Do not set a root canonical here. Next.js metadata inheritance would make
  // pages without their own canonical point to the homepage.
  openGraph: {
    title: "Homes for Sale in California | Crown Coastal Homes",
    description: "Browse current California coastal properties, compare listing details, and request a private tour.",
    type: "website",
    url: productionUrl, // Always use production URL
    images: [{ url: `${productionUrl}/coursel.png`, width: 1200, height: 630, alt: "Crown Coastal Homes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Homes for Sale in California | Crown Coastal Homes",
    description: "Browse current California coastal properties and connect with a licensed real estate professional.",
    images: [`${productionUrl}/coursel.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* Blocking theme script — applies .dark before first paint to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        {/* Critical CSS for first paint — light + dark variables so neither theme flashes */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--bg:#FAF7F2;--surface:#fff;--surface-muted:#F1EEE7;--coastal-border:#E6E0D7;--coastal-primary:#12324A;--coastal-action:#12324A;--coastal-action-hover:#0F2A3E;--coastal-accent-text:#12324A;--coastal-secondary:#6FA8A3;--coastal-text:#1B2430;--coastal-muted-text:#5B6674;--background:#FAF7F2;--foreground:#1B2430;--font-geist-sans:Inter,ui-sans-serif,system-ui,sans-serif;}.dark{--bg:#1B2430;--surface:#2F3A4A;--surface-muted:#3A475A;--coastal-border:#4A576A;--coastal-primary:#6FA8A3;--coastal-action:#315C57;--coastal-action-hover:#274A46;--coastal-accent-text:#A8D7D2;--coastal-secondary:#D7C39A;--coastal-text:#E7EEF5;--coastal-muted-text:#B7C7D6;--background:#1B2430;--foreground:#E7EEF5;}body.antialiased{background:var(--bg);color:var(--coastal-text);-webkit-font-smoothing:antialiased;}`,
          }}
        />
        {GA4_ID && <link rel="preconnect" href="https://www.googletagmanager.com" />}
        <CoreSiteSchema />

      </head>
      <body
        className="antialiased"
        style={FONT_VARS}
        suppressHydrationWarning={true}
      >
        <Providers>
          <Layout>
            {children}
          </Layout>
          <ContactSlidePanel />
        </Providers>
        {/* Google Analytics 4 — lazyOnload to reduce main-thread work (Lighthouse) */}
        {GA4_ID && (
          <Script id="ga4-defer" strategy="lazyOnload">
            {`
              (function(){
                var id = ${JSON.stringify(GA4_ID)};
                function run(){
                  window.dataLayer = window.dataLayer || [];
                  window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
                  window.gtag('js', new Date());
                  window.gtag('config', id, { page_path: window.location.pathname });
                  var s = document.createElement('script');
                  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
                  s.async = true;
                  document.head.appendChild(s);
                }
                if (typeof requestIdleCallback !== 'undefined') {
                  requestIdleCallback(run, { timeout: 2500 });
                } else {
                  setTimeout(run, 1500);
                }
              })();
            `}
          </Script>
        )}
        <ChatWidget />
        {SPEED_INSIGHTS_ENABLED && <SpeedInsights />}
      </body>
    </html>
  );
}
