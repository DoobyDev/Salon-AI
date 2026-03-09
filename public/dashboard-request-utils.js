// Shared request/header helpers for dashboard runtimes.
export function createDashboardRequestUtilsRuntime({
  getToken,
  getUserRole,
  getManagedBusinessId
}) {
  function headers() {
    return {
      Authorization: `Bearer ${getToken() || ""}`,
      "Content-Type": "application/json"
    };
  }

  function withManagedBusiness(path) {
    if (getUserRole() !== "admin") return path;
    const scope = String(getManagedBusinessId() || "").trim();
    if (!scope) return path;
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}businessId=${encodeURIComponent(scope)}`;
  }

  function canManageBusinessModules() {
    if (getUserRole() === "subscriber") return true;
    if (getUserRole() === "admin") {
      return Boolean(String(getManagedBusinessId() || "").trim());
    }
    return false;
  }

  return {
    headers,
    withManagedBusiness,
    canManageBusinessModules
  };
}
