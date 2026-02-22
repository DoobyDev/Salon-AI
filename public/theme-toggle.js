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

function setTheme(theme) {
  const useVibrant = theme === THEMES.vibrant;
  document.body.classList.toggle("theme-vibrant", useVibrant);
  document.body.dataset.theme = useVibrant ? THEMES.vibrant : THEMES.classic;
  try {
    localStorage.setItem(THEME_KEY, useVibrant ? THEMES.vibrant : THEMES.classic);
  } catch {
    // ignore storage failures
  }
}

function mountThemeToggle(initialTheme) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";
  button.setAttribute("aria-label", "Toggle color theme");

  const syncLabel = () => {
    const isVibrant = document.body.classList.contains("theme-vibrant");
    button.textContent = isVibrant ? "Classic Theme" : "Color Boost";
  };

  button.addEventListener("click", () => {
    const next = document.body.classList.contains("theme-vibrant") ? THEMES.classic : THEMES.vibrant;
    setTheme(next);
    syncLabel();
  });

  document.body.appendChild(button);
  setTheme(initialTheme);
  syncLabel();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    mountThemeToggle(getInitialTheme());
  });
} else {
  mountThemeToggle(getInitialTheme());
}
