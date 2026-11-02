# Khadem Arabic layer

Khadem Desktop is an Arabic-first rebrand of Hermes Desktop. Upstream supplies the Arabic locale and RTL support; Khadem adds the defaults and branding below.

## Arabic default locale

New installs open in Arabic because [[src/shared/i18n/config.ts#DEFAULT_ACTIVE_LOCALE]] is `ar`. Untranslated Arabic keys still fall back to English, and users can pick another language in Settings.

## Khadem branding

Arabic UI strings name the agent خادم instead of Hermes, Hermes One or Hermes Agent. Desktop notifications use خادم under Arabic and Khadem otherwise; the internal app identity stays unchanged so user data paths do not move.

## Khadem persona

Resetting a profile's SOUL.md through [[src/main/soul.ts#resetSoul]] writes the Khadem persona: Arabic under the Arabic locale, English otherwise. It tells the agent it is Khadem and to reply in the user's language.
