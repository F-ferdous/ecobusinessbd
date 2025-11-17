import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>{children}</main>
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/13073721422"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed left-4 bottom-4 md:left-6 md:bottom-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg p-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.52 3.48A11.86 11.86 0 0012.04 0C5.46.02.2 5.28.22 11.86c.01 2.09.56 4.15 1.6 5.97L0 24l6.36-1.66a11.8 11.8 0 005.68 1.44h.05c6.58 0 11.84-5.26 11.86-11.74a11.84 11.84 0 00-3.43-8.56zM12.09 21.3h-.04a9.9 9.9 0 01-5.04-1.38l-.36-.21-3.77.98 1.01-3.67-.24-.38a9.92 9.92 0 01-1.56-5.38C2.07 6.37 6.37 2.06 12.06 2.06c2.64 0 5.12 1.03 6.99 2.9a9.79 9.79 0 012.87 6.96c-.02 5.68-4.32 10.38-9.83 10.38zm5.65-7.42c-.31-.15-1.83-.9-2.11-1-.28-.1-.49-.15-.69.16-.2.31-.79 1-.97 1.2-.18.2-.36.22-.67.07-.31-.15-1.3-.48-2.48-1.53-.92-.82-1.54-1.83-1.72-2.14-.18-.31-.02-.48.14-.63.14-.14.31-.36.46-.54.15-.18.2-.31.31-.51.1-.2.05-.38-.02-.53-.07-.15-.69-1.66-.95-2.27-.25-.6-.5-.52-.69-.53-.18-.01-.38-.01-.58-.01-.2 0-.53.07-.81.38-.28.31-1.07 1.05-1.07 2.56 0 1.5 1.1 2.95 1.26 3.16.15.2 2.17 3.31 5.26 4.64.74.32 1.32.51 1.77.65.74.24 1.42.21 1.95.13.59-.09 1.83-.75 2.08-1.47.26-.72.26-1.33.18-1.47-.08-.13-.28-.2-.59-.35z"/>
        </svg>
      </a>
      <Footer />
    </div>
  );
}