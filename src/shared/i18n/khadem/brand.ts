// Khadem (خادم) product branding applied over upstream's translation catalogs at load time, so the
// upstream locale files stay byte-identical and every new upstream string is branded automatically.

export const KHADEM_NAME_AR = "خادم";
export const KHADEM_NAME_LATIN = "Khadem";

// Product-name spellings only. Latin-only lookarounds (not \b): Arabic prefixes attach directly
// ("وHermes", "لـHermes") and must still match, while identifiers (runHermesModel, HERMES_HOME,
// hermes-agent, ~/.hermes) must not.
const BRAND_RE =
  /(?<![A-Za-z0-9_])(?:Hermes(?: Agent| One)?|هيرميس|هيرمس)(?![A-Za-z0-9_-])/g;

// Keys that name the external "Hermes One" cloud service (account, credits, sync, wallets, its
// inference gateway). Renaming those would mislead users about whose service they sign in to.
export const PROTECTED_KEY_PREFIXES: readonly string[] = [
  "providers.hermesAccount.",
  "agents.sync",
  "agents.wallet",
  "constants.hermesone",
];

export function brandText(text: string, name: string): string {
  return text.replace(BRAND_RE, name);
}

export function isProtectedKey(key: string): boolean {
  return PROTECTED_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}
