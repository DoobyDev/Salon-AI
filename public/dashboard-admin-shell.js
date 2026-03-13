import { clearServiceWorkerState } from "./pwa-runtime.js";
import { createDashboardSharedUtilsRuntime } from "./dashboard-shared-utils.js";
import { createAdminPlatformRuntime } from "./dashboard-admin-platform.js";
import { createAdminSupportRuntime } from "./dashboard-admin-support.js";
import { createAdminHubRuntime } from "./dashboard-admin-hub.js";
import { getBusinessHubModulesForRole } from "./dashboard-business-hub.js";

clearServiceWorkerState();

const AUTH_TOKEN_KEY = "salon_ai_token";
const AUTH_USER_KEY = "salon_ai_user";

const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
const userRaw = sessionStorage.getItem(AUTH_USER_KEY);
const user = token && userRaw ? JSON.parse(userRaw || "{}") : null;
const userRole = String(user?.role || "").trim().toLowerCase();

if (!token || !userRaw) {
  window.location.href = "/auth";
} else if (userRole !== "admin") {
  const fallbackRole = userRole || "subscriber";
  window.location.href = `/dashboard?role=${encodeURIComponent(fallbackRole)}`;
} else {
  const params = new URLSearchParams(window.location.search);
  const adminPage = String(params.get("adminPage") || "").trim().toLowerCase();

  const sharedUtils = createDashboardSharedUtilsRuntime();
  const formatMoney = (...args) => sharedUtils.formatMoney(...args);
  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  const formatDateShort = (value) => {
    if (!value) return "";
    try {
      return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
    } catch {
      return String(value);
    }
  };

  const dashActionStatus = document.getElementById("dashActionStatus");
  const logoutBtn = document.getElementById("logoutBtn");
  const adminAskLexiBtn = document.getElementById("adminAskLexiBtn");
  const freeSubscriberModal = document.getElementById("freeSubscriberModal");
  const freeSubscriberModalBackdrop = document.getElementById("freeSubscriberModalBackdrop");
  const freeSubscriberModalCloseBtn = document.getElementById("freeSubscriberModalCloseBtn");
  const freeSubscriberGrantForm = document.getElementById("freeSubscriberGrantForm");
  const freeSubscriberEmailInput = document.getElementById("freeSubscriberEmailInput");
  const freeSubscriberModalMessage = document.getElementById("freeSubscriberModalMessage");
  const freeSubscriberList = document.getElementById("freeSubscriberList");

  const state = {
    adminPlatformAnalytics: null,
    adminRevenueAnalytics: null,
    adminUsageAnalytics: null,
    adminAccountSupportResultsCache: [],
    adminAccountSupportSelectedId: "",
    adminAccountSupportSearchTimerId: null,
    freeSubscriberEntries: []
  };

  function setDashActionStatus(message = "", isError = false, timeoutMs = 2200) {
    if (!dashActionStatus) return;
    dashActionStatus.hidden = !message;
    dashActionStatus.textContent = String(message || "");
    dashActionStatus.className = `status-pill ${isError ? "status-negative" : "status-neutral"}`;
    if (timeoutMs > 0 && message) {
      window.clearTimeout(setDashActionStatus._timer);
      setDashActionStatus._timer = window.setTimeout(() => {
        if (dashActionStatus.textContent === String(message)) {
          dashActionStatus.hidden = true;
        }
      }, timeoutMs);
    }
  }

  function headers() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };
  }

  function setFreeSubscriberModalMessage(message = "", isError = false) {
    if (!freeSubscriberModalMessage) return;
    freeSubscriberModalMessage.textContent = String(message || "");
    freeSubscriberModalMessage.className = `form-message ${isError ? "status-negative" : "status-neutral"}`;
  }

  function renderFreeSubscriberEntries() {
    if (!freeSubscriberList) return;
    const entries = Array.isArray(state.freeSubscriberEntries) ? state.freeSubscriberEntries : [];
    if (!entries.length) {
      freeSubscriberList.innerHTML = '<div class="empty-state">No free subscriber emails added yet.</div>';
      return;
    }
    freeSubscriberList.innerHTML = entries
      .map(
        (entry) => `
          <article class="detail-card admin-free-subscriber-card">
            <div class="admin-free-subscriber-head">
              <div>
                <strong>${escapeHtml(String(entry?.email || ""))}</strong>
                <small>${escapeHtml(entry?.active ? "Active free lifetime grant" : "Removed - ends this calendar month")}</small>
              </div>
              <button class="btn btn-ghost btn-small" type="button" data-free-subscriber-remove="${escapeHtml(String(entry?.email || ""))}" ${
                entry?.active ? "" : "disabled"
              }>Remove free access</button>
            </div>
            <div class="admin-free-subscriber-meta">
              <small>${escapeHtml(`Granted: ${formatDateShort(entry?.grantedAt) || entry?.grantedAt || "Unknown"}`)}</small>
              <small>${escapeHtml(`Linked account: ${entry?.user?.name || entry?.user?.email || "Not signed up yet"}`)}</small>
              <small>${escapeHtml(`Subscription: ${entry?.user?.subscriptionPlan || (entry?.active ? "lifetime_free" : "free_ending")}`)}</small>
            </div>
          </article>
        `
      )
      .join("");
  }

  async function loadFreeSubscriberEntries() {
    const res = await fetch("/api/admin/free-subscriber-access", { headers: headers() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load free subscriber emails.");
    state.freeSubscriberEntries = Array.isArray(data?.entries) ? data.entries : [];
    renderFreeSubscriberEntries();
    return state.freeSubscriberEntries;
  }

  async function refreshAdminOverview() {
    await adminPlatformRuntime.loadAdminPlatformOverview();
  }

  async function openFreeSubscriberModal() {
    if (freeSubscriberModal) {
      freeSubscriberModal.hidden = false;
    }
    setFreeSubscriberModalMessage("");
    await loadFreeSubscriberEntries();
  }

  function closeFreeSubscriberModal() {
    if (freeSubscriberModal) {
      freeSubscriberModal.hidden = true;
    }
    setFreeSubscriberModalMessage("");
  }

  const businessHubModules = getBusinessHubModulesForRole({
    role: "admin",
    moduleDefinitionByKey: (key) => {
      const map = {
        business_profile: { label: "Business Information", howItHelps: "Core business setup for the platform." },
        staff: { label: "Staff Setup", howItHelps: "Team and rota administration." },
        frontdesk: { label: "Salon Features", howItHelps: "Customer-facing business features." },
        social: { label: "Social Media", howItHelps: "Public social links and brand touchpoints." },
        merch: { label: "Merch", howItHelps: "Retail and shipped product oversight." },
        accounting: { label: "Accounting", howItHelps: "Finance exports and bookkeeping support." },
        profitability: { label: "Finance", howItHelps: "Profitability and margin visibility." },
        operations: { label: "Cancellations", howItHelps: "Recovery and cancellation visibility." }
      };
      return map[key] || { label: key, howItHelps: "" };
    }
  });

  const adminSupportRuntime = createAdminSupportRuntime({
    win: window,
    doc: document,
    fetchImpl: fetch,
    getUserRole: () => "admin",
    headers,
    escapeHtml,
    formatDateShort,
    formatMoney,
    openManageForm: async () => null,
    loadAdminBusinessOptions: async () => {},
    reloadAdminManagedDashboard: async () => {},
    setDashActionStatus,
    syncAdminBusinessQueryParam: () => {},
    renderModuleNavigator: () => {},
    getCloseModulePopupActive: () => false,
    openInteractiveModulePopup: () => {
      window.location.href = "/dashboard?role=admin&adminPage=business_profile#adminHubDetailSection";
    },
    canManageBusinessModules: () => false,
    setAccountingStatus: setDashActionStatus,
    getManagedBusinessId: () => "",
    setManagedBusinessId: () => {},
    adminBusinessSelect: null,
    subscriberCalendarSection: null,
    adminAccountSearchForm: document.getElementById("adminAccountSearchForm"),
    adminAccountSearchInput: document.getElementById("adminAccountSearchInput"),
    adminAccountsTable: document.getElementById("adminAccountsTable"),
    adminAccountDetail: null,
    adminAccountEditForm: null,
    adminEditName: null,
    adminEditEmail: null,
    adminEditBusinessName: null,
    adminAccountEditMessage: document.getElementById("adminAccountEditMessage"),
    accountingBookingExportBtn: null,
    accountingPlatformExportBtn: null,
    withManagedBusiness: (url) => url,
    getAdminAccountSupportResultsCache: () => state.adminAccountSupportResultsCache,
    setAdminAccountSupportResultsCache: (value) => {
      state.adminAccountSupportResultsCache = Array.isArray(value) ? value : [];
    },
    getAdminAccountSupportSelectedId: () => state.adminAccountSupportSelectedId,
    setAdminAccountSupportSelectedId: (value) => {
      state.adminAccountSupportSelectedId = String(value || "");
    },
    getAdminAccountSupportSearchTimerId: () => state.adminAccountSupportSearchTimerId,
    setAdminAccountSupportSearchTimerId: (value) => {
      state.adminAccountSupportSearchTimerId = value ?? null;
    }
  });

  const adminPlatformRuntime = createAdminPlatformRuntime({
    win: window,
    doc: document,
    fetchImpl: fetch,
    getUserRole: () => "admin",
    headers,
    escapeHtml,
    formatMoney,
    formatDateShort,
    setDashActionStatus,
    renderAdminManagedBusinessSummary: () => {},
    parseExportFileName: (...args) => adminSupportRuntime.parseExportFileName(...args),
    adminPlatformMetricGrid: document.getElementById("adminPlatformMetricGrid"),
    adminRevenueSummaryGrid: document.getElementById("adminRevenueSummaryGrid"),
    adminRevenueMixChart: document.getElementById("adminRevenueMixChart"),
    adminRevenueHealthGauge: document.getElementById("adminRevenueHealthGauge"),
    adminRevenueYieldGauge: document.getElementById("adminRevenueYieldGauge"),
    adminRevenueTrendGraph: document.getElementById("adminRevenueTrendGraph"),
    adminRevenueMonthlyList: document.getElementById("adminRevenueMonthlyList"),
    adminRevenueSignalList: document.getElementById("adminRevenueSignalList"),
    adminRevenuePeriodPill: document.getElementById("adminRevenuePeriodPill"),
    adminRevenueNote: document.getElementById("adminRevenueNote"),
    adminUsageSummaryGrid: null,
    adminUsageHourlyList: null,
    adminUsageWeekdayList: null,
    adminUsageRoleGrid: null,
    adminUsageOperationsGrid: null,
    adminUsagePeriodPill: null,
    adminUsageNote: null,
    adminPlatformExportBtn: document.getElementById("adminPlatformExportBtn"),
    onManageFreeSubscribers: () => {
      openFreeSubscriberModal().catch((error) => {
        setFreeSubscriberModalMessage(error.message, true);
        if (freeSubscriberModal) freeSubscriberModal.hidden = false;
      });
    },
    getAdminPlatformAnalytics: () => state.adminPlatformAnalytics,
    setAdminPlatformAnalytics: (value) => {
      state.adminPlatformAnalytics = value;
    },
    getAdminRevenueAnalytics: () => state.adminRevenueAnalytics,
    setAdminRevenueAnalytics: (value) => {
      state.adminRevenueAnalytics = value;
    },
    getAdminUsageAnalytics: () => state.adminUsageAnalytics,
    setAdminUsageAnalytics: (value) => {
      state.adminUsageAnalytics = value;
    }
  });

  const adminHubRuntime = createAdminHubRuntime({
    getUserRole: () => "admin",
    getAdminPage: () => adminPage,
    escapeHtml,
    getBusinessHubModules: () => businessHubModules
  });

  logoutBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "/?logout=1";
  });

  adminAskLexiBtn?.addEventListener("click", () => {
    setDashActionStatus("Open a subscriber or customer preview from search if you want the full Ask Lexi dashboard context.", false, 3200);
  });

  freeSubscriberModalCloseBtn?.addEventListener("click", closeFreeSubscriberModal);
  freeSubscriberModalBackdrop?.addEventListener("click", closeFreeSubscriberModal);
  freeSubscriberGrantForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = String(freeSubscriberEmailInput?.value || "").trim().toLowerCase();
    if (!email) {
      setFreeSubscriberModalMessage("Enter an email address first.", true);
      return;
    }
    try {
      setFreeSubscriberModalMessage("Saving free subscriber email...");
      const res = await fetch("/api/admin/free-subscriber-access", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to save free subscriber email.");
      state.freeSubscriberEntries = Array.isArray(data?.entries) ? data.entries : [];
      renderFreeSubscriberEntries();
      if (freeSubscriberEmailInput) freeSubscriberEmailInput.value = "";
      setFreeSubscriberModalMessage("Free lifetime subscriber email saved.");
      await refreshAdminOverview();
    } catch (error) {
      setFreeSubscriberModalMessage(error.message, true);
    }
  });
  freeSubscriberList?.addEventListener("click", async (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest("[data-free-subscriber-remove]") : null;
    if (!(target instanceof HTMLElement)) return;
    const email = String(target.getAttribute("data-free-subscriber-remove") || "").trim().toLowerCase();
    if (!email) return;
    try {
      setFreeSubscriberModalMessage("Removing free subscriber access...");
      const res = await fetch(`/api/admin/free-subscriber-access/${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: headers()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to remove free subscriber access.");
      state.freeSubscriberEntries = Array.isArray(data?.entries) ? data.entries : [];
      renderFreeSubscriberEntries();
      setFreeSubscriberModalMessage("Free subscriber access removed. Renewal will be needed at month end.");
      await refreshAdminOverview();
    } catch (error) {
      setFreeSubscriberModalMessage(error.message, true);
    }
  });

  const adminHubDetailSection = document.getElementById("adminHubDetailSection");

  adminSupportRuntime.bindAdminSupportEvents();
  adminPlatformRuntime.bindAdminPlatformEvents();
  adminPlatformRuntime.loadAdminPlatformOverview();
  adminHubRuntime.renderAdminBusinessHub(
    document.getElementById("adminBusinessHubGrid"),
    adminHubDetailSection,
    {
      adminHubDetailKicker: document.getElementById("adminHubDetailKicker"),
      adminHubDetailTitle: document.getElementById("adminHubDetailTitle"),
      adminHubDetailSummary: document.getElementById("adminHubDetailSummary"),
      adminHubDetailInfoList: document.getElementById("adminHubDetailInfoList"),
      adminHubDetailJobsList: document.getElementById("adminHubDetailJobsList"),
      adminHubDetailOutcomesList: document.getElementById("adminHubDetailOutcomesList")
    }
  );

  if (adminPage && adminHubDetailSection) {
    window.requestAnimationFrame(() => {
      adminHubDetailSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}
