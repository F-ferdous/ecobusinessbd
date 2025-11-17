import Layout from "@/components/Layout";
import CTAButton from "@/components/CTAButton";

export default function AdditionalServicesPage() {
  const services = [
    { title: "US Unique Business Address (One year)", price: "$50" },
    { title: "EIN Application", price: "$50" },
    { title: "ITIN & W-7 assistance", price: "$100" },
    { title: "Seller Permit and Reseller certificate", price: "$50" },
    { title: "BOI filling", price: "$30" },
    { title: "Amazon Business account approval", price: "$50" },
    { title: "Stripe Account Approval", price: "$40" },
    { title: "Business PayPal Account Approval", price: "$50" },
    { title: "US Trademark Registration", price: "$400 + $250 Class Fee" },
    { title: "UK Trademark Registration", price: "$300 + $240 Class Fee" },
    { title: "Confirmation Statement Filling", price: "$100" },
    { title: "VAT Registration Number", price: "$50" },
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
