// Khadem branding for main-process surfaces (desktop notifications). The app identity constant
// (APP_NAME / productName) is left to upstream so user-data paths and updater feeds do not move.
import type { AppLocale } from "../../shared/i18n/types";
import { khademActive } from "../../shared/i18n/khadem/active";

/** Upstream's built-in product name; anything else came from HERMES_DESKTOP_APP_NAME and wins. */
export const UPSTREAM_APP_NAME = "Hermes One";

export function khademAppName(
  locale: AppLocale,
  upstreamName = UPSTREAM_APP_NAME,
): string {
  if (upstreamName !== UPSTREAM_APP_NAME || !khademActive())
    return upstreamName;
  return locale === "ar" ? "خادم" : "Khadem";
}

export function khademResponseReady(locale: AppLocale): string {
  return locale === "ar" && khademActive() ? "الرد جاهز" : "Response ready";
}

export function khademErrorTitle(
  locale: AppLocale,
  upstreamName = UPSTREAM_APP_NAME,
): string {
  const name = khademAppName(locale, upstreamName);
  return locale === "ar" && khademActive()
    ? `${name} — خطأ`
    : `${name} — Error`;
}
