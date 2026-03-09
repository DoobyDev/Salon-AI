const AUTH_USER_KEY = "salon_ai_user";

const ROLE_SECTION_MAP = {
  subscriber: {
    hero: ["dashboardOverviewSection"],
    primary: ["subscriberCalendarSection", "bookingOperationsSection"],
    secondary: ["dashboardQuickActionsSection"]
  },
  customer: {
    hero: ["dashboardOverviewSection"],
    primary: ["customerSearchSection", "customerReceptionSection", "customerLexiCalendarSection"],
    secondary: ["customerSlotsSection", "customerHistorySection"]
  },
  admin: {
    hero: ["dashboardOverviewSection"],
    primary: ["adminPlatformSection"],
    secondary: []
  }
};

function detectRole() {
  const roleFromBody = String(document.body?.getAttribute("data-role") || "").trim().toLowerCase();
  if (roleFromBody) return roleFromBody;

  try {
    const raw = sessionStorage.getItem(AUTH_USER_KEY);
    const user = raw ? JSON.parse(raw) : null;
    const roleFromSession = String(user?.role || "").trim().toLowerCase();
    if (roleFromSession) return roleFromSession;
  } catch {}

  const params = new URLSearchParams(window.location.search);
  const roleFromQuery = String(params.get("role") || "").trim().toLowerCase();
  if (roleFromQuery) return roleFromQuery;
  return "subscriber";
}

function createShell(main) {
  let shell = document.getElementById("dashboardResetShell");
  if (shell) return shell;
  shell = document.createElement("div");
  shell.id = "dashboardResetShell";
  shell.className = "dashboard-reset-shell";

  const hero = document.createElement("div");
  hero.id = "dashboardResetHero";
  hero.className = "dashboard-reset-hero";

  const workspace = document.createElement("div");
  workspace.id = "dashboardResetWorkspace";
  workspace.className = "dashboard-reset-workspace";

  const primary = document.createElement("div");
  primary.id = "dashboardResetPrimary";
  primary.className = "dashboard-reset-primary";

  const secondary = document.createElement("aside");
  secondary.id = "dashboardResetSecondary";
  secondary.className = "dashboard-reset-secondary";

  const vault = document.createElement("div");
  vault.id = "dashboardResetVault";
  vault.className = "dashboard-reset-vault";
  vault.hidden = true;
  vault.setAttribute("aria-hidden", "true");

  workspace.append(primary, secondary);
  shell.append(hero, workspace, vault);
  main.prepend(shell);
  return shell;
}

function ensureVisible(section) {
  if (!(section instanceof HTMLElement)) return;
  section.hidden = false;
  section.style.removeProperty("display");
  section.removeAttribute("aria-hidden");
  section.setAttribute("data-reset-visible", "true");
}

function hideInVault(section, vault) {
  if (!(section instanceof HTMLElement) || !(vault instanceof HTMLElement)) return;
  section.hidden = true;
  section.style.display = "none";
  section.setAttribute("aria-hidden", "true");
  section.setAttribute("data-reset-visible", "false");
  vault.appendChild(section);
}

function mountSection(sectionId, target) {
  const section = document.getElementById(sectionId);
  if (!(section instanceof HTMLElement) || !(target instanceof HTMLElement)) return;
  ensureVisible(section);
  target.appendChild(section);
}

function applyDashboardResetLayout() {
  const main = document.getElementById("dashboardMain");
  if (!(main instanceof HTMLElement)) return;

  const role = detectRole();
  const config = ROLE_SECTION_MAP[role] || ROLE_SECTION_MAP.subscriber;
  const shell = createShell(main);
  const hero = document.getElementById("dashboardResetHero");
  const primary = document.getElementById("dashboardResetPrimary");
  const secondary = document.getElementById("dashboardResetSecondary");
  const vault = document.getElementById("dashboardResetVault");
  if (!(hero instanceof HTMLElement) || !(primary instanceof HTMLElement) || !(secondary instanceof HTMLElement) || !(vault instanceof HTMLElement)) return;

  const visibleIds = new Set([...(config.hero || []), ...(config.primary || []), ...(config.secondary || [])]);
  const allSections = Array.from(main.children).filter((node) => node instanceof HTMLElement && node.id !== "dashboardResetShell");

  allSections.forEach((section) => {
    if (!(section instanceof HTMLElement)) return;
    if (visibleIds.has(section.id)) return;
    hideInVault(section, vault);
  });

  (config.hero || []).forEach((id) => mountSection(id, hero));
  (config.primary || []).forEach((id) => mountSection(id, primary));
  (config.secondary || []).forEach((id) => mountSection(id, secondary));

  secondary.hidden = !(config.secondary || []).length;
  secondary.setAttribute("aria-hidden", secondary.hidden ? "true" : "false");

  main.setAttribute("data-reset-active", "true");
  main.setAttribute("data-reset-role", role);
  document.body?.setAttribute("data-dashboard-reset-active", "true");
}

let resetObserver = null;
let resetTimer = null;

function queueDashboardReset() {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(applyDashboardResetLayout);
  });
}

function installResetObserver() {
  if (resetObserver || !(document.body instanceof HTMLElement)) return;
  resetObserver = new MutationObserver(() => {
    queueDashboardReset();
  });
  resetObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-role"]
  });
}

function runDashboardReset() {
  queueDashboardReset();
  installResetObserver();
  if (resetTimer) window.clearTimeout(resetTimer);
  resetTimer = window.setTimeout(queueDashboardReset, 250);
  window.setTimeout(queueDashboardReset, 900);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runDashboardReset, { once: true });
} else {
  runDashboardReset();
}
