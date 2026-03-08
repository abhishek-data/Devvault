import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "DevVault — Developer Knowledge OS",
  description:
    "Store notes and code snippets locally. Sync to your own GitHub repo. Free forever.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DevVault — Developer Knowledge OS",
    description:
      "Store notes and code snippets locally. Sync to your own GitHub repo. Free forever.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevVault — Developer Knowledge OS",
    description:
      "Store notes and code snippets locally. Sync to your own GitHub repo. Free forever.",
  },
};

export default function Landing() {
  return <LandingPage />;
}
