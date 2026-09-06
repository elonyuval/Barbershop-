"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Language, Localized } from "@/config/types";
import { siteConfig } from "@/config/siteConfig";
import { dictionaries, languageDirection, type Dictionary } from "@/content";

const STORAGE_KEY = "moda:lang";

type I18nValue = {
  language: Language;
  dir: "ltr" | "rtl";
  t: Dictionary;
  /** Picks the right side of a { en, he } pair from siteConfig. */
  pick: (value: Localized) => string;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(
    siteConfig.defaults.language,
  );

  // Restore the visitor's choice after hydration, so the server and the first
  // client render always agree.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "he") {
        setLanguageState(stored);
      }
    } catch {
      // Storage can be blocked; the default language is a fine fallback.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = languageDirection[language];
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore — the switch still works for this page view.
    }
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      language,
      dir: languageDirection[language],
      t: dictionaries[language],
      pick: (localized: Localized) => localized[language],
      setLanguage,
      toggleLanguage: () => setLanguage(language === "en" ? "he" : "en"),
    }),
    [language, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside <I18nProvider>");
  }
  return context;
}
