"use client";

import React, { useState, useEffect } from "react";
import CTAButton from "./CTAButton";

const InteractivePricing = () => {
  const [selectedCountry, setSelectedCountry] = useState<"US" | "UK">("US");

  useEffect(() => {
    const scrollElements = document.querySelectorAll(".scroll-animate");

    const elementInView = (el: Element, dividend = 1) => {
      const elementTop = el.getBoundingClientRect().top;
      return (
        elementTop <=
        (window.innerHeight || document.documentElement.clientHeight) / dividend
      );
    };

    const displayScrollElement = (element: Element) => {
      element.classList.add("animate");
    };

    const hideScrollElement = (element: Element) => {
      element.classList.remove("animate");
    };

    const handleScrollAnimation = () => {
      scrollElements.forEach((el) => {
        if (elementInView(el, 1.25)) {
          displayScrollElement(el);
        } else {
          hideScrollElement(el);
        }
      });
    };

    window.addEventListener("scroll", () => {
      handleScrollAnimation();
    });

    // Initial check
    handleScrollAnimation();

    return () => {
      window.removeEventListener("scroll", handleScrollAnimation);
    };
  }, []);

  // Re-trigger animations on toggle so cards animate-in every time
  useEffect(() => {
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("scroll"));
      });
    }
  }, [selectedCountry]);

  // Pricing data - original two-card layout
  const pricingData = {
    US: {
      basic: {
        title: "Basic",
        discounted: 149,
        original: 199,

        features: [
          "Article of organization",
          "Certificate Of Formation",
          "Registered Agent for One Year",
          "Business Address for One Year",
          "Mail Forwarding for One Year",
          "Employer Identification Number (EIN)",
          "Basic Tax Consultation",
        ],
      },
      premium: {
        title: "Amazon Plus",
        discounted: 449,
        original: 749,

        features: [
          "Article of organization",
          "Certificate Of Formation",
          "Registered Agent for One Year",
          "Unique Business Address for One year",
          "Mail Forwarding for One Year",
          "Employer Identification Number (EIN)",
          "Business Bank Account (Fintech)",
        ],
      },
    },
    UK: {
      basic: {
        discounted: 219,
        original: 299,
        title: "Basic",
        subtitle: "UK company formation Package",
        features: [
          "Incorporation of Your Company",
          "UK Registered Office Address for One Year.",
          "Directors Service Address for One year.",
          "Annual Compliance with Companies House",
          "PSC Register with Companies House",
          "Soft Copy of Certificate of Incorporation",
          "UTR Number",
        ],
      },
      premium: {
        discounted: 349,
        original: 449,
        title: "Shopify Plus",
        subtitle: "UK company formation Package",
        features: [
          "Incorporation of Your Company",
          "UK Registered Office Address for One Year.",
          "Directors Service Address for One year.",
          "Annual Compliance with Companies House",
          "PSC Register with Companies House",
          "Soft Copy of Certificate of Incorporation",
          "Ultimate Beneficial Owner (UBO) Letter.",
          "Business Bank Account Application(Mercury/Airwallex)",
          "Business Bank Account (Fintech)",
          "Shopify Payments account application and verification.",
          "Business PayPal Account with Expert Hand",
        ],
      },
    },
  };

  const currentPricing = pricingData[selectedCountry];
  const isUS = selectedCountry === "US";

  return (
    <section id="pricing" className="py-20 bg-white animate-fadeIn">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 scroll-animate">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-gray-900">Transparent</span>{" "}
            <span className="text-blue-600">Pricing</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Where do you want to Incorporate?
          </p>

          {/* Country Toggle */}
          <div className="inline-flex bg-gray-200 rounded-full p-1 mb-12">
            <button
              onClick={() => setSelectedCountry("US")}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 cursor-pointer hover:scale-105 ${
                selectedCountry === "US"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>In the US</span>
              <span className="text-lg">🇺🇸</span>
            </button>
            <button
              onClick={() => setSelectedCountry("UK")}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 cursor-pointer hover:scale-105 ${
                selectedCountry === "UK"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>In the UK</span>
              <span className="text-lg">🇬🇧</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div
            key={`basic-${selectedCountry}`}
            className="relative scroll-animate animate-slideInLeft hover:scale-105 transition-transform duration-300"
          >
            {/* Green accent border */}
            <div className="absolute -top-2 -left-2 -right-2 -bottom-2 bg-gradient-to-br from-green-400 to-green-500 rounded-3xl opacity-20"></div>
            <div className="absolute -top-1 -left-1 -right-1 -bottom-1 border-2 border-green-400 rounded-3xl"></div>

            <div className="relative bg-white rounded-3xl p-8 shadow-lg">
              {/* Basic Label */}
              <div className="text-left mb-6">
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {isUS
                    ? pricingData.US.basic.title
                    : pricingData.UK.basic.title}
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                {isUS ? (
                  <>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold text-gray-900">
                        ${pricingData.US.basic.discounted}
                      </span>
                      <span className="text-xl text-gray-500 line-through">
                        ${pricingData.US.basic.original}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2">+ State Fee </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold text-gray-900">
                        ${pricingData.UK.basic.discounted}
                      </span>
                      <span className="text-xl text-gray-500 line-through">
                        ${pricingData.UK.basic.original}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2">
                      UK company formation Package
                    </p>
                  </>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() =>
                  (window.location.href =
                    selectedCountry === "US"
                      ? "/purchase/us/purchase?package=basic"
                      : "/purchase/uk/purchase?package=basic")
                }
                className="w-full mb-8 bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl text-lg font-semibold transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-lg"
              >
                Buy Now
              </button>

              {/* Features */}
              <div className="space-y-4">
                {(isUS
                  ? pricingData.US.basic.features
                  : pricingData.UK.basic.features
                ).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-green-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Premium Plan */}
          <div
            key={`premium-${selectedCountry}`}
            className="relative scroll-animate animate-slideInRight hover:scale-105 transition-transform duration-300"
          >
            {/* Glow backdrop */}
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-green-400/40 via-emerald-500/40 to-lime-400/40 blur-2xl opacity-60 -z-10"></div>
            <div className="bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 rounded-3xl p-8 text-white shadow-2xl hover:shadow-[0_25px_60px_-12px_rgba(16,185,129,0.55)] transition-all duration-300 ring-1 ring-white/10">
              {/* Premium Label */}
              <div className="flex justify-between items-center mb-6">
                <span className="inline-block bg-white bg-opacity-20 text-black px-3 py-1 rounded-full text-sm font-medium">
                  {isUS
                    ? pricingData.US.premium.title
                    : pricingData.UK.premium.title}
                </span>
                {isUS ? (
                  <span className="bg-white text-green-600 px-3 py-1 rounded-full text-sm font-semibold">
                    Popular
                  </span>
                ) : (
                  <span className="bg-white text-green-600 px-3 py-1 rounded-full text-sm font-semibold">
                    Priority Processing
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                {isUS ? (
                  <>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold">
                        ${pricingData.US.premium.discounted}
                      </span>
                      <span className="text-xl text-green-200 line-through">
                        ${pricingData.US.premium.original}
                      </span>
                    </div>
                    <p className="text-green-100 mt-2">+ State Fee. </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold">
                        ${pricingData.UK.premium.discounted}
                      </span>
                      <span className="text-xl text-green-200 line-through">
                        ${pricingData.UK.premium.original}
                      </span>
                    </div>
                    <p className="text-green-100 mt-2">
                      UK company formation Package
                    </p>
                  </>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() =>
                  (window.location.href =
                    selectedCountry === "US"
                      ? "/purchase/us/purchase?package=amazon-plus"
                      : "/purchase/uk/purchase?package=shopify-plus")
                }
                className="w-full mb-8 bg-white text-green-600 hover:bg-gray-100 py-4 rounded-xl text-lg font-semibold transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-lg"
              >
                Buy Now
              </button>

              {/* Features */}
              <div className="space-y-4">
                {(isUS
                  ? pricingData.US.premium.features
                  : pricingData.UK.premium.features.slice(0, 7)
                ).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-white flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 scroll-animate">
          <p className="text-gray-600 mb-6">
            Browse all our plans and discover the best fit.
          </p>
          <CTAButton
            href={isUS ? "/usa-company-formation" : "/uk-company-formation"}
            variant="outline"
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 cursor-pointer hover:scale-105 transition-transform duration-200"
          >
            View All Services
          </CTAButton>
        </div>
      </div>
    </section>
  );
};

export default InteractivePricing;
