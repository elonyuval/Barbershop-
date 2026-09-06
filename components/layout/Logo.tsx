"use client";

import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/siteConfig";
import { cn } from "@/lib/utils";

/**
 * Typographic wordmark by default. Set brand.logoImage in siteConfig to use a
 * supplied logo file instead — nothing else needs to change.
 */
export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex min-h-11 items-center gap-3 py-2", className)}
      aria-label={siteConfig.business.name}
    >
      {siteConfig.brand.logoImage ? (
        <Image
          src={siteConfig.brand.logoImage}
          alt={siteConfig.business.name}
          width={132}
          height={34}
          className="h-8 w-auto"
          priority
        />
      ) : (
        <span className="font-display text-lg leading-none tracking-[0.34em] text-offwhite">
          {siteConfig.business.shortName}
        </span>
      )}
    </Link>
  );
}

export default Logo;
