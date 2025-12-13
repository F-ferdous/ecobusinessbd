"use client";

import Layout from "@/components/Layout";
import CTAButton from "@/components/CTAButton";
import AmazonCourseSection from "@/components/AmazonCourseSection";
import dynamic from "next/dynamic";
import { useScrollAnimations } from "@/hooks/useScrollAnimation";

// Dynamically import PaymentMethodsMarquee with SSR disabled to prevent hydration issues
const PaymentMethodsMarquee = dynamic(
  () => import("@/components/PaymentMethodsMarquee"),
  {
    ssr: false,
    loading: () => (
      <section className="py-4 bg-gray-900">
        <div className="text-center py-8">
          <h2 className="text-white text-xl font-bold mb-4">
            Secure payments powered by trusted global payment partners
          </h2>
          <div className="flex justify-center items-center space-x-8">
            {["PayPal", "Stripe", "Visa", "Mastercard"].map((method, index) => (
              <div key={index} className="text-gray-300 font-semibold text-lg">
                {method}
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
  }
);

// Dynamically import InteractivePricing with SSR disabled to prevent hydration issues
const InteractivePricing = dynamic(
  () => import("@/components/InteractivePricing"),
  {
    ssr: false,
    loading: () => (
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              <span className="text-gray-900">Transparent</span>{" "}
              <span className="text-blue-600">Pricing</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Where do you want to Incorporate?
            </p>
            <div className="inline-flex bg-gray-200 rounded-full p-1 mb-12">
              <div className="px-6 py-3 rounded-full text-sm font-medium bg-white text-gray-900 shadow-md flex items-center space-x-2">
                <span>In the US</span>
                <span className="text-lg">🇺🇸</span>
              </div>
              <div className="px-6 py-3 rounded-full text-sm font-medium text-gray-600 flex items-center space-x-2">
                <span>In the UK</span>
                <span className="text-lg">🇬🇧</span>
              </div>
            </div>
          </div>
          <div className="text-center text-gray-500">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    ),
  }
);

// Using direct import to ensure component loads reliably
// const AmazonCourseSection = dynamic(() => import('@/components/AmazonCourseSection'), {
//   ssr: false,
//   loading: () => <div className="py-20 text-center">Loading Amazon Course...</div>
// });

export default function Home() {
  useScrollAnimations();
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-6 animate-fadeInDown">
              🚀 Best-in-class company formation platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-fadeInUp animate-stagger-1">
              Boost Your Business&apos;s
              <br />
              <span className="text-green-600">Formation Success</span>,
              Starting Today
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-fadeInUp animate-stagger-2">
              Join thousands of successful entrepreneurs who trust Eco Business
              for their USA and UK company formation needs. Fast, reliable, and
              cost-effective solutions with maximum ROI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fadeInUp animate-stagger-3">
              <CTAButton
                href="#pricing"
                size="lg"
                className="px-8 py-4 hover:scale-105 transition-transform duration-200"
              >
                Get Started
              </CTAButton>
              <CTAButton
                href="/contact"
                variant="outline"
                size="lg"
                className="px-8 py-4 hover:scale-105 transition-transform duration-200"
              >
                Schedule a consultation
              </CTAButton>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative max-w-6xl mx-auto animate-fadeInUp animate-stagger-4">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden hover:shadow-3xl transition-shadow duration-500">
                {/* Dashboard Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        Formation Dashboard
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6">
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Company Formation Progress */}
                    <div className="lg:col-span-1">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Formation Progress
                        </h3>
                        <div className="space-y-3">
                          <div className="bg-white rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                Delaware LLC
                              </span>
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                Approved
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Filed: Dec 15, 2024
                            </div>
                            <div className="mt-2 flex items-center">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                                <span className="text-xs font-medium text-green-600">
                                  JS
                                </span>
                              </div>
                              <span className="text-xs text-gray-600">
                                John Smith
                              </span>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                UK Ltd Company
                              </span>
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                Processing
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Filed: Dec 18, 2024
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Analytics */}
                    <div className="lg:col-span-2">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Formation Analytics
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-medium text-gray-700">
                                Success Rate
                              </h4>
                              <span className="text-xs text-gray-500">
                                This Month
                              </span>
                            </div>
                            {/* Chart placeholder */}
                            <div className="relative h-24 bg-gradient-to-r from-green-100 to-green-200 rounded-lg mb-3">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-700">
                                    98%
                                  </div>
                                  <div className="text-xs text-green-600">
                                    Success Rate
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              +12% from last month
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-medium text-gray-700">
                                Processing Time
                              </h4>
                              <span className="text-xs text-gray-500">
                                Average
                              </span>
                            </div>
                            {/* Time display */}
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                              <div className="text-xl font-bold text-gray-900">
                                24-48h
                              </div>
                              <div className="text-xs text-gray-500">
                                Average processing time
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        5,000+
                      </div>
                      <div className="text-xs text-gray-500">
                        Companies Formed
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        98%
                      </div>
                      <div className="text-xs text-gray-500">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        24h
                      </div>
                      <div className="text-xs text-gray-500">
                        Avg. Processing
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        50+
                      </div>
                      <div className="text-xs text-gray-500">
                        Countries Served
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods Marquee */}
      <PaymentMethodsMarquee />

      {/* Promotion Section: Company Formation is Easier than ever before */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 scroll-animate">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Company Formation is Easier than ever before
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Launch in days, not weeks. Pick your package, enter your details,
              and let our experts handle the rest. Transparent pricing, fast
              processing, and friendly support — from first click to final
              certificate.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1: Guided Setup */}
            <div className="scroll-animate bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-green-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v8m-4-4h8M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Guided, Step-by-Step
              </h3>
              <p className="text-gray-600 text-sm">
                Simple forms and clear guidance. We collect exactly what’s
                needed for a smooth, compliant filing.
              </p>
              <div className="mt-4 bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <span className="text-sm text-gray-700">Avg. completion</span>
                <span className="text-sm font-semibold text-green-700">
                  5–7 minutes
                </span>
              </div>
            </div>

            {/* Card 2: Fast Processing */}
            <div className="scroll-animate bg-white rounded-2xl border border-blue-100 shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Fast Processing
              </h3>
              <p className="text-gray-600 text-sm">
                We file immediately and keep you updated. Most formations
                complete within 24–48 hours.
              </p>
              <div className="mt-4 bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-xl font-bold text-gray-900">24–48h</div>
                <div className="text-xs text-gray-600">Typical turnaround</div>
              </div>
            </div>

            {/* Card 3: Everything You Need */}
            <div className="scroll-animate bg-white rounded-2xl border border-yellow-100 shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-yellow-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Everything You Need
              </h3>
              <p className="text-gray-600 text-sm">
                From registered agent to tax IDs and bank setup support — select
                add‑ons as you go. No hidden fees.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Registered agent (1 year)
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  EIN/Tax IDs
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Bank account guidance
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Pricing */}
      <InteractivePricing />

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-animate">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Eco Business?
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by thousands of entrepreneurs worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 scroll-animate hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 hover:bg-green-200 transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Trusted Experience
              </h3>
              <p className="text-gray-600 text-sm">
                Over 10 years of experience in international business formation
                with thousands of satisfied clients.
              </p>
            </div>

            <div className="text-center p-6 scroll-animate hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 hover:bg-blue-200 transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Fast Service
              </h3>
              <p className="text-gray-600 text-sm">
                Most companies formed within 24-48 hours. We handle all the
                paperwork so you can focus on your business.
              </p>
            </div>

            <div className="text-center p-6 scroll-animate hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4 hover:bg-yellow-200 transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Maximum ROI
              </h3>
              <p className="text-gray-600 text-sm">
                Competitive pricing with no hidden fees. Get the best value for
                your investment with our comprehensive packages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Amazon Course Section */}
      <AmazonCourseSection />

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of successful entrepreneurs who chose Eco Business
            for their company formation needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton href="#pricing" size="lg">
              Get Started Today
            </CTAButton>
            <CTAButton href="/contact" variant="outline" size="lg">
              Schedule Consultation
            </CTAButton>
          </div>
        </div>
      </section>
    </Layout>
  );
}
