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

  function renderAdminAccountsTable(cache, selectedId) {
    if (!adminAccountsTable) return;
    adminAccountsTable.innerHTML = cache.length
      ? cache.map((account) => `
          <article class="admin-row ${String(account?.id || "") === selectedId ? "is-selected" : ""}" data-admin-account-id="${escapeHtml(String(account?.id || ""))}">
            <div>
              <strong>${escapeHtml(String(account?.name || "Account"))}</strong>
              <small>${escapeHtml(String(account?.email || ""))}</small>
            </div>
            <div>
              <strong>${escapeHtml(roleLabel(account?.role))}</strong>
              <small>${escapeHtml(String(account?.business?.name || account?.business?.city || "No linked business"))}</small>
            </div>
            <div>
              <strong>${escapeHtml(String(account?.stats?.bookingCount ?? account?.stats?.visitCount ?? 0))}</strong>
              <small>${escapeHtml(account?.role === "subscriber" ? "bookings" : "visits")}</small>
            </div>
            <div>
              <strong>${escapeHtml(account?.role === "subscriber" ? String(formatMoney?.(Number(account?.stats?.revenue || 0)) || "GBP 0") : String(account?.stats?.upcomingCount || 0))}</strong>
              <small>${escapeHtml(account?.role === "subscriber" ? String(account?.stats?.planLabel || "no plan") : "upcoming bookings")}</small>
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
    const primary = account?.role === "subscriber"
      ? `${String(stats.bookingCount || 0)} bookings - ${String(formatMoney?.(Number(stats.revenue || 0)) || "GBP 0")}`
      : `${String(stats.visitCount || 0)} visits - ${String(stats.upcomingCount || 0)} upcoming`;
    const secondary = account?.role === "subscriber"
      ? `${String(stats.planLabel || "no plan")} - ${String(account?.business?.city || "no city")}`
      : `${String(stats.linkedBusinesses || 0)} linked salons`;

    adminAccountDetail.innerHTML = `
      <article class="detail-card">
        <strong>${escapeHtml(String(account?.name || "Account"))}</strong>
        <small>${escapeHtml(String(account?.email || ""))}</small>
        <small>${escapeHtml(roleLabel(account?.role))}${account?.business?.name ? ` - ${escapeHtml(String(account.business.name || ""))}` : ""}</small>
      </article>
      <article class="detail-card">
        <strong>Activity</strong>
        <small>${escapeHtml(primary)}</small>
        <small>${escapeHtml(secondary)}</small>
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
      ${account?.role === "subscriber" && account?.business?.id
        ? `
          <article class="detail-card">
            <strong>Managed actions</strong>
            <div class="agenda-item-actions">
              <button class="btn btn-ghost btn-small" type="button" data-admin-account-action="open-dashboard">Open dashboard</button>
              <button class="btn btn-ghost btn-small" type="button" data-admin-account-action="open-profile">Edit business info</button>
            </div>
          </article>
        `
        : ""}
    `;

    if (adminEditName) adminEditName.value = String(account?.name || "");
    if (adminEditEmail) adminEditEmail.value = String(account?.email || "");
    if (adminEditBusinessName) {
      adminEditBusinessName.value = String(account?.business?.name || "");
      adminEditBusinessName.disabled = account?.role !== "subscriber";
    }
    setAdminAccountMessage("");
  }

  function renderAdminAccountSupportModule() {
    if (getUserRole?.() !== "admin" || !adminAccountsTable || !adminAccountDetail) return;
    const cache = Array.isArray(getAdminAccountSupportResultsCache?.()) ? getAdminAccountSupportResultsCache() : [];
    const selectedId = String(getAdminAccountSupportSelectedId?.() || "").trim();
    renderAdminAccountsTable(cache, selectedId);
    renderAdminAccountDetailCard(adminAccountSupportSelectedAccount());
  }

  async function loadAdminAccountSupport(query = getAdminAccountQuery()) {
    if (getUserRole?.() !== "admin") return;
    const q = String(query || "").trim();
    const endpoint = q ? `/api/admin/accounts?query=${encodeURIComponent(q)}` : "/api/admin/accounts";
    const res = await fetchImpl(endpoint, { headers: headers?.() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load admin accounts.");
    const accounts = Array.isArray(data?.accounts) ? data.accounts : [];
    setAdminAccountSupportResultsCache?.(accounts);
    const selectedId = String(getAdminAccountSupportSelectedId?.() || "").trim();
    const selectedStillExists = accounts.some((account) => String(account?.id || "") === selectedId);
    setAdminAccountSupportSelectedId?.(selectedStillExists ? selectedId : String(accounts[0]?.id || "").trim());
    renderAdminAccountSupportModule();
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
    if (account.role === "subscriber") {
      await loadAdminBusinessOptions?.();
      if (String(account?.business?.id || "") === String(getManagedBusinessId?.() || "").trim()) {
        await reloadAdminManagedDashboard?.();
      }
    }
    await loadAdminAccountSupport(getAdminAccountQuery());
    setDashActionStatus?.(`${account.role === "subscriber" ? "Subscriber" : "Customer"} account updated.`);
    setAdminAccountMessage("Account saved.", "success");
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
      const target = event.target instanceof HTMLElement ? event.target.closest("[data-admin-account-id]") : null;
      if (!(target instanceof HTMLElement)) return;
      setAdminAccountSupportSelectedId?.(String(target.getAttribute("data-admin-account-id") || "").trim());
      renderAdminAccountSupportModule();
    });

    adminAccountDetail?.addEventListener("click", async (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest("[data-admin-account-action]") : null;
      if (!(target instanceof HTMLElement)) return;
      const action = String(target.getAttribute("data-admin-account-action") || "").trim();
      const account = adminAccountSupportSelectedAccount();
      if (!account) return;
      try {
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
          businessName: account.role === "subscriber" ? String(adminEditBusinessName?.value || "").trim() : ""
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
