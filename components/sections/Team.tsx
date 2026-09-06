"use client";

import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import { siteConfig } from "@/config/siteConfig";
import { useBookingPrefill } from "@/lib/bookingPrefill";
import { useI18n } from "@/lib/i18n";

/** "Sun–Thu 09:00–18:00" style summary, built from the barber's rota. */
function useRotaSummary() {
  const { t } = useI18n();

  return (barber: (typeof siteConfig.team)[number]) => {
    const working = barber.availability.filter((day) => day.ranges.length > 0);
    if (working.length === 0) return "";

    const days = working.map((day) => t.weekdays.short[day.weekday]).join(", ");
    const first = working[0].ranges[0];
    return `${days} · ${first.start}–${first.end}`;
  };
}

export function Team() {
  const { t, pick } = useI18n();
  const { requestBooking } = useBookingPrefill();
  const summarise = useRotaSummary();
  const trackRef = useRef<HTMLUListElement>(null);

  // On phones the grid becomes a snap carousel; these nudge it one card along.
  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("li");
    const amount = card ? card.clientWidth + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  };

  return (
    <Section
      id="team"
      eyebrow={t.team.eyebrow}
      title={t.team.title}
      lede={t.team.lede}
      className="bg-surface"
    >
      <div className="relative">
        <ul
          ref={trackRef}
          className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {siteConfig.team.map((barber, index) => (
            <Reveal
              as="li"
              key={barber.id}
              delay={index * 0.06}
              className="card-surface w-[78vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-card sm:w-[60vw] md:w-auto md:max-w-none"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={barber.image}
                  alt={pick(barber.name)}
                  fill
                  sizes="(max-width: 768px) 78vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-surface via-surface/25 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-xl text-offwhite">{pick(barber.name)}</h3>
                  <p className="mt-1 text-[0.68rem] uppercase tracking-[0.2em] text-gold">
                    {pick(barber.role)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col p-5">
                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                  {t.team.specialty}
                </p>
                <p className="mt-1.5 text-sm text-cream">{pick(barber.specialty)}</p>

                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {pick(barber.bio)}
                </p>

                <p className="mt-5 flex items-center gap-2 border-t border-hairline pt-4 text-[0.72rem] text-muted">
                  <Clock className="size-3.5 text-gold" aria-hidden="true" />
                  <span className="sr-only">{t.team.availability}: </span>
                  {summarise(barber)}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-5"
                  onClick={() => requestBooking({ barberId: barber.id })}
                >
                  {t.common.bookWithMe}
                </Button>
              </div>
            </Reveal>
          ))}
        </ul>

        {/* Carousel controls, phones only. */}
        <div className="mt-5 flex justify-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-hairline text-cream transition-colors hover:border-gold hover:text-gold"
            aria-label={t.team.previous}
          >
            <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-hairline text-cream transition-colors hover:border-gold hover:text-gold"
            aria-label={t.team.nextBarber}
          >
            <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Section>
  );
}

export default Team;
