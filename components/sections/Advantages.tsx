"use client";

import * as Icons from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SwipeRow from "@/components/ui/SwipeRow";
import Section from "@/components/ui/Section";
import { siteConfig } from "@/config/siteConfig";
import { useI18n } from "@/lib/i18n";

export function Advantages() {
  const { t, pick } = useI18n();

  return (
    <Section
      id="why"
      eyebrow={t.advantages.eyebrow}
      title={t.advantages.title}
      lede={t.advantages.lede}
      className="bg-surface"
    >
      <SwipeRow
        label={t.advantages.title}
        prevLabel={t.common.previousItems}
        nextLabel={t.common.nextItems}
        gridClassName="md:grid-cols-2 lg:grid-cols-3"
      >
        {siteConfig.advantages.map((advantage, index) => {
          const Icon =
            (Icons as unknown as Record<string, Icons.LucideIcon>)[advantage.icon] ??
            Icons.Check;

          return (
            <Reveal
              as="li"
              key={advantage.id}
              delay={index * 0.05}
              className="card-surface w-[80vw] max-w-[330px] shrink-0 snap-start rounded-card p-7 transition-colors duration-500 hover:bg-raised md:w-auto md:max-w-none"
            >
              <Icon className="size-6 text-gold" aria-hidden="true" />
              <h3 className="mt-5 text-lg text-offwhite">{pick(advantage.title)}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">
                {pick(advantage.description)}
              </p>
            </Reveal>
          );
        })}
      </SwipeRow>
    </Section>
  );
}

export default Advantages;
