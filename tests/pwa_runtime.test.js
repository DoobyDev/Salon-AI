import { describe, expect, it, vi } from "vitest";
import { clearServiceWorkerState, registerServiceWorker } from "../public/pwa-runtime.js";

describe("pwa runtime", () => {
  it("skips registration when service workers are unavailable", async () => {
    const result = await registerServiceWorker({
      navigatorRef: {},
      locationRef: { protocol: "https:" }
    });

    expect(result).toEqual({ supported: false, registered: false });
  });

  it("skips registration outside http and https protocols", async () => {
    const register = vi.fn();

    const result = await registerServiceWorker({
      navigatorRef: { serviceWorker: { register } },
      locationRef: { protocol: "file:" }
    });

    expect(register).not.toHaveBeenCalled();
    expect(result).toEqual({ supported: true, registered: false });
  });

  it("registers the shared service worker at root scope", async () => {
    const registration = { active: true };
    const register = vi.fn().mockResolvedValue(registration);

    const result = await registerServiceWorker({
      navigatorRef: { serviceWorker: { register } },
      locationRef: { protocol: "https:" }
    });

    expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/" });
    expect(result).toEqual({ supported: true, registered: true, registration });
  });

  it("clears existing salon-ai service workers and caches", async () => {
    const unregister = vi.fn().mockResolvedValue(true);
    const getRegistrations = vi.fn().mockResolvedValue([{ unregister }]);
    const keys = vi.fn().mockResolvedValue(["salon-ai-v8", "other-cache"]);
    const del = vi.fn().mockResolvedValue(true);

    const result = await clearServiceWorkerState({
      navigatorRef: { serviceWorker: { getRegistrations } },
      cachesRef: { keys, delete: del }
    });

    expect(getRegistrations).toHaveBeenCalled();
    expect(unregister).toHaveBeenCalled();
    expect(keys).toHaveBeenCalled();
    expect(del).toHaveBeenCalledWith("salon-ai-v8");
    expect(del).not.toHaveBeenCalledWith("other-cache");
    expect(result).toEqual({ cleared: true });
  });
});
