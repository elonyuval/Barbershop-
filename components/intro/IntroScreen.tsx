"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { siteConfig } from "@/config/siteConfig";
import { useI18n } from "@/lib/i18n";
import { lockScroll, releaseScroll } from "@/lib/scrollLock";
import IntroVideo from "./IntroVideo";
import "./intro.css";

/**
 * The opening screen.
 *
 * The barber pole is a 3D product film rendered in Blender — see IntroVideo.
 * Everything written on top of it (MODA, the rule, the subtitle, ENTER) is a
 * real HTML layer, so the type stays sharp, selectable and translatable rather
 * than being baked into the video.
 *
 * Timing is keyed to the film's camera move, not to the clock. The shot opens
 * in macro on the striped glass and pulls back to a locked-off, symmetrical
 * front view; the stripes turn slowly throughout. Nothing is written over the
 * frame until the camera has landed and the whole pole is centred, or the type
 * would sit over a moving, off-centre object.
 *
 * Once it lands, the field dims and then the wordmark rises out of it — the
 * dimming is a scrim here rather than baked into the render, so its depth and
 * timing stay adjustable without a 25-minute re-render.
 *
 * ENTER stays live until it is pressed; the film holds on its closing frame.
 */

/**
 * When the camera comes to rest dead front: frame 112 of 120 at 36fps.
 * Measured from the render, not guessed — if the film is ever recut, change
 * this one number and every cue below follows it.
 */
const INTRO_SETTLE_SECONDS = 112 / 36;


type Props = { onEnter: () => void };

export function IntroScreen({ onEnter }: Props) {
  const { t, pick } = useI18n();
  const reduceMotion = useReducedMotion();

  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  const leave = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(
      () => {
        setVisible(false);
        onEnter();
      },
      reduceMotion ? 60 : 900,
    );
  }, [leaving, onEnter, reduceMotion]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === "Escape") {
        event.preventDefault();
        leave();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [leave]);

  // Nothing behind the intro may scroll while it is open.
  useEffect(() => {
    lockScroll();
    return releaseScroll;
  }, []);

  const ease = [0.16, 0.84, 0.24, 1] as const;
  const at = (seconds: number) => (reduceMotion ? 0 : seconds);
  const { video } = siteConfig.intro;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="intro-root fixed inset-0 z-[100] overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t.intro.label}
          style={{ backgroundColor: video.background }}
          initial={{ opacity: 1 }}
          animate={leaving ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: reduceMotion ? 0.05 : 0.85, ease }}
        >
          {/* --- the film --- */}
          <motion.div
            className="absolute inset-0"
            animate={leaving ? { scale: reduceMotion ? 1 : 1.06 } : { scale: 1 }}
            transition={{ duration: reduceMotion ? 0.05 : 0.9, ease }}
          >
            <IntroVideo
              className="intro-film"
              src={video.src}
              webm={video.webm}
              poster={video.poster}
              firstFrame={video.firstFrame}
              background={video.background}
            />
          </motion.div>

          {/* --- the field dims once the camera lands, so the wordmark has
                   something to rise out of --- */}
          <motion.div
            className="intro-scrim pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={leaving ? { opacity: 1 } : { opacity: 1 }}
            transition={{ duration: at(1.0), delay: at(INTRO_SETTLE_SECONDS), ease }}
            aria-hidden="true"
          />

          {/* --- type, layered over the film --- */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <motion.h1
              className="intro-wordmark absolute top-1/2 left-1/2 m-0 -translate-x-1/2 -translate-y-1/2 font-display leading-none whitespace-nowrap"
              style={{
                fontSize: "var(--brand-size)",
                marginTop: "var(--brand-shift)",
                color: "#fbfaf7",
                letterSpacing: "0.14em",
                textIndent: "0.14em",
                textShadow:
                  "0 1px 1px rgba(18,15,12,0.34), 0 6px 18px rgba(18,15,12,0.40)",
              }}
              initial={{ clipPath: "inset(0 50% 0 50%)", opacity: 0, y: 26 }}
              animate={
                leaving
                  ? { opacity: 0, clipPath: "inset(0 0% 0 0%)" }
                  : { clipPath: "inset(0 -4% 0 -4%)", opacity: 1, y: 0 }
              }
              transition={
                leaving
                  ? { duration: 0.4, ease }
                  : { duration: at(1.2), delay: at(INTRO_SETTLE_SECONDS + 0.55), ease }
              }
            >
              {siteConfig.intro.wordmark}
            </motion.h1>

            <div
              className="absolute top-1/2 left-1/2 w-[min(520px,86vw)] -translate-x-1/2 text-center"
              style={{ marginTop: "var(--caption-shift)" }}
            >
              <motion.div
                className="gold-rule mx-auto w-[min(220px,50vw)] origin-center"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={leaving ? { opacity: 0 } : { scaleX: 1, opacity: 1 }}
                transition={
                  leaving ? { duration: 0.3 } : { duration: at(0.8), delay: at(INTRO_SETTLE_SECONDS + 1.15), ease }
                }
              />

              <motion.p
                className="mt-4 mb-0 text-[clamp(0.68rem,1.9vw,0.85rem)] uppercase"
                style={{
                  color: "var(--color-goldsoft)",
                  letterSpacing: "0.32em",
                  textIndent: "0.32em",
                  textShadow: "0 1px 3px rgba(18,15,12,0.75), 0 0 18px rgba(18,15,12,0.55)",
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={leaving ? { opacity: 0 } : { opacity: 1, y: 0 }}
                transition={
                  leaving ? { duration: 0.3 } : { duration: at(0.7), delay: at(INTRO_SETTLE_SECONDS + 1.40), ease }
                }
              >
                {pick(siteConfig.intro.subtitle)}
              </motion.p>

              <motion.div
                className="pointer-events-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={leaving ? { opacity: 0 } : { opacity: 1, y: 0 }}
                transition={
                  leaving ? { duration: 0.3 } : { duration: at(0.7), delay: at(INTRO_SETTLE_SECONDS + 1.65), ease }
                }
              >
                <button
                  type="button"
                  onClick={leave}
                  className="mt-7 inline-flex items-center rounded-full border px-10 py-3.5 text-[clamp(0.66rem,1.7vw,0.78rem)] uppercase backdrop-blur-[2px] transition-colors duration-300 hover:bg-[#f5f2ec] hover:text-[#1b1917] focus-visible:bg-[#f5f2ec] focus-visible:text-[#1b1917]"
                  style={{
                    borderColor: "rgba(248,245,238,0.55)",
                    color: "#f7f4ee",
                    letterSpacing: "0.34em",
                    textIndent: "0.34em",
                    backgroundColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  {t.intro.enter}
                </button>
              </motion.div>
            </div>
          </div>

          {siteConfig.intro.showSkipButton && (
            <button
              type="button"
              onClick={leave}
              className="absolute top-5 end-5 z-30 rounded-full px-4 py-2 text-[0.68rem] uppercase transition-opacity duration-300 hover:opacity-100"
              style={{ color: "#f2efe8", letterSpacing: "0.22em", opacity: 0.6 }}
            >
              {t.intro.skip}
            </button>
          )}

          <p className="sr-only">{t.intro.enterHint}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default IntroScreen;
