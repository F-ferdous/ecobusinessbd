"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentEmail(u?.email ?? null);
    });
    return () => unsub();
  }, []);
  const isAuthenticated = !!currentEmail;
  const isAdminEmail =
    (currentEmail || "").toLowerCase() === "admin@ecobusinessbd.com";
  const dashboardHref = isAdminEmail ? "/admin/dashboard" : "/user/dashboard";

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Amazon Courses", href: "/amazon-courses" },
    // { name: "Contact", href: "/contact" },
  ];

  const servicesMenu = [
    {
      name: "USA Company Formation",
      href: "/usa-company-formation",
    },
    {
      name: "UK Company Formation",
      href: "/uk-company-formation",
    },
    {
      name: "Additional Services",
      href: "/services/additional-services",
    },
  ];

  const handleServicesEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsServicesOpen(true);
  };

  const handleServicesLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsServicesOpen(false);
    }, 300);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsServicesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <header
      className="bg-white shadow-lg sticky top-0 z-50"
      style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e5e7eb" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/assets/images/logo-green.png"
              alt="Eco Business Logo"
              width={180}
              height={60}
              className="h-14 lg:h-16 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center space-x-2 lg:space-x-2"
            data-navbar="desktop"
          >
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-green-600 px-2 py-2 text-base font-semibold transition-all duration-200 hover:scale-105 navbar-item"
              >
                {item.name}
              </Link>
            ))}

            {/* Services Dropdown */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={handleServicesEnter}
              onMouseLeave={handleServicesLeave}
            >
              <button
                className="text-gray-700 hover:text-green-600 px-2 py-2 text-base font-semibold transition-all duration-200 hover:scale-105 flex items-center group navbar-item"
                onClick={() => setIsServicesOpen(!isServicesOpen)}
              >
                Services
                <svg
                  className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                    isServicesOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-100 transition-all duration-300 z-50 ${
                  isServicesOpen
                    ? "opacity-100 translate-y-0 visible"
                    : "opacity-0 translate-y-4 invisible"
                }`}
              >
                <div className="p-1">
                  {servicesMenu.map((item, index) => (
                    <div
                      key={item.name}
                      className={`animate-fadeInUp`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <Link
                        href={item.href}
                        className="block px-3 py-2 rounded-md hover:bg-gray-50 transition-all duration-200 group"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(item.href);
                          setIsServicesOpen(false);
                        }}
                      >
                        <div className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                          {item.name}
                        </div>
                      </Link>
                      {index < servicesMenu.length - 1 && (
                        <div className="h-px bg-gray-100 mx-2 my-0.5"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4 navbar-cta-container">
            {isAuthenticated ? (
              <Link
                href={dashboardHref}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200 navbar-button"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg font-semibold transition-all duration-200 border border-gray-300 hover:border-green-600 navbar-button"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200 navbar-button"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-100 mobile-menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {!isMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-slideDown">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-semibold text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-all duration-200 animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Services Menu (always visible) */}
              <div
                className="animate-fadeInUp"
                style={{ animationDelay: `${navigation.length * 100}ms` }}
              >
                <div className="px-3 pt-2 pb-1 text-base font-semibold text-gray-700">
                  <span>Services</span>
                </div>
                <div className="mt-1 pl-3 pr-3 space-y-1">
                  {servicesMenu.map((item, itemIndex) => (
                    <div
                      key={item.name}
                      className="animate-fadeInUp"
                      style={{ animationDelay: `${itemIndex * 50}ms` }}
                    >
                      <Link
                        href={item.href}
                        className="block py-2 text-sm text-gray-700 hover:text-green-600 rounded-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(item.href);
                          setIsMenuOpen(false);
                          setIsServicesOpen(false);
                        }}
                      >
                        {item.name}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mx-3 mt-4 space-y-2">
                {isAuthenticated ? (
                  <Link
                    href={dashboardHref}
                    className="block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold text-center transition-all duration-200 hover:scale-105 animate-fadeInUp"
                    style={{
                      animationDelay: `${(navigation.length + 1) * 100}ms`,
                    }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block text-gray-700 hover:text-green-600 px-6 py-2 rounded-lg font-semibold text-center transition-all duration-200 border border-gray-300 hover:border-green-600 animate-fadeInUp"
                      style={{
                        animationDelay: `${(navigation.length + 1) * 100}ms`,
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold text-center transition-all duration-200 hover:scale-105 animate-fadeInUp"
                      style={{
                        animationDelay: `${(navigation.length + 2) * 100}ms`,
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
