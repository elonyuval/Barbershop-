"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { siteConfig } from "@/config/siteConfig";
import { useI18n } from "@/lib/i18n";
import BarberPole from "./BarberPole";

/**
 * The opening screen.
 *
 * Order of events, tuned so ENTER lands inside the 2.5–4s window:
 *   0.15s  the pole fades up with a small scale-in
 *   1.50s  MODA opens outward from the centre, behind the pole
 *   2.30s  the gold hairline draws
 *   2.55s  the gold subtitle fades in
 *   2.90s  ENTER appears
 *
 * Repeat visits within a session skip straight past it — an inline script in
 * app/layout.tsx stamps <html data-intro="seen"> before first paint, so there
 * is never a flash of the intro for someone who has already been through it.
 */

type Props = {
  onEnter: () => void;
};

const REVEAL = siteConfig.intro.revealDurationMs / 1000;

export function IntroScreen({ onEnter }: Props) {
  const { t, pick } = useI18n();
  const reduceMotion = useReducedMotion();

  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  const leave = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    // Matches the exit transition below, then hands the page over.
    window.setTimeout(
      () => {
        setVisible(false);
        onEnter();
      },
      reduceMotion ? 60 : 900,
    );
  }, [leaving, onEnter, reduceMotion]);

  // Enter key works anywhere on the screen.
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
    document.body.dataset.locked = "true";
    return () => {
      delete document.body.dataset.locked;
    };
  }, []);

  const ease = [0.16, 0.84, 0.24, 1] as const;
  const at = (seconds: number) => (reduceMotion ? 0 : seconds);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="intro-root fixed inset-0 z-[100] overflow-hidden bg-intro"
          role="dialog"
          aria-modal="true"
          aria-label={t.intro.label}
          initial={{ opacity: 1, filter: "brightness(1)" }}
          animate={
            leaving
              ? { opacity: 0, filter: "brightness(0.35)" }
              : { opacity: 1, filter: "brightness(1)" }
          }
          transition={{ duration: reduceMotion ? 0.05 : 0.85, ease }}
        >
          {/* Warm light falling from above, so the room is not a flat fill. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(115% 85% at 50% 32%, #f2eee6 0%, var(--color-intro) 52%, #cec7bb 100%)",
            }}
          />

          <motion.div
            className="relative grid h-full w-full place-items-center"
            animate={leaving ? { scale: reduceMotion ? 1 : 1.14 } : { scale: 1 }}
            transition={{ duration: reduceMotion ? 0.05 : 0.9, ease }}
          >
            {/* --- wordmark, sitting behind the pole --- */}
            <motion.h1
              className="pointer-events-none absolute top-1/2 left-1/2 m-0 -translate-x-1/2 -translate-y-1/2 font-display leading-none whitespace-nowrap"
              style={{
                fontSize: "var(--brand-size)",
                marginTop: "-4vh",
                color: "#fbfaf7",
                letterSpacing: "0.14em",
                textIndent: "0.14em",
                textShadow:
                  "0 1px 0 #ddd8ce, 0 2px 0 #d6d0c5, 0 3px 0 #cec8bc, 0 4px 0 #c6bfb2, 0 5px 1px rgba(60,52,40,0.2), 0 10px 22px rgba(60,52,40,0.22), 0 26px 46px rgba(60,52,40,0.14)",
              }}
              initial={{ clipPath: "inset(0 50% 0 50%)", opacity: 0 }}
              animate={
                leaving
                  ? { opacity: 0, clipPath: "inset(0 0% 0 0%)" }
                  : { clipPath: "inset(0 -4% 0 -4%)", opacity: 1 }
              }
              transition={
                leaving
                  ? { duration: 0.4, ease }
                  : { duration: at(1.1), delay: at(1.5), ease }
              }
            >
              {siteConfig.intro.wordmark}
            </motion.h1>

            {/* --- the pole --- */}
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.16 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: at(1.7), delay: at(0.15), ease }}
            >
              <motion.div
                // A very slow, almost-frontal turn, so the object feels solid.
                animate={
                  reduceMotion ? undefined : { rotateY: [-2.2, 2.2, -2.2] }
                }
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <BarberPole />
              </motion.div>
            </motion.div>

            {/* --- caption: rule, subtitle, ENTER --- */}
            <div className="absolute top-1/2 left-1/2 z-20 w-[min(520px,86vw)] -translate-x-1/2 text-center"
                 style={{ marginTop: "calc(var(--pole-h) * 0.36)" }}>
              <motion.div
                className="gold-rule mx-auto w-[min(220px,50vw)] origin-center"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={leaving ? { opacity: 0 } : { scaleX: 1, opacity: 1 }}
                transition={
                  leaving
                    ? { duration: 0.3 }
                    : { duration: at(0.8), delay: at(2.3), ease }
                }
              />

              <motion.p
                className="mt-4 mb-0 text-[clamp(0.68rem,1.9vw,0.85rem)] uppercase"
                style={{
                  color: "var(--color-gold)",
                  letterSpacing: "0.32em",
                  textIndent: "0.32em",
                  textShadow: "0 1px 2px rgba(255,255,255,0.5)",
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={leaving ? { opacity: 0 } : { opacity: 1, y: 0 }}
                transition={
                  leaving
                    ? { duration: 0.3 }
                    : { duration: at(0.7), delay: at(2.55), ease }
                }
              >
                {pick(siteConfig.intro.subtitle)}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={leaving ? { opacity: 0 } : { opacity: 1, y: 0 }}
                transition={
                  leaving
                    ? { duration: 0.3 }
                    : { duration: at(0.7), delay: at(REVEAL - 0.3), ease }
                }
              >
                <button
                  type="button"
                  onClick={leave}
                  className="group mt-7 inline-flex items-center rounded-full border px-10 py-3.5 text-[clamp(0.66rem,1.7vw,0.78rem)] uppercase transition-colors duration-300 hover:bg-[#1b1917] hover:text-[#f5f2ec] focus-visible:bg-[#1b1917] focus-visible:text-[#f5f2ec]"
                  style={{
                    borderColor: "rgba(28,25,23,0.45)",
                    color: "#1b1917",
                    letterSpacing: "0.34em",
                    textIndent: "0.34em",
                    backgroundColor: "rgba(255,255,255,0.28)",
                  }}
                >
                  {t.intro.enter}
                </button>
              </motion.div>
            </div>
          </motion.div>

          {/* --- skip, deliberately quiet --- */}
          {siteConfig.intro.showSkipButton && (
            <button
              type="button"
              onClick={leave}
              className="absolute top-5 end-5 z-30 rounded-full px-4 py-2 text-[0.68rem] uppercase transition-opacity duration-300 hover:opacity-100"
              style={{
                color: "#57534e",
                letterSpacing: "0.22em",
                opacity: 0.55,
              }}
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
