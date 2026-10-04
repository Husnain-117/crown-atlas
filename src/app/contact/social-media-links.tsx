"use client"

import { Facebook, Instagram, Linkedin, Youtube, Music2 } from "lucide-react"
import Link from "next/link"
import NewsletterInline from "@/components/blog/newsletter-inline"

export default function SocialMediaLinks() {
  const socialLinks = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/@crowncoastal/?hr=1&wtsid=rdr_1V9RXWsDeNfJKsZzC",
      icon: <Facebook className="h-5 w-5" />,
      color: "hover:bg-blue-600",
    },
    // {
    //   name: "Twitter",
    //   url: "https://twitter.com/yourrealestatecompany",
    //   icon: <Twitter className="h-5 w-5" />,
    //   color: "hover:bg-sky-500",
    // },
    {
      name: "Instagram",
      url: "https://www.instagram.com/crown.coastal?igsh=d25vbzJuZjBweGI0",
      icon: <Instagram className="h-5 w-5" />,
      color: "hover:bg-pink-600",
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/company/crown-coastal-homes/",
      icon: <Linkedin className="h-5 w-5" />,
      color: "hover:bg-blue-700",
    },
    {
      name: "YouTube",
      url: "https://m.youtube.com/@crowncoastal",
      icon: <Youtube className="h-5 w-5" />,
      color: "hover:bg-red-600",
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@crowncoastal",
      icon: <Music2 className="h-5 w-5" />,
      color: "hover:bg-black",
    },
  ]

  return (
    <div className="space-y-6 theme-transition">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-6 h-[2px] bg-gradient-primary rounded-full"></div>
          <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">Social Media</span>
          <div className="w-6 h-[2px] bg-gradient-primary rounded-full"></div>
        </div>
        <h3 className="font-display text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 theme-transition">
          Connect <span className="text-gradient-primary bg-clip-text text-transparent">With Us</span>
        </h3>
        <p className="text-neutral-600 dark:text-neutral-300 text-base leading-relaxed theme-transition">
          Follow us for the latest luxury property listings and California coastal real estate insights
        </p>
      </div>
      
      <div className="flex justify-center gap-4">
        {socialLinks.map((social, index) => (
          <Link
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow us on ${social.name}`}
            className={`group relative flex items-center justify-center h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 text-neutral-600 dark:text-neutral-300 transition-all duration-300 hover:scale-110 hover:shadow-strong ${social.color} hover:text-white hover:border-transparent theme-transition animate-fade-in-up overflow-hidden`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative z-10 transition-colors duration-300">
              {social.icon}
            </div>
          </Link>
        ))}
      </div>
      
      <NewsletterInline source="contact_social" title="Stay Updated With New Listings" />
    </div>
  )
}
