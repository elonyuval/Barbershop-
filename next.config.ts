import type { NextConfig } from "next";

// EXPORT_STATIC=1 produces a fully static build in /out, which is what gets
// published to GitHub Pages (see scripts/build-pages.mjs).
//
// BASE_PATH is the sub-path the site is served from. GitHub project Pages live
// at /<repo>, so the build needs "/Barbershop-"; leave it empty for a site
// served from a domain root.
const isStaticExport = process.env.EXPORT_STATIC === "1";
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // A static export has no image optimiser behind it.
    unoptimized: isStaticExport,
  },
  ...(isStaticExport
    ? {
        output: "export" as const,
        // Trailing slashes keep /admin working as a directory on static hosts.
        trailingSlash: true,
        ...(basePath ? { basePath, assetPrefix: basePath } : {}),
      }
    : {}),
};

export default nextConfig;
