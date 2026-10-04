"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Phone } from "lucide-react"

export default function AffiliateButtons() {
  const handleExploreClick = () => {
    document.getElementById('network-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        size="lg"
        className="bg-gradient-to-r from-brand-sunsetBlush to-orange-600 hover:from-brand-sunsetBlush/90 hover:to-orange-700 text-white px-10 py-6 text-lg font-bold shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 border-0"
        onClick={handleExploreClick}
      >
        <Users className="h-6 w-6 mr-2" />
        Explore Our Network
      </Button>
      <Link href="/contact">
        <Button
          variant="outline"
          size="lg"
          className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 px-10 py-6 text-lg font-bold shadow-2xl hover:shadow-white/30 transition-all duration-300 hover:scale-105"
        >
          <Phone className="h-6 w-6 mr-2" />
          Request Referral
        </Button>
      </Link>
    </div>
  )
}

