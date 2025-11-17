import Layout from '@/components/Layout';
import CTAButton from '@/components/CTAButton';

export default function Contact() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Get in Touch
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Ready to start your business? Have questions about our services? We&apos;re here to help you succeed.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Let&apos;s Start Your Success Story
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our team of experts is ready to help you form your company and grow your business. 
                Contact us today for a free consultation.
              </p>

              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600"><a href="tel:+13073721422" className="hover:underline">+1(307)372-1422</a></p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 9c0 7-7.5 12-7.5 12S4.5 16 4.5 9a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Company Address</h3>
                    <p className="text-gray-600">Eco Business Formation LTD</p>
                    <p className="text-gray-600">124 City Rd, London EC1V 2NX, UK</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">info@ecobusiness.com</p>
                  </div>
                </div>

                {/* Social Links */}
                <div className="pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Follow & Chat</h3>
                  <div className="flex items-center gap-4">
                    <a href="https://www.facebook.com/share/19rwiQJdWC/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600" aria-label="Facebook">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35C.595 0 0 .595 0 1.326v21.348C0 23.405.595 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.312h3.588l-.467 3.622h-3.121V24h6.116C23.405 24 24 23.405 24 22.674V1.326C24 .595 23.405 0 22.675 0z"/></svg>
                    </a>
                    <a href="https://www.instagram.com/ecobusinessformationltd?igsh=aWdrcTcwaTFtOGI4" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600" aria-label="Instagram">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.35 3.608 1.325.975.975 1.263 2.242 1.325 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.35 2.633-1.325 3.608-.975.975-2.242 1.263-3.608 1.325-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.35-3.608-1.325-.975-.975-1.263-2.242-1.325-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.35-2.633 1.325-3.608.975-.975 2.242-1.263 3.608-1.325C8.416 2.175 8.796 2.163 12 2.163zm0 1.837c-3.17 0-3.548.012-4.796.07-1.036.048-1.6.22-1.974.367-.496.192-.85.423-1.223.796-.373.373-.604.727-.796 1.223-.147.374-.319.938-.367 1.974-.058 1.248-.07 1.626-.07 4.796s.012 3.548.07 4.796c.048 1.036.22 1.6.367 1.974.192.496.423.85.796 1.223.373.373.727.604 1.223.796.374.147.938.319 1.974.367 1.248.058 1.626.07 4.796.07s3.548-.012 4.796-.07c1.036-.048 1.6-.22 1.974-.367.496-.192.85-.423 1.223-.796.373-.373.604-.727.796-1.223.147-.374.319-.938.367-1.974.058-1.248.07-1.626.07-4.796s-.012-3.548-.07-4.796c-.048-1.036-.22-1.6-.367-1.974-.192-.496-.423-.85-1.223-.796-.374.147-.938.319-1.974.367-1.248.058-1.626.07-4.796.07z"/></svg>
                    </a>
                    <a href="https://wa.me/13073721422" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600" aria-label="WhatsApp">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.86 11.86 0 0012.04 0C5.46.02.2 5.28.22 11.86c.01 2.09.56 4.15 1.6 5.97L0 24l6.36-1.66a11.8 11.8 0 005.68 1.44h.05c6.58 0 11.84-5.26 11.86-11.74a11.84 11.84 0 00-3.43-8.56zM12.09 21.3h-.04a9.9 9.9 0 01-5.04-1.38l-.36-.21-3.77.98 1.01-3.67-.24-.38a9.92 9.92 0 01-1.56-5.38C2.07 6.37 6.37 2.06 12.06 2.06c2.64 0 5.12 1.03 6.99 2.9a9.79 9.79 0 012.87 6.96c-.02 5.68-4.32 10.38-9.83 10.38zm5.65-7.42c-.31-.15-1.83-.9-2.11-1-.28-.1-.49-.15-.69.16-.2.31-.79 1-.97 1.2-.18.2-.36.22-.67.07-.31-.15-1.3-.48-2.48-1.53-.92-.82-1.54-1.83-1.72-2.14-.18-.31-.02-.48.14-.63.14-.14.31-.36.46-.54.15-.18.2-.31.31-.51.1-.2.05-.38-.02-.53-.07-.15-.69-1.66-.95-2.27-.25-.6-.5-.52-.69-.53-.18-.01-.38-.01-.58-.01-.2 0-.53.07-.81.38-.28.31-1.07 1.05-1.07 2.56 0 1.5 1.1 2.95 1.26 3.16.15.2 2.17 3.31 5.26 4.64.74.32 1.32.51 1.77.65.74.24 1.42.21 1.95.13.59-.09 1.83-.75 2.08-1.47.26-.72.26-1.33.18-1.47-.08-.13-.28-.2-.59-.35z"/></svg>
                    </a>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Hours</h3>
                    <p className="text-gray-600">Mon-Fri: 9:00 AM - 6:00 PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Interested In *
                  </label>
                  <select
                    id="service"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a service</option>
                    <option value="usa-llc">USA LLC Formation</option>
                    <option value="usa-corp">USA Corporation Formation</option>
                    <option value="uk-ltd">UK Limited Company Formation</option>
                    <option value="bank-account">Business Bank Account</option>
                    <option value="virtual-office">Virtual Office</option>
                    <option value="amazon-course">Amazon Course</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tell us about your business goals and how we can help..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Don&apos;t wait – start your business formation journey today with maximum ROI
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton href="/#pricing" variant="secondary" size="lg" className="bg-gray-900 hover:bg-gray-800">
              View Our Services
            </CTAButton>
            <CTAButton href="/about" variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
              Learn About Us
            </CTAButton>
          </div>
        </div>
      </section>
    </Layout>
  );
}