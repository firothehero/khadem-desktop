// Khadem Arabic coverage report for the desktop UI.
//   npx tsx scripts/khadem/i18n-report.mts            # summary + lists
//   npx tsx scripts/khadem/i18n-report.mts --snippet  # also print missing keys as gap-fill entries
// Missing = English keys with no Arabic from upstream AND no Khadem gap-fill (they show in English).
// Stale   = gap-fill keys upstream removed, or now translates itself (safe to delete).
process.env.KHADEM_DISABLE = "1"; // measure upstream's raw catalogs, not the merged result

const { resources } = await import("../../src/shared/i18n/index.ts");
const gapFill = (await import("../../src/shared/i18n/khadem/ar-gap-fill.ts")).default;

type Tree = Record<string, unknown>;
const flatten = (tree: Tree, prefix = "", out: Record<string, string> = {}): Record<string, string> => {
  for (const [key, value] of Object.entries(tree)) {
    if (typeof value === "string") out[prefix + key] = value;
    else if (value && typeof value === "object") flatten(value as Tree, `${prefix}${key}.`, out);
  }
  return out;
};

const en = flatten(resources.en.translation as Tree);
const ar = flatten(resources.ar.translation as Tree);
const missing = Object.keys(en).filter((k) => !(k in ar) && !(k in gapFill));
const removed = Object.keys(gapFill).filter((k) => !(k in en));
const superseded = Object.keys(gapFill).filter((k) => k in ar);

console.log(
  `english=${Object.keys(en).length} upstream_arabic=${Object.keys(ar).length} ` +
    `khadem_gap_fill=${Object.keys(gapFill).length} missing=${missing.length} ` +
    `stale_removed=${removed.length} stale_superseded=${superseded.length}`,
);
for (const k of missing) console.log(`  missing     ${k} = ${JSON.stringify(en[k])}`);
for (const k of removed) console.log(`  stale       ${k} (no longer in English catalog)`);
for (const k of superseded) console.log(`  superseded  ${k} (upstream translates it now)`);
if (process.argv.includes("--snippet") && missing.length) {
  console.log("\n// paste into src/shared/i18n/khadem/ar-gap-fill.ts, then translate:");
  for (const k of missing) console.log(`  ${JSON.stringify(k)}: ${JSON.stringify(en[k])},`);
}
process.exitCode = process.argv.includes("--strict") && (missing.length || removed.length) ? 1 : 0;
