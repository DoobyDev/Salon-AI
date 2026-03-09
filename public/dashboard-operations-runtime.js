// Waitlist, operations insights, and CRM runtime.
export function createOperationsRuntime(deps) {
  const {
    fetchImpl = fetch,
    canManageBusinessModules,
    isPopupMountedBusinessSection,
    hideSection,
    showSection,
    withManagedBusiness,
    headers,
    parseWaitlistDateTimeInput,
    buildWaitlistRecoveryDateTime,
    normalizeText,
    focusModuleByKey,
    isDashboardManagerRole,
    getManageModeEnabled,
    openManageForm,
    openManageConfirm,
    showManageToast,
    writeToClipboard,
    getBookingRows,
    getWaitlistRows,
    setWaitlistRows,
    getWaitlistSummary,
    setWaitlistSummary,
    getOperationsInsights,
    getCrmSegmentsPayload,
    setCrmSegmentsPayload,
    waitlistStatusNote,
    operationsStatusNote,
    crmStatusNote,
    waitlistSection,
    operationsInsightsSection,
    crmSection,
    waitlistSummaryCards,
    waitlistList,
    noShowRiskList,
    rebookingPromptList,
    crmSegmentsList,
    waitlistForm,
    waitlistNameInput,
    waitlistPhoneInput,
    waitlistEmailInput,
    waitlistServiceInput,
    waitlistDateInput
  } = deps || {};

  function setStatus(noteEl, message, isError = false) {
    if (!noteEl) return;
    noteEl.textContent = message || "";
    noteEl.style.color = isError ? "#ffadb5" : "var(--muted)";
  }

  function setWaitlistStatus(message, isError = false) {
    setStatus(waitlistStatusNote, message, isError);
  }

  function parseWaitlistDateTime(raw) {
    return parseWaitlistDateTimeInput?.(raw);
  }

  function buildWaitlistRecoveryPrefillDateTime(booking) {
    return buildWaitlistRecoveryDateTime?.(booking);
  }

  function stageWaitlistRecoveryFromBooking(sourceBooking, options = {}) {
    const booking = sourceBooking && typeof sourceBooking === "object"
      ? sourceBooking
      : (Array.isArray(getBookingRows?.()) ? getBookingRows() : []).find((row) => String(row?.id || "").trim() === String(sourceBooking || "").trim());
    if (!booking) {
      setWaitlistStatus("Could not find that booking to stage waitlist recovery.", true);
      return false;
    }
    if (waitlistNameInput) waitlistNameInput.value = String(booking.customerName || "").trim();
    if (waitlistPhoneInput) waitlistPhoneInput.value = String(booking.customerPhone || "").trim();
    if (waitlistEmailInput) waitlistEmailInput.value = String(booking.customerEmail || "").trim().toLowerCase();
    if (waitlistServiceInput) waitlistServiceInput.value = String(booking.service || "").trim();
    if (waitlistDateInput) waitlistDateInput.value = buildWaitlistRecoveryPrefillDateTime(booking);
    const wasCancelled = normalizeText?.(booking?.status).includes("cancel");
    setWaitlistStatus(
      wasCancelled
        ? "Waitlist recovery pre-filled from the cancelled booking. Review and save to start outreach."
        : "Waitlist form pre-filled from the selected booking. Review and save if this customer wants another slot."
    );
    if (options.focusModule !== false) {
      focusModuleByKey?.("waitlist");
      waitlistSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        if (waitlistNameInput instanceof HTMLElement) waitlistNameInput.focus();
      }, 140);
    }
    return true;
  }

  function renderWaitlistSummary() {
    if (!waitlistSummaryCards) return;
    const summary = getWaitlistSummary?.() || { totalEntries: 0, waitingCount: 0, contactedCount: 0, bookedCount: 0 };
    const cards = [
      { label: "Waitlist Entries", value: summary.totalEntries || 0 },
      { label: "Waiting", value: summary.waitingCount || 0 },
      { label: "Contacted/Booked", value: (summary.contactedCount || 0) + (summary.bookedCount || 0) }
    ];
    waitlistSummaryCards.innerHTML = "";
    cards.forEach((card) => {
      const article = document.createElement("article");
      article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
      waitlistSummaryCards.appendChild(article);
    });
  }

  function renderWaitlist() {
    if (!waitlistList) return;
    const rows = Array.isArray(getWaitlistRows?.()) ? getWaitlistRows() : [];
    waitlistList.innerHTML = "";
    if (!rows.length) {
      waitlistList.innerHTML =
        "<li><div class='waitlist-meta'><strong>No waitlist names added yet.</strong><br /><small>Add interested clients here so you can fill cancellations faster.</small><br /><button class='btn btn-ghost' type='button' data-module-jump='waitlist' style='margin-top:0.45rem;padding:0.32rem 0.65rem;font-size:0.75rem;'>Open Waitlist</button></div></li>";
      return;
    }
    rows.forEach((entry) => {
      const preferred = entry.preferredDate && entry.preferredTime ? `${entry.preferredDate} ${entry.preferredTime}` : "Flexible";
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="waitlist-meta">
          <strong>${entry.customerName} (${entry.status})</strong><br />
          <small>${entry.service || "Any service"} | ${preferred} | ${entry.customerPhone || entry.customerEmail || "No contact"}</small>
        </div>
        <div class="waitlist-actions">
          <button class="btn btn-ghost manage-only waitlist-backfill" type="button" data-id="${entry.id}" ${entry.status === "waiting" ? "" : "disabled"}>Edit Status</button>
          <button class="btn btn-ghost manage-only waitlist-edit" type="button" data-id="${entry.id}">Edit</button>
          <button class="btn btn-ghost manage-only waitlist-remove" type="button" data-id="${entry.id}">Delete</button>
        </div>
      `;
      waitlistList.appendChild(li);
    });
  }

  function applyWaitlistPayload(data) {
    setWaitlistRows?.(Array.isArray(data?.entries) ? data.entries : []);
    setWaitlistSummary?.(data?.summary || null);
    renderWaitlistSummary();
    renderWaitlist();
  }

  async function loadWaitlist() {
    if (!canManageBusinessModules?.()) return;
    const res = await fetchImpl(withManagedBusiness?.("/api/waitlist"), { headers: headers?.() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load waitlist.");
    applyWaitlistPayload(data);
  }

  async function upsertWaitlistEntry(payload) {
    const res = await fetchImpl(withManagedBusiness?.("/api/waitlist/upsert"), {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to save waitlist entry.");
    applyWaitlistPayload(data);
  }

  async function markWaitlistContacted(entryId) {
    const res = await fetchImpl(withManagedBusiness?.(`/api/waitlist/${encodeURIComponent(entryId)}/backfill`), {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify({})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to update waitlist entry.");
    applyWaitlistPayload(data);
  }

  async function removeWaitlistEntry(entryId) {
    const res = await fetchImpl(withManagedBusiness?.(`/api/waitlist/${encodeURIComponent(entryId)}`), {
      method: "DELETE",
      headers: headers?.()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to remove waitlist entry.");
    applyWaitlistPayload(data);
  }

  function setOperationsStatus(message, isError = false) {
    setStatus(operationsStatusNote, message, isError);
  }

  function setCrmStatus(message, isError = false) {
    setStatus(crmStatusNote, message, isError);
  }

  async function markRebookingPromptSent(payload) {
    const res = await fetchImpl(withManagedBusiness?.("/api/operations/rebooking/mark-sent"), {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify(payload || {})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to mark rebooking prompt as sent.");
    return data;
  }

  function renderOperationsInsights() {
    if (!operationsInsightsSection || !noShowRiskList || !rebookingPromptList) return;
    if (!canManageBusinessModules?.() || !isPopupMountedBusinessSection?.(operationsInsightsSection)) {
      hideSection?.(operationsInsightsSection);
      return;
    }
    showSection?.(operationsInsightsSection);
    const operationsInsights = getOperationsInsights?.();
    const riskRows = Array.isArray(operationsInsights?.noShowRisk) ? operationsInsights.noShowRisk : [];
    const promptRows = Array.isArray(operationsInsights?.rebookingPrompts) ? operationsInsights.rebookingPrompts : [];

    noShowRiskList.innerHTML = "";
    if (!riskRows.length) {
      noShowRiskList.innerHTML = "<li><small>No high-risk bookings right now.</small></li>";
    } else {
      riskRows.forEach((row) => {
        const item = document.createElement("li");
        const reasonText = Array.isArray(row.reasons) ? row.reasons.join(" ") : "";
        item.innerHTML = `
          <strong>${row.customerName} - ${row.service}</strong>
          <small>${row.date} ${row.time} ? Risk: ${row.riskLevel} (${row.riskScore})</small>
          <small>${reasonText}</small>
          <div class="ops-actions">
            <button class="btn btn-ghost ops-send-reminder" type="button" data-booking-id="${row.bookingId}" data-customer-name="${row.customerName}" data-service="${row.service}">Mark Reminder Sent</button>
          </div>
        `;
        noShowRiskList.appendChild(item);
      });
    }

    rebookingPromptList.innerHTML = "";
    if (!promptRows.length) {
      rebookingPromptList.innerHTML = "<li><small>No rebooking candidates right now.</small></li>";
    } else {
      promptRows.forEach((row) => {
        const item = document.createElement("li");
        item.innerHTML = `
          <strong>${row.customerName}</strong>
          <small>${row.daysSinceLastVisit} days since ${row.lastService}</small>
          <small>${row.suggestedMessage}</small>
          <div class="ops-actions">
            <button class="btn btn-ghost ops-copy-rebooking" type="button" data-message="${row.suggestedMessage.replaceAll('"', "&quot;")}">Copy Prompt</button>
            <button class="btn btn-ghost ops-mark-rebooking" type="button" data-customer-key="${row.customerKey}" data-customer-name="${row.customerName}" data-service="${row.lastService}">Mark Sent</button>
          </div>
        `;
        rebookingPromptList.appendChild(item);
      });
    }
  }

  function renderCrmSegments() {
    if (!crmSection || !crmSegmentsList) return;
    if (!canManageBusinessModules?.() || !isPopupMountedBusinessSection?.(crmSection)) {
      hideSection?.(crmSection);
      return;
    }
    showSection?.(crmSection);
    const payload = getCrmSegmentsPayload?.();
    const segments = Array.isArray(payload?.segments) ? payload.segments : [];
    crmSegmentsList.innerHTML = "";
    if (!segments.length) {
      crmSegmentsList.innerHTML = "<li><small>No client segments yet. They will appear here as booking history builds up.</small></li>";
      return;
    }
    segments.forEach((segment) => {
      const leads = Array.isArray(segment?.leads) ? segment.leads : [];
      const firstLead = leads[0] || null;
      const sampleMessage = String(firstLead?.message || "").trim();
      const sampleCustomerKey = String(firstLead?.customerKey || "").trim();
      const sampleCustomerName = String(firstLead?.customerName || "").trim();
      const segmentId = String(segment?.id || "").trim();
      const leadCount = leads.length;
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <strong>${segment.label || "Segment"}</strong>
        <small>${leadCount} ${leadCount === 1 ? "lead" : "leads"} ready for outreach.</small>
        <small>${sampleMessage || "No suggested message yet."}</small>
        <div class="crm-actions">
          <button class="btn btn-ghost crm-copy-message" type="button" data-segment-id="${segmentId}" data-message="${sampleMessage.replaceAll('"', "&quot;")}">Copy Template</button>
          <button class="btn btn-ghost crm-mark-sent" type="button" data-segment-id="${segmentId}" data-customer-key="${sampleCustomerKey}" data-customer-name="${sampleCustomerName}" data-message="${sampleMessage.replaceAll('"', "&quot;")}" ${sampleCustomerKey ? "" : "disabled"}>Mark Campaign Sent</button>
          <button class="btn btn-ghost manage-only crm-edit-template" type="button" data-segment-id="${segmentId}" data-message="${sampleMessage.replaceAll('"', "&quot;")}">Edit</button>
          <button class="btn btn-ghost manage-only crm-delete-segment" type="button" data-segment-id="${segmentId}">Delete</button>
        </div>
      `;
      crmSegmentsList.appendChild(listItem);
    });
  }

  async function loadCrmSegments() {
    if (!canManageBusinessModules?.()) return;
    const res = await fetchImpl(withManagedBusiness?.("/api/crm/segments"), { headers: headers?.() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load CRM segments.");
    setCrmSegmentsPayload?.(data);
    renderCrmSegments();
  }

  async function sendCrmCampaign(payload) {
    const res = await fetchImpl(withManagedBusiness?.("/api/crm/campaigns/send"), {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify(payload || {})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to save CRM campaign activity.");
    return data;
  }

  function bindOperationsEvents() {
    waitlistForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const customerName = String(waitlistNameInput?.value || "").trim();
      const customerPhone = String(waitlistPhoneInput?.value || "").trim();
      const customerEmail = String(waitlistEmailInput?.value || "").trim().toLowerCase();
      const service = String(waitlistServiceInput?.value || "").trim();
      const preferred = parseWaitlistDateTime(waitlistDateInput?.value || "");
      if (!customerName) {
        setWaitlistStatus("Customer name is required.", true);
        return;
      }
      if (!customerPhone && !customerEmail) {
        setWaitlistStatus("Phone or email is required.", true);
        return;
      }
      if (waitlistDateInput?.value && !preferred) {
        setWaitlistStatus("Preferred date/time is invalid. Use a valid date/time.", true);
        return;
      }
      try {
        setWaitlistStatus("Saving waitlist entry...");
        await upsertWaitlistEntry({
          customerName,
          customerPhone,
          customerEmail,
          service,
          preferredDate: preferred?.preferredDate || "",
          preferredTime: preferred?.preferredTime || "",
          notes: ""
        });
        if (waitlistNameInput) waitlistNameInput.value = "";
        if (waitlistPhoneInput) waitlistPhoneInput.value = "";
        if (waitlistEmailInput) waitlistEmailInput.value = "";
        if (waitlistServiceInput) waitlistServiceInput.value = "";
        if (waitlistDateInput) waitlistDateInput.value = "";
        setWaitlistStatus("Waitlist entry saved.");
      } catch (error) {
        setWaitlistStatus(error.message, true);
      }
    });

    waitlistList?.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const entryId = String(target.getAttribute("data-id") || "").trim();
      if (!entryId) return;
      if (!isDashboardManagerRole?.() || !getManageModeEnabled?.()) return;
      try {
        if (target.classList.contains("waitlist-edit")) {
          const entry = (Array.isArray(getWaitlistRows?.()) ? getWaitlistRows() : []).find((row) => String(row.id || "") === entryId);
          if (!entry) return;
          const values = await openManageForm?.({
            title: "Edit Waitlist Entry",
            submitLabel: "Save",
            fields: [
              { id: "customerName", label: "Customer Name", required: true, value: entry.customerName || "" },
              { id: "customerPhone", label: "Customer Phone", value: entry.customerPhone || "" },
              { id: "customerEmail", label: "Customer Email", value: entry.customerEmail || "" },
              { id: "service", label: "Service", value: entry.service || "" },
              { id: "preferredDate", label: "Preferred Date", type: "date", value: entry.preferredDate || "" },
              { id: "preferredTime", label: "Preferred Time", type: "time", value: entry.preferredTime || "" }
            ]
          });
          if (!values) return;
          setWaitlistStatus("Saving waitlist entry...");
          await upsertWaitlistEntry({
            id: entryId,
            customerName: values.customerName,
            customerPhone: values.customerPhone,
            customerEmail: String(values.customerEmail || "").toLowerCase(),
            service: values.service,
            preferredDate: values.preferredDate,
            preferredTime: values.preferredTime
          });
          setWaitlistStatus("Waitlist entry updated.");
          showManageToast?.("Waitlist entry updated.");
          return;
        }
        if (target.classList.contains("waitlist-backfill")) {
          setWaitlistStatus("Marking waitlist entry as contacted...");
          await markWaitlistContacted(entryId);
          setWaitlistStatus("Waitlist entry marked as contacted.");
          return;
        }
        if (target.classList.contains("waitlist-remove")) {
          const confirmed = await openManageConfirm?.({
            title: "Delete Waitlist Entry",
            message: "Remove this waitlist entry?",
            confirmLabel: "Delete"
          });
          if (!confirmed) return;
          setWaitlistStatus("Removing waitlist entry...");
          await removeWaitlistEntry(entryId);
          setWaitlistStatus("Waitlist entry removed.");
          showManageToast?.("Waitlist entry deleted.");
        }
      } catch (error) {
        setWaitlistStatus(error.message, true);
      }
    });

    noShowRiskList?.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.classList.contains("ops-send-reminder")) return;
      const bookingId = String(target.getAttribute("data-booking-id") || "").trim();
      const customerName = String(target.getAttribute("data-customer-name") || "").trim();
      const service = String(target.getAttribute("data-service") || "").trim();
      if (!bookingId) return;
      try {
        setOperationsStatus("Saving reminder activity...");
        await markRebookingPromptSent({ customerKey: `booking:${bookingId}`, customerName, service });
        setOperationsStatus("Reminder activity logged.");
      } catch (error) {
        setOperationsStatus(error.message, true);
      }
    });

    rebookingPromptList?.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.classList.contains("ops-copy-rebooking")) {
        const message = String(target.getAttribute("data-message") || "").trim();
        if (!message) return;
        const copied = await writeToClipboard?.(message);
        setOperationsStatus(copied ? "Rebooking prompt copied to clipboard." : "Clipboard unavailable on this browser.", !copied);
        return;
      }
      if (!target.classList.contains("ops-mark-rebooking")) return;
      const customerKey = String(target.getAttribute("data-customer-key") || "").trim();
      const customerName = String(target.getAttribute("data-customer-name") || "").trim();
      const service = String(target.getAttribute("data-service") || "").trim();
      if (!customerKey) return;
      try {
        setOperationsStatus("Saving rebooking activity...");
        await markRebookingPromptSent({ customerKey, customerName, service });
        setOperationsStatus("Rebooking prompt marked as sent.");
      } catch (error) {
        setOperationsStatus(error.message, true);
      }
    });

    crmSegmentsList?.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.classList.contains("crm-copy-message")) {
        const message = String(target.getAttribute("data-message") || "").trim();
        if (!message) return;
        const copied = await writeToClipboard?.(message);
        setCrmStatus(copied ? "Campaign template copied to clipboard." : "Clipboard unavailable on this browser.", !copied);
        return;
      }
      if (!target.classList.contains("crm-mark-sent")) return;
      const segmentId = String(target.getAttribute("data-segment-id") || "").trim();
      const customerKey = String(target.getAttribute("data-customer-key") || "").trim();
      const customerName = String(target.getAttribute("data-customer-name") || "").trim();
      const message = String(target.getAttribute("data-message") || "").trim();
      if (!segmentId || !customerKey || !message) return;
      try {
        setCrmStatus("Saving campaign activity...");
        await sendCrmCampaign({ segmentId, customerKey, customerName, message, channel: "manual" });
        setCrmStatus("Campaign activity marked as sent.");
      } catch (error) {
        setCrmStatus(error.message, true);
      }
    });
  }

  return {
    setWaitlistStatus,
    parseWaitlistDateTime,
    buildWaitlistRecoveryPrefillDateTime,
    stageWaitlistRecoveryFromBooking,
    renderWaitlistSummary,
    renderWaitlist,
    applyWaitlistPayload,
    loadWaitlist,
    upsertWaitlistEntry,
    markWaitlistContacted,
    removeWaitlistEntry,
    setOperationsStatus,
    setCrmStatus,
    markRebookingPromptSent,
    renderOperationsInsights,
    renderCrmSegments,
    loadCrmSegments,
    sendCrmCampaign,
    bindOperationsEvents
  };
}
