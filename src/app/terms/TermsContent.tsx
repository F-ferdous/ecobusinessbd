"use client";

import { useScrollAnimations } from "@/hooks/useScrollAnimation";

export default function TermsContent() {
  useScrollAnimations();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">📜 Terms and Conditions</h1>
          <p className="text-white/90">Effective Date: October 03, 2025</p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-12 bg-white scroll-animate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-gray-800">
          <p>
            Welcome to Eco-Business (“Company,” “we,” “our,” “us”)! These Terms and Conditions (“Terms”) govern your use of our website
            <a className="text-green-600 hover:underline ml-1" href="https://ecobusinessbd.com" target="_blank" rel="noopener noreferrer">https://ecobusinessbd.com</a>
            {" "}(“Service”).
          </p>
          <p>
            By accessing or using our Service, you agree to comply with these Terms. If you do not agree with them, you may not use our Service.
          </p>
        </div>
      </section>

      {/* Sections */}
      <Section number="1" title="Acceptance of Terms">
        <ul className="list-disc pl-6 space-y-2">
          <li>Are at least 18 years old.</li>
          <li>Have read, understood, and agreed to these Terms and our Privacy Policy.</li>
          <li>Will comply with all applicable laws and regulations while using our Service.</li>
        </ul>
      </Section>

      <Section number="2" title="Services Provided">
        <p>Eco-Business provides professional services including but not limited to:</p>
        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>Business Formation Services (USA, UK, and Global)</li>
          <li>Business Consultancy & Virtual Address Services</li>
          <li>Bank Account & Payment Gateway Support</li>
          <li>Compliance & Legal Documentation Support</li>
        </ul>
        <p className="mt-3">
          We continuously work to improve our services, but we reserve the right to modify, suspend, or discontinue any service without prior notice.
        </p>
      </Section>

      <Section number="3" title="Accounts & User Responsibility">
        <p>To use some features of our website, you may need to create an account.</p>
        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>You are responsible for maintaining the confidentiality of your account information, including your password.</li>
          <li>You agree not to use another person’s account without permission.</li>
          <li>Eco-Business reserves the right to suspend or terminate any account found to be in violation of our Terms.</li>
        </ul>
      </Section>

      <Section number="4" title="Purchases & Payment">
        <p>When you purchase a service from Eco-Business, you agree to:</p>
        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>Provide accurate and complete billing information (name, address, contact details, and payment details).</li>
          <li>Use a valid payment method that you are legally authorized to use.</li>
          <li>Allow us to use third-party payment processors (such as PayPal, Stripe, etc.) to complete the transaction.</li>
        </ul>
        <p className="mt-3">
          We reserve the right to refuse or cancel orders if fraud, unauthorized use, or illegal activity is suspected.
        </p>
      </Section>

      <Section number="5" title="Subscriptions & Renewal">
        <ul className="list-disc pl-6 space-y-2">
          <li>Some of our services may be offered on a subscription basis.</li>
          <li>Subscriptions are billed on a recurring cycle (monthly or yearly).</li>
          <li>Unless canceled, subscriptions automatically renew.</li>
          <li>You may cancel at any time through your account or by contacting us at <a className="text-green-600 hover:underline" href="mailto:support@ecobusinessbd.com">support@ecobusinessbd.com</a>.</li>
        </ul>
      </Section>

      <Section number="6" title="Refund Policy">
        <p>
          Payments made to Eco-Business are non-refundable, as they are for service-based work. However, in exceptional cases, you may contact customer support for review. For details, please check our Refund Policy page.
        </p>
      </Section>

      <Section number="7" title="Virtual Business Address Service">
        <ul className="list-disc pl-6 space-y-2">
          <li>The address is for virtual purposes only, not for physical office or residence.</li>
          <li>It cannot be used as a storefront or listed on Google Maps.</li>
          <li>We do not provide utility bills, lease agreements, or physical documents as proof of address.</li>
          <li>Legal or government documents received at this address will be scanned and forwarded to your registered email.</li>
          <li>Up to 5 mails per month are free. Additional mails may incur extra charges.</li>
          <li>Shipping costs and handling fees for physical mail delivery are the client’s responsibility.</li>
        </ul>
      </Section>

      <Section number="8" title="Intellectual Property Rights">
        <p>
          All website content, including text, graphics, logos, and designs, are the property of Eco-Business. You may not copy, distribute, or use our materials without prior written consent.
        </p>
      </Section>

      <Section number="9" title="Limitation of Liability">
        <p>Eco-Business will not be responsible for any:</p>
        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>Indirect, incidental, or consequential damages resulting from your use of our services.</li>
          <li>Delays caused by third parties (such as government agencies, payment processors, or mailing services).</li>
          <li>Losses resulting from incorrect or incomplete information provided by the client.</li>
        </ul>
      </Section>

      <Section number="10" title="Third-Party Links">
        <p>
          Our website may contain links to third-party websites. We do not control or take responsibility for their content, policies, or practices. It is your responsibility to review their Terms and Privacy Policies before using their services.
        </p>
      </Section>

      <Section number="11" title="Compliance & Legal Services">
        <p>Through our dashboard and support, we may assist clients with:</p>
        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>Annual Reports</li>
          <li>Tax Filings (IRS, HMRC, etc.)</li>
          <li>Trademark Applications (USPTO)</li>
          <li>BOI Filings and other compliance requirements</li>
        </ul>
        <p className="mt-3">
          ⚠️ Important: We provide guidance and filing services only. Final approval always depends on government agencies, and we cannot guarantee outcomes.
        </p>
      </Section>

      <Section number="12" title="Termination of Service">
        <p>We may suspend or terminate your access to our Service if you:</p>
        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>Violate these Terms.</li>
          <li>Engage in fraudulent, abusive, or illegal activities.</li>
          <li>Fail to make payments for services.</li>
        </ul>
      </Section>

      <Section number="13" title="Governing Law">
        <p>
          These Terms shall be governed by and interpreted in accordance with the laws of Bangladesh (or the country where our main office operates), without regard to conflict of law principles.
        </p>
      </Section>

      <Section number="14" title="Changes to Terms">
        <p>
          Eco-Business reserves the right to modify or replace these Terms at any time. Updates will be posted on our website, and continued use of our services after changes means you accept the new Terms.
        </p>
      </Section>

      <Section number="15" title="Contact Us">
        <p>
          If you have any questions about these Terms, please contact us: {" "}
          <a className="text-green-600 hover:underline" href="mailto:support@ecobusinessbd.com">📧 Email: support@ecobusinessbd.com</a>
        </p>
      </Section>
    </>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="py-10 bg-gray-50 scroll-animate">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-baseline gap-2">
            <span className="text-green-600">{number}.</span>
            <span>{title}</span>
          </h2>
          <div className="text-gray-800 leading-relaxed space-y-2">{children}</div>
        </div>
      </div>
    </section>
  );
}
