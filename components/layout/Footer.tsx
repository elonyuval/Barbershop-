"use client";

import { Facebook, Instagram, MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import { useI18n } from "@/lib/i18n";
import Logo from "./Logo";

export function Footer() {
  const { t, pick } = useI18n();
  const year = new Date().getFullYear();

  const links = [
    { href: "#services", label: t.nav.services },
    { href: "#team", label: t.nav.team },
    { href: "#gallery", label: t.nav.gallery },
    { href: "#reviews", label: t.nav.reviews },
    { href: "#booking", label: t.nav.book },
    { href: "/admin", label: t.nav.admin },
  ];

  return (
    <footer className="border-t border-hairline bg-ink px-5 pt-16 pb-10 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              {pick(siteConfig.business.description)}
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href={siteConfig.business.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-11 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:border-gold hover:text-gold"
                aria-label="Instagram"
              >
                <Instagram className="size-4" aria-hidden="true" />
              </a>
              <a
                href={siteConfig.business.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-11 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:border-gold hover:text-gold"
                aria-label="Facebook"
              >
                <Facebook className="size-4" aria-hidden="true" />
              </a>
              <a
                href={`https://wa.me/${siteConfig.business.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-11 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:border-gold hover:text-gold"
                aria-label={t.common.whatsapp}
              >
                <MessageCircle className="size-4" aria-hidden="true" />
              </a>
              <a
                href={`tel:${siteConfig.business.phone.replace(/[^+\d]/g, "")}`}
                className="inline-flex size-11 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:border-gold hover:text-gold"
                aria-label={t.common.call}
              >
                <Phone className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <nav aria-label={t.footer.explore}>
            <h2 className="text-[0.7rem] uppercase tracking-[0.24em] text-gold">
              {t.footer.explore}
            </h2>
            <ul className="mt-5 space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-block py-1.5 text-sm text-muted transition-colors hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[0.7rem] uppercase tracking-[0.24em] text-gold">
              {t.footer.hours}
            </h2>
            <ul className="mt-5 space-y-2 text-sm text-muted">
              {siteConfig.hours.map((day) => (
                <li key={day.weekday} className="flex justify-between gap-3">
                  <span>{t.weekdays.short[day.weekday]}</span>
                  <span className="tabular-nums">
                    {day.ranges.length === 0
                      ? t.location.closed
                      : `${day.ranges[0].start}–${day.ranges[0].end}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-hairline pt-7 text-[0.74rem] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.business.name}. {t.footer.rights}
          </p>
          <ul className="flex flex-wrap gap-5">
            <li>
              <a href="#visit" className="inline-block py-1.5 transition-colors hover:text-gold">
                {t.footer.privacy}
              </a>
            </li>
            <li>
              <a href="#visit" className="inline-block py-1.5 transition-colors hover:text-gold">
                {t.footer.accessibility}
              </a>
            </li>
            <li>
              <a href="#visit" className="inline-block py-1.5 transition-colors hover:text-gold">
                {t.footer.terms}
              </a>
            </li>
          </ul>
        </div>

        <p className="mt-5 text-[0.7rem] text-muted/70">{t.footer.builtNotice}</p>
      </div>
    </footer>
  );
}

export default Footer;
