"use client";

import { Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import { siteConfig } from "@/config/siteConfig";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Location() {
  const { t, pick } = useI18n();
  const today = new Date().getDay();

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    siteConfig.business.mapQuery,
  )}`;

  return (
    <Section
      id="visit"
      eyebrow={t.location.eyebrow}
      title={t.location.title}
      className="bg-surface"
    >
      <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        {/* --- hours --- */}
        <Reveal>
          <h3 className="text-[0.72rem] uppercase tracking-[0.24em] text-gold">
            {t.location.hours}
          </h3>

          <ul className="mt-6">
            {siteConfig.hours.map((day) => {
              const isToday = day.weekday === today;
              const closed = day.ranges.length === 0;

              return (
                <li
                  key={day.weekday}
                  className={cn(
                    "flex items-baseline justify-between gap-4 border-b border-hairline py-3.5 text-[0.95rem]",
                    isToday && "text-offwhite",
                    !isToday && "text-muted",
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    {t.weekdays.long[day.weekday]}
                    {isToday && (
                      <span className="rounded-full border border-gold/40 px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.18em] text-gold">
                        {t.location.today}
                      </span>
                    )}
                  </span>

                  <span className={closed ? "text-muted/70" : "tabular-nums"}>
                    {closed
                      ? t.location.closed
                      : day.ranges
                          .map((range) => `${range.start}–${range.end}`)
                          .join(", ")}
                  </span>
                </li>
              );
            })}
          </ul>

          <h3 className="mt-10 text-[0.72rem] uppercase tracking-[0.24em] text-gold">
            {t.location.contact}
          </h3>

          <address className="mt-5 space-y-3 not-italic text-muted">
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              {pick(siteConfig.business.address)}
            </p>
            <p className="flex items-center gap-3">
              <Phone className="size-4 shrink-0 text-gold" aria-hidden="true" />
              <a
                href={`tel:${siteConfig.business.phone.replace(/[^+\d]/g, "")}`}
                className="transition-colors hover:text-gold"
              >
                {siteConfig.business.phone}
              </a>
            </p>
            <p className="flex items-center gap-3">
              <Instagram className="size-4 shrink-0 text-gold" aria-hidden="true" />
              <a
                href={siteConfig.business.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-gold"
              >
                @{siteConfig.business.shortName.toLowerCase()}barberclub
              </a>
            </p>
          </address>

          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href={mapsHref} external size="md">
              {t.common.navigate}
            </LinkButton>
            <LinkButton
              href={`tel:${siteConfig.business.phone.replace(/[^+\d]/g, "")}`}
              variant="outline"
              size="md"
            >
              <Phone className="size-4" aria-hidden="true" />
              {t.common.call}
            </LinkButton>
            <LinkButton
              href={`https://wa.me/${siteConfig.business.whatsapp}`}
              variant="whatsapp"
              size="md"
              external
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {t.common.whatsapp}
            </LinkButton>
          </div>
        </Reveal>

        {/* --- map --- */}
        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-card border border-hairline">
            <iframe
              src={siteConfig.business.mapEmbedUrl}
              title={pick(siteConfig.business.address)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[340px] w-full grayscale-[0.4] contrast-110 lg:h-[520px]"
            />
          </div>
          <p className="mt-3 text-[0.72rem] text-muted">{t.location.mapNotice}</p>
        </Reveal>
      </div>
    </Section>
  );
}

export default Location;
