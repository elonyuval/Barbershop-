"use client";

import * as Icons from "lucide-react";
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import SwipeRow from "@/components/ui/SwipeRow";
import Section from "@/components/ui/Section";
import { siteConfig } from "@/config/siteConfig";
import { useBookingPrefill } from "@/lib/bookingPrefill";
import { asset } from "@/lib/paths";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";

/** Resolves the icon named in siteConfig, falling back to a safe default. */
function ServiceIcon({ name }: { name: string }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Scissors;
  return <Icon className="size-5 text-gold" aria-hidden="true" />;
}

export function Services() {
  const { t, pick } = useI18n();
  const { requestBooking } = useBookingPrefill();

  return (
    <Section
      id="services"
      eyebrow={t.services.eyebrow}
      title={t.services.title}
      lede={t.services.lede}
      className="section-base"
    >
      <SwipeRow
        label={t.services.title}
        prevLabel={t.common.previousItems}
        nextLabel={t.common.nextItems}
        gridClassName="md:grid-cols-2 lg:grid-cols-3"
      >
        {siteConfig.services.map((service, index) => (
          <Reveal
            as="li"
            key={service.id}
            delay={index * 0.06}
            className="group card-surface relative flex w-[80vw] max-w-[330px] shrink-0 snap-start flex-col overflow-hidden rounded-card md:w-auto md:max-w-none"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={asset(service.image)}
                alt={pick(service.name)}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-surface via-surface/25 to-transparent"
              />
              {service.featured && (
                <span className="absolute top-4 end-4 rounded-full border border-gold/40 bg-ink/70 px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-gold">
                  {siteConfig.business.shortName}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="mb-3 flex items-center gap-3">
                <ServiceIcon name={service.icon} />
                <h3 className="text-xl leading-tight text-offwhite">
                  {pick(service.name)}
                </h3>
              </div>

              <p className="text-sm leading-relaxed text-muted">
                {pick(service.description)}
              </p>

              <dl className="mt-6 flex items-baseline justify-between border-t border-hairline pt-5">
                <div>
                  <dt className="sr-only">{t.services.duration}</dt>
                  <dd className="text-[0.72rem] uppercase tracking-[0.2em] text-muted">
                    {service.durationMinutes} {t.common.minutes}
                  </dd>
                </div>
                <div className="text-end">
                  <dt className="sr-only">{t.booking.summaryPrice}</dt>
                  <dd className="font-display text-2xl text-gold">
                    {formatPrice(service.price, siteConfig.business.currencySymbol)}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => requestBooking({ serviceId: service.id })}
                className="mt-4 inline-flex min-h-11 items-center gap-2 self-start py-2 text-[0.7rem] uppercase tracking-[0.22em] text-cream transition-colors hover:text-gold"
              >
                {t.services.book}
                <Icons.ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
              </button>
            </div>
          </Reveal>
        ))}
      </SwipeRow>
    </Section>
  );
}

export default Services;
