"use client";

import Image from "next/image";
import Link from "next/link";
import { useScrollAnimations } from "@/hooks/useScrollAnimation";

export default function AboutContent() {
  useScrollAnimations();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <Image
              src="/assets/images/icon-lightGray.png"
              alt="Eco Business Icon"
              width={80}
              height={80}
              className="mx-auto"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">🌿 About Us – Eco-Business</h1>
          <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto">
            Welcome to Eco-Business, a trusted global platform for company formation, business consultancy, and international compliance services.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 bg-white scroll-animate">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            We started Eco-Business with a simple vision: to make global business expansion easy, affordable, and transparent for entrepreneurs and organizations of all sizes. In today’s digital world, businesses are no longer limited by borders. We help dreamers, innovators, and leaders turn their ideas into successful companies—whether in the USA, UK, Europe, or anywhere worldwide.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-16 bg-gray-50 scroll-animate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">💡 Who We Are</h2>
              <p className="text-gray-700 leading-relaxed">
                Eco-Business is more than just a service provider. We are a team of dedicated professionals, business consultants, and compliance experts committed to helping individuals and companies achieve their global goals. With years of experience in international company formation, taxation, and compliance, we understand the challenges entrepreneurs face—and we work tirelessly to make the process smooth, secure, and stress-free.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="grid grid-cols-2 gap-6 text-center">
                <Stat value="10+" label="Years Experience" />
                <Stat value="5000+" label="Clients Served" />
                <Stat value="50+" label="Countries Covered" />
                <Stat value="24/7" label="Dedicated Support" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 bg-white scroll-animate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">🌍 What We Do</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Company Formation & Registration" color="green">
              Register your business in the USA, UK, or any global jurisdiction with complete guidance.
            </Card>
            <Card title="Virtual Business Address & Mail Forwarding" color="blue">
              Use our premium addresses for official registration, mail forwarding, and compliance support.
            </Card>
            <Card title="Business Banking & Payment Gateways" color="yellow">
              Assistance with opening international bank accounts and connecting with Stripe, PayPal, Airwallex, and more.
            </Card>
            <Card title="Compliance & Legal Documentation" color="purple">
              Annual reports, BOI filing, tax filings, VAT registration, and all compliance requirements handled professionally.
            </Card>
            <Card title="Trademark & IP Services" color="red">
              Protect your brand globally with USPTO and international trademark services.
            </Card>
            <Card title="Business Consultancy & Growth Strategy" color="indigo">
              Tailored consultancy for startups to enterprises to scale and expand globally.
            </Card>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-gray-50 scroll-animate">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">🚀 Our Mission</h2>
          <blockquote className="text-xl text-gray-800 bg-white rounded-2xl p-6 shadow">
            “To empower entrepreneurs and businesses worldwide by making global business services accessible, affordable, and trustworthy.”
          </blockquote>
          <p className="mt-4 text-gray-700">
            We remove complex barriers and provide smart solutions so you can focus on growth—while we handle the rest.
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 bg-white scroll-animate">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">🌟 Our Vision</h2>
          <p className="text-gray-700 leading-relaxed">
            To become the leading global business partner for entrepreneurs, startups, and organizations who want to expand beyond borders, build trust internationally, and achieve long-term success.
          </p>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-16 bg-gray-50 scroll-animate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">🤝 Why Choose Eco-Business?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Badge text="Global Expertise – Knowledge of USA, UK, and global jurisdictions." />
            <Badge text="Transparency – No hidden charges, no confusing terms." />
            <Badge text="Dedicated Support – Friendly and professional assistance, always." />
            <Badge text="End-to-End Solutions – From formation to growth, everything in one place." />
            <Badge text="Secure & Reliable – Your data and business are protected with us." />
          </div>
        </div>
      </section>

      {/* Beyond Business */}
      <section className="py-16 bg-white scroll-animate">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">🌱 Beyond Business</h2>
          <p className="text-gray-700 leading-relaxed">
            At Eco-Business, we believe in more than just paperwork. We believe in building trust, nurturing relationships, and supporting entrepreneurs who want to change the world. Whether you are a freelancer starting your first LLC in the USA or a growing company expanding into Europe—we are here to guide you every step of the way.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-gray-50 scroll-animate">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">📩 Get in Touch</h2>
          <p className="text-gray-700 mb-6">
            We are always ready to listen to your needs, answer your questions, and guide you with the right solution.
          </p>
          <Link
            href="mailto:support@ecobusinessbd.com"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            📧 Email: support@ecobusinessbd.com
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="group">
      <div className="text-4xl font-bold text-green-600 mb-1 transition-transform duration-300 group-hover:-translate-y-1">
        {value}
      </div>
      <div className="text-gray-700">{label}</div>
    </div>
  );
}

function Card({
  title,
  color,
  children,
}: {
  title: string;
  color:
    | "green"
    | "blue"
    | "yellow"
    | "purple"
    | "red"
    | "indigo";
  children: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    purple: "bg-purple-100 text-purple-700",
    red: "bg-red-100 text-red-700",
    indigo: "bg-indigo-100 text-indigo-700",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${colorMap[color]}`}>
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700 leading-relaxed">{children}</p>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow border border-gray-100 flex items-start gap-3 hover:shadow-md transition-all duration-300">
      <span className="text-green-600 mt-0.5">✅</span>
      <span className="text-gray-800">{text}</span>
    </div>
  );
}
