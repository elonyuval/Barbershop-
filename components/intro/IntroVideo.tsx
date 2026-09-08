"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { asset } from "@/lib/paths";
import { cn } from "@/lib/utils";

/** The master's own pixel dimensions, which set every fit calculation below. */
const FILM_W = 608;
const FILM_H = 1080;

/** The rate the 120 frames are encoded at, so the film runs 4.00s. */
const FILM_FPS = 30;

/**
 * When the pole clears each pair of frame edges, measured off the rendered
 * frames rather than guessed: it leaves the left and right edges at frame 39
 * and the top and bottom only at frame 97, because it is a tall object and runs
 * off the short edges for most of the pull-back.
 *
 * These are the moments the film can stop covering the viewport. Before them
 * its own pixels reach its own edges, so any letterboxing draws a hard-edged
 * rectangle across the page; after them the edges are flat field, which is the
 * same colour as the box behind, and the boundary cannot be seen.
 *
 * They are frame numbers, so they follow the rate: recut the film and only
 * FILM_FPS needs to change.
 */
const SIDES_CLEAR_SECONDS = 39 / FILM_FPS;
const CAPS_CLEAR_SECONDS = 97 / FILM_FPS;

/**
 * The barber pole on the opening screen — a 3D product film rendered in
 * Blender, not a drawing and not an AI clip. Real geometry, so the object is
 * pixel-stable while the camera moves.
 *
 * One 9:16 master serves every screen. The pole is shot against a flat, unbroken
 * ivory field and the box behind the video is painted the identical ivory, so
 * once the field reaches the frame edges the letterboxing has no visible edge —
 * the frame simply reads as more of the same seamless surface.
 *
 * Until then it does not letterbox at all. The film opens covering the viewport
 * edge to edge, and eases back to its intended framing at the moment its own
 * backdrop arrives at the edges this screen would letterbox. That ease is the
 * only reason the geometry below exists: an earlier version letterboxed from the
 * first frame, and the opening macro — which fills the frame with dark chrome —
 * sat in the page as an obvious cut-out square.
 *
 * The clip is never stretched, and the last frame is held rather than looped,
 * because the wordmark and ENTER sit over a still object once the camera lands.
 */
export function IntroVideo({
  src,
  webm,
  poster,
  firstFrame,
  background,
  onFirstFrame,
  className,
}: {
  src: string;
  webm?: string;
  /** The settled closing frame. Stands in only if the video cannot decode. */
  poster: string;
  /**
   * The film's own frame 1. This is the `poster` the <video> shows before
   * playback starts, and it must be frame 1 rather than the closing frame:
   * posting the last frame first makes the opening read as a jump backwards
   * — the settled pole appears, then snaps to the macro as playback begins.
   */
  firstFrame: string;
  /** Must match the video's own ivory exactly, or the letterbox edge shows. */
  background: string;
  /** Fired once real pixels are on screen, so nothing flashes before then. */
  onFirstFrame?: () => void;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  /**
   * How the picture is framed right now.
   *
   * `cover` fills the viewport, so nothing is letterboxed and there is no box
   * in the page. It is plain `object-fit: cover`, which means it is also what
   * the markup paints before any JavaScript runs — the framing cannot flash a
   * box while the page is hydrating.
   *
   * `bridge` is the intended fit at the exact magnification cover was showing,
   * so switching to it changes nothing on screen; it exists only to give the
   * ease somewhere to start from, since `object-fit` itself cannot animate.
   *
   * `settled` is the intended framing, eased into over the following second.
   */
  const [phase, setPhase] = useState<"cover" | "bridge" | "settled">("cover");
  /** When the film may stop covering, for the framing this viewport lands on. */
  const openAtRef = useRef(CAPS_CLEAR_SECONDS);

  /**
   * Work out how far the film has to be blown up to cover this viewport, and
   * which edges it would otherwise letterbox — the later-clearing pair decides
   * when it is safe to ease back.
   */
  const measure = useCallback(() => {
    const host = hostRef.current;
    if (!host) return;

    const { width, height } = host.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const filmScale =
      Number.parseFloat(getComputedStyle(host).getPropertyValue("--film-scale")) || 1;
    const contain = Math.min(width / FILM_W, height / FILM_H);
    const cover = Math.max(width / FILM_W, height / FILM_H);

    // A pair of bars appears wherever the settled framing falls short of the
    // viewport. Half a pixel of slack keeps rounding from inventing one.
    const barsOnSides = contain * FILM_W * filmScale < width - 0.5;
    const barsOnCaps = contain * FILM_H * filmScale < height - 0.5;

    openAtRef.current = barsOnCaps
      ? CAPS_CLEAR_SECONDS
      : barsOnSides
        ? SIDES_CLEAR_SECONDS
        : 0;

    host.style.setProperty("--film-cover", String(cover / contain));
  }, []);

  // Before the first paint, so the film is never briefly letterboxed.
  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [measure]);



  useEffect(() => {
    if (phase !== "bridge") return;
    const raf = window.requestAnimationFrame(() => setPhase("settled"));
    return () => window.cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Freeze on the closing frame instead of snapping back to the macro.
    //
    // Pause and nothing else. An earlier version also seeked to
    // `duration - 0.04` to be sure of landing on the last frame; in the WebM
    // that seek resolved to 0 instead, so the film snapped back to the opening
    // macro the moment it ended and the wordmark rose over the wrong shot. A
    // video that has ended already holds its final frame, so there is nothing
    // to seek to — and the clip carries no `loop`, so there is nothing to
    // guard against either.
    const holdLastFrame = () => video.pause();
    video.addEventListener("ended", holdLastFrame);

    // The ease back to the intended framing is driven off the film's own clock,
    // not a timer, so it cannot drift out of step with the picture. If playback
    // never starts — a blocked autoplay, a phone in low-power mode — the clock
    // never advances, the film stays covering, and what the visitor sees is a
    // full-bleed still of frame 1 rather than a cut-out square.
    let raf = 0;
    const watch = () => {
      if (video.currentTime >= openAtRef.current) {
        setPhase("bridge");
        return;
      }
      raf = window.requestAnimationFrame(watch);
    };
    raf = window.requestAnimationFrame(watch);

    // Some browsers refuse the autoplay promise; the poster then carries it.
    void video.play().catch(() => undefined);

    return () => {
      window.cancelAnimationFrame(raf);
      video.removeEventListener("ended", holdLastFrame);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      data-frame={phase}
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ backgroundColor: background }}
    >
      {!failed && (
        <video
          ref={videoRef}
          className="intro-film-image absolute inset-0 h-full w-full"
          poster={asset(firstFrame)}
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
          It goes straight to the settled framing and never covers: it is the
          settled frame, so its own edges are already flat field.
          The old drawn pole is gone and is never used as a fallback. */}
      {failed && (
        <div
          className="intro-film-still absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${asset(poster)})` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default IntroVideo;
