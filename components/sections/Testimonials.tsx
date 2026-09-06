"use client";

import { Quote, Star } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SwipeRow from "@/components/ui/SwipeRow";
import Section from "@/components/ui/Section";
import { siteConfig } from "@/config/siteConfig";
import { useI18n } from "@/lib/i18n";
import { fill } from "@/lib/utils";

export function Testimonials() {
  const { t, pick, language } = useI18n();

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return `${t.months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <Section
      id="reviews"
      eyebrow={t.testimonials.eyebrow}
      title={t.testimonials.title}
      lede={t.testimonials.lede}
      className="bg-ink"
    >
      <SwipeRow
        label={t.testimonials.title}
        prevLabel={t.common.previousItems}
        nextLabel={t.common.nextItems}
        gridClassName="md:grid-cols-2 lg:grid-cols-3"
      >
        {siteConfig.testimonials.map((testimonial, index) => (
          <Reveal
            as="li"
            key={testimonial.id}
            delay={index * 0.05}
            className="card-surface flex w-[80vw] max-w-[330px] shrink-0 snap-start flex-col rounded-card p-7 md:w-auto md:max-w-none"
          >
            <Quote
              className="size-6 text-gold/50 rtl:-scale-x-100"
              aria-hidden="true"
            />

            <blockquote className="mt-4 flex-1 text-[0.98rem] leading-relaxed text-cream/90">
              {pick(testimonial.quote)}
            </blockquote>

            <div className="mt-6 flex items-center justify-between border-t border-hairline pt-5">
              <div>
                <p className="text-sm text-offwhite">{testimonial.author}</p>
                <p className="mt-0.5 text-[0.68rem] uppercase tracking-[0.16em] text-muted">
                  {formatDate(testimonial.date)}
                </p>
              </div>

              <p
                className="flex items-center gap-0.5"
                aria-label={fill(t.testimonials.ratingLabel, {
                  rating: testimonial.rating,
                })}
              >
                {Array.from({ length: 5 }, (_, starIndex) => (
                  <Star
                    key={starIndex}
                    className={
                      starIndex < testimonial.rating
                        ? "size-3.5 fill-gold text-gold"
                        : "size-3.5 text-muted/40"
                    }
                    aria-hidden="true"
                  />
                ))}
              </p>
            </div>
          </Reveal>
        ))}
      </SwipeRow>

      {/*
        Kept visible on purpose: these reviews are written for the template.
        Delete this section, or replace the reviews in siteConfig, before the
        site goes live for a real shop.
      */}
      <p
        className="mt-8 flex flex-wrap items-center gap-2 text-[0.72rem] text-muted"
        lang={language}
      >
        <span className="rounded-full border border-gold/30 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-gold">
          {t.common.demoContent}
        </span>
        {t.testimonials.disclaimer}
      </p>
    </Section>
  );
}

export default Testimonials;
