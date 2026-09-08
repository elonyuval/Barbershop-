"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LinkButton } from "@/components/ui/Button";
import { siteConfig } from "@/config/siteConfig";
import { useI18n } from "@/lib/i18n";
import { lockScroll, releaseScroll } from "@/lib/scrollLock";
import { cn } from "@/lib/utils";
import LanguageSwitch from "./LanguageSwitch";
import Logo from "./Logo";

/**
 * Transparent over the hero, and it picks up a dark backing once the page
 * scrolls so the links stay readable against the photography.
 */
export function Header() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile sheet when the viewport grows past the breakpoint.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const onChange = () => query.matches && setMenuOpen(false);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    lockScroll();
    return releaseScroll;
  }, [menuOpen]);

  // Courses drop out of the nav entirely when the section is switched off in
  // siteConfig, so a shop that does not teach never shows a dead anchor.
  const links = [
    { href: "#services", label: t.nav.services },
    { href: "#team", label: t.nav.team },
    { href: "#gallery", label: t.nav.gallery },
    ...(siteConfig.courses.enabled
      ? [{ href: "#courses", label: t.courses.navLabel }]
      : []),
    { href: "#experience", label: t.nav.experience },
    { href: "#reviews", label: t.nav.reviews },
    { href: "#visit", label: t.nav.visit },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-hairline bg-ink/85 backdrop-blur-lg"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center gap-6 px-5 py-4 sm:px-8 lg:px-12">
        <Logo />

        <nav
          className="ms-auto hidden items-center gap-7 lg:flex"
          aria-label={t.nav.home}
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.72rem] uppercase tracking-[0.18em] text-muted transition-colors hover:text-gold"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-3 lg:ms-0">
          <div className="hidden items-center gap-3 sm:flex">
            <LanguageSwitch />
            <LinkButton href="#booking" size="sm" className="whitespace-nowrap">
              {t.common.bookNow}
            </LinkButton>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-hairline text-cream lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-50 bg-ink/97 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex h-18 items-center justify-between px-5 py-4 sm:px-8">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex size-11 items-center justify-center rounded-full border border-hairline text-cream"
                aria-label={t.nav.closeMenu}
              >
                <X className="size-5" />
              </button>
            </div>

            <nav
              className="flex flex-col gap-1 px-5 pt-6 sm:px-8"
              aria-label={t.nav.openMenu}
            >
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-hairline py-4 font-display text-2xl text-cream transition-colors hover:text-gold"
                >
                  {link.label}
                </a>
              ))}

              <div className="mt-8 flex flex-col gap-3">
                <LinkButton
                  href="#booking"
                  size="lg"
                  onClick={() => setMenuOpen(false)}
                >
                  {t.common.bookNow}
                </LinkButton>
                <LanguageSwitch className="self-start" />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
