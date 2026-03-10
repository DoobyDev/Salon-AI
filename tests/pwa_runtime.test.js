import { describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "../public/pwa-runtime.js";

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
});
