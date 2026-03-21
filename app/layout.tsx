import type { Metadata } from "next";
import { geistSans, geistMono } from "@/lib/fonts";
import "./globals.css";
import { Providers } from "@/components/Providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mydevvault.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DevVault | Local-First Developer Knowledge OS",
    template: "%s | DevVault",
  },
  applicationName: "DevVault",
  description: "DevVault is a local-first developer knowledge OS. Store markdown notes and code snippets securely, then sync seamlessly to your private GitHub repo.",
  keywords: [
    "developer notes",
    "code snippets",
    "knowledge base",
    "markdown notes",
    "github sync",
    "developer productivity",
  ],
  authors: [{ name: "Abhishek" }],
  creator: "Abhishek",
  publisher: "DevVault",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "DevVault",
    title: "DevVault | Local-First Developer Knowledge OS",
    description: "DevVault is a local-first developer knowledge OS. Store markdown notes and code snippets securely, then sync seamlessly to your private GitHub repo.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevVault | Local-First Developer Knowledge OS",
    description: "DevVault is a local-first developer knowledge OS. Store markdown notes and code snippets securely, then sync seamlessly to your private GitHub repo.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", rel: "shortcut icon" },
    ],
    apple: [{ url: "/favicon.svg" }],
  },
  manifest: "/manifest.webmanifest",
};

import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DevVault",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: "DevVault is a local-first developer knowledge OS. Store markdown notes and code snippets securely, then sync seamlessly to your private GitHub repo."
  };

  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
