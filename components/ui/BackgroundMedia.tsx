"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { VideoAsset } from "@/config/types";
import { asset } from "@/lib/paths";
import { cn } from "@/lib/utils";

/**
 * Background media that degrades sensibly:
 *
 *   video configured  → muted, looping, playsInline video with its poster
 *   video missing     → the poster image alone, with a very slow drift so the
 *                       panel still feels alive
 *   video errors      → falls back to the poster at runtime
 *   reduced motion    → poster only, never autoplaying
 *
 * With `lazy`, the video file is only attached once the section is near the
 * viewport, so a below-the-fold clip costs nothing on first load.
 */
export function BackgroundMedia({
  asset: media,
  alt,
  className,
  priority = false,
  lazy = false,
}: {
  asset: VideoAsset;
  alt: string;
  className?: string;
  priority?: boolean;
  lazy?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [near, setNear] = useState(!lazy);

  useEffect(() => {
    if (!lazy || near) return;
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [lazy, near]);

  const showVideo = Boolean(media.src) && !failed && !reduceMotion && near;

  return (
    <div ref={containerRef} className={cn("absolute inset-0 overflow-hidden", className)}>
      <Image
        src={asset(media.poster)}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        className={cn(
          "object-cover",
          // Only drifts when it is carrying the panel on its own.
          !showVideo && !reduceMotion && "animate-[drift_26s_ease-in-out_infinite_alternate]",
        )}
      />

      {showVideo && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          poster={asset(media.poster)}
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? "auto" : "metadata"}
          // Fires once no listed source can be decoded; the poster stays put.
          onError={() => setFailed(true)}
          aria-label={alt}
        >
          {/* WebM first: smaller, and preferred where supported. */}
          {media.webm && <source src={asset(media.webm)} type="video/webm" />}
          <source src={asset(media.src)} type="video/mp4" />
        </video>
      )}

      <style>{`
        @keyframes drift {
          from { transform: scale(1.04) translate3d(0, 0, 0); }
          to   { transform: scale(1.12) translate3d(-1.5%, -1%, 0); }
        }
      `}</style>
    </div>
  );
}

export default BackgroundMedia;
