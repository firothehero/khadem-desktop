// Khadem (خادم) renderer layer — imported once from src/renderer/src/main.tsx (KHADEM.md ledger).
import "./khadem.css";
import { FONT_OPTIONS } from "../constants";
import { installHardcodedTranslator } from "./hardcoded";
import { khademActive } from "../../../shared/i18n/khadem/active";

export const KHADEM_ARABIC_FONT = '"IBM Plex Sans Arabic"';

/** Prefix every user-selectable font stack with the Arabic text face. Its @font-face is limited to
 *  Arabic code points, so Latin glyphs still render in the font the user picked. Idempotent. */
export function applyKhademFonts(options = FONT_OPTIONS): void {
  for (const option of options) {
    if (!option.stack.includes(KHADEM_ARABIC_FONT)) {
      option.stack = `${KHADEM_ARABIC_FONT}, ${option.stack}`;
    }
  }
}

/** Window title follows the UI language: «خادم» for Arabic, "Khadem" otherwise. An explicit
 *  VITE_HERMES_DESKTOP_APP_NAME build override wins, as it does upstream. */
export function khademTitle(
  lang: string | null | undefined,
  override?: string,
): string {
  if (override) return override;
  return lang === "ar" ? "خادم" : "Khadem";
}

function syncTitle(): void {
  const override = import.meta.env.VITE_HERMES_DESKTOP_APP_NAME?.trim();
  document.title = khademTitle(
    document.documentElement.getAttribute("lang"),
    override,
  );
}

export function installKhademRenderer(): void {
  if (!khademActive()) return;
  applyKhademFonts();
  // main.tsx assigns document.title after its imports run; take over right after that.
  queueMicrotask(syncTitle);
  installHardcodedTranslator();
  new MutationObserver(syncTitle).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"],
  });
}

installKhademRenderer();
