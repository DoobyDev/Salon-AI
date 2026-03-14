import { createAdminHubRuntime } from "./dashboard-admin-hub.js?v=20260313-admin11";
import { getBusinessHubModulesForRole } from "./dashboard-business-hub.js?v=20260313-admin6";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const subscriberBusinessHubGrid = document.getElementById("subscriberBusinessHubGrid");

if (subscriberBusinessHubGrid) {
  const runtime = createAdminHubRuntime({
    getUserRole: () => "subscriber",
    escapeHtml,
    getBusinessHubModules: () => getBusinessHubModulesForRole({ role: "subscriber" })
  });

  runtime.bindBusinessHubGrid(
    subscriberBusinessHubGrid,
    getBusinessHubModulesForRole({ role: "subscriber" })
  );
}
