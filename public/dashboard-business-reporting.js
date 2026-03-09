// Business Hub command deck and reporting runtime.
export function createBusinessReportingRuntime(deps) {
  const {
    win = window,
    doc = document,
    fetchImpl = fetch,
    getUserRole,
    getUserEmail,
    getUserName,
    getUserBusinessId,
    getManagedBusinessId,
    headers,
    withManagedBusiness,
    formatMoney,
    escapeHtml,
    todayDateKeyLocal,
    parseBookingDate,
    toDateKey,
    getBookingRows,
    getStaffWorkingForDate,
    getAccountingRows,
    getWaitlistRows,
    getOperationsInsights,
    getBusinessProfileServicesValue,
    getBusinessProfileNameValue,
    getBusinessProfileEmailValue,
    getBusinessProfilePhoneValue,
    getBusinessProfileCityValue,
    getBusinessProfileCountryValue,
    getStaffRosterRows,
    isDashboardDemoDataModeActive,
    openManageForm,
    setDashActionStatus,
    showManageToast,
    hubCommandSignalGrid,
    hubReportStatusPill,
    hubPrintReportBtn,
    hubEmailReportBtn,
    hubReportHighlights,
    hubReportStatusText,
    hubPriorityList,
    hubAutoRoutines,
    hubRunPrioritySweepBtn,
    localStorageKey
  } = deps || {};

  function loadHubAutoRoutinePrefs() {
    try {
      const parsed = JSON.parse(localStorage.getItem(localStorageKey || "") || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveHubAutoRoutinePrefs(value) {
    try {
      localStorage.setItem(localStorageKey || "", JSON.stringify(value || {}));
    } catch {
      // Ignore localStorage errors.
    }
  }

  function businessHubCommandModel() {
    const now = new Date();
    const todayKey = todayDateKeyLocal?.();
    const next7Cutoff = now.getTime() + 7 * 24 * 60 * 60 * 1000;
    const rows = Array.isArray(getBookingRows?.()) ? getBookingRows() : [];
    const todayBookings = rows.filter((row) => {
      const dt = parseBookingDate?.(row?.date);
      return dt ? toDateKey?.(dt) === todayKey : false;
    });
    const next7 = rows.filter((row) => {
      const dt = parseBookingDate?.(row?.date);
      if (!dt) return false;
      const dayTs = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 12).getTime();
      return dayTs >= new Date(new Date().setHours(0, 0, 0, 0)).getTime() && dayTs <= next7Cutoff;
    });
    const todayCancelled = todayBookings.filter((row) => String(row?.status || "").toLowerCase() === "cancelled").length;
    const todayRevenue = todayBookings
      .filter((row) => String(row?.status || "").toLowerCase() !== "cancelled")
      .reduce((sum, row) => sum + Number(row?.price || 0), 0);
    const workingToday = getStaffWorkingForDate?.(new Date()) || [];
    const workingTomorrow = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return getStaffWorkingForDate?.(d) || [];
    })();
    const accountingConnected = (Array.isArray(getAccountingRows?.()) ? getAccountingRows() : []).filter((row) => row?.connected || row?.status === "connected").length;
    const waitlistCount = Array.isArray(getWaitlistRows?.()) ? getWaitlistRows().length : 0;
    const operationsInsights = getOperationsInsights?.();
    const noShowRiskCount = Array.isArray(operationsInsights?.noShowRisk) ? operationsInsights.noShowRisk.length : 0;
    const rebookingPromptCount = Array.isArray(operationsInsights?.rebookingPrompts) ? operationsInsights.rebookingPrompts.length : 0;
    const servicesCount = String(getBusinessProfileServicesValue?.() || "").split("\n").map((v) => v.trim()).filter(Boolean).length;
    const profileReady = Boolean(String(getBusinessProfileNameValue?.() || "").trim() && String(getBusinessProfileEmailValue?.() || "").trim() && String(getBusinessProfilePhoneValue?.() || "").trim());
    const coverageRisk = todayBookings.length > 0 && workingToday.length === 0;
    const revenuePressure = todayCancelled >= 2 || noShowRiskCount >= 2;
    const setupGap = !profileReady || servicesCount < 3;
    const financeReady = accountingConnected > 0;
    const priorityItems = [
      coverageRisk
        ? { level: "critical", title: "Staff coverage gap today", note: "Bookings are in the diary but no rota cover is detected. Assign cover before opening.", action: "Open Staff Rota & Coverage", moduleKey: "staff" }
        : { level: "focus", title: "Confirm team cover for peak blocks", note: `${workingToday.length} staff scheduled today. Review AM/PM balance before the busiest slots.`, action: "Open Staff Rota & Coverage", moduleKey: "staff" },
      revenuePressure
        ? { level: "risk", title: "Protect today's revenue", note: `${todayCancelled} cancellations and ${noShowRiskCount} no-show risks flagged. Use waitlist and service recovery.`, action: "Open Waitlist Recovery", moduleKey: "waitlist" }
        : { level: "focus", title: "Use quiet windows for growth", note: "Diary pressure looks manageable. Queue review requests and referral outreach for completed clients.", action: "Open Reviews & Reputation", moduleKey: "reviews_reputation" },
      financeReady
        ? { level: "focus", title: "Close takings cleanly", note: `${accountingConnected} accounting connection${accountingConnected === 1 ? "" : "s"} active. Prepare a daily/weekly export or reconciliation note.`, action: "Open Accounting", moduleKey: "accounting" }
        : { level: "risk", title: "Accounting feed not connected", note: "Daily takings and reconciliation will need manual checks until a provider is connected.", action: "Open Accounting", moduleKey: "accounting" },
      setupGap
        ? { level: "risk", title: "Business profile still incomplete", note: `Profile ${profileReady ? "ready" : "missing contact details"} • ${servicesCount} services listed. Finish setup to improve booking conversion.`, action: "Open Business Profile", moduleKey: "business_profile" }
        : { level: "focus", title: "Launch setup is in good shape", note: "Use the Business Hub workspaces for daily operations, growth and finance actions.", action: "Open Business Hub", moduleKey: "home" }
    ];
    const signalCards = [
      { label: "Today Load", value: String(todayBookings.length), note: `${todayCancelled} cancelled • ${next7.length} in next 7 days` },
      { label: "Team Cover", value: String(workingToday.length), note: `${workingTomorrow.length} scheduled tomorrow` },
      { label: "Waitlist Ready", value: String(waitlistCount), note: `${rebookingPromptCount} recovery/rebooking prompts` },
      { label: "Takings Signal", value: formatMoney?.(todayRevenue), note: financeReady ? "Accounting feed live" : "Manual finance review" }
    ];
    const autoRoutines = [
      { key: "openingSweep", label: "Opening Sweep", note: "Prioritize staff cover, diary pressure and no-show risks before trade starts." },
      { key: "waitlistBackfill", label: "Waitlist Backfill", note: "Flag cancellations and stage same-day waitlist recovery prompts." },
      { key: "closeDayPack", label: "Close-Day Pack", note: "Prepare takings summary, follow-up actions and tomorrow staffing checks." }
    ];
    const reportHighlights = [
      `Bookings: ${rows.length} total • ${todayBookings.length} today • ${next7.length} within 7 days`,
      `Operations: ${workingToday.length} staff on rota today • ${waitlistCount} waitlist entries • ${noShowRiskCount} no-show risks`,
      `Finance: Today revenue signal ${formatMoney?.(todayRevenue)}${financeReady ? " • accounting connected" : " • accounting not connected"}`,
      `Setup: ${profileReady ? "Profile ready" : "Profile needs contact details"} • ${servicesCount} services listed`
    ];
    const healthScore = Math.max(35, Math.min(99, 100 - (coverageRisk ? 20 : 0) - (revenuePressure ? 12 : 0) - (setupGap ? 10 : 0) - (!financeReady ? 8 : 0)));
    return {
      generatedAt: new Date().toISOString(),
      todayKey,
      signalCards,
      priorityItems,
      autoRoutines,
      reportHighlights,
      summary: {
        bookingsTotal: rows.length,
        todayBookings: todayBookings.length,
        next7Bookings: next7.length,
        todayCancelled,
        todayRevenue,
        staffToday: workingToday.length,
        waitlistCount,
        noShowRiskCount,
        accountingConnected,
        healthScore
      }
    };
  }

  function renderBusinessHubCommandDeck() {
    const role = getUserRole?.();
    if (!(role === "subscriber" || role === "admin")) return;
    const model = businessHubCommandModel();
    if (hubCommandSignalGrid) {
      hubCommandSignalGrid.innerHTML = "";
      model.signalCards.forEach((card) => {
        const article = doc.createElement("article");
        article.className = "hub-command-signal";
        article.innerHTML = `<p>${escapeHtml(card.label)}</p><strong>${escapeHtml(card.value)}</strong><small>${escapeHtml(card.note)}</small>`;
        hubCommandSignalGrid.appendChild(article);
      });
    }
    if (hubReportHighlights) {
      hubReportHighlights.innerHTML = "";
      model.reportHighlights.forEach((line) => {
        const li = doc.createElement("li");
        li.className = "is-focus";
        li.innerHTML = `<strong>${escapeHtml(line.split(":")[0] || "Report")}</strong><small>${escapeHtml(line)}</small>`;
        hubReportHighlights.appendChild(li);
      });
    }
    if (hubPriorityList) {
      hubPriorityList.innerHTML = "";
      model.priorityItems.forEach((item) => {
        const li = doc.createElement("li");
        li.className = item.level === "critical" ? "is-critical" : item.level === "risk" ? "is-risk" : "is-focus";
        li.innerHTML = `
          <strong>${escapeHtml(item.title)}</strong>
          <small>${escapeHtml(item.note)}</small>
          <div style="margin-top:0.25rem;display:flex;gap:0.35rem;flex-wrap:wrap;">
            <button type="button" class="btn btn-ghost" data-module-jump="${escapeHtml(item.moduleKey || "home")}" style="min-height:30px;padding:0.2rem 0.45rem;font-size:0.68rem;">${escapeHtml(item.action || "Open")}</button>
          </div>
        `;
        hubPriorityList.appendChild(li);
      });
    }
    if (hubAutoRoutines) {
      const prefs = loadHubAutoRoutinePrefs();
      hubAutoRoutines.innerHTML = "";
      model.autoRoutines.forEach((item) => {
        const enabled = prefs[item.key] === true;
        const row = doc.createElement("div");
        row.className = "hub-auto-routine";
        row.innerHTML = `
          <div class="hub-auto-routine-copy">
            <strong>${escapeHtml(item.label)}</strong>
            <small>${escapeHtml(item.note)}</small>
          </div>
          <button type="button" class="btn btn-ghost" data-hub-auto-toggle="${escapeHtml(item.key)}" aria-pressed="${enabled ? "true" : "false"}">${enabled ? "Auto On" : "Auto Off"}</button>
        `;
        hubAutoRoutines.appendChild(row);
      });
    }
    if (hubReportStatusPill) {
      hubReportStatusPill.textContent = `${model.summary.healthScore}% ready`;
      hubReportStatusPill.classList.remove("muted");
    }
    if (hubReportStatusText) {
      hubReportStatusText.textContent = `Health score ${model.summary.healthScore}% • ${model.summary.todayBookings} bookings today • ${model.summary.staffToday} staff on rota today • ${model.summary.waitlistCount} waitlist entries.`;
    }
  }

  function buildBusinessReportPayload() {
    const model = businessHubCommandModel();
    const profileName = String(getBusinessProfileNameValue?.() || "").trim() || String(getUserName?.() || "Salon Business");
    const profileEmail = String(getBusinessProfileEmailValue?.() || getUserEmail?.() || "").trim();
    const profilePhone = String(getBusinessProfilePhoneValue?.() || "").trim();
    const services = String(getBusinessProfileServicesValue?.() || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 12);
    const staffList = (Array.isArray(getStaffRosterRows?.()) ? getStaffRosterRows() : []).slice(0, 20).map((member) => ({
      name: String(member?.name || "Staff"),
      role: String(member?.role || "team"),
      availability: String(member?.availability || "unknown")
    }));
    const bookingsRecent = (Array.isArray(getBookingRows?.()) ? getBookingRows() : []).slice(0, 25).map((row) => ({
      date: String(row?.date || ""),
      time: String(row?.time || ""),
      customerName: String(row?.customerName || "Client"),
      service: String(row?.service || ""),
      status: String(row?.status || "pending"),
      price: Number(row?.price || 0)
    }));
    return {
      generatedAt: new Date().toISOString(),
      reportDate: todayDateKeyLocal?.(),
      role: String(getUserRole?.() || ""),
      business: {
        id: String(getManagedBusinessId?.() || getUserBusinessId?.() || ""),
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        city: String(getBusinessProfileCityValue?.() || ""),
        country: String(getBusinessProfileCountryValue?.() || "")
      },
      summary: model.summary,
      signals: model.signalCards,
      priorities: model.priorityItems,
      reportHighlights: model.reportHighlights,
      services,
      staffList,
      bookingsRecent
    };
  }

  function buildBusinessReportHtml(payload) {
    const p = payload || {};
    const summary = p.summary || {};
    const business = p.business || {};
    const fmtMoney = (value) => formatMoney?.(Number(value || 0));
    const rows = Array.isArray(p.bookingsRecent) ? p.bookingsRecent : [];
    const priorities = Array.isArray(p.priorities) ? p.priorities : [];
    const services = Array.isArray(p.services) ? p.services : [];
    const staffList = Array.isArray(p.staffList) ? p.staffList : [];
    return `<!doctype html>
  <html><head><meta charset="utf-8" />
  <title>${escapeHtml(String(business.name || "Salon"))} - Business Report</title>
  <style>
    body{font-family:Segoe UI,Arial,sans-serif;margin:22px;color:#1f2430;background:#fff}
    h1,h2,h3{margin:0;color:#151823}
    p{margin:0;color:#4e5463;line-height:1.4}
    .head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;border:1px solid #e7e8ee;border-radius:14px;padding:14px}
    .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px}
    .card{border:1px solid #e7e8ee;border-radius:12px;padding:10px;background:#fafbff}
    .card p{font-size:12px;text-transform:uppercase;letter-spacing:.04em}
    .card strong{display:block;margin-top:4px;font-size:18px;color:#1e2431}
    .section{margin-top:14px;border:1px solid #ececf2;border-radius:14px;padding:12px}
    ul{margin:8px 0 0;padding-left:18px}
    li{margin:0 0 6px}
    table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12px}
    th,td{border-bottom:1px solid #ececf2;padding:7px 6px;text-align:left;vertical-align:top}
    th{color:#4f5666;font-weight:600;background:#fafbff}
    .muted{color:#6a7180}
    @media print {.section,.head,.card{break-inside:avoid}}
  </style></head><body>
    <div class="head">
      <div>
        <h1>${escapeHtml(String(business.name || "Salon Business"))} - Business Report</h1>
        <p>${escapeHtml(String(business.city || ""))}${business.city && business.country ? ", " : ""}${escapeHtml(String(business.country || ""))}</p>
        <p>${escapeHtml(String(business.phone || ""))}${business.phone && business.email ? " • " : ""}${escapeHtml(String(business.email || ""))}</p>
      </div>
      <div style="text-align:right">
        <p><strong style="font-size:13px;color:#1f2430;">Generated</strong></p>
        <p>${escapeHtml(new Date(p.generatedAt || Date.now()).toLocaleString("en-GB"))}</p>
        <p class="muted">Role: ${escapeHtml(String(p.role || ""))}</p>
      </div>
    </div>
    <div class="grid">
      <div class="card"><p>Today Bookings</p><strong>${escapeHtml(String(summary.todayBookings ?? 0))}</strong></div>
      <div class="card"><p>Next 7 Days</p><strong>${escapeHtml(String(summary.next7Bookings ?? 0))}</strong></div>
      <div class="card"><p>Today Revenue</p><strong>${escapeHtml(fmtMoney(summary.todayRevenue))}</strong></div>
      <div class="card"><p>Health Score</p><strong>${escapeHtml(String(summary.healthScore ?? 0))}%</strong></div>
    </div>
    <section class="section">
      <h2 style="font-size:15px;">AI Priorities</h2>
      <ul>${priorities.map((item) => `<li><strong>${escapeHtml(String(item?.title || ""))}</strong><br><span class="muted">${escapeHtml(String(item?.note || ""))}</span></li>`).join("") || "<li class='muted'>No priorities available.</li>"}</ul>
    </section>
    <section class="section">
      <h2 style="font-size:15px;">Business Highlights</h2>
      <ul>${(Array.isArray(p.reportHighlights) ? p.reportHighlights : []).map((line) => `<li>${escapeHtml(String(line || ""))}</li>`).join("") || "<li class='muted'>No highlights available.</li>"}</ul>
    </section>
    <section class="section">
      <h2 style="font-size:15px;">Team & Services Snapshot</h2>
      <table><thead><tr><th>Staff</th><th>Role</th><th>Availability</th></tr></thead><tbody>
      ${staffList.map((s) => `<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.role)}</td><td>${escapeHtml(s.availability)}</td></tr>`).join("") || "<tr><td colspan='3' class='muted'>No staff loaded.</td></tr>"}
      </tbody></table>
      <p style="margin-top:8px"><strong style="font-size:13px;color:#1f2430;">Services</strong></p>
      <p class="muted">${services.length ? escapeHtml(services.join(" • ")) : "No services listed yet."}</p>
    </section>
    <section class="section">
      <h2 style="font-size:15px;">Recent Bookings</h2>
      <table><thead><tr><th>Date</th><th>Time</th><th>Client</th><th>Service</th><th>Status</th><th>Price</th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td>${escapeHtml(r.date)}</td><td>${escapeHtml(r.time)}</td><td>${escapeHtml(r.customerName)}</td><td>${escapeHtml(r.service)}</td><td>${escapeHtml(r.status)}</td><td>${escapeHtml(fmtMoney(r.price))}</td></tr>`).join("") || "<tr><td colspan='6' class='muted'>No bookings available.</td></tr>"}
      </tbody></table>
    </section>
  </body></html>`;
  }

  function openPrintWindowWithHtml(html) {
    const popup = win.open("", "_blank", "noopener,noreferrer,width=980,height=760");
    if (!popup) {
      setDashActionStatus?.("Popup blocked. Allow popups to print the report.", true);
      return false;
    }
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    win.setTimeout(() => {
      try {
        popup.focus();
        popup.print();
      } catch {
        // Ignore print issues.
      }
    }, 220);
    return true;
  }

  async function printBusinessReportPdf() {
    const payload = buildBusinessReportPayload();
    const html = buildBusinessReportHtml(payload);
    const opened = openPrintWindowWithHtml(html);
    if (!opened) return;
    setDashActionStatus?.("Print dialog opened. Choose Save as PDF to create a business report PDF.");
    if (hubReportStatusPill) {
      hubReportStatusPill.textContent = "Print opened";
      hubReportStatusPill.classList.add("muted");
    }
  }

  async function queueBusinessReportEmail(recipientEmail, note = "") {
    const payload = buildBusinessReportPayload();
    const body = {
      recipientEmail: String(recipientEmail || "").trim(),
      subject: `${payload.business?.name || "Salon"} Business Report (${payload.reportDate})`,
      note: String(note || "").trim(),
      report: payload
    };
    if (isDashboardDemoDataModeActive?.()) {
      try {
        const key = "salon_ai_demo_report_emails_v1";
        const rows = JSON.parse(localStorage.getItem(key) || "[]");
        const next = Array.isArray(rows) ? rows : [];
        next.unshift({ id: `demo_report_${Date.now()}`, ...body, queuedAt: new Date().toISOString(), status: "queued_demo" });
        localStorage.setItem(key, JSON.stringify(next.slice(0, 40)));
        return { queued: true, status: "queued_demo" };
      } catch {
        throw new Error("Could not queue demo report email on this device.");
      }
    }
    const res = await fetchImpl(withManagedBusiness?.("/api/business-reports/email"), {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not queue business report email.");
    return data;
  }

  async function openBusinessReportEmailFlow() {
    const role = getUserRole?.();
    if (!(role === "subscriber" || role === "admin")) return;
    const values = await openManageForm?.({
      title: "Email Business Report",
      submitLabel: "Queue Email",
      fields: [
        { id: "recipientEmail", label: "Recipient Email", type: "email", required: true, value: String(getUserEmail?.() || "") },
        { id: "note", label: "Message Note", type: "textarea", placeholder: "Optional note for the recipient (e.g. weekly review before payroll)." }
      ]
    });
    if (!values) return;
    const recipientEmail = String(values.recipientEmail || "").trim();
    const note = String(values.note || "").trim();
    if (!recipientEmail) {
      setDashActionStatus?.("Recipient email is required.", true);
      return;
    }
    if (hubReportStatusPill) {
      hubReportStatusPill.textContent = "Queueing...";
      hubReportStatusPill.classList.add("muted");
    }
    try {
      const data = await queueBusinessReportEmail(recipientEmail, note);
      const queueMsg = data?.deliveryMode === "smtp" ? "Email sent." : "Email queued.";
      if (hubReportStatusPill) {
        hubReportStatusPill.textContent = data?.deliveryMode === "smtp" ? "Sent" : "Queued";
        hubReportStatusPill.classList.add("muted");
      }
      if (hubReportStatusText) {
        hubReportStatusText.textContent = `${queueMsg} Recipient: ${recipientEmail}. ${data?.queuedAt ? `Queued ${new Date(data.queuedAt).toLocaleString("en-GB")}.` : ""}`;
      }
      setDashActionStatus?.(`Business report ${data?.deliveryMode === "smtp" ? "sent" : "queued"} for email delivery.`);
      showManageToast?.(data?.deliveryMode === "smtp" ? "Business report sent." : "Business report queued.");
    } catch (error) {
      if (hubReportStatusPill) hubReportStatusPill.textContent = "Error";
      setDashActionStatus?.(error.message || "Could not queue business report email.", true);
    }
  }

  function bindBusinessReportingEvents() {
    hubPrintReportBtn?.addEventListener("click", async () => {
      const role = getUserRole?.();
      if (!(role === "subscriber" || role === "admin")) return;
      await printBusinessReportPdf();
    });

    hubEmailReportBtn?.addEventListener("click", async () => {
      const role = getUserRole?.();
      if (!(role === "subscriber" || role === "admin")) return;
      await openBusinessReportEmailFlow();
    });

    hubRunPrioritySweepBtn?.addEventListener("click", () => {
      const role = getUserRole?.();
      if (!(role === "subscriber" || role === "admin")) return;
      setDashActionStatus?.("AI sweep complete: priorities reordered for staffing, booking risk and finance readiness.");
      showManageToast?.("AI priority sweep complete.");
      renderBusinessHubCommandDeck();
    });

    hubAutoRoutines?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const btn = target.closest("[data-hub-auto-toggle]");
      if (!(btn instanceof HTMLElement)) return;
      const key = String(btn.getAttribute("data-hub-auto-toggle") || "").trim();
      if (!key) return;
      const prefs = loadHubAutoRoutinePrefs();
      prefs[key] = !(prefs[key] === true);
      saveHubAutoRoutinePrefs(prefs);
      renderBusinessHubCommandDeck();
      setDashActionStatus?.(`${key} ${prefs[key] ? "automation enabled" : "automation disabled"} for this device.`);
    });
  }

  return {
    loadHubAutoRoutinePrefs,
    saveHubAutoRoutinePrefs,
    businessHubCommandModel,
    renderBusinessHubCommandDeck,
    buildBusinessReportPayload,
    buildBusinessReportHtml,
    openPrintWindowWithHtml,
    printBusinessReportPdf,
    queueBusinessReportEmail,
    openBusinessReportEmailFlow,
    bindBusinessReportingEvents
  };
}
