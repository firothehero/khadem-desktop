import type { AppLocale } from "./types";
import { KHADEM_DEFAULT_LOCALE, khademActive } from "./khadem/active"; // KHADEM-PATCH

export const SOURCE_LOCALE: AppLocale = "en";
export const FALLBACK_LOCALE: AppLocale = "en";
export const DEFAULT_ACTIVE_LOCALE: AppLocale = khademActive()
  ? KHADEM_DEFAULT_LOCALE
  : "en"; // KHADEM-PATCH
export const APP_LOCALES: AppLocale[] = [
  "en",
  "ar",
  "es",
  "fa",
  "he",
  "id",
  "ja",
  "pl",
  "pt-BR",
  "pt-PT",
  "tr",
  "zh-CN",
  "zh-TW",
];

// Locales that render right-to-left. Used to set the document's `dir`
// attribute so the whole UI mirrors for these languages.
export const RTL_LOCALES: AppLocale[] = ["ar", "fa", "he"];

export type TextDirection = "ltr" | "rtl";

export function getLocaleDirection(locale: AppLocale): TextDirection {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}
