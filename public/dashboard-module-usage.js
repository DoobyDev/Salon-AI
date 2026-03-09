// Local module usage tracking (per role) for lightweight UX hints.
export function createModuleUsageRuntime({ getRole, storage = window.localStorage }) {
  function moduleUsageStorageKey() {
    return `dashboard:module-usage:v1:${String(getRole?.() || "guest")}`;
  }

  function loadModuleUsageMap() {
    try {
      const parsed = JSON.parse(storage.getItem(moduleUsageStorageKey()) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveModuleUsageMap(map) {
    try {
      storage.setItem(moduleUsageStorageKey(), JSON.stringify(map || {}));
    } catch {
      // Ignore localStorage errors.
    }
  }

  function markModuleUsed(moduleKey, mode = "open") {
    const key = String(moduleKey || "").trim();
    if (!key) return;
    const map = loadModuleUsageMap();
    const prev = map[key] && typeof map[key] === "object" ? map[key] : {};
    map[key] = {
      opens: Math.max(0, Number(prev.opens || 0)) + (mode === "open" ? 1 : 0),
      focuses: Math.max(0, Number(prev.focuses || 0)) + (mode === "focus" ? 1 : 0),
      lastMode: mode,
      lastUsedAt: new Date().toISOString()
    };
    saveModuleUsageMap(map);
  }

  function moduleUsageSummary(mod) {
    const key = String(mod?.key || "").trim();
    const row = loadModuleUsageMap()[key];
    if (!row || !row.lastUsedAt) {
      return { label: "Not used yet", detail: "Open this popup to start using it today." };
    }
    const ts = new Date(row.lastUsedAt);
    const timeLabel = Number.isFinite(ts.getTime()) ? ts.toLocaleString("en-GB") : "Recently";
    const opens = Number(row.opens || 0);
    return {
      label: opens > 0 ? `${opens} popup open${opens === 1 ? "" : "s"}` : "Viewed in dashboard",
      detail: `Last used ${timeLabel}`
    };
  }

  return {
    moduleUsageStorageKey,
    loadModuleUsageMap,
    saveModuleUsageMap,
    markModuleUsed,
    moduleUsageSummary
  };
}
