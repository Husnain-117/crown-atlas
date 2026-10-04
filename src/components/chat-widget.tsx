"use client"

import Script from "next/script"
import { usePathname } from 'next/navigation'
import { isCanadaLanderPath } from '@/lib/canada-lander-content'

/**
 * Crisp live chat widget.
 * Set NEXT_PUBLIC_CRISP_WEBSITE_ID in your environment to enable.
 * Configure business hours, bot, and routing in the Crisp dashboard.
 */
export default function ChatWidget() {
  const pathname = usePathname()
  const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID

  if (!websiteId || isCanadaLanderPath(pathname)) return null

  return (
    <Script
      id="crisp-widget"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
          window.$crisp = window.$crisp || [];
          window.CRISP_WEBSITE_ID = ${JSON.stringify(websiteId)};
          (function() {
            var d = document;
            var s = d.createElement("script");
            s.src = "https://client.crisp.chat/l.js";
            s.async = 1;
            d.getElementsByTagName("head")[0].appendChild(s);
          })();
        `,
      }}
    />
  )
}
