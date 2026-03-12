// Shared request/header helpers for dashboard runtimes.
export function createDashboardRequestUtilsRuntime({
  getToken,
  getUserRole,
  getAuthRole,
  getPreviewCustomerEmail,
  getManagedBusinessId
}) {
  function headers() {
    return {
      Authorization: `Bearer ${getToken() || ""}`,
      "Content-Type": "application/json"
    };
  }

  function withManagedBusiness(path) {
    const authRole = typeof getAuthRole === "function" ? getAuthRole() : getUserRole();
    if (authRole !== "admin") return path;
    const scope = String(getManagedBusinessId() || "").trim();
    if (!scope) return path;
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}businessId=${encodeURIComponent(scope)}`;
  }

  function withCustomerPreview(path) {
    const authRole = typeof getAuthRole === "function" ? getAuthRole() : getUserRole();
    if (authRole !== "admin") return path;
    const customerEmail = String(getPreviewCustomerEmail?.() || "").trim().toLowerCase();
    if (!customerEmail) return path;
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}customerEmail=${encodeURIComponent(customerEmail)}`;
  }

  function canManageBusinessModules() {
    if (getUserRole() === "subscriber") return true;
    const authRole = typeof getAuthRole === "function" ? getAuthRole() : getUserRole();
    if (authRole === "admin") {
      return Boolean(String(getManagedBusinessId() || "").trim());
    }
    return false;
  }

  return {
    headers,
    withManagedBusiness,
    withCustomerPreview,
    canManageBusinessModules
  };
}
