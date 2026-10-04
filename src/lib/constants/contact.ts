/**
 * Contact Information - Single Source of Truth
 * Used across all pages for NAP (Name, Address, Phone) consistency
 */

export const CONTACT = {
  // Primary contact phone - SINGLE SOURCE OF TRUTH
  phone: {
    display: "+1 (858) 305-4362", // Display format
    href: "tel:+18583054362",     // Tel link format
    raw: "18583054362",           // Raw numbers only
  },

  // Business email - SINGLE SOURCE OF TRUTH
  email: {
    display: "contact@crowncoastalhomes.com",
    href: "mailto:contact@crowncoastalhomes.com",
  },

  // Business information - SINGLE SOURCE OF TRUTH
  business: {
    name: "Crown Coastal Homes",
    address: "San Diego, CA",
    fullAddress: {
      street: "702 Broadway",
      city: "San Diego",
      state: "CA",
      zip: "92101",
      country: "United States",
      serviceArea: "Serving all of California",
      timezone: "America/Los_Angeles", // Pacific Time (PST/PDT)
    },
  },

  // WhatsApp - SINGLE SOURCE OF TRUTH
  whatsApp: {
    number: "18583054362",
    href: "https://wa.me/18583054362",
  },

  // Agent information
  agent: {
    name: "Reza Barghlameno",
    title: "California Real Estate Agent",
    dre: "02211952",
    avatarUrl: "/agent without bg.png",
  },
} as const
