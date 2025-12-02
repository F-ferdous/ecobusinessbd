import Layout from "@/components/Layout";
import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <Layout>
      <section className="min-h-[70vh] flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-xl">
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Coming Soon
          </h1>
          <p className="text-gray-600 mb-8">
            We’re putting the final touches on this service. Please check back
            soon.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-5 py-3 text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              Go to Home
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-gray-800 font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
