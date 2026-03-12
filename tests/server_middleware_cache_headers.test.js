import { describe, expect, it, vi } from "vitest";
import { applyServerMiddleware } from "../src/services/server_middleware.js";

function createMiddlewareHarness() {
  const app = {
    use: vi.fn(),
    post: vi.fn()
  };
  const express = {
    raw: vi.fn(() => "raw-parser"),
    json: vi.fn(() => "json-parser"),
    static: vi.fn((dir, options) => ({ dir, options }))
  };

  applyServerMiddleware({
    app,
    express,
    helmet: () => "helmet-middleware",
    cors: () => "cors-middleware",
    compression: () => "compression-middleware",
    getCorsOptions: () => ({ origin: "*" }),
    publicDir: "public",
    apiLimiter: "api-limiter",
    stripeBillingWebhookHandler: vi.fn(),
    paypalBillingWebhookHandler: vi.fn()
  });

  return express.static.mock.calls[0][1].setHeaders;
}

function cacheControlFor(setHeaders, filePath) {
  const headers = {};
  const res = {
    setHeader: vi.fn((key, value) => {
      headers[key] = value;
    })
  };

  setHeaders(res, filePath);
  return headers["Cache-Control"];
}

describe("server middleware cache headers", () => {
  it("marks shell entry files as no-store", () => {
    const setHeaders = createMiddlewareHarness();

    expect(cacheControlFor(setHeaders, "C:/app/public/index.html")).toBe("no-cache, no-store, must-revalidate");
    expect(cacheControlFor(setHeaders, "C:/app/public/dashboard.html")).toBe("no-cache, no-store, must-revalidate");
    expect(cacheControlFor(setHeaders, "C:/app/public/dashboard-admin.html")).toBe("no-cache, no-store, must-revalidate");
    expect(cacheControlFor(setHeaders, "C:/app/public/auth.html")).toBe("no-cache, no-store, must-revalidate");
    expect(cacheControlFor(setHeaders, "C:/app/public/sw.js")).toBe("no-cache, no-store, must-revalidate");
    expect(cacheControlFor(setHeaders, "C:/app/public/manifest.webmanifest")).toBe("no-cache, no-store, must-revalidate");
  });

  it("marks core css and js assets as revalidated", () => {
    const setHeaders = createMiddlewareHarness();

    expect(cacheControlFor(setHeaders, "C:/app/public/styles.css")).toBe("no-cache, must-revalidate");
    expect(cacheControlFor(setHeaders, "C:/app/public/app.js")).toBe("no-cache, must-revalidate");
    expect(cacheControlFor(setHeaders, "C:/app/public/dashboard.js")).toBe("no-cache, must-revalidate");
    expect(cacheControlFor(setHeaders, "C:/app/public/dashboard-admin-shell.js")).toBe("no-cache, must-revalidate");
    expect(cacheControlFor(setHeaders, "C:/app/public/auth.js")).toBe("no-cache, must-revalidate");
    expect(cacheControlFor(setHeaders, "C:/app/public/theme-toggle.js")).toBe("no-cache, must-revalidate");
  });

  it("allows long-lived caching for unrelated static assets", () => {
    const setHeaders = createMiddlewareHarness();

    expect(cacheControlFor(setHeaders, "C:/app/public/icons/icon.svg")).toBe("public, max-age=86400");
  });
});
