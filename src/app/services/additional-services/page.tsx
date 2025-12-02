import Layout from "@/components/Layout";
import Link from "next/link";

export default function AdditionalServicesPage() {
  const services: {
    id: string;
    title: string;
    price: string;
    description: string;
  }[] = [
    {
      id: "us-unique-address",
      title: "US Unique Business Address (One year)",
      price: "$50",
      description: "One-year unique US business address with mail support.",
    },
    {
      id: "ein-application",
      title: "EIN Application",
      price: "$50",
      description: "We apply for your EIN (Tax ID) and deliver confirmation.",
    },
    {
      id: "itin-w7",
      title: "ITIN & W-7 assistance",
      price: "$100",
      description: "Guidance and assistance to obtain ITIN with W-7.",
    },
    {
      id: "seller-permit",
      title: "Seller Permit and Reseller certificate",
      price: "$50",
      description:
        "Support to obtain seller’s permit and reseller certificate.",
    },
    {
      id: "boi-filing",
      title: "BOI filling",
      price: "$30",
      description: "Beneficial Ownership Information filing assistance.",
    },
    {
      id: "amazon-business-approval",
      title: "Amazon Business account approval",
      price: "$50",
      description: "Hands-on support for Amazon Business account approval.",
    },
    {
      id: "stripe-approval",
      title: "Stripe Account Approval",
      price: "$40",
      description: "Guided setup and approval support for Stripe.",
    },
    {
      id: "paypal-approval",
      title: "Business PayPal Account Approval",
      price: "$50",
      description: "Support to set up and approve Business PayPal account.",
    },
    {
      id: "us-trademark",
      title: "US Trademark Registration",
      price: "$400 + $250 Class Fee",
      description:
        "Trademark filing assistance. Government Class Fee $250 applies.",
    },
    {
      id: "uk-trademark",
      title: "UK Trademark Registration",
      price: "$300 + $240 Class Fee",
      description:
        "Trademark filing assistance. Government Class Fee $240 applies.",
    },
    {
      id: "confirmation-statement",
      title: "Confirmation Statement Filling",
      price: "$100",
      description: "Annual confirmation statement filing service.",
    },
    {
      id: "vat-registration",
      title: "VAT Registration Number",
      price: "$50",
      description: "Assistance in obtaining VAT Registration Number.",
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Additional Services
          </h1>
          <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto">
            Others service
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((s, idx) => (
              <div
                key={s.title}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 pr-3">
                    {s.title}
                  </h3>
                  <span className="shrink-0 inline-flex items-center rounded-full bg-green-100 text-green-700 text-sm font-semibold px-3 py-1">
                    {s.price}
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600">{s.description}</p>
                <div className="mt-4">
                  <Link
                    href={`/purchase/additional?service=${encodeURIComponent(
                      s.id
                    )}`}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-md border border-green-600 text-green-700 hover:bg-green-600 hover:text-white transition-colors"
                  >
                    Buy Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Need multiple services together?</p>
            <CTAButton href="/contact" variant="secondary">Request a Custom Bundle</CTAButton>
          </div> */}
        </div>
      </section>
    </Layout>
  );
}
