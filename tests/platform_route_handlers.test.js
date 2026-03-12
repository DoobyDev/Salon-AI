import { describe, expect, it, vi } from "vitest";
import { createPlatformRouteHandlers } from "../src/services/platform_route_handlers.js";

describe("platform route handlers", () => {
  it("serves the dedicated admin dashboard shell for admin dashboard requests", () => {
    const { dashboardPageHandler } = createPlatformRouteHandlers({ publicDir: "C:/app/public" });
    const res = {
      setHeader: vi.fn(),
      sendFile: vi.fn()
    };

    dashboardPageHandler({ query: { role: "admin" } }, res);

    expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-cache, no-store, must-revalidate");
    expect(res.sendFile).toHaveBeenCalledWith(expect.stringContaining("dashboard-admin.html"));
  });

  it("serves the shared dashboard shell for non-admin dashboard requests", () => {
    const { dashboardPageHandler } = createPlatformRouteHandlers({ publicDir: "C:/app/public" });
    const res = {
      setHeader: vi.fn(),
      sendFile: vi.fn()
    };

    dashboardPageHandler({ query: { role: "subscriber" } }, res);

    expect(res.sendFile).toHaveBeenCalledWith(expect.stringContaining("dashboard.html"));
    expect(res.sendFile).not.toHaveBeenCalledWith(expect.stringContaining("dashboard-admin.html"));
  });
});
