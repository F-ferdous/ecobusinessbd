"use client";

import React from "react";

const PaymentMethodsMarquee = () => {
  const paymentMethods = [
    "PayPal",
    "Stripe",
    "Visa",
    "Mastercard",
    "Apple Pay",
    "Google Pay",
    "American Express",
    "Bitcoin",
  ] as const;

  // Brand style approximations (safe system font stacks + brand colors)
  const brandStyles: Record<(typeof paymentMethods)[number], React.CSSProperties> = {
    PayPal: {
      fontWeight: 800,
      letterSpacing: "0.5px",
      fontFamily: "\"Helvetica Neue\", Arial, sans-serif",
    },
    Stripe: {
      fontWeight: 800,
      letterSpacing: "0.4px",
      fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    },
    Visa: {
      fontWeight: 900,
      letterSpacing: "1px",
      textTransform: "uppercase",
      fontFamily: "Helvetica, Arial, sans-serif",
    },
    Mastercard: {
      fontWeight: 700,
      letterSpacing: "0.5px",
      textTransform: "lowercase",
      fontFamily: "Helvetica, Arial, sans-serif",
    },
    "Apple Pay": {
      fontWeight: 700,
      letterSpacing: "0.2px",
      fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", Helvetica, Arial, sans-serif",
    },
    "Google Pay": {
      fontWeight: 800,
      letterSpacing: "0.2px",
      fontFamily: "Roboto, system-ui, Arial, sans-serif",
    },
    "American Express": {
      fontWeight: 900,
      letterSpacing: "1.2px",
      textTransform: "uppercase",
      fontFamily: "Helvetica, Arial, sans-serif",
    },
    Bitcoin: {
      fontWeight: 900,
      letterSpacing: "0.6px",
      fontFamily: "\"Helvetica Neue\", Arial, sans-serif",
    },
  };

  return (
    <section className="py-8 bg-gray-900 overflow-hidden">
      {/* Header text */}
      <div className="text-center mb-8">
        <h3 className="text-white text-xl font-bold">
          Secure payments powered by trusted global payment partners
        </h3>
      </div>
      
      <div className="relative py-4">
        {/* Fade effect on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-900 to-transparent z-10"></div>
        
        {/* Marquee container */}
        <div className="flex marquee-animation">
          {/* First set of payment methods */}
          <div className="flex items-center space-x-12 px-6 min-w-max">
            {paymentMethods.map((method, index) => (
              <div 
                key={`first-${index}`}
                className="text-white whitespace-nowrap hover:scale-110 transition-transform duration-300"
              >
                <span
                  className="text-[28px] text-[#6983a7]"
                  style={brandStyles[method]}
                >
                  {method}
                </span>
              </div>
            ))}
          </div>
          
          {/* Second set (duplicate for seamless loop) */}
          <div className="flex items-center space-x-12 px-6 min-w-max">
            {paymentMethods.map((method, index) => (
              <div 
                key={`second-${index}`}
                className="text-white whitespace-nowrap hover:scale-110 transition-transform duration-300"
              >
                <span
                  className="text-[28px] text-[#6983a7]"
                  style={brandStyles[method]}
                >
                  {method}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes marqueeSlide {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          .marquee-animation {
            animation: marqueeSlide 15s linear infinite;
            will-change: transform;
          }
          
          /* Faster animation on mobile devices */
          @media (max-width: 768px) {
            .marquee-animation {
              animation: marqueeSlide 8s linear infinite;
            }
          }
        `
      }} />
    </section>
  );
};

export default PaymentMethodsMarquee;