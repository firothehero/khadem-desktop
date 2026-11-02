// Installs the Khadem agent plugin (firothehero/khadem: plugins/khadem) into the local Hermes home
// and enables it once, so the desktop's agent is خادم too: Arabic persona, خادم-branded catalogs,
// Arabic defaults, arabic_text / hijri_date tools and Arabic skills.
//
// The plugin is vendored under resources/khadem-agent-plugin (scripts/khadem/vendor-agent-plugin.sh)
// and works with whichever hermes-agent version the upstream installer pins, because it only uses
// the public plugin API (plus seams covered by the Khadem agent repo's tests).
import { execFile } from "child_process";
import { app } from "electron";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { homedir } from "os";
import { join } from "path";
import { khademActive } from "../../shared/i18n/khadem/active";
import { isRemoteMode } from "../hermes";
import {
  HERMES_HOME,
  HERMES_PYTHON,
  HERMES_REPO,
  getEnhancedPath,
  hermesCliArgs,
} from "../installer";
import { HIDDEN_SUBPROCESS_OPTIONS } from "../process-options";

export const PLUGIN_NAME = "khadem";
const RESOURCE_DIR = "khadem-agent-plugin";
const STAMP_FILE = ".khadem-desktop.json";

export interface KhademPluginStamp {
  version: string;
  source: string;
  enabled?: boolean;
}

export type KhademPluginResult =
  | { status: "skipped"; reason: string }
  | {
      status: "ready" | "installed" | "updated";
      enabled: boolean;
      error?: string;
    };

/** Where the vendored plugin lives: unpacked resources when packaged, the repo in dev. */
export function vendoredPluginDir(candidates?: string[]): string | null {
  const roots = candidates ?? [
    join(
      process.resourcesPath ?? "",
      "app.asar.unpacked",
      "resources",
      RESOURCE_DIR,
    ),
    join(app.getAppPath(), "resources", RESOURCE_DIR),
    join(__dirname, "..", "..", "resources", RESOURCE_DIR),
  ];
  return roots.find((dir) => existsSync(join(dir, "plugin.yaml"))) ?? null;
}

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(readFileSync(file, "utf-8")) as T;
  } catch {
    return null;
  }
}

/** Version identity of a plugin tree: plugin.yaml version + the vendored source commit. */
export function pluginIdentity(dir: string): KhademPluginStamp {
  const manifest = readFileSync(join(dir, "plugin.yaml"), "utf-8");
  const version = /^version:\s*["']?([^"'\s]+)/m.exec(manifest)?.[1] ?? "0";
  const source =
    readJson<{ commit?: string }>(join(dir, "SOURCE.json"))?.commit ?? "";
  return { version, source };
}

/** Copy the vendored plugin into <home>/plugins/khadem when missing or a different build. */
export function syncPluginFiles(
  sourceDir: string,
  home: string,
): { action: "ready" | "installed" | "updated"; stamp: KhademPluginStamp } {
  const dest = join(home, "plugins", PLUGIN_NAME);
  const want = pluginIdentity(sourceDir);
  const have = readJson<KhademPluginStamp>(join(dest, STAMP_FILE));
  if (
    have &&
    have.version === want.version &&
    have.source === want.source &&
    existsSync(join(dest, "plugin.yaml"))
  ) {
    return { action: "ready", stamp: have };
  }
  const action = existsSync(dest) ? "updated" : "installed";
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(join(home, "plugins"), { recursive: true });
  cpSync(sourceDir, dest, { recursive: true });
  const stamp = { ...want, enabled: have?.enabled ?? false };
  writeFileSync(join(dest, STAMP_FILE), JSON.stringify(stamp, null, 2));
  return { action, stamp };
}

function enablePlugin(): Promise<string | null> {
  return new Promise((resolve) => {
    execFile(
      HERMES_PYTHON,
      hermesCliArgs(["plugins", "enable", PLUGIN_NAME]),
      {
        cwd: HERMES_REPO,
        env: {
          ...process.env,
          PATH: getEnhancedPath(),
          HOME: homedir(),
          HERMES_HOME,
        },
        timeout: 120_000,
        ...HIDDEN_SUBPROCESS_OPTIONS,
      },
      (error, _stdout, stderr) =>
        resolve(error ? String(stderr || error.message) : null),
    );
  });
}

let inFlight: Promise<KhademPluginResult> | null = null;

/** Idempotent; safe to call at every startup and after every install. Never throws. */
export function ensureKhademAgentPlugin(): Promise<KhademPluginResult> {
  inFlight ??= run().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function run(): Promise<KhademPluginResult> {
  try {
    if (!khademActive())
      return { status: "skipped", reason: "Khadem layer disabled" };
    if (isRemoteMode())
      return { status: "skipped", reason: "remote connection" };
    if (!existsSync(HERMES_PYTHON) || !existsSync(HERMES_REPO)) {
      return { status: "skipped", reason: "Hermes not installed" };
    }
    const source = vendoredPluginDir();
    if (!source)
      return { status: "skipped", reason: "vendored plugin missing" };

    const { action, stamp } = syncPluginFiles(source, HERMES_HOME);
    // Enable exactly once per home: a later `hermes plugins disable khadem` is the user's choice.
    if (stamp.enabled) return { status: action, enabled: true };
    const error = await enablePlugin();
    if (!error) {
      const stampFile = join(HERMES_HOME, "plugins", PLUGIN_NAME, STAMP_FILE);
      writeFileSync(
        stampFile,
        JSON.stringify({ ...stamp, enabled: true }, null, 2),
      );
    }
    return { status: action, enabled: !error, ...(error ? { error } : {}) };
  } catch (err) {
    return { status: "skipped", reason: (err as Error).message };
  }
}
