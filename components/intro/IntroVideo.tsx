"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/paths";
import { cn } from "@/lib/utils";

/**
 * The barber pole on the opening screen — a real product film, not a drawing.
 *
 * Two encodes are supplied: a 9:16 cut for phones and a 16:9 cut for wider
 * screens. Only one is mounted, chosen from the viewport, so a phone never
 * downloads the desktop file. The clip is never stretched: it is letterboxed
 * against the same ivory the video was shot on, so no edge is visible.
 *
 * The last frame is held rather than looped, which is what the composition
 * needs — the wordmark and ENTER sit over a still object.
 */
export function IntroVideo({
  portrait,
  landscape,
  poster,
  background,
  onFirstFrame,
  className,
}: {
  portrait: { src: string; webm?: string };
  landscape: { src: string; webm?: string };
  poster: string;
  /** Must match the video's own background exactly, or the edges show. */
  background: string;
  /** Fired once real pixels are on screen, so nothing flashes before then. */
  onFirstFrame?: () => void;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);

  // Pick the cut before mounting the element, so only one file is ever fetched.
  useEffect(() => {
    const query = window.matchMedia("(max-aspect-ratio: 1/1)");
    setIsPortrait(query.matches);
    const onChange = (event: MediaQueryListEvent) => setIsPortrait(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Freeze on the closing frame instead of looping back to an empty room.
    const holdLastFrame = () => {
      video.pause();
      video.currentTime = Math.max(0, video.duration - 0.05);
    };
    video.addEventListener("ended", holdLastFrame);

    // Some browsers refuse the autoplay promise; the poster then carries it.
    void video.play().catch(() => undefined);

    return () => video.removeEventListener("ended", holdLastFrame);
  }, [isPortrait]);

  const cut = isPortrait ? portrait : landscape;

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ backgroundColor: background }}
    >
      {/* object-contain, never object-cover: the pole must not be cropped or
          stretched, and the surrounding ivory matches the video's own. */}
      {isPortrait !== null && !failed && (
        <video
          key={isPortrait ? "portrait" : "landscape"}
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-contain"
          poster={asset(poster)}
          autoPlay
          muted
          playsInline
          preload="auto"
          onPlaying={onFirstFrame}
          onError={() => setFailed(true)}
          aria-hidden="true"
        >
          {cut.webm && <source src={asset(cut.webm)} type="video/webm" />}
          <source src={asset(cut.src)} type="video/mp4" />
        </video>
      )}

      {/* If the video cannot be decoded at all, the poster stands in — the old
          drawn pole is gone and is never used as a fallback. */}
      {failed && (
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${asset(poster)})` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default IntroVideo;
