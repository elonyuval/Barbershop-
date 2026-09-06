import type { Language } from "@/config/types";
import type { Dictionary } from "./dictionary";
import { en } from "./en";
import { he } from "./he";

export const dictionaries: Record<Language, Dictionary> = { en, he };

export const languageDirection: Record<Language, "ltr" | "rtl"> = {
  en: "ltr",
  he: "rtl",
};

export type { Dictionary };
