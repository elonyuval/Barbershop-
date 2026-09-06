"use client";

import BackgroundMedia from "@/components/ui/BackgroundMedia";
import { LinkButton } from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { siteConfig } from "@/config/siteConfig";
import { useI18n } from "@/lib/i18n";

/**
 * A full-bleed cinematic break between the dense sections. The clip is lazily
 * attached, so it costs nothing until the visitor scrolls near it.
 */
export function Experience() {
  const { t } = useI18n();

  return (
    <section id="experience" className="relative min-h-[80svh] overflow-hidden">
      <BackgroundMedia
        asset={siteConfig.media.experienceVideo}
        alt={t.experience.lede}
        lazy
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(12,10,9,0.93)_0%,rgba(12,10,9,0.72)_45%,rgba(12,10,9,0.35)_100%)]"
      />
      <div className="grain absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-[80svh] w-full max-w-6xl items-center px-5 py-24 sm:px-8 lg:px-12">
        <Reveal className="max-w-xl">
          <p className="eyebrow">{t.experience.eyebrow}</p>
          <h2 className="mt-5 text-[clamp(1.9rem,5vw,3.1rem)] leading-[1.1] text-offwhite">
            {t.experience.title}
          </h2>
          <p className="mt-5 text-[0.98rem] leading-relaxed text-cream/80">
            {t.experience.lede}
          </p>
          <LinkButton href="#booking" size="lg" className="mt-9">
            {t.common.bookNow}
          </LinkButton>
        </Reveal>
      </div>
    </section>
  );
}

export default Experience;
