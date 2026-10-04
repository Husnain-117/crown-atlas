import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Clock, Phone, Mail, Navigation } from "lucide-react"
import { CONTACT } from "@/lib/constants/contact"

export default function OfficeLocation() {
  // Office address for Google Maps - using CONTACT constant for NAP consistency
  const officeAddress = `${CONTACT.business.fullAddress.street}, ${CONTACT.business.fullAddress.city}, ${CONTACT.business.fullAddress.state} ${CONTACT.business.fullAddress.zip}`
  const encodedAddress = encodeURIComponent(officeAddress)

  return (
    <Card className="glass-card bg-[var(--surface)] border border-[var(--coastal-border)] shadow-medium rounded-2xl overflow-hidden theme-transition">
      <CardContent className="p-0">
        {/* Google Maps Embed */}
        <div className="relative h-[280px] w-full overflow-hidden">
          <iframe
            src={`https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Crown Coastal Realty Office Location"
            className="grayscale hover:grayscale-0 transition-all duration-500"
          ></iframe>
          <a
            href="https://maps.google.com/?q=702+Broadway+San+Diego+CA+92101"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 bg-[var(--coastal-primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-semibold transition-all hover:scale-105"
          >
            <Navigation className="h-4 w-4" />
            Get Directions
          </a>
        </div>

        <div className="p-4 space-y-2">
          {/* Address */}
          <div className="flex items-start gap-3 rounded-xl p-3 bg-[var(--coastal-primary)]/8 border border-[var(--coastal-border)] hover:bg-[var(--coastal-primary)]/12 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-[var(--coastal-primary)] flex items-center justify-center flex-shrink-0">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--coastal-primary)] mb-1 text-xs uppercase tracking-wider">Office Address</h3>
              <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed">
                {CONTACT.business.fullAddress.street}<br />
                {CONTACT.business.fullAddress.city}, {CONTACT.business.fullAddress.state} {CONTACT.business.fullAddress.zip}<br />
                {CONTACT.business.fullAddress.country}
              </p>
            </div>
          </div>

          {/* Business Hours */}
          <div className="flex items-start gap-3 rounded-xl p-3 bg-amber-50 dark:bg-amber-500/10 border border-[var(--coastal-border)] hover:bg-amber-100 dark:hover:bg-amber-500/15 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-600 mb-1 text-xs uppercase tracking-wider">Business Hours</h3>
              <div className="space-y-0.5 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-[var(--coastal-muted-text)]">Mon – Fri</span>
                  <span className="text-[var(--coastal-text)] font-medium">9:00 AM – 5:00 PM PT</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[var(--coastal-muted-text)]">Saturday</span>
                  <span className="text-[var(--coastal-text)] font-medium">10:00 AM – 4:00 PM PT</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[var(--coastal-muted-text)]">Sunday</span>
                  <span className="text-red-400 font-medium">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Phone */}
          <a
            href={CONTACT.phone.href}
            className="flex items-start gap-3 rounded-xl p-3 bg-teal-50 dark:bg-teal-500/10 border border-[var(--coastal-border)] hover:bg-teal-100 dark:hover:bg-teal-500/15 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
              <Phone className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-teal-600 dark:text-teal-400 mb-1 text-xs uppercase tracking-wider">Phone</h3>
              <p className="text-[var(--coastal-text)] text-sm font-medium">
                {CONTACT.phone.display}
              </p>
            </div>
          </a>

          {/* Email */}
          <a
            href={CONTACT.email.href}
            className="flex items-start gap-3 rounded-xl p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-[var(--coastal-border)] hover:bg-indigo-100 dark:hover:bg-indigo-500/15 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1 text-xs uppercase tracking-wider">Email</h3>
              <p className="text-[var(--coastal-text)] text-sm font-medium break-all">
                {CONTACT.email.display}
              </p>
            </div>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
