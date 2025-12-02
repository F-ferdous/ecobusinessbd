import Layout from "@/components/Layout";
import CTAButton from "@/components/CTAButton";
import Image from "next/image";

export default function AmazonCourses() {
  const courses = [
    {
      id: 1,
      title: "Amazon FBA Complete Mastery Course",
      description:
        "Learn everything you need to know about Amazon FBA from product research to scaling your business. Complete step-by-step guide for beginners to advanced sellers.",
      duration: "8 weeks",
      level: "Beginner to Advanced",
      price: "$497",
      originalPrice: "$697",
      features: [
        "Product research and validation strategies",
        "Supplier sourcing and negotiation",
        "Amazon listing optimization",
        "PPC advertising mastery",
        "Inventory management",
        "Brand building and protection",
        "Advanced scaling techniques",
        "Live Q&A sessions",
      ],
      popular: true,
    },
    {
      id: 2,
      title: "Amazon PPC Advertising Masterclass",
      description:
        "Master Amazon advertising with proven PPC strategies. Learn to optimize campaigns, reduce ACOS, and maximize profits with data-driven advertising techniques.",
      duration: "4 weeks",
      level: "Intermediate",
      price: "$297",
      originalPrice: "$397",
      features: [
        "Campaign structure and setup",
        "Keyword research and targeting",
        "Bid optimization strategies",
        "ACOS reduction techniques",
        "Advanced campaign types",
        "Performance analytics",
        "Budget management",
        "Case studies and examples",
      ],
      popular: false,
    },
    {
      id: 3,
      title: "Amazon Product Research Bootcamp",
      description:
        "Discover winning products with our comprehensive research methodology. Learn to identify high-profit opportunities and avoid costly mistakes.",
      duration: "3 weeks",
      level: "Beginner",
      price: "$197",
      originalPrice: "$297",
      features: [
        "Market analysis techniques",
        "Competition research",
        "Profit calculation methods",
        "Trend identification",
        "Supplier validation",
        "Risk assessment",
        "Research tools and software",
        "Product validation framework",
      ],
      popular: false,
    },
    {
      id: 4,
      title: "Amazon Brand Building Strategy",
      description:
        "Build a sustainable Amazon brand that stands out from the competition. Learn trademark protection, brand registry, and long-term growth strategies.",
      duration: "6 weeks",
      level: "Intermediate to Advanced",
      price: "$397",
      originalPrice: "$497",
      features: [
        "Brand strategy development",
        "Amazon Brand Registry",
        "Trademark protection",
        "Brand store optimization",
        "A+ content creation",
        "Customer loyalty building",
        "Multi-channel expansion",
        "Legal protection strategies",
      ],
      popular: false,
    },
    {
      id: 5,
      title: "Amazon Seller Compliance & Legal Protection",
      description:
        "Protect your Amazon business with comprehensive compliance strategies. Learn to avoid suspensions, handle IP claims, and maintain account health.",
      duration: "2 weeks",
      level: "All Levels",
      price: "$197",
      originalPrice: "$297",
      features: [
        "Account health management",
        "Compliance best practices",
        "IP claim handling",
        "Suspension prevention",
        "Appeal strategies",
        "Legal documentation",
        "Policy updates",
        "Risk mitigation",
      ],
      popular: false,
    },
    {
      id: 6,
      title: "Amazon International Expansion",
      description:
        "Scale your Amazon business globally with our international expansion course. Learn market entry strategies for Europe, Asia, and beyond.",
      duration: "5 weeks",
      level: "Advanced",
      price: "$397",
      originalPrice: "$597",
      features: [
        "Market selection criteria",
        "International regulations",
        "Cross-border logistics",
        "Currency and pricing",
        "Cultural considerations",
        "VAT and tax compliance",
        "Local competition analysis",
        "Expansion timeline planning",
      ],
      popular: false,
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
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
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Amazon Business Courses
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
            Master Amazon selling with our comprehensive course collection. From
            beginner fundamentals to advanced strategies, achieve maximum ROI on
            your Amazon business.
          </p>
          <CTAButton href="#courses" variant="secondary" size="lg">
            Browse Courses
          </CTAButton>
        </div>
      </section>

      {/* Course Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Amazon Courses?
            </h2>
            <p className="text-xl text-gray-600">
              Learn from industry experts with proven track records
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-green-600"
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
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Proven Strategies
              </h3>
              <p className="text-gray-600">
                Learn from successful Amazon sellers who have generated millions
                in revenue using these exact strategies.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Comprehensive Content
              </h3>
              <p className="text-gray-600">
                Step-by-step guides, video tutorials, templates, and tools to
                implement everything you learn.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Expert Support
              </h3>
              <p className="text-gray-600">
                Direct access to instructors, live Q&A sessions, and a community
                of successful Amazon sellers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Waitlist */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Join the Waitlist
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Courses are opening soon. Join the waitlist and be the first to know
            when enrollment starts.
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <form className="flex flex-col sm:flex-row gap-3 justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 min-w-0 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <button
                type="submit"
                className="rounded-lg bg-green-600 hover:bg-green-700 text-white px-6 py-3 font-semibold"
              >
                Join Waitlist
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-3">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
