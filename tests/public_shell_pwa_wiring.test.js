import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readPublicFile(fileName) {
  return readFileSync(path.resolve(process.cwd(), "public", fileName), "utf8");
}

describe("public shell pwa wiring", () => {
  it("links the shared manifest from all public shell pages", () => {
    expect(readPublicFile("index.html")).toContain('<link rel="manifest" href="/manifest.webmanifest" />');
    expect(readPublicFile("auth.html")).toContain('<link rel="manifest" href="/manifest.webmanifest" />');
    expect(readPublicFile("dashboard.html")).toContain('<link rel="manifest" href="/manifest.webmanifest" />');
    expect(readPublicFile("dashboard-admin.html")).toContain('<link rel="manifest" href="/manifest.webmanifest" />');
    expect(readPublicFile("legal.html")).toContain('<link rel="manifest" href="/manifest.webmanifest" />');
  });

  it("loads the modular dashboard entrypoint from the live dashboard shell", () => {
    expect(readPublicFile("dashboard.html")).toContain('<script type="module" src="/dashboard.js?v=20260312-admin2"></script>');
    expect(readPublicFile("dashboard.html")).not.toContain("ask-lexi-dashboard.js");
    expect(readPublicFile("dashboard-admin.html")).toContain('<script type="module" src="/dashboard-admin-shell.js?v=20260312-admin3"></script>');
  });

  it("registers the shared service worker from active page entrypoints", () => {
    expect(readPublicFile("ask-lexi-home.js")).toContain('import { registerServiceWorker } from "./pwa-runtime.js";');
    expect(readPublicFile("ask-lexi-home.js")).toContain("registerServiceWorker();");
    expect(readPublicFile("dashboard.js")).toContain('import { clearServiceWorkerState } from "./pwa-runtime.js";');
    expect(readPublicFile("dashboard.js")).toContain("clearServiceWorkerState();");
    expect(readPublicFile("dashboard-admin-shell.js")).toContain('import { clearServiceWorkerState } from "./pwa-runtime.js";');
    expect(readPublicFile("dashboard-admin-shell.js")).toContain("clearServiceWorkerState();");
    expect(readPublicFile("auth.js")).toContain('import { registerServiceWorker } from "./pwa-runtime.js";');
    expect(readPublicFile("auth.js")).toContain("registerServiceWorker();");
    expect(readPublicFile("legal.js")).toContain('import { registerServiceWorker } from "./pwa-runtime.js";');
    expect(readPublicFile("legal.js")).toContain("registerServiceWorker();");
  });
});
