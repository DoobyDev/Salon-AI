// Admin account support and accounting export runtime.
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
    adminAccountSupportSection,
    adminAccountSupportScope,
    adminAccountSupportSearch,
    adminAccountSupportRefreshBtn,
    adminAccountSupportResults,
    adminAccountSupportDetail,
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

  function adminAccountSupportSelectedAccount() {
    const cache = Array.isArray(getAdminAccountSupportResultsCache?.()) ? getAdminAccountSupportResultsCache() : [];
    const selectedId = String(getAdminAccountSupportSelectedId?.() || "").trim();
    return cache.find((account) => String(account?.id || "") === selectedId) || null;
  }

  function renderAdminAccountSupportModule() {
    if (getUserRole?.() !== "admin" || !adminAccountSupportSection) return;
    const selected = adminAccountSupportSelectedAccount();
    const cache = Array.isArray(getAdminAccountSupportResultsCache?.()) ? getAdminAccountSupportResultsCache() : [];
    const selectedId = String(getAdminAccountSupportSelectedId?.() || "").trim();
    if (adminAccountSupportScope) {
      adminAccountSupportScope.textContent = selected
        ? `${selected.role === "subscriber" ? "Subscriber" : "Customer"} account loaded`
        : "Admin support popup";
    }
    if (adminAccountSupportResults) {
      if (!cache.length) {
        adminAccountSupportResults.innerHTML = `
          <div class="admin-account-support-detail-empty">
            <div>
              <strong>No accounts loaded yet</strong>
              <p>Search for a subscriber or customer account to review it here.</p>
            </div>
          </div>
        `;
      } else {
        adminAccountSupportResults.innerHTML = cache.map((account) => {
          const isSelected = String(account?.id || "") === selectedId;
          const summary = account?.role === "subscriber"
            ? [account?.business?.name, account?.business?.city, account?.business?.country].filter(Boolean).join(" • ")
            : `Visits ${Number(account?.stats?.visitCount || 0)} • Linked salons ${Number(account?.stats?.linkedBusinesses || 0)}`;
          return `
            <button type="button" class="admin-account-support-card${isSelected ? " is-selected" : ""}" data-admin-account-id="${escapeHtml(String(account?.id || ""))}">
              <div class="admin-account-support-card-head">
                <strong>${escapeHtml(String(account?.name || "Unnamed account"))}</strong>
                <span class="admin-account-support-role-pill is-${escapeHtml(String(account?.role || "").toLowerCase())}">${escapeHtml(String(account?.role || "account"))}</span>
              </div>
              <small>${escapeHtml(String(account?.email || ""))}</small>
              <div class="admin-account-support-card-row">
                <span class="admin-account-support-stat-pill">${escapeHtml(summary || "Open this account")}</span>
                <small>${escapeHtml(account?.createdAt ? formatDateShort?.(account.createdAt) : "")}</small>
              </div>
            </button>
          `;
        }).join("");
      }
    }
    if (adminAccountSupportDetail) {
      if (!selected) {
        adminAccountSupportDetail.innerHTML = `
          <div class="admin-account-support-detail-empty">
            <div>
              <strong>Select an account</strong>
              <p>Use this popup to search, review, and edit subscriber or customer accounts.</p>
            </div>
          </div>
        `;
        return;
      }
      const stats = selected?.stats || {};
      const subscriberMeta = selected?.role === "subscriber"
        ? [selected?.business?.name, selected?.business?.type, selected?.business?.city, selected?.business?.country].filter(Boolean).join(" • ")
        : "";
      const recentVisits = Array.isArray(selected?.recentVisits) ? selected.recentVisits : [];
      const visitRows = recentVisits.length
        ? recentVisits.map((visit) => `
            <div class="admin-account-support-visit-row">
              <div>
                <strong>${escapeHtml(String(visit?.businessName || visit?.service || "Visit"))}</strong>
                <small>${escapeHtml([visit?.service, visit?.date, visit?.time].filter(Boolean).join(" • "))}</small>
              </div>
              <small>${escapeHtml(String(visit?.status || ""))}</small>
            </div>
          `).join("")
        : `<div class="admin-account-support-visit-row"><div><strong>No recent visits</strong><small>This account has no recent linked activity yet.</small></div></div>`;
      adminAccountSupportDetail.innerHTML = `
        <div class="admin-account-support-card-head">
          <div>
            <strong>${escapeHtml(String(selected?.name || "Unnamed account"))}</strong>
            <div class="admin-account-support-card-row">
              <span class="admin-account-support-role-pill is-${escapeHtml(String(selected?.role || "").toLowerCase())}">${escapeHtml(String(selected?.role || "account"))}</span>
              <small>${escapeHtml(String(selected?.email || ""))}</small>
            </div>
            ${subscriberMeta ? `<small>${escapeHtml(subscriberMeta)}</small>` : ""}
          </div>
          <div class="admin-account-support-action-row">
            ${selected?.role === "subscriber" && selected?.business?.id ? '<button class="btn" type="button" data-admin-account-action="open-dashboard">Open Dashboard</button>' : ""}
            ${selected?.role === "subscriber" && selected?.business?.id ? '<button class="btn btn-ghost" type="button" data-admin-account-action="open-profile">Edit Business Info</button>' : ""}
            <button class="btn btn-ghost" type="button" data-admin-account-action="edit-account">Edit Account</button>
          </div>
        </div>
        <div class="admin-account-support-stats">
          <article>
            <p>${escapeHtml(selected?.role === "subscriber" ? "Bookings" : "Visits")}</p>
            <strong>${escapeHtml(String(stats.visitCount || stats.bookingCount || 0))}</strong>
          </article>
          <article>
            <p>${escapeHtml(selected?.role === "subscriber" ? "Active Plan" : "Upcoming")}</p>
            <strong>${escapeHtml(String(stats.planLabel || stats.upcomingCount || "0"))}</strong>
          </article>
          <article>
            <p>${escapeHtml(selected?.role === "subscriber" ? "Revenue Signal" : "Linked Salons")}</p>
            <strong>${escapeHtml(selected?.role === "subscriber" ? formatMoney?.(Number(stats.revenue || 0)) : String(stats.linkedBusinesses || 0))}</strong>
          </article>
        </div>
        <section class="admin-account-support-visit-list">
          <p>${escapeHtml(selected?.role === "subscriber" ? "Subscriber snapshot" : "Recent visits")}</p>
          ${selected?.role === "subscriber"
            ? `
              <div class="admin-account-support-visit-row">
                <div>
                  <strong>${escapeHtml(String(selected?.business?.name || "Subscriber business"))}</strong>
                  <small>${escapeHtml(String(stats.planStatus || "No billing data"))}</small>
                </div>
                <small>${escapeHtml(String(stats.lastBookingAt ? formatDateShort?.(stats.lastBookingAt) : "No recent booking"))}</small>
              </div>
              <div class="admin-account-support-visit-row">
                <div>
                  <strong>Managed dashboard access</strong>
                  <small>Open their Booking Diary and Business Hub in the admin dashboard below.</small>
                </div>
              </div>
            `
            : visitRows}
        </section>
        <section class="admin-account-support-notes">
          <p>${escapeHtml(selected?.role === "subscriber" ? "Admin note" : "Customer note")}</p>
          <strong>${escapeHtml(selected?.role === "subscriber"
            ? "Dashboard edits continue through the managed subscriber views below."
            : "Editing the account here keeps future customer sign-in and visit history aligned.")}</strong>
        </section>
      `;
    }
  }

  async function loadAdminAccountSupport(query = adminAccountSupportSearch?.value || "") {
    if (getUserRole?.() !== "admin") return;
    const q = String(query || "").trim();
    const endpoint = q ? `/api/admin/accounts?query=${encodeURIComponent(q)}` : "/api/admin/accounts";
    const res = await fetchImpl(endpoint, { headers: headers?.() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load admin account support data.");
    const accounts = Array.isArray(data?.accounts) ? data.accounts : [];
    setAdminAccountSupportResultsCache?.(accounts);
    const selectedId = String(getAdminAccountSupportSelectedId?.() || "").trim();
    const selectedStillExists = accounts.some((account) => String(account?.id || "") === selectedId);
    setAdminAccountSupportSelectedId?.(
      selectedStillExists ? selectedId : String(accounts[0]?.id || "").trim()
    );
    renderAdminAccountSupportModule();
  }

  async function openAdminAccountSupportEditForm() {
    const account = adminAccountSupportSelectedAccount();
    if (!account) return;
    const fields = [
      { id: "name", label: "Name", required: true, value: String(account?.name || "") },
      { id: "email", label: "Email", required: true, value: String(account?.email || "") }
    ];
    if (account.role === "subscriber") {
      fields.push({ id: "businessName", label: "Business Name", required: true, value: String(account?.business?.name || "") });
    }
    const values = await openManageForm?.({
      title: `Edit ${account.role === "subscriber" ? "Subscriber" : "Customer"} Account`,
      submitLabel: "Save Changes",
      fields
    });
    if (!values) return;
    const res = await fetchImpl(`/api/admin/accounts/${encodeURIComponent(String(account.id || ""))}`, {
      method: "PATCH",
      headers: headers?.(),
      body: JSON.stringify(values)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to update account.");
    if (account.role === "subscriber") {
      await loadAdminBusinessOptions?.();
      if (String(account?.business?.id || "") === String(getManagedBusinessId?.() || "").trim()) {
        await reloadAdminManagedDashboard?.();
      }
    }
    await loadAdminAccountSupport(adminAccountSupportSearch?.value || "");
    setDashActionStatus?.(`${account.role === "subscriber" ? "Subscriber" : "Customer"} account updated.`);
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
    adminAccountSupportRefreshBtn?.addEventListener("click", async () => {
      if (getUserRole?.() !== "admin") return;
      try {
        await loadAdminAccountSupport(adminAccountSupportSearch?.value || "");
        setDashActionStatus?.("Account support refreshed.");
      } catch (error) {
        setDashActionStatus?.(error.message, true);
      }
    });

    adminAccountSupportSearch?.addEventListener("input", () => {
      if (getUserRole?.() !== "admin") return;
      const timerId = getAdminAccountSupportSearchTimerId?.();
      if (timerId) win.clearTimeout(timerId);
      const nextTimer = win.setTimeout(() => {
        loadAdminAccountSupport(adminAccountSupportSearch?.value || "").catch((error) => {
          setDashActionStatus?.(error.message, true);
        });
      }, 220);
      setAdminAccountSupportSearchTimerId?.(nextTimer);
    });

    adminAccountSupportResults?.addEventListener("click", (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest("[data-admin-account-id]") : null;
      if (!(target instanceof HTMLElement)) return;
      setAdminAccountSupportSelectedId?.(String(target.getAttribute("data-admin-account-id") || "").trim());
      renderAdminAccountSupportModule();
    });

    adminAccountSupportDetail?.addEventListener("click", async (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest("[data-admin-account-action]") : null;
      if (!(target instanceof HTMLElement)) return;
      const action = String(target.getAttribute("data-admin-account-action") || "").trim();
      const account = adminAccountSupportSelectedAccount();
      if (!account) return;
      try {
        if (action === "edit-account") {
          await openAdminAccountSupportEditForm();
          return;
        }
        if (action === "open-dashboard" && account.role === "subscriber" && account?.business?.id) {
          const nextBusinessId = String(account.business.id || "").trim();
          setManagedBusinessId?.(nextBusinessId);
          if (adminBusinessSelect) adminBusinessSelect.value = nextBusinessId;
          syncAdminBusinessQueryParam?.();
          await reloadAdminManagedDashboard?.();
          renderModuleNavigator?.();
          const closeModulePopupActive = getCloseModulePopupActive?.();
          if (typeof closeModulePopupActive === "function") closeModulePopupActive();
          subscriberCalendarSection?.scrollIntoView({ behavior: "smooth", block: "start" });
          setDashActionStatus?.(`Loaded ${account.business.name || "subscriber"} dashboard.`);
          return;
        }
        if (action === "open-profile" && account.role === "subscriber" && account?.business?.id) {
          const nextBusinessId = String(account.business.id || "").trim();
          setManagedBusinessId?.(nextBusinessId);
          if (adminBusinessSelect) adminBusinessSelect.value = nextBusinessId;
          syncAdminBusinessQueryParam?.();
          await reloadAdminManagedDashboard?.();
          openInteractiveModulePopup?.("business_information");
        }
      } catch (error) {
        setDashActionStatus?.(error.message, true);
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
