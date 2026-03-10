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
