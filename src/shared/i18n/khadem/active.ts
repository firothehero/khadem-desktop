// Is the Khadem layer on? Always in the app. Under vitest it stays inert unless KHADEM_FORCE=1, so
// upstream's own test-suite keeps testing upstream behaviour (Khadem's tests opt in).
// KHADEM_DISABLE=1 turns it off anywhere `process.env` exists (main process, tests).

type Env = Record<string, string | undefined>;

function readEnv(): Env {
  try {
    // globalThis lookup: the renderer has no Node `process` (and no Node typings).
    const proc = (globalThis as { process?: { env?: Env } }).process;
    return proc?.env ?? {};
  } catch {
    return {};
  }
}

const truthy = (value: string | undefined): boolean =>
  ["1", "true", "yes", "on"].includes((value ?? "").trim().toLowerCase());

export function khademActive(env: Env = readEnv()): boolean {
  if (truthy(env.KHADEM_DISABLE)) return false;
  if (env.VITEST && !truthy(env.KHADEM_FORCE)) return false;
  return true;
}

/** Khadem is Arabic-first: new installs open in Arabic. */
export const KHADEM_DEFAULT_LOCALE = "ar" as const;
