"use client";

import { useScrollAnimations } from "@/hooks/useScrollAnimation";

export default function RefundContent() {
  useScrollAnimations();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Eco-Business Refund Policy</h1>
        </div>
      </section>

      <Section number="1" title="General Information">
        <p>
          All transactions with Eco-Business for digital services are processed via PayPal, Stripe, or other secure payment gateways. We do not store any payment information.
        </p>
        <p>
          We reserve the right to change prices, service specifications, purchase terms, and package offerings without prior notice.
        </p>
        <p>
          Please read this policy carefully before purchasing digital services such as UK or USA company formation, PDF documents, or online guides.
        </p>
      </Section>

      <Section number="2" title="Delivery of Services">
        <p>
          If you do not receive your service or access link within the specified timeframe, email <a className="text-green-600 hover:underline" href="mailto:support@ecobusinessbd.com">support@ecobusinessbd.com</a> with your transaction details. We will ensure your product or service is delivered as quickly as possible.
        </p>
      </Section>

      <Section number="3" title="Refund Eligibility / Conditions">
        <p>Refunds are provided only under the following conditions:</p>
        <ol className="list-decimal pl-6 mt-3 space-y-2">
          <li>The service has not yet started.</li>
          <li>If part of the service is completed, a partial refund may be issued for the remaining portion.</li>
          <li>No refund will be provided if the service is canceled during an ongoing process.</li>
        </ol>
        <p className="mt-3 text-gray-700">
          Note: Prorated refunds are not available, but future billing will be stopped.
        </p>
      </Section>

      <Section number="4" title="Administrative Fees">
        <p>
          Eco-Business reserves the right to deduct reasonable administrative and processing fees from any refund to cover payment processing and administrative costs.
        </p>
      </Section>

      <Section number="5" title="Refund Request Process">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Refund requests must be made within 30 days of the transaction.</li>
          <li>
            Required information:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Full name</li>
              <li>Order/Transaction number</li>
              <li>Clear reason for the refund</li>
              <li>Proof of payment (receipt or confirmation email)</li>
              <li>Supporting documents, if applicable</li>
            </ul>
          </li>
          <li>Requests will be reviewed on a case-by-case basis, and you will receive a response within 3 business days.</li>
          <li>If approved, the refund will be processed directly to your original payment method.</li>
        </ol>
        <p className="mt-3">Total timeframe: The entire approval and refund process will be completed within 15 business days.</p>
      </Section>

      <Section number="6" title="Payment Providers">
        <p>
          Full refunds may not be possible for service disruptions or delays caused by third-party payment providers; partial refunds may be considered based on the situation.
        </p>
        <p>
          UK & USA services – refunds are customized according to the specific situation.
        </p>
        <p>
          Note: Services purchased during promotions or discounted offers are non-refundable. Service packages are non-refundable.
        </p>
      </Section>

      <Section number="7" title="Service Termination & Activation">
        <p>
          If you do not request a refund within 30 days, your refund eligibility expires. Failure to provide required documents or information will result in service forfeiture. After 30 days, a new order must be placed to purchase the service again.
        </p>
      </Section>

      <Section number="8" title="Late or Missing Refunds">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Check your dashboard</li>
          <li>Check your payment account</li>
          <li>Contact <a className="text-green-600 hover:underline" href="mailto:support@ecobusinessbd.com">support@ecobusinessbd.com</a> if the issue persists</li>
        </ol>
        <p className="mt-3">
          Refunds will be issued using the payment method mutually agreed upon with Eco-Business.
        </p>
      </Section>

      <Section number="9" title="Sale Items">
        <p>
          Regular-priced services are eligible for refunds; services purchased at a discounted rate or during special promotions are non-refundable.
        </p>
      </Section>

      <Section number="10" title="Exceptions">
        <p>Refunds will not be issued if:</p>
        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>Required documents or information are not provided</li>
          <li>Refund request is due to third-party actions (banks, payment processors, government agencies)</li>
          <li>Terms and conditions are violated</li>
          <li>Service has already been fully completed or delivered</li>
          <li>Refund request is submitted after the 30-day eligibility period</li>
        </ul>
      </Section>

      <Section number="11" title="Finality of Refund Decisions">
        <p>
          Eco-Business reserves the right to determine the legitimacy of all refund claims. Refund decisions are final and evaluated on a case-by-case basis.
        </p>
      </Section>

      <Section number="12" title="Returns">
        <p>
          Digital services or documents are considered “used” once downloaded or accessed. All purchases are non-returnable and non-exchangeable.
        </p>
      </Section>

      <Section number="13" title="Contact Us">
        <p>
          For questions about this refund policy or to submit a refund request, email: {" "}
          <a className="text-green-600 hover:underline" href="mailto:support@ecobusinessbd.com">support@ecobusinessbd.com</a>
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
