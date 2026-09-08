"use client";

import { ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { siteConfig } from "@/config/siteConfig";
import { useI18n } from "@/lib/i18n";

/**
 * The courses announcement strip.
 *
 * It sits directly under the hero and is deliberately NOT a section: a visitor
 * who came to book a haircut should be able to take it in and keep scrolling
 * without it competing with the shop itself. It is one line and one link, and
 * the link is an in-page anchor down to the real section.
 *
 * The arrow flips with the writing direction, so in Hebrew it points the way
 * the eye is already travelling.
 */
export function CoursesStrip() {
  const { t, dir } = useI18n();
  const { courses } = siteConfig;

  if (!courses.enabled || !courses.strip.enabled) return null;

  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  // The <aside> is a real element rather than Reveal's `as` prop: Reveal only
  // forwards className, so an aria-label handed to it is silently dropped and
  // the strip would reach screen readers as an unlabelled region.
  return (
    <aside
      aria-label={t.courses.navLabel}
      className="relative border-y border-hairline bg-surface/60 px-5 py-4 sm:px-8 lg:px-12"
    >
      <Reveal className="mx-auto flex w-full max-w-6xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="flex items-start gap-3 text-[0.92rem] leading-relaxed text-cream sm:items-center">
          <GraduationCap
            className="mt-0.5 size-5 shrink-0 text-gold sm:mt-0"
            aria-hidden="true"
          />
          <span>
            <span className="me-2 rounded-full border border-gold/40 px-2 py-0.5 align-middle text-[0.6rem] uppercase tracking-[0.2em] text-gold">
              {t.courses.strip.badge}
            </span>
            {t.courses.strip.text}
          </span>
        </p>

        <a
          href="#courses"
          className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-gold/50 px-5 py-2 text-[0.8rem] uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {t.courses.strip.cta}
          <Arrow
            className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
        </a>
      </Reveal>
    </aside>
  );
}

export default CoursesStrip;
