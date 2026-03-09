// Bookings list, filters, metrics, and pagination runtime.
export function createBookingsRuntime(deps) {
  const {
    fetchImpl = fetch,
    getUserRole,
    getManagedBusinessId,
    headers,
    withManagedBusiness,
    escapeHtml,
    parseBookingDate,
    toDateKey,
    openManageForm,
    openManageConfirm,
    setDashActionStatus,
    showManageToast,
    syncLexiPendingReminders,
    refreshCustomerDashboard,
    renderExecutivePulse,
    renderSubscriberCalendar,
    renderBusinessGrowthPanel,
    renderCommandCenter,
    renderOperationsInsights,
    stageWaitlistRecoveryFromBooking,
    shouldRenderTopMetricsGrid,
    isDashboardManagerRole,
    isManageModeEnabled,
    isDashboardDemoDataModeActive,
    addMetric,
    bookingsList,
    bookingSearch,
    bookingStatus,
    bookingSort,
    statusChips,
    bookingPendingBanner,
    loadMoreBookingsBtn,
    bookingsCountLabel,
    metricsGrid,
    getBookingRows,
    setBookingRows,
    getNextBookingsCursor,
    setNextBookingsCursor,
    getBookingDateFilterKeys,
    getBookingDateFilterLabel,
    getSubscriberCommandCenter,
    setSubscriberCommandCenter,
    getOperationsInsights,
    setOperationsInsights
  } = deps || {};

  function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
  }

  function parseLexiBookingContextNotes(notes) {
    const raw = String(notes || "").trim();
    if (!raw.startsWith("LEXI_CONTEXT_V1:")) return null;
    try {
      const parsed = JSON.parse(raw.slice("LEXI_CONTEXT_V1:".length));
      return {
        summary: String(parsed?.summary || "").trim(),
        transcript: Array.isArray(parsed?.transcript)
          ? parsed.transcript
            .map((entry) => ({
              role: entry?.role === "assistant" ? "assistant" : "user",
              content: String(entry?.content || "").trim()
            }))
            .filter((entry) => entry.content)
          : []
      };
    } catch {
      return null;
    }
  }

  function isPendingConfirmationStatus(status) {
    const value = normalizeText(status);
    return value === "pending" || value === "pending_confirmation" || value === "awaiting_confirmation";
  }

  function formatBookingStatusLabel(status) {
    const value = normalizeText(status);
    if (isPendingConfirmationStatus(value)) return "Pending Confirmation";
    if (!value) return "Unknown";
    return value
      .split(/[_\s]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function renderBookings(bookings) {
    if (!bookingsList) return;
    bookingsList.innerHTML = "";
    if (!bookings.length) {
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <strong>No bookings yet.</strong><br />
          <small style="color:var(--muted);">Try the AI receptionist flow or share your booking link to get your first appointment.</small>
        </div>
        <div style="margin-top:0.45rem;">
          <button class="btn btn-ghost" type="button" data-module-jump="frontdesk" style="padding:0.32rem 0.65rem;font-size:0.75rem;">Open Front Desk</button>
        </div>
      `;
      bookingsList.appendChild(li);
      return;
    }
    bookings.forEach((booking) => {
      const pendingConfirmation = isPendingConfirmationStatus(booking?.status);
      const statusLabel = formatBookingStatusLabel(booking?.status);
      const isCancelled = normalizeText(booking?.status) === "cancelled";
      const lexiContext = parseLexiBookingContextNotes(booking?.notes);
      const lexiTranscriptHtml = (lexiContext?.transcript || [])
        .map((entry) => `<div style="margin-top:0.35rem;"><strong>${escapeHtml(entry.role === "assistant" ? "Lexi" : "Customer")}:</strong> ${escapeHtml(entry.content || "")}</div>`)
        .join("");
      const li = document.createElement("li");
      if (pendingConfirmation) li.classList.add("booking-row-pending");
      li.innerHTML = `
        <div class="booking-row-head">
          <div>
            <strong>${escapeHtml(booking.customerName || "Customer")}</strong><br />
            <small>${escapeHtml(booking.service || "Service")} on ${escapeHtml(booking.date || "N/A")} at ${escapeHtml(booking.time || "N/A")}</small>
          </div>
          <span class="booking-status-badge ${pendingConfirmation ? "pending" : ""}">${escapeHtml(statusLabel)}</span>
        </div>
        ${pendingConfirmation ? '<div class="booking-pending-note">Subscriber action required: confirm or contact the customer with an alternative slot.</div>' : ""}
        ${lexiContext?.summary ? `<div style="margin-top:0.45rem;padding:0.65rem 0.8rem;border-radius:12px;background:rgba(80,110,150,0.12);border:1px solid rgba(112,150,204,0.16);"><strong>Lexi Summary</strong><div style="margin-top:0.25rem;color:var(--muted);">${escapeHtml(lexiContext.summary)}</div></div>` : ""}
        ${lexiTranscriptHtml ? `<details style="margin-top:0.45rem;"><summary style="cursor:pointer;color:var(--muted);">View Lexi conversation</summary><div style="margin-top:0.45rem;padding:0.1rem 0.2rem 0.1rem 0;">${lexiTranscriptHtml}</div></details>` : ""}
        <div style="margin-top:0.4rem;display:flex;gap:0.4rem;flex-wrap:wrap;">
          <button class="btn btn-ghost manage-only cancel-booking" data-id="${booking.id}" ${booking.status === "cancelled" ? "disabled" : ""}>Delete</button>
          <button class="btn btn-ghost manage-only reschedule-booking" data-id="${booking.id}" ${booking.status === "cancelled" ? "disabled" : ""}>Edit</button>
          ${isCancelled ? `<button class="btn btn-ghost manage-only recover-booking-slot" data-id="${booking.id}">Recover Slot</button>` : ""}
        </div>
      `;
      bookingsList.appendChild(li);
    });
  }

  function getFilteredBookings() {
    const query = normalizeText(bookingSearch?.value);
    const statusFilter = normalizeText(bookingStatus?.value || "all");
    const sortMode = normalizeText(bookingSort?.value || "newest");
    const bookingDateFilterKeys = getBookingDateFilterKeys?.();
    let rows = Array.isArray(getBookingRows?.()) ? getBookingRows().slice() : [];
    if (bookingDateFilterKeys instanceof Set && bookingDateFilterKeys.size) {
      rows = rows.filter((booking) => {
        const date = parseBookingDate?.(booking?.date);
        return date ? bookingDateFilterKeys.has(toDateKey?.(date)) : false;
      });
    }
    if (statusFilter !== "all") {
      rows = rows.filter((booking) => {
        const rowStatus = normalizeText(booking.status);
        if (statusFilter === "pending") return isPendingConfirmationStatus(rowStatus);
        return rowStatus === statusFilter;
      });
    }
    if (query) {
      rows = rows.filter((booking) => {
        const blob = [
          booking.customerName,
          booking.service,
          booking.date,
          booking.time,
          booking.status,
          booking.businessName
        ]
          .map((value) => normalizeText(value))
          .join(" ");
        return blob.includes(query);
      });
    }
    if (sortMode === "oldest") {
      rows.sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
    } else if (sortMode === "status") {
      rows.sort((a, b) => normalizeText(a.status).localeCompare(normalizeText(b.status)));
    } else {
      rows.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    }
    return rows;
  }

  function updatePendingBookingBanner() {
    if (!bookingPendingBanner) return;
    const role = getUserRole?.();
    if (!(role === "subscriber" || role === "admin")) {
      bookingPendingBanner.hidden = true;
      return;
    }
    const rows = Array.isArray(getBookingRows?.()) ? getBookingRows() : [];
    const pendingRows = rows.filter((row) => isPendingConfirmationStatus(row?.status));
    if (!pendingRows.length) {
      bookingPendingBanner.hidden = true;
      return;
    }
    bookingPendingBanner.hidden = false;
    const strong = bookingPendingBanner.querySelector("strong");
    const small = bookingPendingBanner.querySelector("small");
    if (strong) {
      strong.textContent = `${pendingRows.length} pending booking${pendingRows.length === 1 ? "" : "s"} need confirmation`;
    }
    if (small) {
      small.textContent = "Review pending requests in Booking Operations and confirm them before the customer is notified.";
    }
  }

  function applyBookingFilters() {
    const filtered = getFilteredBookings();
    const rows = Array.isArray(getBookingRows?.()) ? getBookingRows() : [];
    const bookingDateFilterLabel = getBookingDateFilterLabel?.();
    renderBookings(filtered);
    updatePendingBookingBanner();
    syncLexiPendingReminders?.();
    if (bookingsCountLabel) {
      bookingsCountLabel.textContent = `Showing ${filtered.length} of ${rows.length} loaded bookings${bookingDateFilterLabel && bookingDateFilterLabel !== "All dates" ? ` (${bookingDateFilterLabel})` : ""}`;
    }
    refreshCustomerDashboard?.();
    renderExecutivePulse?.();
  }

  function setActiveStatusChip(status) {
    if (!statusChips) return;
    const chips = Array.from(statusChips.querySelectorAll(".status-chip"));
    chips.forEach((chip) => {
      const chipStatus = chip.getAttribute("data-status");
      chip.classList.toggle("active", chipStatus === status);
    });
  }

  async function cancelBooking(bookingId) {
    if (isDashboardDemoDataModeActive?.()) {
      const rows = Array.isArray(getBookingRows?.()) ? getBookingRows() : [];
      setBookingRows?.(rows.map((row) => (row.id === bookingId ? { ...row, status: "cancelled" } : row)));
      return;
    }
    const res = await fetchImpl(`/api/bookings/${bookingId}/cancel`, {
      method: "PATCH",
      headers: headers?.()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to cancel booking.");
  }

  async function rescheduleBooking(bookingId) {
    const values = await openManageForm?.({
      title: "Edit Booking",
      submitLabel: "Save",
      fields: [
        { id: "date", label: "New Date", type: "date", required: true },
        { id: "time", label: "New Time", type: "time", required: true }
      ]
    });
    if (!values) return;
    if (isDashboardDemoDataModeActive?.()) {
      const rows = Array.isArray(getBookingRows?.()) ? getBookingRows() : [];
      setBookingRows?.(
        rows.map((row) => (
          row.id === bookingId ? { ...row, date: values.date.trim(), time: values.time.trim() } : row
        ))
      );
      return;
    }
    const res = await fetchImpl(`/api/bookings/${bookingId}/reschedule`, {
      method: "PATCH",
      headers: headers?.(),
      body: JSON.stringify({ date: values.date.trim(), time: values.time.trim() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to reschedule booking.");
  }

  async function createBooking(payload) {
    const res = await fetchImpl("/api/bookings", {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to create booking.");
    return data.booking;
  }

  async function loadMetrics() {
    const role = getUserRole?.();
    if (role === "admin") {
      if (!getManagedBusinessId?.()) {
        setSubscriberCommandCenter?.(null);
        setOperationsInsights?.(null);
        renderCommandCenter?.();
        renderOperationsInsights?.();
        return;
      }
      const managedRes = await fetchImpl(withManagedBusiness?.("/api/dashboard/subscriber") || "/api/dashboard/subscriber", {
        headers: headers?.()
      });
      const managedData = await managedRes.json();
      if (!managedRes.ok) throw new Error(managedData.error || "Unable to load managed business metrics.");
      setSubscriberCommandCenter?.(managedData.commandCenter || null);
      renderCommandCenter?.();
      setOperationsInsights?.(managedData.operationsInsights || null);
      renderOperationsInsights?.();
      return;
    }
    const endpoint = `/api/dashboard/${role}`;
    const res = await fetchImpl(endpoint, { headers: headers?.() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load dashboard metrics.");
    const analytics = data.analytics || {};
    if (role === "subscriber") {
      setSubscriberCommandCenter?.(data.commandCenter || null);
      renderCommandCenter?.();
      setOperationsInsights?.(data.operationsInsights || null);
      renderOperationsInsights?.();
    }
    if (shouldRenderTopMetricsGrid?.()) {
      Object.entries(analytics).forEach(([key, value]) => addMetric?.(key, value));
    }
  }

  function updateLoadMoreState(isLoading = false) {
    if (!loadMoreBookingsBtn) return;
    if (getNextBookingsCursor?.()) {
      loadMoreBookingsBtn.style.display = "inline-flex";
      loadMoreBookingsBtn.disabled = isLoading;
      loadMoreBookingsBtn.textContent = isLoading ? "Loading..." : "Load More";
    } else {
      loadMoreBookingsBtn.style.display = "none";
    }
  }

  async function loadBookings({ append = false } = {}) {
    const role = getUserRole?.();
    const managedBusinessId = String(getManagedBusinessId?.() || "").trim();
    const params = new URLSearchParams({ limit: role === "admin" ? "500" : "50" });
    const endpoint = role === "admin" ? "/api/bookings" : "/api/me/bookings";
    if (role === "subscriber" && managedBusinessId) {
      params.set("businessId", managedBusinessId);
    }
    if (append && getNextBookingsCursor?.()) params.set("cursor", getNextBookingsCursor());
    const res = await fetchImpl(`${endpoint}?${params.toString()}`, { headers: headers?.() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load bookings.");
    const rows = Array.isArray(data.bookings) ? data.bookings : [];
    const currentRows = Array.isArray(getBookingRows?.()) ? getBookingRows() : [];
    setBookingRows?.(append ? currentRows.concat(rows) : rows);
    setNextBookingsCursor?.(data?.pagination?.nextCursor || null);
    updateLoadMoreState(false);
    applyBookingFilters();
    renderSubscriberCalendar?.();
    renderBusinessGrowthPanel?.();
  }

  function bindBookingEvents() {
    bookingSearch?.addEventListener("input", applyBookingFilters);

    bookingStatus?.addEventListener("change", () => {
      setActiveStatusChip(bookingStatus.value);
      applyBookingFilters();
    });

    bookingSort?.addEventListener("change", applyBookingFilters);

    bookingsList?.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const actionButton = target.closest(".recover-booking-slot, .cancel-booking, .reschedule-booking");
      if (!(actionButton instanceof HTMLElement)) return;
      const bookingId = actionButton.getAttribute("data-id");
      if (!bookingId) return;
      if (!isDashboardManagerRole?.() || !isManageModeEnabled?.()) return;

      try {
        if (actionButton.classList.contains("recover-booking-slot")) {
          const rows = Array.isArray(getBookingRows?.()) ? getBookingRows() : [];
          const booking = rows.find((row) => String(row?.id || "") === String(bookingId || ""));
          if (stageWaitlistRecoveryFromBooking?.(booking)) {
            showManageToast?.("Waitlist recovery form pre-filled.");
          }
          return;
        }
        if (actionButton.classList.contains("cancel-booking")) {
          const confirmed = await openManageConfirm?.({
            title: "Delete Booking",
            message: "Cancel this booking?",
            confirmLabel: "Delete"
          });
          if (!confirmed) return;
          await cancelBooking(bookingId);
          showManageToast?.("Booking deleted.");
        }
        if (actionButton.classList.contains("reschedule-booking")) {
          await rescheduleBooking(bookingId);
          showManageToast?.("Booking updated.");
        }
        if (isDashboardDemoDataModeActive?.()) {
          applyBookingFilters();
          renderSubscriberCalendar?.();
          return;
        }
        if (shouldRenderTopMetricsGrid?.() && metricsGrid) metricsGrid.innerHTML = "";
        await Promise.all([loadMetrics(), loadBookings({ append: false })]);
      } catch (error) {
        setDashActionStatus?.(error.message, true);
      }
    });

    loadMoreBookingsBtn?.addEventListener("click", async () => {
      if (!getNextBookingsCursor?.()) return;
      try {
        updateLoadMoreState(true);
        await loadBookings({ append: true });
      } catch (error) {
        updateLoadMoreState(false);
        setDashActionStatus?.(error.message, true);
      }
    });

    statusChips?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.classList.contains("status-chip")) return;
      const status = target.getAttribute("data-status");
      if (!status) return;
      if (bookingStatus) bookingStatus.value = status;
      setActiveStatusChip(status);
      applyBookingFilters();
    });
  }

  return {
    renderBookings,
    normalizeText,
    parseLexiBookingContextNotes,
    isPendingConfirmationStatus,
    formatBookingStatusLabel,
    getFilteredBookings,
    applyBookingFilters,
    updatePendingBookingBanner,
    setActiveStatusChip,
    cancelBooking,
    rescheduleBooking,
    createBooking,
    loadMetrics,
    updateLoadMoreState,
    loadBookings,
    bindBookingEvents
  };
}
