import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DevVault",
    short_name: "DevVault",
    description:
      "Your developer knowledge OS — local-first, GitHub-synced. Store notes, code snippets, and bookmarks.",
    start_url: "/app",
    display: "standalone",
    background_color: "#1A1A1E",
    theme_color: "#1A1A1E",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    share_target: {
      action: "/app/share",
      method: "GET",
      params: {
        title: "title",
        text: "text",
        url: "url",
      },
    },
  };
}
