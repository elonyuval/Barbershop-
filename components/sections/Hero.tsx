"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";
import BackgroundMedia from "@/components/ui/BackgroundMedia";
import { LinkButton } from "@/components/ui/Button";
import { siteConfig } from "@/config/siteConfig";
import { useI18n } from "@/lib/i18n";

export function Hero() {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();

  const whatsappHref = `https://wa.me/${siteConfig.business.whatsapp}`;
  const ease = [0.16, 0.84, 0.24, 1] as const;

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 26 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease },
        };

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      <BackgroundMedia
        asset={siteConfig.media.heroVideo}
        alt={t.hero.videoFallback}
        priority
      />

      {/* Graded scrim: dark at the foot and along the text edge, so the
          headline holds up over any frame of the video. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(12,10,9,0.94)_0%,rgba(12,10,9,0.6)_38%,rgba(12,10,9,0.22)_70%,rgba(12,10,9,0.5)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(115%_78%_at_18%_58%,rgba(12,10,9,0.62),transparent_72%)]"
      />
      <div className="grain absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-7xl px-5 pt-28 pb-24 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <motion.p className="eyebrow" {...rise(0.05)}>
            {t.hero.eyebrow}
          </motion.p>

          <motion.h1
            className="mt-6 text-[clamp(2.4rem,7.2vw,4.6rem)] leading-[1.04] text-offwhite"
            {...rise(0.15)}
          >
            {t.hero.titleLine1}
            <br />
            <span className="text-gold italic">{t.hero.titleLine2}</span>
          </motion.h1>

          <motion.p
            className="mt-7 max-w-xl text-[1rem] leading-relaxed text-cream/80"
            {...rise(0.28)}
          >
            {t.hero.lede}
          </motion.p>

          <motion.div className="mt-10 flex flex-wrap items-center gap-3" {...rise(0.4)}>
            <LinkButton href="#booking" size="lg">
              {t.common.bookNow}
            </LinkButton>
            <LinkButton href="#services" variant="outline" size="lg">
              {t.common.viewServices}
            </LinkButton>
            <LinkButton href={whatsappHref} variant="whatsapp" size="lg" external>
              <MessageCircle className="size-4" aria-hidden="true" />
              {t.common.whatsapp}
            </LinkButton>
          </motion.div>
        </div>
      </div>

      <a
        href="#services"
        className="absolute inset-x-0 bottom-6 mx-auto flex w-fit flex-col items-center gap-2 py-2 text-[0.62rem] uppercase tracking-[0.3em] text-muted transition-colors hover:text-gold"
      >
        {t.hero.scroll}
        <ChevronDown
          className={reduceMotion ? "size-4" : "size-4 animate-bounce"}
          aria-hidden="true"
        />
      </a>
    </section>
  );
}

export default Hero;
