import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Homework Tracker",
    short_name: "HW Tracker",
    description: "Track your homework progress by book, unit, and task.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7F2",
    theme_color: "#C45D3E",
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
