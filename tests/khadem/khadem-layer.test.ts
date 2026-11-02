// Khadem (خادم) desktop layer contract. Runs with the layer forced on (it is inert under vitest
// otherwise so upstream's own tests keep testing upstream behaviour). See KHADEM.md.
import { readFileSync } from "fs";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ROOT = join(__dirname, "..", "..");

type Tree = Record<string, unknown>;

function flatten(
  tree: Tree,
  prefix = "",
  out: Record<string, string> = {},
): Record<string, string> {
  for (const [key, value] of Object.entries(tree)) {
    if (typeof value === "string") out[prefix + key] = value;
    else if (value && typeof value === "object")
      flatten(value as Tree, `${prefix}${key}.`, out);
  }
  return out;
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("KHADEM_FORCE", "1");
  vi.stubEnv("KHADEM_DISABLE", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("khademActive", () => {
  it("is on in the app, inert under vitest unless forced, and off when disabled", async () => {
    const { khademActive } =
      await import("../../src/shared/i18n/khadem/active");
    expect(khademActive({})).toBe(true);
    expect(khademActive({ VITEST: "true" })).toBe(false);
    expect(khademActive({ VITEST: "true", KHADEM_FORCE: "1" })).toBe(true);
    expect(khademActive({ KHADEM_DISABLE: "1" })).toBe(false);
  });
});

describe("brandText", () => {
  it("renames the product but keeps identifiers, commands and paths", async () => {
    const { brandText } = await import("../../src/shared/i18n/khadem/brand");
    const out = brandText(
      "مرحباً بك في Hermes One وHermes Agent؛ شغّل `hermes model` في ~/.hermes مع HERMES_HOME وrunHermesModel",
      "خادم",
    );
    expect(out).toBe(
      "مرحباً بك في خادم وخادم؛ شغّل `hermes model` في ~/.hermes مع HERMES_HOME وrunHermesModel",
    );
  });
});

describe("applyKhademLayer (synthetic catalogs)", () => {
  it("fills gaps under upstream, applies overrides over it, brands, and protects service keys", async () => {
    const { applyKhademLayer } =
      await import("../../src/shared/i18n/khadem/apply");
    const resources = {
      en: { translation: { welcome: { title: "Welcome to Hermes One" } } },
      ar: {
        translation: {
          welcome: { title: "مرحباً بك في Hermes One" },
          providers: { hermesAccount: { sectionTitle: "حساب Hermes One" } },
        },
      },
      es: { translation: { welcome: { title: "Bienvenido a Hermes One" } } },
    };
    applyKhademLayer(resources, true);
    expect(resources.ar.translation.welcome.title).toBe("مرحباً بك في خادم");
    expect(resources.en.translation.welcome.title).toBe("Welcome to Khadem");
    expect(resources.es.translation.welcome.title).toBe(
      "Bienvenido a Hermes One",
    );
    expect(resources.ar.translation.providers.hermesAccount.sectionTitle).toBe(
      "حساب Hermes One",
    );
    // a gap-fill key appears where upstream had nothing
    expect(flatten(resources.ar.translation)["botGroups.title"]).toBe(
      "مجموعات الوكلاء",
    );
  });

  it("is a no-op when inactive", async () => {
    const { applyKhademLayer } =
      await import("../../src/shared/i18n/khadem/apply");
    const resources = { ar: { translation: { a: "Hermes" } } };
    applyKhademLayer(resources, false);
    expect(resources.ar.translation.a).toBe("Hermes");
  });
});

describe("real catalogs with Khadem forced on", () => {
  it("defaults to Arabic and leaves no Arabic key untranslated", async () => {
    const i18n = await import("../../src/shared/i18n");
    expect(i18n.DEFAULT_ACTIVE_LOCALE).toBe("ar");
    const en = flatten(i18n.resources.en.translation as Tree);
    const ar = flatten(i18n.resources.ar.translation as Tree);
    const missing = Object.keys(en).filter((key) => !(key in ar));
    // A failure lists keys upstream added without Arabic: translate them in
    // src/shared/i18n/khadem/ar-gap-fill.ts (or run `npm run khadem:i18n`).
    expect(missing).toEqual([]);
    expect(i18n.t("welcome.title", "ar")).toContain("خادم");
    expect(i18n.t("welcome.title", "en")).toContain("Khadem");
  });

  it("brands every Arabic string except the protected Hermes One service keys", async () => {
    const i18n = await import("../../src/shared/i18n");
    const { isProtectedKey } =
      await import("../../src/shared/i18n/khadem/brand");
    const leftovers = Object.entries(
      flatten(i18n.resources.ar.translation as Tree),
    ).filter(
      ([key, value]) =>
        !isProtectedKey(key) &&
        /(?<![A-Za-z0-9_])Hermes(?![A-Za-z0-9_-])/.test(value),
    );
    expect(leftovers).toEqual([]);
  });

  it("keeps every gap-fill entry pointed at a key upstream still has", async () => {
    const i18n = await import("../../src/shared/i18n");
    const gapFill = (await import("../../src/shared/i18n/khadem/ar-gap-fill"))
      .default;
    const en = flatten(i18n.resources.en.translation as Tree);
    const stale = Object.keys(gapFill).filter((key) => !(key in en));
    expect(stale).toEqual([]);
    const placeholders = (s: string): string =>
      (s.match(/\{\{\w+\}\}/g) ?? []).sort().join();
    const broken = Object.entries(gapFill).filter(
      ([key, value]) =>
        key in en && placeholders(value) !== placeholders(en[key]),
    );
    expect(broken).toEqual([]);
  });
});

describe("main-process branding and persona", () => {
  it("names the app خادم/Khadem unless an explicit app-name override is set", async () => {
    const b = await import("../../src/main/khadem/branding");
    expect(b.khademAppName("ar")).toBe("خادم");
    expect(b.khademAppName("en")).toBe("Khadem");
    expect(b.khademAppName("ar", "Acme")).toBe("Acme");
    expect(b.khademErrorTitle("ar")).toBe("خادم — خطأ");
    expect(b.khademResponseReady("ar")).toBe("الرد جاهز");
  });

  it("writes the Arabic Khadem SOUL for Arabic and the upstream SOUL when inactive", async () => {
    const p = await import("../../src/main/khadem/persona");
    expect(p.khademDefaultSoul("ar", "UP")).toContain("أنت خادم");
    expect(p.khademDefaultSoul("en", "UP")).toContain("You are Khadem");
    vi.stubEnv("KHADEM_FORCE", "");
    expect(p.khademDefaultSoul("ar", "UP")).toBe("UP");
  });
});

describe("renderer fonts", () => {
  it("prefixes every font stack with the Arabic text face exactly once", async () => {
    const { applyKhademFonts, KHADEM_ARABIC_FONT } =
      await import("../../src/renderer/src/khadem");
    const options = [
      { value: "x", label: "x", stack: '"Manrope", sans-serif' },
    ];
    applyKhademFonts(options);
    applyKhademFonts(options);
    expect(options[0].stack).toBe(
      `${KHADEM_ARABIC_FONT}, "Manrope", sans-serif`,
    );
  });

  it("titles the window by language", async () => {
    const { khademTitle } = await import("../../src/renderer/src/khadem");
    expect(khademTitle("ar")).toBe("خادم");
    expect(khademTitle("en")).toBe("Khadem");
    expect(khademTitle("ar", "Acme")).toBe("Acme");
  });
});

// The patch ledger (KHADEM.md): every hook Khadem places in an upstream file. If an upstream sync
// drops one while resolving a conflict, this names the file to re-patch.
const LEDGER: Array<[string, string]> = [
  [
    "src/shared/i18n/index.ts",
    'import { applyKhademLayer } from "./khadem/apply"; // KHADEM-PATCH',
  ],
  ["src/shared/i18n/index.ts", "applyKhademLayer(resources); // KHADEM-PATCH"],
  ["src/shared/i18n/config.ts", "? KHADEM_DEFAULT_LOCALE"],
  [
    "src/main/soul.ts",
    "khademDefaultSoul(getAppLocale(), DEFAULT_SOUL); // KHADEM-PATCH",
  ],
  [
    "src/main/ipc/register.ts",
    "khademAppName(getAppLocale(), APP_NAME), // KHADEM-PATCH",
  ],
  [
    "src/main/ipc/register.ts",
    "khademErrorTitle(getAppLocale(), APP_NAME), // KHADEM-PATCH",
  ],
  ["src/renderer/src/main.tsx", 'import "./khadem"; // KHADEM-PATCH'],
  ["src/main/app/start.ts", "void ensureKhademAgentPlugin(); // KHADEM-PATCH"],
  [
    "src/main/ipc/register.ts",
    "await ensureKhademAgentPlugin(); // KHADEM-PATCH",
  ],
  ["src/renderer/src/screens/Chat/ChatInput.tsx", 'dir="auto"'],
];

describe("patch ledger", () => {
  it.each(LEDGER)("%s still carries its Khadem hook", (file, marker) => {
    expect(readFileSync(join(ROOT, file), "utf-8")).toContain(marker);
  });
});
