const THEME_KEY = "salonTheme";
const THEMES = {
  classic: "classic",
  vibrant: "vibrant"
};

function getInitialTheme() {
  const params = new URLSearchParams(window.location.search);
  const forced = params.get("theme");
  if (forced === THEMES.classic || forced === THEMES.vibrant) {
    try {
      localStorage.setItem(THEME_KEY, forced);
    } catch {
      // ignore storage failures
    }
    return forced;
  }

  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === THEMES.classic || stored === THEMES.vibrant) {
      return stored;
    }
  } catch {
    // ignore storage failures
  }

  return THEMES.vibrant;
}

function applyTheme(theme, persist = true) {
  const useVibrant = theme === THEMES.vibrant;
  document.body.classList.toggle("theme-vibrant", useVibrant);
  document.body.dataset.theme = useVibrant ? THEMES.vibrant : THEMES.classic;
  document.body.dataset.themeMode = useVibrant ? "dark" : "light";
  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, useVibrant ? THEMES.vibrant : THEMES.classic);
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
  if (isDashboardScreen()) {
    return;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";
  button.setAttribute("aria-label", "Toggle light or dark mode");
  const homeScreen = isHomeScreen();
  if (homeScreen) {
    button.classList.add("theme-toggle-nav");
  }

  const syncLabel = () => {
    const isVibrant = document.body.classList.contains("theme-vibrant");
    button.textContent = isVibrant ? "Dark Mode" : "Light Mode";
  };

  button.addEventListener("click", () => {
    const next = document.body.classList.contains("theme-vibrant") ? THEMES.classic : THEMES.vibrant;
    setTheme(next);
    syncLabel();
  });

  if (homeScreen) {
    const topbarActions = document.querySelector(".topbar .auth-actions");
    if (topbarActions instanceof HTMLElement) {
      topbarActions.appendChild(button);
    } else {
      document.body.appendChild(button);
    }
  } else {
    document.body.appendChild(button);
  }
  applyTheme(initialTheme, true);
  syncLabel();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    mountThemeToggle(getInitialTheme());
  });
} else {
  mountThemeToggle(getInitialTheme());
}
