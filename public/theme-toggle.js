const THEME_KEY = "salonTheme";
const LEGACY_THEME_KEYS = ["salonThemeMode", "dashboardThemeMode", "salonThemeVariant"];

function clearLegacyThemeState() {
  const { body, documentElement } = document;
  if (!body) return;

  body.classList.remove("theme-vibrant", "dashboard-light-mode");
  body.dataset.theme = "premium";
  delete body.dataset.themeMode;

  documentElement.classList.remove("theme-vibrant", "dashboard-light-mode");
  documentElement.dataset.theme = "premium";
  delete documentElement.dataset.themeMode;

  try {
    localStorage.removeItem(THEME_KEY);
    LEGACY_THEME_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore storage failures
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", clearLegacyThemeState);
} else {
  clearLegacyThemeState();
}
