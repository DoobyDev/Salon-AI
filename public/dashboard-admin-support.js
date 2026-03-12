// Admin account tooling and accounting export runtime.
export function createAdminSupportRuntime(deps) {
  const {
    win = window,
    doc = document,
    fetchImpl = fetch,
    getUserRole,
    headers,
    escapeHtml,
    formatDateShort,
    formatMoney,
    openManageForm,
    loadAdminBusinessOptions,
    reloadAdminManagedDashboard,
    setDashActionStatus,
    syncAdminBusinessQueryParam,
    renderModuleNavigator,
    getCloseModulePopupActive,
    openInteractiveModulePopup,
    canManageBusinessModules,
    setAccountingStatus,
    getManagedBusinessId,
    setManagedBusinessId,
    adminBusinessSelect,
    subscriberCalendarSection,
    adminAccountSearchForm,
    adminAccountSearchInput,
    adminAccountsTable,
    adminAccountDetail,
    adminAccountEditForm,
    adminEditName,
    adminEditEmail,
    adminEditBusinessName,
    adminAccountEditMessage,
    accountingBookingExportBtn,
    accountingPlatformExportBtn,
    withManagedBusiness,
    getAdminAccountSupportResultsCache,
    setAdminAccountSupportResultsCache,
    getAdminAccountSupportSelectedId,
    setAdminAccountSupportSelectedId,
    getAdminAccountSupportSearchTimerId,
    setAdminAccountSupportSearchTimerId
  } = deps || {};

  function buildMockAdminAccounts(query = "") {
    const rows = [
      {
        id: "mock_subscriber_1",
        role: "subscriber",
        name: "Jade Mercer",
        email: "jade@lunalocks.co.uk",
        business: {
          id: "mock_biz_1",
          name: "Luna Locks Studio",
          city: "Manchester"
        },
        stats: {
          bookingCount: 184,
          revenue: 12640,
          planLabel: "growth",
          lastBookingAt: "2026-03-11T15:30:00.000Z"
        },
        recentVisits: [
          { service: "Balayage", businessName: "Luna Locks Studio", date: "2026-03-11" },
          { service: "Cut & Finish", businessName: "Luna Locks Studio", date: "2026-03-10" }
        ]
      },
      {
        id: "mock_subscriber_2",
        role: "subscriber",
        name: "Marco Ellis",
        email: "marco@atlasbarber.co.uk",
        business: {
          id: "mock_biz_2",
          name: "Atlas Barber Co.",
          city: "Liverpool"
        },
        stats: {
          bookingCount: 142,
          revenue: 9180,
          planLabel: "starter",
          lastBookingAt: "2026-03-11T11:10:00.000Z"
        },
        recentVisits: [
          { service: "Skin Fade", businessName: "Atlas Barber Co.", date: "2026-03-11" }
        ]
      },
      {
        id: "mock_customer_1",
        role: "customer",
        name: "Ava Hart",
        email: "ava.hart@example.com",
        business: {
          name: "Luna Locks Studio"
        },
        stats: {
          visitCount: 9,
          upcomingCount: 1,
          linkedBusinesses: 2,
          lastBookingAt: "2026-03-10T10:00:00.000Z"
        },
        recentVisits: [
          { service: "Glossing", businessName: "Luna Locks Studio", date: "2026-03-10" },
          { service: "Cut & Finish", businessName: "Atlas Barber Co.", date: "2026-02-22" }
        ]
      }
    ];
    const q = String(query || "").trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((account) => {
      const haystack = [
        account.name,
        account.email,
        account.business?.name,
        account.business?.city,
        account.role
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  function getAdminAccountQuery() {
    return String(adminAccountSearchInput?.value || "").trim();
  }

  function setAdminAccountMessage(text, mode = "neutral") {
    if (!adminAccountEditMessage) return;
    adminAccountEditMessage.textContent = String(text || "");
    adminAccountEditMessage.className = `form-message ${mode === "error" ? "status-negative" : mode === "success" ? "status-positive" : "status-neutral"}`;
  }

  function adminAccountSupportSelectedAccount() {
    const cache = Array.isArray(getAdminAccountSupportResultsCache?.()) ? getAdminAccountSupportResultsCache() : [];
    const selectedId = String(getAdminAccountSupportSelectedId?.() || "").trim();
    return cache.find((account) => String(account?.id || "") === selectedId) || null;
  }

  function roleLabel(role) {
    const value = String(role || "").trim().toLowerCase();
    return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "Account";
  }

  function isSubscriberAccount(account) {
    return String(account?.role || "").trim().toLowerCase() === "subscriber";
  }

  function isCustomerAccount(account) {
    return String(account?.role || "").trim().toLowerCase() === "customer";
  }

  function managedBusinessIdForAccount(account) {
    return String(account?.business?.id || "").trim();
  }

  function buildAccountPreviewUrl(account) {
    const url = new URL("/dashboard", win.location?.origin || "http://localhost");
    const accountRole = String(account?.role || "").trim().toLowerCase();
    url.searchParams.set("role", accountRole === "customer" ? "customer" : "subscriber");
    url.searchParams.set("adminPreview", "1");
    if (accountRole === "subscriber") {
      const businessId = managedBusinessIdForAccount(account);
      if (businessId) url.searchParams.set("businessId", businessId);
    }
    if (accountRole === "customer") {
      const customerEmail = String(account?.email || "").trim().toLowerCase();
      if (customerEmail) url.searchParams.set("customerEmail", customerEmail);
      if (account?.name) url.searchParams.set("customerName", String(account.name || "").trim());
    }
    return `${url.pathname}${url.search}${url.hash}`;
  }

  function renderAdminAccountsTable(cache, selectedId) {
    if (!adminAccountsTable) return;
    adminAccountsTable.innerHTML = cache.length
      ? cache.map((account) => `
          <article class="admin-row admin-account-result-row ${String(account?.id || "") === selectedId ? "is-selected" : ""}" data-admin-account-id="${escapeHtml(String(account?.id || ""))}" data-admin-account-open="dashboard">
            <div class="admin-account-result-main">
              <div>
                <strong>${escapeHtml(String(account?.name || "Account"))}</strong>
                <small>${escapeHtml(String(account?.email || ""))}</small>
              </div>
              <div class="admin-account-result-badges">
                <span class="status-pill">${escapeHtml(roleLabel(account?.role))}</span>
                <span class="status-pill">${escapeHtml(String(account?.business?.name || account?.business?.city || "No linked business"))}</span>
              </div>
            </div>
            <div class="admin-account-result-stats">
              <div>
                <strong>${escapeHtml(String(account?.stats?.bookingCount ?? account?.stats?.visitCount ?? 0))}</strong>
                <small>${escapeHtml(isSubscriberAccount(account) ? "bookings" : "visits")}</small>
              </div>
              <div>
                <strong>${escapeHtml(isSubscriberAccount(account) ? String(formatMoney?.(Number(account?.stats?.revenue || 0)) || "GBP 0") : String(account?.stats?.upcomingCount || 0))}</strong>
                <small>${escapeHtml(isSubscriberAccount(account) ? String(account?.stats?.planLabel || "no plan") : "upcoming bookings")}</small>
              </div>
              <div>
                <strong>${escapeHtml(String(formatDateShort?.(account?.stats?.lastBookingAt) || account?.stats?.lastBookingAt || "No recent booking"))}</strong>
                <small>${escapeHtml("last activity")}</small>
              </div>
            </div>
            <div class="admin-account-result-foot">
              <small>
                ${escapeHtml(
                  isSubscriberAccount(account)
                    ? `Open ${String(account?.business?.name || "subscriber")} dashboard preview`
                    : `Open ${String(account?.name || "customer")} dashboard preview`
                )}
              </small>
              <button class="btn btn-ghost btn-small" type="button" data-admin-account-action="open-dashboard">Open dashboard</button>
            </div>
          </article>
        `).join("")
      : '<div class="empty-state">No matching accounts found.</div>';
  }

  function renderAdminAccountDetailCard(account) {
    if (!adminAccountDetail) return;
    if (!account) {
      adminAccountDetail.innerHTML = '<div class="empty-state">Select an account to review and edit it.</div>';
      if (adminEditName) adminEditName.value = "";
      if (adminEditEmail) adminEditEmail.value = "";
      if (adminEditBusinessName) adminEditBusinessName.value = "";
      setAdminAccountMessage("");
      return;
    }

    const stats = account?.stats || {};
    const recentVisits = Array.isArray(account?.recentVisits) ? account.recentVisits : [];
    const isSubscriber = isSubscriberAccount(account);
    const managedBusinessId = managedBusinessIdForAccount(account);
    const primary = isSubscriber
      ? `${String(stats.bookingCount || 0)} bookings - ${String(formatMoney?.(Number(stats.revenue || 0)) || "GBP 0")}`
      : `${String(stats.visitCount || 0)} visits - ${String(stats.upcomingCount || 0)} upcoming`;
    const secondary = isSubscriber
      ? `${String(stats.planLabel || "no plan")} - ${String(account?.business?.city || "no city")}`
      : `${String(stats.linkedBusinesses || 0)} linked salons`;
    const detailRows = isSubscriber
      ? [
          ["Business", String(account?.business?.name || "No linked business")],
          ["City", String(account?.business?.city || "Not set")],
          ["Plan", String(stats.planLabel || "Not set")],
          ["Bookings", String(stats.bookingCount || 0)],
          ["Revenue", String(formatMoney?.(Number(stats.revenue || 0)) || "GBP 0")],
          ["Last booking", String(stats.lastBookingAt ? formatDateShort?.(stats.lastBookingAt) || stats.lastBookingAt : "No recent booking")]
        ]
      : [
          ["Linked salon", String(account?.business?.name || "No primary salon linked")],
          ["Visits", String(stats.visitCount || 0)],
          ["Upcoming", String(stats.upcomingCount || 0)],
          ["Linked salons", String(stats.linkedBusinesses || 0)],
          ["Last booking", String(stats.lastBookingAt ? formatDateShort?.(stats.lastBookingAt) || stats.lastBookingAt : "No recent booking")],
          ["Email", String(account?.email || "No email")]
        ];

    adminAccountDetail.innerHTML = `
      <article class="detail-card admin-account-hero-card">
        <p class="kicker">${escapeHtml(roleLabel(account?.role))}</p>
        <strong>${escapeHtml(String(account?.name || "Account"))}</strong>
        <small>${escapeHtml(String(account?.email || ""))}</small>
        <small>${account?.business?.name ? `${escapeHtml(String(account.business.name || ""))}` : escapeHtml(isSubscriber ? "Subscriber account" : "Customer account")}</small>
      </article>
      <article class="detail-card admin-account-summary-card">
        <strong>Snapshot</strong>
        <div class="admin-account-stat-grid">
          <div class="admin-account-stat">
            <span>Primary</span>
            <strong>${escapeHtml(primary)}</strong>
          </div>
          <div class="admin-account-stat">
            <span>Secondary</span>
            <strong>${escapeHtml(secondary)}</strong>
          </div>
        </div>
      </article>
      <article class="detail-card admin-account-data-card">
        <strong>${escapeHtml(isSubscriber ? "Subscriber data" : "Customer data")}</strong>
        <div class="admin-account-data-list">
          ${detailRows
            .map(
              ([label, value]) => `
                <div class="admin-account-data-row">
                  <span>${escapeHtml(label)}</span>
                  <strong>${escapeHtml(value)}</strong>
                </div>
              `
            )
            .join("")}
        </div>
      </article>
      <article class="detail-card">
        <strong>Recent activity</strong>
        ${recentVisits.length
          ? recentVisits
              .slice(0, 4)
              .map((visit) => `<small>${escapeHtml(String(visit?.service || "Service"))} - ${escapeHtml(String(visit?.businessName || "Salon"))} - ${escapeHtml(String(formatDateShort?.(visit?.date) || visit?.date || ""))}</small>`)
              .join("")
          : `<small>${escapeHtml(String(stats.lastBookingAt ? formatDateShort?.(stats.lastBookingAt) : "No recent activity available."))}</small>`}
      </article>
      ${(isSubscriber || isCustomerAccount(account))
        ? `
          <article class="detail-card">
            <strong>Managed actions</strong>
            <div class="agenda-item-actions">
              <button class="btn btn-ghost btn-small" type="button" data-admin-account-action="open-dashboard">Open ${isSubscriber ? "subscriber" : "customer"} dashboard</button>
              ${isSubscriber && managedBusinessId ? '<button class="btn btn-ghost btn-small" type="button" data-admin-account-action="open-profile">Edit business info</button>' : ""}
            </div>
          </article>
        `
        : ""}
    `;

    if (adminEditName) adminEditName.value = String(account?.name || "");
    if (adminEditEmail) adminEditEmail.value = String(account?.email || "");
    if (adminEditBusinessName) {
      adminEditBusinessName.value = String(account?.business?.name || "");
      adminEditBusinessName.disabled = !isSubscriber;
    }
    setAdminAccountMessage("");
  }

  function renderAdminAccountSupportModule() {
    if (getUserRole?.() !== "admin" || !adminAccountsTable) return;
    const cache = Array.isArray(getAdminAccountSupportResultsCache?.()) ? getAdminAccountSupportResultsCache() : [];
    const selectedId = String(getAdminAccountSupportSelectedId?.() || "").trim();
    renderAdminAccountsTable(cache, selectedId);
    if (adminAccountDetail) {
      renderAdminAccountDetailCard(adminAccountSupportSelectedAccount());
    }
  }

  async function loadAdminAccountSupport(query = getAdminAccountQuery()) {
    if (getUserRole?.() !== "admin") return;
    const q = String(query || "").trim();
    const endpoint = q ? `/api/admin/accounts?query=${encodeURIComponent(q)}` : "/api/admin/accounts";
    let accounts = [];
    let usingMockData = false;
    try {
      const res = await fetchImpl(endpoint, { headers: headers?.() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load admin accounts.");
      accounts = Array.isArray(data?.accounts) ? data.accounts : [];
    } catch {
      usingMockData = true;
    }
    if (!accounts.length) {
      accounts = buildMockAdminAccounts(q);
      usingMockData = true;
    }
    setAdminAccountSupportResultsCache?.(accounts);
    const selectedId = String(getAdminAccountSupportSelectedId?.() || "").trim();
    const selectedStillExists = accounts.some((account) => String(account?.id || "") === selectedId);
    setAdminAccountSupportSelectedId?.(selectedStillExists ? selectedId : String(accounts[0]?.id || "").trim());
    renderAdminAccountSupportModule();
    if (usingMockData) {
      setAdminAccountMessage("Showing mock account results so the admin search panel stays populated.", "neutral");
    }
  }

  async function updateAdminAccount(values = {}) {
    const account = adminAccountSupportSelectedAccount();
    if (!account) return;
    const res = await fetchImpl(`/api/admin/accounts/${encodeURIComponent(String(account.id || ""))}`, {
      method: "PATCH",
      headers: headers?.(),
      body: JSON.stringify(values)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to update account.");
    if (isSubscriberAccount(account)) {
      await loadAdminBusinessOptions?.();
      if (managedBusinessIdForAccount(account) === String(getManagedBusinessId?.() || "").trim()) {
        await reloadAdminManagedDashboard?.();
      }
    }
    await loadAdminAccountSupport(getAdminAccountQuery());
    setDashActionStatus?.(`${isSubscriberAccount(account) ? "Subscriber" : "Customer"} account updated.`);
    setAdminAccountMessage("Account saved.", "success");
  }

  async function openAdminAccountSupportEditForm() {
    const account = adminAccountSupportSelectedAccount();
    if (!account) return;
    const isSubscriber = isSubscriberAccount(account);
    const fields = [
      { id: "name", label: "Name", required: true, value: String(account?.name || "") },
      { id: "email", label: "Email", required: true, value: String(account?.email || "") }
    ];
    if (isSubscriber) {
      fields.push({ id: "businessName", label: "Business Name", required: true, value: String(account?.business?.name || "") });
    }
    const values = await openManageForm?.({
      title: `Edit ${isSubscriber ? "Subscriber" : "Customer"} Account`,
      submitLabel: "Save Changes",
      fields
    });
    if (!values) return;
    await updateAdminAccount(values);
  }

  function parseExportFileName(disposition, fallback = "accounting_export.csv") {
    const value = String(disposition || "");
    const match = value.match(/filename="?([^";]+)"?/i);
    return match?.[1] ? match[1] : fallback;
  }

  async function runAccountingExport(url, button, successMessage, options = {}) {
    const requireManagedBusiness = options.requireManagedBusiness !== false;
    if (requireManagedBusiness && !canManageBusinessModules?.()) {
      setAccountingStatus?.("Select a managed business before exporting accounting data.", true);
      return;
    }
    setAccountingStatus?.("Preparing accounting export...");
    if (button) button.disabled = true;
    try {
      const res = await fetchImpl(url, { headers: headers?.() });
      if (!res.ok) {
        let message = "Unable to export accounting CSV.";
        try {
          const data = await res.json();
          message = data.error || message;
        } catch {
          // Ignore parse error and keep fallback message.
        }
        throw new Error(message);
      }
      const fileName = parseExportFileName(res.headers.get("content-disposition"), "accounting_export.csv");
      const blob = await res.blob();
      const objectUrl = win.URL.createObjectURL(blob);
      const a = doc.createElement("a");
      a.href = objectUrl;
      a.download = fileName;
      doc.body.appendChild(a);
      a.click();
      a.remove();
      win.URL.revokeObjectURL(objectUrl);
      setAccountingStatus?.(successMessage || "Accounting CSV exported.");
    } catch (error) {
      setAccountingStatus?.(error.message, true);
    } finally {
      if (button) button.disabled = false;
    }
  }

  function bindAdminSupportEvents() {
    adminAccountSearchInput?.addEventListener("input", () => {
      if (getUserRole?.() !== "admin") return;
      const timerId = getAdminAccountSupportSearchTimerId?.();
      if (timerId) win.clearTimeout(timerId);
      const nextTimer = win.setTimeout(() => {
        loadAdminAccountSupport(getAdminAccountQuery()).catch((error) => {
          setAdminAccountMessage(error.message, "error");
        });
      }, 220);
      setAdminAccountSupportSearchTimerId?.(nextTimer);
    });

    adminAccountSearchForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (getUserRole?.() !== "admin") return;
      try {
        await loadAdminAccountSupport(getAdminAccountQuery());
      } catch (error) {
        setAdminAccountMessage(error.message, "error");
      }
    });

    adminAccountsTable?.addEventListener("click", (event) => {
      const row = event.target instanceof HTMLElement ? event.target.closest("[data-admin-account-id]") : null;
      if (!(row instanceof HTMLElement)) return;
      const accountId = String(row.getAttribute("data-admin-account-id") || "").trim();
      setAdminAccountSupportSelectedId?.(accountId);
      renderAdminAccountSupportModule();
      const account = adminAccountSupportSelectedAccount();
      if (!account) return;
      const targetUrl = buildAccountPreviewUrl(account);
      if (win.location) {
        win.location.href = targetUrl;
      }
      setDashActionStatus?.(`Opening ${account.name || (isSubscriberAccount(account) ? account.business?.name : "customer")} dashboard preview.`);
    });

    adminAccountDetail?.addEventListener("click", async (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest("[data-admin-account-action]") : null;
      if (!(target instanceof HTMLElement)) return;
      const action = String(target.getAttribute("data-admin-account-action") || "").trim();
      const account = adminAccountSupportSelectedAccount();
      if (!account) return;
      const isSubscriber = isSubscriberAccount(account);
      const managedBusinessId = managedBusinessIdForAccount(account);
      try {
        if (action === "open-dashboard" && (isSubscriber || isCustomerAccount(account))) {
          if (isSubscriber && managedBusinessId) {
            setManagedBusinessId?.(managedBusinessId);
            if (adminBusinessSelect) adminBusinessSelect.value = managedBusinessId;
          }
          const targetUrl = buildAccountPreviewUrl(account);
          if (win.location) {
            win.location.href = targetUrl;
          }
          setDashActionStatus?.(`Opening ${account.name || (isSubscriber ? account.business?.name : "customer")} dashboard preview.`);
          return;
        }
        if (action === "open-profile" && isSubscriber && managedBusinessId) {
          setManagedBusinessId?.(managedBusinessId);
          if (adminBusinessSelect) adminBusinessSelect.value = managedBusinessId;
          syncAdminBusinessQueryParam?.();
          await reloadAdminManagedDashboard?.();
          openInteractiveModulePopup?.("business_information");
        }
      } catch (error) {
        setDashActionStatus?.(error.message, true);
      }
    });

    adminAccountEditForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const account = adminAccountSupportSelectedAccount();
      if (!account) {
        setAdminAccountMessage("Select an account first.", "error");
        return;
      }
      try {
        setAdminAccountMessage("Saving...", "neutral");
        await updateAdminAccount({
          name: String(adminEditName?.value || "").trim(),
          email: String(adminEditEmail?.value || "").trim(),
          businessName: isSubscriberAccount(account) ? String(adminEditBusinessName?.value || "").trim() : ""
        });
      } catch (error) {
        setAdminAccountMessage(error.message, "error");
      }
    });

    accountingBookingExportBtn?.addEventListener("click", async () => {
      await runAccountingExport(
        withManagedBusiness?.("/api/accounting-integrations/export?scope=business&format=csv"),
        accountingBookingExportBtn,
        "Booking accounting CSV exported.",
        { requireManagedBusiness: true }
      );
    });

    accountingPlatformExportBtn?.addEventListener("click", async () => {
      await runAccountingExport(
        "/api/accounting-integrations/export?scope=platform&format=csv",
        accountingPlatformExportBtn,
        "Platform revenue CSV exported.",
        { requireManagedBusiness: false }
      );
    });

    if (getUserRole?.() === "admin" && (adminAccountsTable || adminAccountDetail)) {
      loadAdminAccountSupport().catch((error) => {
        setAdminAccountMessage(error.message, "error");
      });
    }
  }

  return {
    adminAccountSupportSelectedAccount,
    renderAdminAccountSupportModule,
    loadAdminAccountSupport,
    openAdminAccountSupportEditForm,
    parseExportFileName,
    runAccountingExport,
    bindAdminSupportEvents
  };
}
