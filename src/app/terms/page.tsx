import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Crown Coastal Homes",
  description: "Terms of Service for Crown Coastal Homes real estate services",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 pt-20 sm:pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-[var(--coastal-text)]">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              1. Acceptance of Terms
            </h2>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              By accessing and using the Crown Coastal Homes website and services (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              2. Use License
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials on Crown Coastal Homes' website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--coastal-text)] ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
              <li>Attempt to decompile or reverse engineer any software contained on Crown Coastal Homes' website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              3. Real Estate Services
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Crown Coastal Homes provides real estate information, property listings, and related services. We act as an intermediary between buyers, sellers, and real estate professionals. All property information is provided for informational purposes only and is subject to change without notice.
            </p>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              We do not guarantee the accuracy, completeness, or timeliness of any property information. All property transactions are subject to standard real estate practices, applicable laws, and the terms of individual agreements between parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              4. User Accounts
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              You may not use as a username the name of another person or entity or that is not lawfully available for use, a name or trademark that is subject to any rights of another person or entity other than you without appropriate authorization, or a name that is otherwise offensive, vulgar, or obscene.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              5. Privacy Policy
            </h2>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding the collection and use of your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              6. Prohibited Uses
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              You may not use our Service:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--coastal-text)] ml-4">
              <li>In any way that violates any applicable national or international law or regulation</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter", "spam", or any other similar solicitation</li>
              <li>To impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity</li>
              <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
              <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              7. Disclaimer
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              The materials on Crown Coastal Homes' website are provided on an 'as is' basis. Crown Coastal Homes makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              Further, Crown Coastal Homes does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              8. Limitations
            </h2>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              In no event shall Crown Coastal Homes or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Crown Coastal Homes' website, even if Crown Coastal Homes or a Crown Coastal Homes authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              9. Accuracy of Materials
            </h2>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              The materials appearing on Crown Coastal Homes' website could include technical, typographical, or photographic errors. Crown Coastal Homes does not warrant that any of the materials on its website are accurate, complete, or current. Crown Coastal Homes may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              10. Links
            </h2>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              Crown Coastal Homes has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Crown Coastal Homes of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              11. Modifications
            </h2>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              Crown Coastal Homes may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              12. Governing Law
            </h2>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of the State of California, United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              13. Contact Information
            </h2>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              If you have any questions about these Terms of Service, please contact us through our contact page or by email at the address provided on our website.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}




