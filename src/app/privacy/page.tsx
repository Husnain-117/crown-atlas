import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Crown Coastal Homes",
  description: "Privacy Policy for Crown Coastal Homes real estate services",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 pt-20 sm:pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-[var(--coastal-text)]">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              1. Introduction
            </h2>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              Crown Coastal Homes ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              2. Information We Collect
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-3 text-[var(--coastal-text)]">
              2.1 Personal Information
            </h3>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--coastal-text)] ml-4">
              <li>Register for an account</li>
              <li>Search for properties</li>
              <li>Request information about properties or services</li>
              <li>Subscribe to our newsletter or marketing communications</li>
              <li>Contact us through forms or email</li>
              <li>Participate in surveys or promotions</li>
            </ul>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mt-4">
              This information may include your name, email address, phone number, mailing address, date of birth, and other details you choose to provide.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[var(--coastal-text)]">
              2.2 Automatically Collected Information
            </h3>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              When you access our website, we may automatically collect certain information about your device, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--coastal-text)] ml-4">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages you visit and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>Search terms used</li>
              <li>Date and time of access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              3. How We Use Your Information
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--coastal-text)] ml-4">
              <li>Provide, operate, and maintain our website and services</li>
              <li>Process your property inquiries and requests</li>
              <li>Send you property listings, updates, and marketing communications</li>
              <li>Improve, personalize, and expand our website and services</li>
              <li>Understand and analyze how you use our website</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Communicate with you about your account, transactions, or customer service requests</li>
              <li>Send you administrative information, updates, security alerts, and support messages</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Comply with legal obligations and enforce our terms of service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              4. Information Sharing and Disclosure
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              We may share your information in the following situations:
            </p>
            <h3 className="text-xl font-semibold mt-6 mb-3 text-[var(--coastal-text)]">
              4.1 Service Providers
            </h3>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              We may share your information with third-party service providers who perform services on our behalf, such as hosting, data analysis, email delivery, marketing assistance, and customer service.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[var(--coastal-text)]">
              4.2 Real Estate Professionals
            </h3>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              When you express interest in a property, we may share your contact information with the listing agent or real estate professional associated with that property.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[var(--coastal-text)]">
              4.3 Legal Requirements
            </h3>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              We may disclose your information if required to do so by law or in response to valid requests by public authorities, such as a court or government agency.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[var(--coastal-text)]">
              4.4 Business Transfers
            </h3>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              In the event of a merger, acquisition, reorganization, or sale of assets, your information may be transferred as part of that transaction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              5. Cookies and Tracking Technologies
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
            </p>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              We use cookies for purposes such as:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--coastal-text)] ml-4">
              <li>Remembering your preferences and settings</li>
              <li>Analyzing website traffic and usage patterns</li>
              <li>Providing personalized content and advertisements</li>
              <li>Improving our website functionality and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              6. Data Security
            </h2>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              7. Your Privacy Rights
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--coastal-text)] ml-4">
              <li>The right to access – You have the right to request copies of your personal data</li>
              <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete</li>
              <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions</li>
              <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions</li>
              <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions</li>
              <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions</li>
            </ul>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mt-4">
              To exercise these rights, please contact us using the contact information provided below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              8. Children's Privacy
            </h2>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              Our services are not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us, and we will take steps to delete such information from our systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              9. Third-Party Links
            </h2>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              Our website may contain links to third-party websites that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services. We strongly advise you to review the privacy policy of every site you visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              10. Changes to This Privacy Policy
            </h2>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              11. California Privacy Rights
            </h2>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete personal information, the right to opt-out of the sale of personal information, and the right to non-discrimination for exercising your privacy rights. To exercise these rights, please contact us using the information provided below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--coastal-text)]">
              12. Contact Us
            </h2>
            <p className="text-[var(--coastal-text)] leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us through our contact page or by email at the address provided on our website. We will respond to your inquiry as soon as reasonably possible.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}




