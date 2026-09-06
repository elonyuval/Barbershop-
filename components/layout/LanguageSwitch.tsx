"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitch({ className }: { className?: string }) {
  const { t, toggleLanguage } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline px-3.5 py-2.5",
        "text-[0.68rem] uppercase tracking-[0.2em] text-muted transition-colors",
        "hover:border-gold hover:text-gold",
        className,
      )}
      // The label names the language being switched TO, which is what a
      // bilingual visitor scans for.
      aria-label={`Switch language to ${t.common.switchTo}`}
    >
      <Languages className="size-3.5" aria-hidden="true" />
      {t.common.switchTo}
    </button>
  );
}

export default LanguageSwitch;
