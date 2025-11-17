"use client";

import { useScrollAnimations } from "@/hooks/useScrollAnimation";

export default function PrivacyContent() {
  useScrollAnimations();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-white/90">Effective Date: October 03, 2025</p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-12 bg-white scroll-animate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-gray-800">
          <p>
            Welcome to Eco-Business (referred to as “we,” “our,” or “us”). We operate the website
            <a className="text-green-600 hover:underline ml-1" href="https://ecobusinessbd.com" target="_blank" rel="noopener noreferrer">https://ecobusinessbd.com</a>
            {" "}(the “Service”).
          </p>
          <p>
            This Privacy Policy explains how we collect, use, and protect your personal information when you visit or use our website. By accessing or using our Service, you agree to the practices described in this policy.
          </p>
        </div>
      </section>

      <Section title="Information We Collect">
        <p>We may collect the following types of information:</p>
        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li><span className="font-semibold">Personal Details</span>: name, email address, phone number, postal address, country, city, and ZIP code.</li>
          <li><span className="font-semibold">Technical & Usage Data</span>: IP address, browser type, operating system, time and date of visit, time spent on pages, and other diagnostic data.</li>
          <li><span className="font-semibold">Cookies & Tracking Data</span>: We use cookies and similar technologies to enhance your experience, remember preferences, and show relevant content.</li>
          <li><span className="font-semibold">Optional Information</span>: If you share extra details (e.g., business details, documents, or payment preferences), we may store them securely.</li>
        </ul>
      </Section>

      <Section title="How We Use Your Information">
        <p>We use collected information for purposes including:</p>
        <ol className="list-decimal pl-6 mt-3 space-y-2">
          <li>To provide and improve our Service.</li>
          <li>To communicate with you (updates, offers, newsletters, or support).</li>
          <li>To analyze website usage and improve user experience.</li>
          <li>To ensure security and prevent unauthorized access.</li>
          <li>To comply with legal and regulatory requirements.</li>
        </ol>
      </Section>

      <Section title="Data Sharing & Disclosure">
        <p>We do not sell or rent your personal data. However, we may share information in the following cases:</p>
        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>With service providers who help us operate our website.</li>
          <li>If required by law or government authorities.</li>
          <li>During business transactions (merger, acquisition, or asset transfer).</li>
          <li>With your consent, where applicable.</li>
        </ul>
      </Section>

      <Section title="Cookies">
        <p>
          We use cookies to personalize your experience. You can set your browser to refuse cookies, but some parts of our Service may not work properly without them.
        </p>
      </Section>

      <Section title="Data Retention">
        <p>
          We will keep your information only as long as necessary for business, legal, or security purposes.
        </p>
      </Section>

      <Section title="Your Rights">
        <p>
          Depending on your location (such as GDPR in the EU or CCPA in California), you may have rights to:
        </p>
        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>Access, update, or delete your data.</li>
          <li>Opt-out of marketing communications.</li>
          <li>Restrict or object to data processing.</li>
          <li>Withdraw consent at any time.</li>
        </ul>
        <p className="mt-3">
          To exercise your rights, contact us at <a className="text-green-600 hover:underline" href="mailto:info@ecobusinessbd.com">info@ecobusinessbd.com</a>.
        </p>
      </Section>

      <Section title="Security of Data">
        <p>
          We take reasonable steps to protect your data, but no method of online transmission is 100% secure.
        </p>
      </Section>

      <Section title="Third-Party Links">
        <p>
          Our website may contain links to external sites. We are not responsible for their privacy practices or policies.
        </p>
      </Section>

      <Section title="Children’s Privacy">
        <p>
          Our services are not directed to children under 18. We do not knowingly collect their data.
        </p>
      </Section>

      <Section title="Updates to This Policy">
        <p>
          We may update this Privacy Policy from time to time. Updates will be posted on this page with a new “Effective Date.”
        </p>
      </Section>

      <Section title="Contact Us">
        <p>
          If you have any questions about this Privacy Policy, please contact us: {" "}
          <a className="text-green-600 hover:underline" href="mailto:info@ecobusinessbd.com">📧 Email: info@ecobusinessbd.com</a>
        </p>
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-10 bg-gray-50 scroll-animate">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
          <div className="text-gray-800 leading-relaxed space-y-2">{children}</div>
        </div>
      </div>
    </section>
  );
}
