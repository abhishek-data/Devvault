import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mydevvault.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DevVault",
    template: "%s | DevVault",
  },
  applicationName: "DevVault",
  description: "Your developer knowledge OS — local-first, GitHub-synced",
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
    title: "DevVault — Developer Knowledge OS",
    description:
      "Store notes and code snippets locally. Sync to your own GitHub repo. Free forever.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevVault — Developer Knowledge OS",
    description:
      "Store notes and code snippets locally. Sync to your own GitHub repo. Free forever.",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
