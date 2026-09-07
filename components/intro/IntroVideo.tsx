"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/paths";
import { cn } from "@/lib/utils";

/**
 * The barber pole on the opening screen — a 3D product film rendered in
 * Blender, not a drawing and not an AI clip. Real geometry, so the object is
 * pixel-stable while the camera moves.
 *
 * One 9:16 master serves every screen. That is not a shortcut: the pole is shot
 * against a flat, unbroken ivory field, and the box behind the video is painted
 * the identical ivory, so on a wide screen the letterboxing has no visible
 * edge — the frame simply reads as more of the same seamless field. A second
 * 16:9 encode would double the render time and the download for no gain.
 *
 * The clip is never cropped or stretched (`object-contain`), and the last frame
 * is held rather than looped, because the wordmark and ENTER sit over a still
 * object once the camera lands.
 */
export function IntroVideo({
  src,
  webm,
  poster,
  background,
  onFirstFrame,
  className,
}: {
  src: string;
  webm?: string;
  poster: string;
  /** Must match the video's own ivory exactly, or the letterbox edge shows. */
  background: string;
  /** Fired once real pixels are on screen, so nothing flashes before then. */
  onFirstFrame?: () => void;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Freeze on the closing frame instead of snapping back to the macro.
    const holdLastFrame = () => {
      video.pause();
      video.currentTime = Math.max(0, video.duration - 0.04);
    };
    video.addEventListener("ended", holdLastFrame);

    // Some browsers refuse the autoplay promise; the poster then carries it.
    void video.play().catch(() => undefined);

    return () => video.removeEventListener("ended", holdLastFrame);
  }, []);

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ backgroundColor: background }}
    >
      {!failed && (
        <video
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
          {webm && <source src={asset(webm)} type="video/webm" />}
          <source src={asset(src)} type="video/mp4" />
        </video>
      )}

      {/* If the video cannot be decoded at all, the closing frame stands in.
          The old drawn pole is gone and is never used as a fallback. */}
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
