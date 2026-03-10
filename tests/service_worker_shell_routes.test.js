import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const swPath = path.resolve(process.cwd(), "public", "sw.js");
const swSource = readFileSync(swPath, "utf8");

describe("service worker shell routes", () => {
  it("precaches the canonical shell routes", () => {
    expect(swSource).toContain('"/auth"');
    expect(swSource).toContain('"/dashboard"');
    expect(swSource).toContain('"/legal"');
    expect(swSource).toContain('"/manifest.webmanifest"');
  });

  it("refreshes canonical shell routes from the network first", () => {
    expect(swSource).toContain('url.pathname === "/auth"');
    expect(swSource).toContain('url.pathname === "/dashboard"');
    expect(swSource).toContain('url.pathname === "/legal"');
  });

  it("still treats legacy auth and dashboard html assets as refresh-first", () => {
    expect(swSource).toContain('url.pathname === "/dashboard.html"');
    expect(swSource).toContain('url.pathname === "/auth.html"');
  });
});
