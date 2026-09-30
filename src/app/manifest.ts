import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "मवेशी बाज़ार - पशु बिक्री PWA",
    short_name: "मवेशी बाज़ार",
    description: "अच्छे और स्वस्थ गाय, भैंस, पड़वा व पड़िया बिक्री के लिए उपलब्ध",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#047857",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
