import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ulluk",
    short_name: "Ulluk",
    description:
      "Bangla-speaker-দের জন্য A1 German: পাঠ, শব্দভাণ্ডার, ব্যাকরণ, কুইজ আর ব্লগ।",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#0B1F3B",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
