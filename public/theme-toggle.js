const THEME_KEY = "salonTheme";
const THEMES = {
  classic: "classic",
  vibrant: "vibrant"
};

function getInitialTheme() {
  return THEMES.classic;
}

function applyTheme(theme, persist = true) {
  document.body.classList.remove("theme-vibrant");
  document.body.dataset.theme = THEMES.classic;
  document.body.dataset.themeMode = "light";
  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, THEMES.classic);
    } catch {
      // ignore storage failures
    }
  }
}

function setTheme(theme) {
  applyTheme(theme, true);
}

function isHomeScreen() {
  return !!document.getElementById("home") || window.location.pathname === "/" || window.location.pathname.endsWith("/index.html");
}

function isDashboardScreen() {
  return !!document.getElementById("dashboardMain");
}

function mountThemeToggle(initialTheme) {
  applyTheme(initialTheme, true);
}

async function clearLegacyThemeCaches() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  } catch {
    // ignore service worker cleanup failures
  }
  if (!("caches" in window)) return;
  try {
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map((key) => caches.delete(key)));
  } catch {
    // ignore cache cleanup failures
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    clearLegacyThemeCaches().catch(() => {});
    mountThemeToggle(getInitialTheme());
  });
} else {
  clearLegacyThemeCaches().catch(() => {});
  mountThemeToggle(getInitialTheme());
}
