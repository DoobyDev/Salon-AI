const STORAGE_KEY = "salon_theme_preset";
const DEFAULT_THEME = "copper-glow";

const THEMES = [
  {
    id: "copper-glow",
    label: "Copper",
    description: "Warm and premium",
    swatch: "linear-gradient(135deg, #22140f 0%, #bb693f 56%, #efc7a0 100%)",
    themeColor: "#bb693f"
  },
  {
    id: "rose-editorial",
    label: "Rose",
    description: "Soft and stylish",
    swatch: "linear-gradient(135deg, #2a1819 0%, #b96b78 56%, #efc2bf 100%)",
    themeColor: "#b96b78"
  },
  {
    id: "forest-luxe",
    label: "Forest",
    description: "Calm and refined",
    swatch: "linear-gradient(135deg, #182019 0%, #6d8b65 56%, #d6c7a0 100%)",
    themeColor: "#6d8b65"
  }
];

function getRoot() {
  return document.documentElement;
}

function isValidTheme(themeId) {
  return THEMES.some((theme) => theme.id === themeId);
}

function getSavedTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY) || "";
    return isValidTheme(value) ? value : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function setTheme(themeId) {
  const id = isValidTheme(themeId) ? themeId : DEFAULT_THEME;
  const root = getRoot();
  if (!root) return;
  if (id === DEFAULT_THEME) {
    delete root.dataset.salonTheme;
  } else {
    root.dataset.salonTheme = id;
  }
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {}

  const theme = THEMES.find((row) => row.id === id) || THEMES[0];
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && theme?.themeColor) meta.setAttribute("content", theme.themeColor);

  document.querySelectorAll("[data-salon-theme-option]").forEach((button) => {
    button.classList.toggle("is-active", button.getAttribute("data-salon-theme-option") === id);
    button.setAttribute("aria-pressed", String(button.getAttribute("data-salon-theme-option") === id));
  });
}

function shouldExposeThemeStudio() {
  const body = document.body;
  if (!body) return false;
  return body.classList.contains("ask-lexi-dashboard") && String(body.dataset.role || "").trim().toLowerCase() === "admin";
}

function buildSwitcher() {
  if (document.getElementById("salonThemeSwitcher")) return;

  const shell = document.createElement("aside");
  shell.className = "salon-theme-switcher";
  shell.id = "salonThemeSwitcher";

  const head = document.createElement("div");
  head.className = "salon-theme-switcher-head";
  head.innerHTML = `
    <div>
      <strong>Theme Studio</strong>
      <small>Try a different salon look</small>
    </div>
    <button class="salon-theme-toggle" type="button" id="salonThemeToggleBtn" aria-expanded="true">Hide</button>
  `;

  const options = document.createElement("div");
  options.className = "salon-theme-options";
  options.id = "salonThemeOptions";
  options.innerHTML = THEMES.map(
    (theme) => `
      <button class="salon-theme-option" type="button" data-salon-theme-option="${theme.id}" aria-pressed="false">
        <span class="salon-theme-swatch" style="background:${theme.swatch}"></span>
        <strong>${theme.label}</strong>
        <small>${theme.description}</small>
      </button>
    `
  ).join("");

  shell.append(head, options);
  document.body.appendChild(shell);

  options.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest("[data-salon-theme-option]");
    if (!(button instanceof HTMLElement)) return;
    const themeId = String(button.getAttribute("data-salon-theme-option") || "").trim();
    if (!themeId) return;
    setTheme(themeId);
  });

  const toggle = head.querySelector("#salonThemeToggleBtn");
  toggle?.addEventListener("click", () => {
    const hidden = options.hasAttribute("hidden");
    if (hidden) {
      options.removeAttribute("hidden");
      toggle.textContent = "Hide";
      toggle.setAttribute("aria-expanded", "true");
    } else {
      options.setAttribute("hidden", "");
      toggle.textContent = "Show";
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function syncSwitcherVisibility() {
  const shell = document.getElementById("salonThemeSwitcher");
  if (!shell) return;
  shell.hidden = !shouldExposeThemeStudio();
}

document.addEventListener("DOMContentLoaded", () => {
  setTheme(getSavedTheme());
  buildSwitcher();
  syncSwitcherVisibility();
  const body = document.body;
  if (!body) return;
  const observer = new MutationObserver(() => {
    syncSwitcherVisibility();
  });
  observer.observe(body, { attributes: true, attributeFilter: ["data-role", "class"] });
});
