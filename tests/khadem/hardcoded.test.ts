// Khadem's translator for upstream's hard-coded (non-i18n) onboarding labels.
import { describe, expect, it } from "vitest";
import {
  HARDCODED_LABELS,
  translateHardcoded,
} from "../../src/renderer/src/khadem/hardcoded";

describe("hard-coded label translator", () => {
  it("translates known labels for Arabic and restores them for other languages", () => {
    document.body.innerHTML =
      '<div class="onboard-eyebrow">HERMES ONE</div><div class="onboard-eyebrow">SETUP</div><div class="other">SETUP</div>';
    translateHardcoded(document, "ar");
    const [brand, setup] = document.querySelectorAll(".onboard-eyebrow");
    expect(brand.textContent).toBe("خادم");
    expect(setup.textContent).toBe("الإعداد");
    expect(document.querySelector(".other")!.textContent).toBe("SETUP");

    translateHardcoded(document, "en");
    expect(brand.textContent).toBe("KHADEM");
    expect(setup.textContent).toBe("SETUP");
  });

  it("leaves unknown strings alone and has an Arabic value for every row", () => {
    document.body.innerHTML =
      '<div class="onboard-eyebrow">SOMETHING NEW</div>';
    translateHardcoded(document, "ar");
    expect(document.querySelector(".onboard-eyebrow")!.textContent).toBe(
      "SOMETHING NEW",
    );
    for (const row of HARDCODED_LABELS) expect(row.ar.trim()).not.toBe("");
  });
});
