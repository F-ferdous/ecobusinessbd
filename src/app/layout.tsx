import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoBusiness - Professional Business Formation Services",
  description: "Expert business formation services for USA and UK companies. LLC, Corporation, and Limited Company registration made simple.",
  icons: {
    icon: [
      { url: "/assets/images/icon-green.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/assets/images/icon-green.png?v=2", sizes: "16x16", type: "image/png" },
    ],
    apple: { url: "/assets/images/icon-green.png?v=2" },
    shortcut: "/assets/images/icon-green.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/globe.svg?v=3" type="image/svg+xml" />
        <link rel="icon" href="/assets/images/icon-green.png?v=2" sizes="32x32" type="image/png" />
        <link rel="icon" href="/assets/images/icon-green.png?v=2" sizes="16x16" type="image/png" />
        <link rel="shortcut icon" href="/assets/images/icon-green.png?v=2" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/images/icon-green.png?v=2" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
