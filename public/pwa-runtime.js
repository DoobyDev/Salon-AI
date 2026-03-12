export async function registerServiceWorker({
  navigatorRef = globalThis.navigator,
  locationRef = globalThis.location
} = {}) {
  const serviceWorker = navigatorRef?.serviceWorker;
  const protocol = String(locationRef?.protocol || "").toLowerCase();
  const isSupportedProtocol = protocol === "http:" || protocol === "https:";

  if (!serviceWorker) {
    return { supported: false, registered: false };
  }

  if (!isSupportedProtocol) {
    return { supported: true, registered: false };
  }

  try {
    const registration = await serviceWorker.register("/sw.js", { scope: "/" });
    return { supported: true, registered: true, registration };
  } catch {
    return { supported: true, registered: false };
  }
}

export async function clearServiceWorkerState({
  navigatorRef = globalThis.navigator,
  cachesRef = globalThis.caches
} = {}) {
  const serviceWorker = navigatorRef?.serviceWorker;

  try {
    if (serviceWorker?.getRegistrations) {
      const registrations = await serviceWorker.getRegistrations();
      await Promise.all((Array.isArray(registrations) ? registrations : []).map((registration) => registration.unregister?.()));
    }
  } catch {
    // Ignore cleanup failures; dashboard should still continue loading.
  }

  try {
    if (cachesRef?.keys) {
      const keys = await cachesRef.keys();
      await Promise.all(
        (Array.isArray(keys) ? keys : [])
          .filter((key) => String(key || "").startsWith("salon-ai-"))
          .map((key) => cachesRef.delete(key))
      );
    }
  } catch {
    // Ignore cache cleanup failures; dashboard should still continue loading.
  }

  return { cleared: true };
}
