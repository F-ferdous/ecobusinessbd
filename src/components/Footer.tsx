import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/assets/images/logo-lightGray.png"
                alt="Eco Business Logo"
                width={160}
                height={40}
                className="h-14 w-auto"
              />
            </Link>
            <p className="text-gray-300 mb-4 max-w-md">
              Your trusted partner for company formation in USA and UK. We
              provide comprehensive business setup services with maximum ROI for
              your investment.
            </p>
            <div className="space-y-1 text-gray-300 mb-6">
              <p className="font-semibold text-white">
                Eco Business Formation LTD
              </p>
              <p>124 City Rd, London EC1V 2NX, UK</p>
              <p>
                Mobile:{" "}
                <a href="tel:+13073721422" className="hover:text-white">
                  +1(307)372-1422
                </a>
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/share/19rwiQJdWC/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">Facebook</span>
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.675 0h-21.35C.595 0 0 .595 0 1.326v21.348C0 23.405.595 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.312h3.588l-.467 3.622h-3.121V24h6.116C23.405 24 24 23.405 24 22.674V1.326C24 .595 23.405 0 22.675 0z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/ecobusinessformationltd?igsh=aWdrcTcwaTFtOGI4"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.35 3.608 1.325.975.975 1.263 2.242 1.325 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.35 2.633-1.325 3.608-.975.975-2.242 1.263-3.608 1.325-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.35-3.608-1.325-.975-.975-1.263-2.242-1.325-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.35-2.633 1.325-3.608.975-.975 2.242-1.263 3.608-1.325C8.416 2.175 8.796 2.163 12 2.163zm0 1.837c-3.17 0-3.548.012-4.796.07-1.036.048-1.6.22-1.974.367-.496.192-.85.423-1.223.796-.373.373-.604.727-.796 1.223-.147.374-.319.938-.367 1.974-.058 1.248-.07 1.626-.07 4.796s.012 3.548.07 4.796c.048 1.036.22 1.6.367 1.974.192.496.423.85.796 1.223.373.373.727.604 1.223.796.374.147.938.319 1.974.367 1.248.058 1.626.07 4.796.07s3.548-.012 4.796-.07c1.036-.048 1.6-.22 1.974-.367.496-.192.85-.423 1.223-.796.373-.373.604-.727.796-1.223.147-.374.319-.938.367-1.974.058-1.248.07-1.626.07-4.796s-.012-3.548-.07-4.796c-.048-1.036-.22-1.6-.367-1.974-.192-.496-.423-.85-1.223-.796-.374.147-.938.319-1.974.367-1.248.058-1.626.07-4.796.07zm0 3.905a5.095 5.095 0 110 10.19 5.095 5.095 0 010-10.19zm0 1.837a3.258 3.258 0 100 6.516 3.258 3.258 0 000-6.516zm6.406-3.28a1.19 1.19 0 110 2.381 1.19 1.19 0 010-2.381z" />
                </svg>
              </a>
              <a
                href="https://wa.me/13073721422"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">WhatsApp</span>
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.52 3.48A11.86 11.86 0 0012.04 0C5.46.02.2 5.28.22 11.86c.01 2.09.56 4.15 1.6 5.97L0 24l6.36-1.66a11.8 11.8 0 005.68 1.44h.05c6.58 0 11.84-5.26 11.86-11.74a11.84 11.84 0 00-3.43-8.56zM12.09 21.3h-.04a9.9 9.9 0 01-5.04-1.38l-.36-.21-3.77.98 1.01-3.67-.24-.38a9.92 9.92 0 01-1.56-5.38C2.07 6.37 6.37 2.06 12.06 2.06c2.64 0 5.12 1.03 6.99 2.9a9.79 9.79 0 012.87 6.96c-.02 5.68-4.32 10.38-9.83 10.38zm5.65-7.42c-.31-.15-1.83-.9-2.11-1-.28-.1-.49-.15-.69.16-.2.31-.79 1-.97 1.2-.18.2-.36.22-.67.07-.31-.15-1.3-.48-2.48-1.53-.92-.82-1.54-1.83-1.72-2.14-.18-.31-.02-.48.14-.63.14-.14.31-.36.46-.54.15-.18.2-.31.31-.51.1-.2.05-.38-.02-.53-.07-.15-.69-1.66-.95-2.27-.25-.6-.5-.52-.69-.53-.18-.01-.38-.01-.58-.01-.2 0-.53.07-.81.38-.28.31-1.07 1.05-1.07 2.56 0 1.5 1.1 2.95 1.26 3.16.15.2 2.17 3.31 5.26 4.64.74.32 1.32.51 1.77.65.74.24 1.42.21 1.95.13.59-.09 1.83-.75 2.08-1.47.26-.72.26-1.33.18-1.47-.08-.13-.28-.2-.59-.35z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/usa-company-formation"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  USA Company Formation
                </Link>
              </li>
              <li>
                <Link
                  href="/uk-company-formation"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  UK Company Formation
                </Link>
              </li>
              <li>
                <Link
                  href="/coming-soon"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Bank Account Opening
                </Link>
              </li>
              <li>
                <Link
                  href="/coming-soon"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Virtual Office
                </Link>
              </li>
              <li>
                <Link
                  href="/coming-soon"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Tax Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © <span suppressHydrationWarning>{currentYear}</span> Eco
              Business. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Maximum ROI • Trusted Worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
