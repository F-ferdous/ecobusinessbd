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
  description:
    "Expert business formation services for USA and UK companies. LLC, Corporation, and Limited Company registration made simple.",
  icons: {
    icon: [
      {
        url: "/assets/images/icon-green.png?v=2",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/assets/images/icon-green.png?v=2",
        sizes: "16x16",
        type: "image/png",
      },
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
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-P3THNQKK');",
          }}
        />
        <link rel="icon" href="/globe.svg?v=3" type="image/svg+xml" />
        <link
          rel="icon"
          href="/assets/images/icon-green.png?v=2"
          sizes="32x32"
          type="image/png"
        />
        <link
          rel="icon"
          href="/assets/images/icon-green.png?v=2"
          sizes="16x16"
          type="image/png"
        />
        <link
          rel="shortcut icon"
          href="/assets/images/icon-green.png?v=2"
          type="image/png"
        />
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
