// Khadem agent-plugin installer: copies the vendored plugin into a Hermes home idempotently.
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { describe, expect, it, vi } from "vitest";

vi.mock("electron", () => ({ app: { getAppPath: () => process.cwd() } }));
vi.mock("../../src/main/hermes", () => ({ isRemoteMode: () => false }));
vi.mock("../../src/main/installer", () => ({
  HERMES_HOME: "/nonexistent",
  HERMES_PYTHON: "/nonexistent/python",
  HERMES_REPO: "/nonexistent/repo",
  getEnhancedPath: () => "",
  hermesCliArgs: (a: string[]) => a,
}));

const ROOT = join(__dirname, "..", "..");

function fakePlugin(version: string, commit: string): string {
  const dir = mkdtempSync(join(tmpdir(), "khadem-src-"));
  writeFileSync(
    join(dir, "plugin.yaml"),
    `name: khadem\nversion: ${version}\nkind: backend\n`,
  );
  writeFileSync(join(dir, "SOURCE.json"), JSON.stringify({ commit }));
  writeFileSync(join(dir, "__init__.py"), "def register(ctx):\n    pass\n");
  return dir;
}

describe("Khadem agent plugin installer", () => {
  it("ships a vendored plugin with its source commit", async () => {
    const { vendoredPluginDir, pluginIdentity } =
      await import("../../src/main/khadem/agent-plugin");
    const dir = vendoredPluginDir([
      join(ROOT, "resources", "khadem-agent-plugin"),
    ]);
    expect(dir).not.toBeNull();
    const id = pluginIdentity(dir!);
    expect(id.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(id.source).toMatch(/^[0-9a-f]{40}$/);
    for (const file of [
      "__init__.py",
      "arabic.py",
      "persona.py",
      "tools.py",
      "ummalqura.py",
    ]) {
      expect(existsSync(join(dir!, file))).toBe(true);
    }
  });

  it("installs, then is a no-op, then updates when the vendored build changes", async () => {
    const { syncPluginFiles } =
      await import("../../src/main/khadem/agent-plugin");
    const home = mkdtempSync(join(tmpdir(), "hermes-home-"));
    mkdirSync(join(home, "plugins"));

    expect(
      syncPluginFiles(fakePlugin("1.0.0", "a".repeat(40)), home).action,
    ).toBe("installed");
    expect(
      syncPluginFiles(fakePlugin("1.0.0", "a".repeat(40)), home).action,
    ).toBe("ready");

    // remember the one-time enable across updates (so a user's later disable is respected)
    const stampFile = join(home, "plugins", "khadem", ".khadem-desktop.json");
    const stamp = JSON.parse(readFileSync(stampFile, "utf-8"));
    writeFileSync(stampFile, JSON.stringify({ ...stamp, enabled: true }));

    const updated = syncPluginFiles(fakePlugin("1.1.0", "b".repeat(40)), home);
    expect(updated.action).toBe("updated");
    expect(updated.stamp).toMatchObject({ version: "1.1.0", enabled: true });
    expect(
      readFileSync(join(home, "plugins", "khadem", "plugin.yaml"), "utf-8"),
    ).toContain("1.1.0");
  });

  it("skips quietly when Hermes is not installed", async () => {
    const { ensureKhademAgentPlugin } =
      await import("../../src/main/khadem/agent-plugin");
    vi.stubEnv("KHADEM_FORCE", "1");
    await expect(ensureKhademAgentPlugin()).resolves.toMatchObject({
      status: "skipped",
    });
    vi.unstubAllEnvs();
  });
});
