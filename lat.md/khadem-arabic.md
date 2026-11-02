# Khadem Arabic layer

Khadem Desktop is an Arabic-first rebrand of Hermes Desktop kept in Khadem-owned files, with one-line hooks in upstream files so upstream merges stay clean. KHADEM.md has the full ledger.

## Activation

[[src/shared/i18n/khadem/active.ts#khademActive]] turns the layer on in the app and off under vitest unless `KHADEM_FORCE=1`, so upstream tests keep testing upstream behaviour.

New installs open in Arabic through [[src/shared/i18n/config.ts#DEFAULT_ACTIVE_LOCALE]]; users can still pick another language in Settings.

## Catalog layer

[[src/shared/i18n/khadem/apply.ts#applyKhademLayer]] runs once on the shared resources before i18next initialises.

It fills Arabic gaps under upstream's translations, applies Khadem overrides, then brands Arabic and English through [[src/shared/i18n/khadem/brand.ts#brandText]]. Keys naming the external Hermes One cloud account keep that name.

## Renderer layer

[[src/renderer/src/khadem/index.ts#installKhademRenderer]] loads Khadem typography, prefixes every font option with IBM Plex Sans Arabic, titles the window, and translates hard-coded labels.

The hard-coded label table lives in [[src/renderer/src/khadem/hardcoded.ts#HARDCODED_LABELS]]. Khadem's stylesheet also mirrors direction icons in RTL and swaps onboarding and splash marks for the Khadem seal and wordmark.

## Agent plugin

[[src/main/khadem/agent-plugin.ts#ensureKhademAgentPlugin]] copies the vendored Khadem agent plugin into the local Hermes home and enables it once, at startup and after install.

Remote connections are skipped. The plugin gives the agent the Khadem persona, Arabic defaults, branded agent strings, Arabic tools and skills.

## Persona and notifications

Resetting a profile's SOUL.md through [[src/main/soul.ts#resetSoul]] writes the Khadem persona, Arabic under the Arabic locale.

Desktop notifications use [[src/main/khadem/branding.ts#khademAppName]], so they read خادم or Khadem unless an explicit app-name override is set.
