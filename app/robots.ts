import type { MetadataRoute } from "next";

// Always prerendered — also required by the static export used for the
// shareable single-file build (see scripts/build-standalone.mjs).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The demo admin area has no authentication; keep it out of search.
        disallow: ["/admin"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
