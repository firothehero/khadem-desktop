// The single entry point the upstream i18n index calls (see KHADEM.md → patch ledger).
import arGapFill from "./ar-gap-fill";
import { khademActive } from "./active";
import arOverrides from "./ar-overrides";
import {
  KHADEM_NAME_AR,
  KHADEM_NAME_LATIN,
  brandText,
  isProtectedKey,
} from "./brand";

type Tree = Record<string, unknown>;
type Resources = Record<string, { translation: Tree }>;

/** Locales that carry the Khadem name (others keep upstream wording untouched). */
export const BRANDED_LOCALES: Record<string, string> = {
  ar: KHADEM_NAME_AR,
  en: KHADEM_NAME_LATIN,
};

function readPath(tree: Tree, path: string[]): unknown {
  let node: unknown = tree;
  for (const part of path) {
    if (!node || typeof node !== "object") return undefined;
    node = (node as Tree)[part];
  }
  return node;
}

function writePath(tree: Tree, path: string[], value: string): void {
  let node = tree;
  for (const part of path.slice(0, -1)) {
    const next = node[part];
    if (!next || typeof next !== "object") node[part] = {};
    node = node[part] as Tree;
  }
  node[path[path.length - 1]] = value;
}

function brandTree(tree: Tree, name: string, prefix = ""): void {
  for (const [key, value] of Object.entries(tree)) {
    const dotted = prefix + key;
    if (typeof value === "string") {
      if (!isProtectedKey(dotted)) tree[key] = brandText(value, name);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      brandTree(value as Tree, name, `${dotted}.`);
    }
  }
}

/** Fill Arabic gaps (upstream wins), apply Khadem overrides (Khadem wins), then brand. */
export function applyKhademLayer(
  resources: Resources,
  active = khademActive(),
): Resources {
  if (!active) return resources;
  const ar = resources.ar?.translation;
  if (ar) {
    for (const [key, value] of Object.entries(arGapFill)) {
      const path = key.split(".");
      if (typeof readPath(ar, path) !== "string") writePath(ar, path, value);
    }
    for (const [key, value] of Object.entries(arOverrides)) {
      writePath(ar, key.split("."), value);
    }
  }
  for (const [locale, name] of Object.entries(BRANDED_LOCALES)) {
    const tree = resources[locale]?.translation;
    if (tree) brandTree(tree, name);
  }
  return resources;
}
