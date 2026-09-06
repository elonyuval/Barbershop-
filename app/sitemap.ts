import type { MetadataRoute } from "next";

// Always prerendered — also required by the static export used for the
// shareable single-file build (see scripts/build-standalone.mjs).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
