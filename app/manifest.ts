import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DevVault",
    short_name: "DevVault",
    description:
      "Store notes and code snippets locally. Sync to your own GitHub repo. Free forever.",
    start_url: "/",
    display: "standalone",
    background_color: "#080810",
    theme_color: "#080810",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
