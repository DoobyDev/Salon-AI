// Commercial, revenue attribution, and profitability runtime.
export function createBusinessControlsRuntime(deps) {
  const {
    fetchImpl = fetch,
    canManageBusinessModules,
    isPopupMountedBusinessSection,
    hideSection,
    showSection,
    withManagedBusiness,
    headers,
    formatMoney,
    escapeHtml,
    formatDateTime,
    renderExecutivePulse,
    getUserRole,
    getCommercialPayload,
    setCommercialPayload,
    getRevenueAttributionPayload,
    setRevenueAttributionPayload,
    getProfitabilityPayload,
    setProfitabilityPayload,
    commercialSection,
    commercialSummaryCards,
    membershipList,
    packageList,
    giftCardList,
    merchSection,
    merchSummaryCards,
    merchList,
    revenueAttributionSection,
    revenueSummaryCards,
    revenueChannelList,
    profitabilitySection,
    profitSummaryCards,
    profitPayrollList,
    profitRentInput,
    profitUtilitiesInput,
    profitSoftwareInput,
    profitOtherInput,
    profitCogsPercentInput,
    commercialStatusNote,
    merchStatusNote,
    revenueStatusNote,
    profitStatusNote
  } = deps || {};

  function setNote(node, message, isError = false) {
    if (!node) return;
    node.textContent = message || "";
    node.style.color = isError ? "#ffadb5" : "var(--muted)";
  }

  function setCommercialStatus(message, isError = false) {
    setNote(commercialStatusNote, message, isError);
  }

  function setMerchStatus(message, isError = false) {
    setNote(merchStatusNote, message, isError);
  }

  function formatShipmentStatusLabel(value) {
    return String(value || "preparing")
      .split("_")
      .filter(Boolean)
      .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function renderCommercialControls() {
    if (!commercialSection || !commercialSummaryCards || !membershipList || !packageList || !giftCardList) return;
    if (!canManageBusinessModules?.() || !isPopupMountedBusinessSection?.(commercialSection)) {
      hideSection?.(commercialSection);
      return;
    }
    showSection?.(commercialSection);

    const commercialPayload = getCommercialPayload?.() || {};
    const summary = commercialPayload.summary || {};
    const memberships = Array.isArray(commercialPayload.memberships) ? commercialPayload.memberships : [];
    const packages = Array.isArray(commercialPayload.packages) ? commercialPayload.packages : [];
    const giftCards = Array.isArray(commercialPayload.giftCards) ? commercialPayload.giftCards : [];
    const merch = (Array.isArray(commercialPayload.merch) ? commercialPayload.merch : []).filter((item) => item.status !== "inactive");

    commercialSummaryCards.innerHTML = "";
    [
      { label: "Active Memberships", value: String(summary.activeMemberships || 0) },
      { label: "Active Packages", value: String(summary.activePackages || 0) },
      { label: "Active Gift Cards", value: String(summary.activeGiftCards || 0) },
      { label: "Outstanding Gift Balance", value: formatMoney(summary.outstandingGiftBalance || 0) },
      { label: "Active Merch", value: String(summary.activeMerchItems || merch.filter((item) => item.status === "active").length || 0) },
      { label: "Pending Shipments", value: String(summary.pendingMerchShipments || 0) }
    ].forEach((card) => {
      const article = document.createElement("article");
      article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
      commercialSummaryCards.appendChild(article);
    });

    membershipList.innerHTML = "";
    if (!memberships.length) {
      membershipList.innerHTML = "<li><small>No membership plans set up yet.</small></li>";
    } else {
      memberships.forEach((plan) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${plan.name}</strong>
          <small>${formatMoney(plan.price)} / ${plan.billingCycle} (${plan.status})</small>
          <small>${plan.benefits || "No benefits text set."}</small>
          <div class="commercial-actions manage-only">
            <button class="btn btn-ghost commercial-edit-membership" type="button" data-membership-id="${plan.id}">Edit</button>
            <button class="btn btn-ghost commercial-delete-membership" type="button" data-membership-id="${plan.id}">Delete</button>
          </div>
        `;
        membershipList.appendChild(li);
      });
    }

    packageList.innerHTML = "";
    if (!packages.length) {
      packageList.innerHTML = "<li><small>No service packages set up yet.</small></li>";
    } else {
      packages.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${item.name}</strong>
          <small>${formatMoney(item.price)} ? Sessions: ${item.remainingSessions}/${item.sessionCount}</small>
          <small>Status: ${item.status}</small>
          <div class="commercial-actions manage-only">
            <button class="btn btn-ghost commercial-edit-package" type="button" data-package-id="${item.id}">Edit</button>
            <button class="btn btn-ghost commercial-delete-package" type="button" data-package-id="${item.id}">Delete</button>
          </div>
        `;
        packageList.appendChild(li);
      });
    }

    giftCardList.innerHTML = "";
    if (!giftCards.length) {
      giftCardList.innerHTML = "<li><small>No gift cards issued yet.</small></li>";
    } else {
      giftCards.forEach((gift) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${gift.code} - ${gift.recipientName}</strong>
          <small>Balance: ${formatMoney(gift.remainingBalance)} / ${formatMoney(gift.initialBalance)} (${gift.status})</small>
          <small>Issued: ${formatDateTime(gift.issuedAt)} ? Expires: ${gift.expiresAt ? formatDateTime(gift.expiresAt) : "Not set"}</small>
          <div class="commercial-actions">
            <button class="btn btn-ghost commercial-redeem-gift" type="button" data-gift-card-id="${gift.id}" ${gift.status === "active" ? "" : "disabled"}>Redeem Amount</button>
          </div>
        `;
        giftCardList.appendChild(li);
      });
    }
  }

  function renderMerchControls() {
    if (!merchSection || !merchSummaryCards || !merchList) return;
    if (!canManageBusinessModules?.() || !isPopupMountedBusinessSection?.(merchSection)) {
      hideSection?.(merchSection);
      return;
    }
    showSection?.(merchSection);
    const commercialPayload = getCommercialPayload?.() || {};
    const summary = commercialPayload.summary || {};
    const merch = Array.isArray(commercialPayload.merch) ? commercialPayload.merch : [];

    merchSummaryCards.innerHTML = "";
    [
      { label: "Active Products", value: String(summary.activeMerchItems || 0) },
      { label: "Shippable Products", value: String(summary.shippableMerchItems || 0) },
      { label: "Pending Shipments", value: String(summary.pendingMerchShipments || 0) },
      { label: "Catalog Value", value: formatMoney(summary.merchCatalogValue || 0) }
    ].forEach((card) => {
      const article = document.createElement("article");
      article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
      merchSummaryCards.appendChild(article);
    });

    merchList.innerHTML = "";
    if (!merch.length) {
      merchList.innerHTML = "<li><small>No merch products added yet.</small></li>";
      return;
    }
    merch.forEach((item) => {
      const latestShipment = Array.isArray(item.shipments) && item.shipments.length ? item.shipments[0] : null;
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="merch-card-head">
          <img class="merch-card-thumb" src="${escapeHtml(item.imageUrl || "/icons/barber.svg")}" alt="${escapeHtml(item.name || "Product")}" />
          <div class="merch-card-copy">
            <strong>${escapeHtml(item.name)}</strong>
            <small>${formatMoney(item.salePrice)} â€¢ Stock: ${escapeHtml(String(item.inventory || 0))} â€¢ ${escapeHtml(String(item.status || "active"))}</small>
            <p>${escapeHtml(item.description || "No description set.")}</p>
          </div>
        </div>
        <div class="merch-chip-row">
          <span>${item.shippingAvailable ? `Shipping on â€¢ ${formatMoney(item.shippingCost || 0)}` : "Collection only"}</span>
          <span>${escapeHtml(String((item.shipments || []).length))} shipment${(item.shipments || []).length === 1 ? "" : "s"}</span>
        </div>
        <p class="merch-shipment-note">${
          latestShipment
            ? `Latest shipment: ${escapeHtml(latestShipment.customerName || "Customer")} â€¢ ${escapeHtml(formatShipmentStatusLabel(latestShipment.status))}${latestShipment.trackingRef ? ` â€¢ Tracking: ${escapeHtml(latestShipment.trackingRef)}` : ""}`
            : "No shipments created yet for this product."
        }</p>
        <div class="commercial-actions manage-only">
          <button class="btn btn-ghost merch-edit" type="button" data-merch-id="${item.id}">Edit</button>
          <button class="btn btn-ghost merch-ship" type="button" data-merch-id="${item.id}" ${item.shippingAvailable ? "" : "disabled"}>Ship to Customer</button>
          <button class="btn btn-ghost merch-delete" type="button" data-merch-id="${item.id}">Delete</button>
        </div>
      `;
      merchList.appendChild(li);
    });
  }

  function applyCommercialPayload(data) {
    setCommercialPayload?.({
      memberships: Array.isArray(data?.memberships) ? data.memberships : [],
      packages: Array.isArray(data?.packages) ? data.packages : [],
      giftCards: Array.isArray(data?.giftCards) ? data.giftCards : [],
      merch: Array.isArray(data?.merch) ? data.merch : [],
      summary: data?.summary || null
    });
    renderCommercialControls();
    renderMerchControls();
  }

  async function loadCommercialControls() {
    if (!canManageBusinessModules?.()) return;
    const res = await fetchImpl(withManagedBusiness?.("/api/commercial-controls"), { headers: headers?.() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load commercial controls.");
    applyCommercialPayload(data);
  }

  async function upsertMembership(payload) {
    const res = await fetchImpl(withManagedBusiness?.("/api/commercial-controls/memberships/upsert"), { method: "POST", headers: headers?.(), body: JSON.stringify(payload || {}) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to save membership.");
    applyCommercialPayload(data);
  }

  async function upsertPackage(payload) {
    const res = await fetchImpl(withManagedBusiness?.("/api/commercial-controls/packages/upsert"), { method: "POST", headers: headers?.(), body: JSON.stringify(payload || {}) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to save package.");
    applyCommercialPayload(data);
  }

  async function issueGiftCard(payload) {
    const res = await fetchImpl(withManagedBusiness?.("/api/commercial-controls/gift-cards/issue"), { method: "POST", headers: headers?.(), body: JSON.stringify(payload || {}) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to issue gift card.");
    applyCommercialPayload(data);
  }

  async function redeemGiftCard(giftCardId, amount) {
    const res = await fetchImpl(withManagedBusiness?.(`/api/commercial-controls/gift-cards/${encodeURIComponent(giftCardId)}/redeem`), { method: "POST", headers: headers?.(), body: JSON.stringify({ amount }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to redeem gift card.");
    applyCommercialPayload(data);
  }

  async function upsertMerchItem(payload) {
    const res = await fetchImpl(withManagedBusiness?.("/api/commercial-controls/merch/upsert"), { method: "POST", headers: headers?.(), body: JSON.stringify(payload || {}) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to save merch product.");
    applyCommercialPayload(data);
  }

  async function createMerchShipment(merchId, payload) {
    const res = await fetchImpl(withManagedBusiness?.(`/api/commercial-controls/merch/${encodeURIComponent(merchId)}/ship`), { method: "POST", headers: headers?.(), body: JSON.stringify(payload || {}) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to create shipment.");
    applyCommercialPayload(data);
  }

  function setRevenueStatus(message, isError = false) {
    setNote(revenueStatusNote, message, isError);
  }

  function toChannelLabel(channel) {
    return String(channel || "direct").split("_").filter(Boolean).map((part) => part.slice(0, 1).toUpperCase() + part.slice(1)).join(" ");
  }

  function renderRevenueAttribution() {
    if (!revenueAttributionSection || !revenueSummaryCards || !revenueChannelList) return;
    if (!canManageBusinessModules?.() || !isPopupMountedBusinessSection?.(revenueAttributionSection)) {
      hideSection?.(revenueAttributionSection);
      return;
    }
    showSection?.(revenueAttributionSection);
    const revenueAttributionPayload = getRevenueAttributionPayload?.() || {};
    const summary = revenueAttributionPayload.summary || {};
    const channels = Array.isArray(revenueAttributionPayload.channels) ? revenueAttributionPayload.channels : [];

    revenueSummaryCards.innerHTML = "";
    [
      { label: "Attributed Revenue", value: formatMoney(summary.totalRevenue || 0) },
      { label: "Channel Spend", value: formatMoney(summary.totalSpend || 0) },
      { label: "Blended ROI", value: typeof summary.blendedRoiPercent === "number" ? `${summary.blendedRoiPercent}%` : "0%" },
      { label: "Best Revenue Channel", value: summary.bestRevenueChannel ? toChannelLabel(summary.bestRevenueChannel) : "None yet" }
    ].forEach((card) => {
      const article = document.createElement("article");
      article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
      revenueSummaryCards.appendChild(article);
    });

    revenueChannelList.innerHTML = "";
    if (!channels.length) {
      ["Instagram", "Google", "Walk-in"].forEach((label) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${label}</strong><small>Bookings: 0 ? Revenue: ${formatMoney(0)} ? Spend: ${formatMoney(0)}</small><small>ROI: 0% ? Share: 0% ? Cancelled: 0</small><div class="commercial-actions manage-only"><button class="btn btn-ghost" type="button" data-module-jump="revenue">Open</button></div>`;
        revenueChannelList.appendChild(li);
      });
      if (getUserRole?.() === "subscriber") {
        const li = document.createElement("li");
        li.innerHTML = "<small>Clean slate: channel performance will populate after bookings and spend are tracked.</small>";
        revenueChannelList.appendChild(li);
      }
      return;
    }
    channels.forEach((row) => {
      const roiText = typeof row.roiPercent === "number" ? `${row.roiPercent}%` : "n/a";
      const li = document.createElement("li");
      li.innerHTML = `<strong>${row.label || toChannelLabel(row.channel)}</strong><small>Bookings: ${row.bookings} ? Revenue: ${formatMoney(row.revenue)} ? Spend: ${formatMoney(row.spend)}</small><small>ROI: ${roiText} ? Share: ${row.sharePercent}% ? Cancelled: ${row.cancelledBookings || 0}</small><div class="commercial-actions manage-only"><button class="btn btn-ghost revenue-edit-spend" type="button" data-channel="${row.channel}" data-spend="${row.spend}">Edit</button><button class="btn btn-ghost revenue-delete-spend" type="button" data-channel="${row.channel}">Delete</button></div>`;
      revenueChannelList.appendChild(li);
    });
    renderExecutivePulse?.();
  }

  function applyRevenueAttributionPayload(data) {
    setRevenueAttributionPayload?.(data || { channels: [], summary: null });
    renderRevenueAttribution();
  }

  async function loadRevenueAttribution() {
    if (!canManageBusinessModules?.()) return;
    const res = await fetchImpl(withManagedBusiness?.("/api/revenue-attribution"), { headers: headers?.() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load revenue attribution.");
    applyRevenueAttributionPayload(data);
  }

  async function saveRevenueChannelSpend(payload) {
    const res = await fetchImpl(withManagedBusiness?.("/api/revenue-attribution/spend"), { method: "POST", headers: headers?.(), body: JSON.stringify(payload || {}) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to save channel spend.");
    applyRevenueAttributionPayload(data);
  }

  function setProfitabilityStatus(message, isError = false) {
    setNote(profitStatusNote, message, isError);
  }

  function renderProfitabilitySummary() {
    if (!profitabilitySection || !profitSummaryCards || !profitPayrollList) return;
    if (!canManageBusinessModules?.() || !isPopupMountedBusinessSection?.(profitabilitySection)) {
      hideSection?.(profitabilitySection);
      return;
    }
    showSection?.(profitabilitySection);
    const profitabilityPayload = getProfitabilityPayload?.() || {};
    const summary = profitabilityPayload.summary || {};
    const payrollEntries = Array.isArray(profitabilityPayload.payrollEntries) ? profitabilityPayload.payrollEntries : [];
    const fixedCosts = profitabilityPayload.fixedCosts || {};
    const cogsPercent = Number(profitabilityPayload.cogsPercent || 0);

    profitSummaryCards.innerHTML = "";
    [
      { label: "Gross Revenue", value: formatMoney(summary.grossRevenue || 0) },
      { label: "Total Costs", value: formatMoney(summary.totalCosts || 0) },
      { label: "Estimated Profit", value: formatMoney(summary.estimatedProfit || 0) },
      { label: "Profit Margin", value: typeof summary.profitMarginPercent === "number" ? `${summary.profitMarginPercent}%` : "0%" },
      { label: "Break-even Revenue", value: summary.breakevenRevenue === null ? formatMoney(0) : formatMoney(summary.breakevenRevenue) }
    ].forEach((card) => {
      const article = document.createElement("article");
      article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
      profitSummaryCards.appendChild(article);
    });

    profitPayrollList.innerHTML = "";
    if (!payrollEntries.length) {
      profitPayrollList.innerHTML = `<li><small>${getUserRole?.() === "subscriber" ? "Clean slate: payroll and fixed costs start at zero until you add them." : "No payroll entries yet. Add payroll to get realistic profit projections."}</small><br /><button class='btn btn-ghost' type='button' data-module-jump='profitability' style='margin-top:0.45rem;padding:0.32rem 0.65rem;font-size:0.75rem;'>Open Profitability</button></li>`;
    } else {
      payrollEntries.forEach((entry) => {
        const total = Number(entry.hours || 0) * Number(entry.hourlyRate || 0) + Number(entry.bonus || 0);
        const li = document.createElement("li");
        li.innerHTML = `<strong>${entry.staffName}${entry.role ? ` (${entry.role})` : ""}</strong><small>${entry.hours}h x ${formatMoney(entry.hourlyRate)} + bonus ${formatMoney(entry.bonus || 0)}</small><small>Total payroll cost: ${formatMoney(total)}</small><div class="profit-actions"><button class="btn btn-ghost manage-only profit-edit-payroll" type="button" data-entry-id="${entry.id}">Edit</button><button class="btn btn-ghost manage-only profit-remove-payroll" type="button" data-entry-id="${entry.id}">Delete</button></div>`;
        profitPayrollList.appendChild(li);
      });
    }

    if (profitRentInput) profitRentInput.value = String(fixedCosts.rent || "");
    if (profitUtilitiesInput) profitUtilitiesInput.value = String(fixedCosts.utilities || "");
    if (profitSoftwareInput) profitSoftwareInput.value = String(fixedCosts.software || "");
    if (profitOtherInput) profitOtherInput.value = String(fixedCosts.other || "");
    if (profitCogsPercentInput) profitCogsPercentInput.value = String(cogsPercent || "");
    renderExecutivePulse?.();
  }

  function applyProfitabilityPayload(data) {
    setProfitabilityPayload?.(data || { payrollEntries: [], fixedCosts: {}, cogsPercent: 0, summary: null });
    renderProfitabilitySummary();
  }

  async function loadProfitabilitySummary() {
    if (!canManageBusinessModules?.()) return;
    const res = await fetchImpl(withManagedBusiness?.("/api/profitability-summary"), { headers: headers?.() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load profitability summary.");
    applyProfitabilityPayload(data);
  }

  async function upsertPayrollInput(payload) {
    const res = await fetchImpl(withManagedBusiness?.("/api/profitability/payroll/upsert"), { method: "POST", headers: headers?.(), body: JSON.stringify(payload || {}) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to save payroll entry.");
    applyProfitabilityPayload(data);
  }

  async function removePayrollInput(entryId) {
    const res = await fetchImpl(withManagedBusiness?.(`/api/profitability/payroll/${encodeURIComponent(entryId)}`), { method: "DELETE", headers: headers?.() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to remove payroll entry.");
    applyProfitabilityPayload(data);
  }

  async function upsertProfitabilityCosts(payload) {
    const res = await fetchImpl(withManagedBusiness?.("/api/profitability/costs/upsert"), { method: "POST", headers: headers?.(), body: JSON.stringify(payload || {}) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to save cost inputs.");
    applyProfitabilityPayload(data);
  }

  return {
    setCommercialStatus,
    setMerchStatus,
    formatShipmentStatusLabel,
    renderCommercialControls,
    renderMerchControls,
    applyCommercialPayload,
    loadCommercialControls,
    upsertMembership,
    upsertPackage,
    issueGiftCard,
    redeemGiftCard,
    upsertMerchItem,
    createMerchShipment,
    setRevenueStatus,
    toChannelLabel,
    renderRevenueAttribution,
    applyRevenueAttributionPayload,
    loadRevenueAttribution,
    saveRevenueChannelSpend,
    setProfitabilityStatus,
    renderProfitabilitySummary,
    applyProfitabilityPayload,
    loadProfitabilitySummary,
    upsertPayrollInput,
    removePayrollInput,
    upsertProfitabilityCosts
  };
}
