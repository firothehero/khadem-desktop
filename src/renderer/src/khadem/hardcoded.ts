// Upstream renders a few English strings that never go through i18n (onboarding eyebrows). Rather
// than editing those components, Khadem translates the exact known strings in the live DOM.
// Add rows here when a sync introduces another hard-coded label (the test lists the contract).

export interface HardcodedLabel {
  selector: string;
  text: string;
  ar: string;
  en?: string;
}

export const HARDCODED_LABELS: HardcodedLabel[] = [
  {
    selector: ".onboard-eyebrow",
    text: "HERMES ONE",
    ar: "خادم",
    en: "KHADEM",
  },
  { selector: ".onboard-eyebrow", text: "SETUP", ar: "الإعداد" },
  { selector: ".onboard-eyebrow", text: "INSTALLING", ar: "جارٍ التثبيت" },
  { selector: ".onboard-eyebrow", text: "COMPLETE", ar: "اكتمل" },
  { selector: ".onboard-eyebrow", text: "ERROR", ar: "خطأ" },
];

const SELECTOR = [...new Set(HARDCODED_LABELS.map((row) => row.selector))].join(
  ",",
);
const ORIGINAL = "khademOriginal";

/** Rewrite matching elements under `root` for `lang`; reversible when the language changes. */
export function translateHardcoded(root: ParentNode, lang: string): void {
  const nodes: Element[] = [];
  if (root instanceof Element && root.matches(SELECTOR)) nodes.push(root);
  nodes.push(...root.querySelectorAll(SELECTOR));
  for (const el of nodes) {
    if (!(el instanceof HTMLElement) || el.childElementCount > 0) continue;
    const original = el.dataset[ORIGINAL] ?? el.textContent?.trim() ?? "";
    const row = HARDCODED_LABELS.find(
      (r) => r.text === original && el.matches(r.selector),
    );
    if (!row) continue;
    const next = lang === "ar" ? row.ar : (row.en ?? row.text);
    el.dataset[ORIGINAL] = original;
    if (el.textContent !== next) el.textContent = next;
  }
}

export function installHardcodedTranslator(
  doc: Document = document,
): MutationObserver {
  const lang = (): string => doc.documentElement.getAttribute("lang") ?? "en";
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") translateHardcoded(doc, lang());
      for (const node of record.addedNodes) {
        if (node instanceof Element) translateHardcoded(node, lang());
      }
    }
  });
  observer.observe(doc.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["lang"],
  });
  translateHardcoded(doc, lang());
  return observer;
}
