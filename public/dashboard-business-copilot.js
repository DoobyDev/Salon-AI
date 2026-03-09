// Business copilot popup, mic, context, and request runtime.
export function createBusinessCopilotRuntime(deps) {
  const {
    win = window,
    doc = document,
    fetchImpl = fetch,
    t = (_key, fallback) => String(fallback || ""),
    getUserRole,
    headers,
    escapeHtml,
    formatMoney,
    renderCopilotList,
    moduleDefinitionByKey,
    selectedCalendarDateSummary,
    parseBookingDate,
    toDateKey,
    todayDateKeyLocal,
    getBookingRows,
    getStaffWorkingForDate,
    getWaitlistRows,
    getOperationsInsights,
    getAccountingRows,
    getManagedBusinessId,
    getSubscriberAiScope,
    setSubscriberAiScope,
    getAdminAiScope,
    setAdminAiScope,
    DashboardSpeechRecognition,
    setDashActionStatus,
    getOpenCopilotPopupRole,
    setOpenCopilotPopupRole,
    getLastCopilotPopupTrigger,
    setLastCopilotPopupTrigger,
    getBusinessCopilotPopupHosts,
    setBusinessCopilotPopupHost,
    getBusinessCopilotPopupPlaceholders,
    setBusinessCopilotPopupPlaceholder,
    getBusinessLexiSpeechRecognition,
    setBusinessLexiSpeechRecognition,
    getBusinessLexiMicListening,
    setBusinessLexiMicListening,
    customerReceptionInput,
    subscriberCopilotForm,
    subscriberCopilotInput,
    subscriberCopilotSend,
    subscriberCopilotClear,
    subscriberCopilotAnswer,
    subscriberCopilotFindings,
    subscriberCopilotFixes,
    subscriberCopilotSnapshot,
    subscriberCopilotLinks,
    subscriberBusinessAiContext,
    subscriberAiScopeChips,
    subscriberCopilotOpenPopup,
    subscriberCopilotPopup,
    subscriberCopilotPopupClose,
    subscriberCopilotMessages,
    subscriberCopilotMicBtn,
    subscriberCopilotMicStopBtn,
    adminCopilotForm,
    adminCopilotInput,
    adminCopilotSend,
    adminCopilotClear,
    adminCopilotAnswer,
    adminCopilotFindings,
    adminCopilotFixes,
    adminBusinessAiContext,
    adminAiScopeChips,
    adminCopilotOpenPopup,
    adminCopilotPopup,
    adminCopilotPopupClose,
    adminCopilotMessages,
    adminCopilotMicBtn,
    adminCopilotMicStopBtn
  } = deps || {};

  function subscriberCopilotLinkCandidates() {
    return [
      { key: "command_center", label: "Command Center", keywords: ["priority", "focus", "today", "urgent", "what should i focus", "plan today"] },
      { key: "calendar", label: "Calendar", keywords: ["calendar", "diary", "day", "week", "month", "slot", "availability"] },
      { key: "booking_ops", label: "Booking Operations", keywords: ["booking", "bookings", "appointment", "appointments", "reschedule", "rescheduling", "change booking", "booking status"] },
      { key: "waitlist", label: "Waitlist", keywords: ["waitlist", "cancel", "cancellation", "backfill", "fill slot", "empty chair"] },
      { key: "staff", label: "Staff & Capacity", keywords: ["staff", "team", "capacity", "cover", "shift", "workload"] },
      { key: "operations", label: "No-Show & Rebooking", keywords: ["no-show", "noshow", "rebook", "rebooking", "missed appointments"] },
      { key: "crm", label: "CRM & Campaigns", keywords: ["crm", "campaign", "retention", "reactivation", "follow-up", "repeat bookings", "repeat clients"] },
      { key: "commercial", label: "Memberships & Packages", keywords: ["membership", "memberships", "package", "packages", "bundle", "gift card", "offer"] },
      { key: "accounting", label: "Accounting", keywords: ["accounting", "takings", "payout", "bookkeeping", "export", "reconcile"] },
      { key: "revenue", label: "Revenue Attribution", keywords: ["revenue", "roi", "channel", "marketing", "ads", "spend"] },
      { key: "profitability", label: "Profitability & Payroll", keywords: ["profit", "margin", "payroll", "break-even", "costs"] }
    ];
  }

  function renderSubscriberCopilotSnapshot(snapshot) {
    if (!subscriberCopilotSnapshot) return;
    const business = snapshot?.business || {};
    const bookings = snapshot?.bookings || {};
    const health = snapshot?.health || {};
    const cards = [
      { label: "Business", value: business.name || "Current business" },
      { label: "Type", value: business.type || "n/a" },
      { label: "Total Bookings", value: bookings.total ?? "n/a" },
      { label: "Cancelled", value: bookings.cancelled ?? "n/a" },
      { label: "Cancellation Rate", value: typeof bookings.cancelRatePct === "number" ? `${bookings.cancelRatePct}%` : "n/a" },
      { label: "Upcoming (7d)", value: bookings.upcoming7d ?? "n/a" },
      { label: "AI Service", value: health.openaiConfigured ? "Connected" : "Not connected" },
      { label: "Accounting Feed", value: health.accountingSignalsAvailable ? "Live" : "Not loaded" }
    ];
    subscriberCopilotSnapshot.innerHTML = "";
    cards.forEach((card) => {
      const article = doc.createElement("article");
      article.innerHTML = `<p>${escapeHtml?.(card.label)}</p><strong>${escapeHtml?.(String(card.value))}</strong>`;
      subscriberCopilotSnapshot.appendChild(article);
    });
  }

  function renderSubscriberCopilotLinks(links) {
    if (!subscriberCopilotLinks) return;
    const rows = Array.isArray(links) ? links.filter(Boolean) : [];
    subscriberCopilotLinks.innerHTML = "";
    subscriberCopilotLinks.classList.remove("is-visible");
    if (!rows.length) return;

    const label = doc.createElement("span");
    label.className = "copilot-answer-links-label";
    label.textContent = "Open this in your dashboard:";
    subscriberCopilotLinks.appendChild(label);

    rows.forEach((item) => {
      const button = doc.createElement("button");
      button.type = "button";
      button.className = "btn btn-ghost";
      button.setAttribute("data-module-jump", String(item.key || ""));
      button.textContent = String(item.label || "Open");
      subscriberCopilotLinks.appendChild(button);
    });

    subscriberCopilotLinks.classList.add("is-visible");
  }

  function buildSubscriberCopilotLinks(payload, question = "") {
    const searchableParts = [
      question,
      payload?.answer,
      ...(Array.isArray(payload?.findings) ? payload.findings : []),
      ...(Array.isArray(payload?.suggestedActions) ? payload.suggestedActions : []),
      ...(Array.isArray(payload?.suggestedFixes) ? payload.suggestedFixes : [])
    ]
      .filter(Boolean)
      .map((part) => String(part).toLowerCase());

    const haystack = searchableParts.join(" \n ");
    const picked = [];
    const seen = new Set();
    const candidates = subscriberCopilotLinkCandidates();

    candidates.forEach((candidate) => {
      if (seen.has(candidate.key)) return;
      if (!moduleDefinitionByKey?.(candidate.key)) return;
      const hit = candidate.keywords.some((word) => haystack.includes(word));
      if (!hit) return;
      picked.push({ key: candidate.key, label: candidate.label });
      seen.add(candidate.key);
    });

    if (!picked.length) {
      ["command_center", "calendar", "booking_ops"].forEach((key) => {
        if (seen.has(key)) return;
        const mod = moduleDefinitionByKey?.(key);
        if (!mod) return;
        picked.push({ key, label: mod.label });
        seen.add(key);
      });
    }

    return picked.slice(0, 4);
  }

  function copilotPopupRefs(role) {
    if (role === "admin") {
      return {
        overlay: adminCopilotPopup,
        input: adminCopilotInput,
        messages: adminCopilotMessages,
        answer: adminCopilotAnswer,
        openBtn: adminCopilotOpenPopup,
        closeBtn: adminCopilotPopupClose,
        micBtn: adminCopilotMicBtn,
        stopBtn: adminCopilotMicStopBtn
      };
    }
    return {
      overlay: subscriberCopilotPopup,
      input: subscriberCopilotInput,
      messages: subscriberCopilotMessages,
      answer: subscriberCopilotAnswer,
      openBtn: subscriberCopilotOpenPopup,
      closeBtn: subscriberCopilotPopupClose,
      micBtn: subscriberCopilotMicBtn,
      stopBtn: subscriberCopilotMicStopBtn
    };
  }

  function dashboardMicSupported() {
    return typeof DashboardSpeechRecognition === "function";
  }

  function getBusinessAiPopupCard(role) {
    const refs = copilotPopupRefs(role);
    const host = getBusinessCopilotPopupHosts?.()?.[role];
    return (host instanceof HTMLElement ? host.querySelector(".copilot-chat-popup") : null)
      || refs.overlay?.querySelector(".copilot-chat-popup")
      || null;
  }

  function businessLexiStatusRefs(role) {
    const popupCard = getBusinessAiPopupCard(role);
    const prefix = role === "admin" ? "admin" : "subscriber";
    return {
      popupCard,
      micBtn: popupCard?.querySelector(`#${prefix}CopilotMicBtn`) || null,
      stopBtn: popupCard?.querySelector(`#${prefix}CopilotMicStopBtn`) || null,
      status: popupCard?.querySelector(`#${prefix}CopilotAvatarStatus`) || null,
      transcript: popupCard?.querySelector(`#${prefix}CopilotAvatarTranscript`) || null,
      shell: popupCard?.querySelector(".lexi-avatar-shell") || null
    };
  }

  function setBusinessLexiPanelState(role, state, status, transcript) {
    const refs = businessLexiStatusRefs(role);
    if (refs.shell instanceof HTMLElement) refs.shell.setAttribute("data-avatar-state", state);
    if (refs.status) refs.status.textContent = status;
    if (refs.transcript) refs.transcript.textContent = transcript;
  }

  function setBusinessLexiMicButtonState(role, listening = false) {
    const refs = businessLexiStatusRefs(role);
    const supported = dashboardMicSupported();
    if (refs.micBtn instanceof HTMLButtonElement) {
      refs.micBtn.disabled = !supported;
      refs.micBtn.textContent = listening ? t("dashboard.listening", "Listening...") : t("common.push_to_talk", "Push to Talk");
    }
    if (refs.stopBtn instanceof HTMLButtonElement) {
      refs.stopBtn.disabled = !supported || !listening;
      refs.stopBtn.textContent = "Stop";
    }
  }

  function stopBusinessLexiMicCapture(role) {
    try {
      getBusinessLexiSpeechRecognition?.()?.[role]?.stop?.();
    } catch {}
  }

  function startBusinessLexiMicCapture(role) {
    if (getBusinessLexiMicListening?.()?.[role]) {
      stopBusinessLexiMicCapture(role);
      return;
    }
    if (!dashboardMicSupported()) {
      setDashActionStatus?.("Push-to-talk is not supported in this browser.", true, 2600);
      setBusinessLexiPanelState(role, "speaking", "Push-to-talk is unavailable.", "This browser does not support speech capture.");
      return;
    }
    const refs = copilotPopupRefs(role);
    if (!refs.input) return;
    const recognition = new DashboardSpeechRecognition();
    let finalTranscript = "";
    recognition.lang = "en-GB";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setBusinessLexiMicListening?.(role, true);
      setBusinessLexiSpeechRecognition?.(role, recognition);
      setBusinessLexiMicButtonState(role, true);
      setBusinessLexiPanelState(role, "listening", "Lexi is listening.", "Say your question, then review the text before sending it.");
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results || [])
        .map((result) => String(result?.[0]?.transcript || ""))
        .join(" ")
        .trim();
      if (!transcript) return;
      finalTranscript = transcript;
      refs.input.value = transcript;
      setBusinessLexiPanelState(role, "listening", "Lexi is listening.", `You: ${transcript}`);
    };
    recognition.onerror = (event) => {
      const message = String(event?.error || "speech error").replace(/_/g, " ").trim();
      setDashActionStatus?.(`Mic error: ${message}`, true, 2600);
      setBusinessLexiPanelState(role, "speaking", "Lexi hit a mic error.", `Mic error: ${message}`);
    };
    recognition.onend = () => {
      setBusinessLexiMicListening?.(role, false);
      setBusinessLexiSpeechRecognition?.(role, null);
      setBusinessLexiMicButtonState(role, false);
      setBusinessLexiPanelState(
        role,
        "idle",
        "Push-to-talk is ready.",
        finalTranscript
          ? t("dashboard.review_words_then_press_ask", "Review your words in the chat box, then press Ask Lexi.")
          : t("common.push_to_talk_ready_prompt", "Press Push to Talk when you want to speak.")
      );
      refs.input.focus();
    };
    recognition.start();
  }

  function appendCopilotChatMessage(role, kind, text, options = {}) {
    const refs = copilotPopupRefs(role);
    if (!refs.messages) return null;
    const row = doc.createElement("div");
    row.className = `customer-chat-msg ${kind === "user" ? "user" : "ai"}${options.pending ? " is-pending" : ""}`;
    row.textContent = String(text || "");
    refs.messages.appendChild(row);
    refs.messages.scrollTop = refs.messages.scrollHeight;
    return { row, bubble: row };
  }

  function ensureCopilotChatSeed(role) {
    const refs = copilotPopupRefs(role);
    if (!refs.messages || refs.messages.childElementCount > 0) return;
    appendCopilotChatMessage(role, "assistant", String(refs.answer?.textContent || t("dashboard.ask_lexi_help", "Ask Lexi a question and I'll help.")));
  }

  function resetCopilotChat(role, introText) {
    const refs = copilotPopupRefs(role);
    if (refs.messages) refs.messages.innerHTML = "";
    appendCopilotChatMessage(role, "assistant", introText);
  }

  function ensureBusinessAiPopupHost(role) {
    const current = getBusinessCopilotPopupHosts?.()?.[role];
    if (current instanceof HTMLElement) return current;
    const host = doc.createElement("div");
    host.className = "copilot-chat-popup-overlay home-lexi-popup-overlay";
    host.setAttribute("aria-hidden", "true");
    host.addEventListener("click", (event) => {
      if (event.target === host) closeBusinessAiChatPopup(role);
    });
    setBusinessCopilotPopupHost?.(role, host);
    return host;
  }

  function setBusinessAiPrompt(role, prompt) {
    const text = String(prompt || "").trim();
    if (!text) return;
    if (role === "admin") {
      if (adminCopilotInput) adminCopilotInput.value = text;
      adminCopilotInput?.focus();
    } else {
      if (subscriberCopilotInput) subscriberCopilotInput.value = text;
      subscriberCopilotInput?.focus();
    }
  }

  function openBusinessAiChatPopup(role, options = {}) {
    const refs = copilotPopupRefs(role);
    if (!refs.overlay) return;
    const popupCard = refs.overlay.querySelector(".copilot-chat-popup");
    if (!(popupCard instanceof HTMLElement)) return;
    const host = ensureBusinessAiPopupHost(role);
    if (!(host instanceof HTMLElement)) return;
    let placeholder = getBusinessCopilotPopupPlaceholders?.()?.[role];
    if (!(placeholder instanceof HTMLElement)) {
      placeholder = doc.createElement("div");
      placeholder.className = "home-lexi-chat-placeholder";
      setBusinessCopilotPopupPlaceholder?.(role, placeholder);
    }
    if (popupCard.parentNode && popupCard.parentNode !== host) {
      popupCard.parentNode.insertBefore(placeholder, popupCard);
    }
    if (host.parentElement !== doc.body) {
      doc.body.appendChild(host);
    }
    host.appendChild(popupCard);
    host.classList.add("is-open");
    host.setAttribute("aria-hidden", "false");
    doc.body.classList.add("home-lexi-popup-open");
    setOpenCopilotPopupRole?.(role);
    if (options.trigger instanceof HTMLElement) {
      setLastCopilotPopupTrigger?.(options.trigger);
    }
    if (typeof options.prompt === "string" && options.prompt.trim()) {
      setBusinessAiPrompt(role, options.prompt);
    }
    ensureCopilotChatSeed(role);
    setBusinessLexiMicButtonState(role, false);
    setBusinessLexiPanelState(
      role,
      "idle",
      "Push-to-talk is ready.",
      "Ask about bookings, treatments, operations, or business decisions from this one popup."
    );
    if (options.focusInput !== false) {
      win.requestAnimationFrame(() => refs.input?.focus());
    }
  }

  function closeBusinessAiChatPopup(role) {
    const refs = copilotPopupRefs(role);
    if (!refs.overlay) return;
    const host = getBusinessCopilotPopupHosts?.()?.[role];
    const popupCard = (host instanceof HTMLElement ? host.querySelector(".copilot-chat-popup") : null)
      || refs.overlay.querySelector(".copilot-chat-popup");
    const placeholder = getBusinessCopilotPopupPlaceholders?.()?.[role];
    stopBusinessLexiMicCapture(role);
    if (host instanceof HTMLElement) {
      host.classList.remove("is-open");
      host.setAttribute("aria-hidden", "true");
    }
    if (popupCard instanceof HTMLElement && placeholder?.parentNode) {
      placeholder.parentNode.insertBefore(popupCard, placeholder);
      placeholder.remove();
    }
    doc.body.classList.remove("home-lexi-popup-open");
    if (getOpenCopilotPopupRole?.() === role) {
      setOpenCopilotPopupRole?.("");
      const trigger = getLastCopilotPopupTrigger?.();
      if (trigger instanceof HTMLElement) {
        trigger.focus();
      }
      setLastCopilotPopupTrigger?.(null);
    }
  }

  function renderSubscriberCopilotResponse(payload, options = {}) {
    if (subscriberCopilotAnswer) {
      subscriberCopilotAnswer.textContent = String(payload?.answer || t("dashboard.no_reply_yet", "No reply came back yet."));
    }
    renderSubscriberCopilotLinks(buildSubscriberCopilotLinks(payload, options.question));
  }

  function renderAdminCopilotResponse(payload) {
    if (adminCopilotAnswer) {
      adminCopilotAnswer.textContent = String(payload?.answer || t("dashboard.no_reply_yet", "No reply came back yet."));
    }
    renderCopilotList?.(adminCopilotFindings, payload?.findings, "No findings.");
    renderCopilotList?.(adminCopilotFixes, payload?.suggestedFixes, "No suggested fixes.");
  }

  function businessAiContextString(role) {
    const selected = selectedCalendarDateSummary?.();
    const today = todayDateKeyLocal?.();
    const bookingRows = Array.isArray(getBookingRows?.()) ? getBookingRows() : [];
    const todayRows = bookingRows.filter((row) => {
      const dt = parseBookingDate?.(row?.date);
      return dt ? toDateKey?.(dt) === today : false;
    });
    const todayCancelled = todayRows.filter((row) => String(row?.status || "").toLowerCase() === "cancelled").length;
    const todayRevenue = todayRows
      .filter((row) => String(row?.status || "").toLowerCase() !== "cancelled")
      .reduce((sum, row) => sum + Number(row?.price || 0), 0);
    const workingToday = getStaffWorkingForDate?.(new Date())?.length || 0;
    const waitlistCount = Array.isArray(getWaitlistRows?.()) ? getWaitlistRows().length : 0;
    const operationsInsights = getOperationsInsights?.();
    const noShowRiskCount = Array.isArray(operationsInsights?.noShowRisk) ? operationsInsights.noShowRisk.length : 0;
    const accountingRows = Array.isArray(getAccountingRows?.()) ? getAccountingRows() : [];
    const accountingConnected = accountingRows.filter((row) => row?.connected || row?.status === "connected").length;
    const scope = role === "admin" ? getAdminAiScope?.() : getSubscriberAiScope?.();
    const parts = [
      `Scope: ${scope}`,
      `Today: ${todayRows.length} bookings, ${todayCancelled} cancelled, revenue signal ${formatMoney?.(todayRevenue)}, ${workingToday} staff on rota`,
      `Waitlist: ${waitlistCount} entries`,
      `No-show risks: ${noShowRiskCount}`,
      `Accounting: ${accountingConnected ? `${accountingConnected} connection(s) live` : "not connected"}`
    ];
    if (selected) {
      parts.push(`Selected day (${selected.dateKey}): ${selected.bookings} bookings, ${selected.cancelled} cancelled, ${selected.staffCount} staff, revenue ${formatMoney?.(selected.revenue)}`);
    }
    if (role === "admin" && getManagedBusinessId?.()) {
      parts.unshift(`Managed business: ${getManagedBusinessId?.()}`);
    }
    return parts.join(" | ");
  }

  function renderBusinessAiWorkspace(role) {
    const isAdmin = role === "admin";
    const contextEl = isAdmin ? adminBusinessAiContext : subscriberBusinessAiContext;
    const scopeWrap = isAdmin ? adminAiScopeChips : subscriberAiScopeChips;
    if (!(contextEl instanceof HTMLElement)) return;
    const bookingRows = Array.isArray(getBookingRows?.()) ? getBookingRows() : [];
    const selected = selectedCalendarDateSummary?.();
    const today = todayDateKeyLocal?.();
    const todayCount = bookingRows.filter((row) => {
      const dt = parseBookingDate?.(row?.date);
      return dt ? toDateKey?.(dt) === today : false;
    }).length;
    const waitlistCount = Array.isArray(getWaitlistRows?.()) ? getWaitlistRows().length : 0;
    const operationsInsights = getOperationsInsights?.();
    const noShowRiskCount = Array.isArray(operationsInsights?.noShowRisk) ? operationsInsights.noShowRisk.length : 0;
    const staffToday = getStaffWorkingForDate?.(new Date())?.length || 0;
    const revenueToday = bookingRows
      .filter((row) => {
        const dt = parseBookingDate?.(row?.date);
        return dt ? toDateKey?.(dt) === today && String(row?.status || "").toLowerCase() !== "cancelled" : false;
      })
      .reduce((sum, row) => sum + Number(row?.price || 0), 0);

    contextEl.innerHTML = `
      <strong>${isAdmin ? "Managed Business AI Context" : "Business AI Context"}</strong><br />
      ${isAdmin ? "Diagnostics and subscriber support recommendations" : "Operational and growth recommendations for your salon"} •
      Today: <strong>${todayCount}</strong> bookings • <strong>${staffToday}</strong> staff •
      Waitlist <strong>${waitlistCount}</strong> • No-show risks <strong>${noShowRiskCount}</strong> •
      Revenue signal <strong>${escapeHtml?.(formatMoney?.(revenueToday))}</strong>
      ${selected ? `<br />Selected day: <strong>${escapeHtml?.(selected.label)}</strong> (${escapeHtml?.(selected.dateKey)}) • ${selected.bookings} bookings • ${selected.staffCount} staff${selected.staffNames.length ? ` • ${escapeHtml?.(selected.staffNames.join(", "))}` : ""}` : `<br />Select a day in the Booking Diary to let AI focus on that specific date.`}
    `;

    if (scopeWrap) {
      const currentScope = isAdmin ? getAdminAiScope?.() : getSubscriberAiScope?.();
      scopeWrap.querySelectorAll(".ai-scope-chip").forEach((btn) => {
        if (!(btn instanceof HTMLElement)) return;
        btn.classList.toggle("is-active", String(btn.getAttribute("data-ai-scope") || "") === currentScope);
      });
    }
  }

  function copilotPromptWithBusinessContext(role, question) {
    const q = String(question || "").trim();
    if (!q) return "";
    const context = businessAiContextString(role);
    return `${q}\n\nOptional business context (use only if relevant to the question):\n${context}`;
  }

  async function askSubscriberCopilot(question) {
    const role = getUserRole?.();
    if (!(role === "subscriber" || role === "admin")) throw new Error("Subscriber copilot is unavailable.");
    const res = await fetchImpl("/api/copilot/subscriber", {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify({ question: String(question || "").trim() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Subscriber copilot is unavailable.");
    return data;
  }

  async function askAdminCopilot(question) {
    if (getUserRole?.() !== "admin") throw new Error("Admin copilot is only available to admins.");
    const body = { question: String(question || "").trim() };
    if (getManagedBusinessId?.()) body.businessId = getManagedBusinessId?.();
    const res = await fetchImpl("/api/admin/copilot", {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Admin copilot is unavailable.");
    return data;
  }

  function bindCopilotEvents() {
    subscriberCopilotMicBtn?.addEventListener("click", () => startBusinessLexiMicCapture("subscriber"));
    subscriberCopilotMicStopBtn?.addEventListener("click", () => stopBusinessLexiMicCapture("subscriber"));
    subscriberCopilotPopupClose?.addEventListener("click", () => closeBusinessAiChatPopup("subscriber"));
    subscriberCopilotPopup?.addEventListener("click", (event) => {
      if (event.target === subscriberCopilotPopup) closeBusinessAiChatPopup("subscriber");
    });

    adminCopilotMicBtn?.addEventListener("click", () => startBusinessLexiMicCapture("admin"));
    adminCopilotMicStopBtn?.addEventListener("click", () => stopBusinessLexiMicCapture("admin"));
    adminCopilotPopupClose?.addEventListener("click", () => closeBusinessAiChatPopup("admin"));
    adminCopilotPopup?.addEventListener("click", (event) => {
      if (event.target === adminCopilotPopup) closeBusinessAiChatPopup("admin");
    });

    doc.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !getOpenCopilotPopupRole?.()) return;
      closeBusinessAiChatPopup(getOpenCopilotPopupRole?.());
    });

    adminCopilotForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (getUserRole?.() !== "admin") return;
      const question = String(adminCopilotInput?.value || "").trim();
      if (!question) return;
      if (adminCopilotInput) adminCopilotInput.value = "";
      openBusinessAiChatPopup("admin", { focusInput: false });
      appendCopilotChatMessage("admin", "user", question);
      const pending = appendCopilotChatMessage("admin", "assistant", t("dashboard.admin_pending", "Give me a moment while I check platform health and pull together the key fixes."), { pending: true });
      if (adminCopilotSend) adminCopilotSend.disabled = true;
      if (adminCopilotAnswer) adminCopilotAnswer.textContent = t("dashboard.admin_pending", "Give me a moment while I check platform health and pull together the key fixes.");
      try {
        const payload = await askAdminCopilot(copilotPromptWithBusinessContext("admin", question));
        renderAdminCopilotResponse(payload);
        if (pending?.bubble) {
          pending.bubble.textContent = String(payload?.answer || t("dashboard.no_reply_yet", "No reply came back yet."));
          pending.row?.classList.remove("is-pending");
        }
      } catch (error) {
        const fallback = {
          answer: error.message || t("dashboard.admin_check_failed", "I couldn't complete that admin Lexi check just now."),
          findings: [t("dashboard.admin_request_failed", "I couldn't complete that admin request right now.")],
          suggestedFixes: ["Check the AI service setup and server logs, then try again."],
          snapshot: null
        };
        renderAdminCopilotResponse(fallback);
        if (pending?.bubble) {
          pending.bubble.textContent = String(fallback.answer || t("dashboard.admin_check_failed", "I couldn't complete that admin Lexi check just now."));
          pending.row?.classList.remove("is-pending");
        }
      } finally {
        if (adminCopilotSend) adminCopilotSend.disabled = false;
      }
    });

    adminCopilotClear?.addEventListener("click", () => {
      if (adminCopilotInput) adminCopilotInput.value = "";
      resetCopilotChat("admin", t("dashboard.admin_intro", "Ask Lexi about admin checks, managed businesses, bookings, or general salon, barber, and beauty questions."));
      renderAdminCopilotResponse({
        answer: t("dashboard.admin_intro", "Ask Lexi about admin checks, managed businesses, bookings, or general salon, barber, and beauty questions."),
        findings: [],
        suggestedFixes: [],
        snapshot: null
      });
    });

    [customerReceptionInput, adminCopilotInput, subscriberCopilotInput].forEach((input) => {
      input?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" || event.shiftKey) return;
        event.preventDefault();
        const form = input.closest("form");
        if (form instanceof HTMLFormElement) form.requestSubmit();
      });
    });

    subscriberCopilotForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const role = getUserRole?.();
      if (!(role === "subscriber" || role === "admin")) return;
      const question = String(subscriberCopilotInput?.value || "").trim();
      if (!question) return;
      if (subscriberCopilotInput) subscriberCopilotInput.value = "";
      openBusinessAiChatPopup("subscriber", { focusInput: false });
      appendCopilotChatMessage("subscriber", "user", question);
      const pending = appendCopilotChatMessage("subscriber", "assistant", t("dashboard.subscriber_pending", "Give me a moment while I check today's bookings and business signals so I can give you clear advice."), { pending: true });
      if (subscriberCopilotSend) subscriberCopilotSend.disabled = true;
      if (subscriberCopilotAnswer) subscriberCopilotAnswer.textContent = t("dashboard.subscriber_pending", "Give me a moment while I check today's bookings and business signals so I can give you clear advice.");
      try {
        const payload = await askSubscriberCopilot(copilotPromptWithBusinessContext("subscriber", question));
        renderSubscriberCopilotResponse(payload, { question });
        if (pending?.bubble) {
          pending.bubble.textContent = String(payload?.answer || t("dashboard.no_reply_yet", "No reply came back yet."));
          pending.row?.classList.remove("is-pending");
        }
      } catch (error) {
        const fallback = {
          answer: error.message || t("dashboard.subscriber_check_failed", "I couldn't complete that Lexi check just now."),
          findings: [t("dashboard.request_failed", "I couldn't complete that request right now.")],
          suggestedActions: ["Check the server logs and AI service setup, then try again."],
          snapshot: null
        };
        renderSubscriberCopilotResponse(fallback, { question });
        if (pending?.bubble) {
          pending.bubble.textContent = String(fallback.answer || t("dashboard.subscriber_check_failed", "I couldn't complete that Lexi check just now."));
          pending.row?.classList.remove("is-pending");
        }
      } finally {
        if (subscriberCopilotSend) subscriberCopilotSend.disabled = false;
      }
    });

    subscriberCopilotClear?.addEventListener("click", () => {
      if (subscriberCopilotInput) subscriberCopilotInput.value = "";
      resetCopilotChat("subscriber", t("dashboard.subscriber_intro", "Ask Lexi about your dashboard, bookings, services, products, or day-to-day salon questions."));
      renderSubscriberCopilotResponse({
        answer: t("dashboard.subscriber_intro", "Ask Lexi about your dashboard, bookings, services, products, or day-to-day salon questions."),
        findings: [],
        suggestedActions: [],
        snapshot: null
      }, { question: "" });
    });

    subscriberAiScopeChips?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const chip = target.closest(".ai-scope-chip");
      if (!(chip instanceof HTMLElement)) return;
      const scope = String(chip.getAttribute("data-ai-scope") || "").trim().toLowerCase();
      if (!scope) return;
      setSubscriberAiScope?.(scope);
      const examples = {
        today: "What should I focus on first today to reduce cancellations and increase revenue?",
        calendar: "Review my diary this week and tell me where I have pressure, gaps and opportunities.",
        staff: "Check staffing cover and capacity. What changes should I make today?",
        revenue: "How can I protect today's revenue and improve the next 7 days?",
        growth: "What growth action should I run today for repeat bookings and reviews?"
      };
      if (subscriberCopilotInput) subscriberCopilotInput.placeholder = examples[scope] || examples.today;
      renderBusinessAiWorkspace("subscriber");
    });

    adminAiScopeChips?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const chip = target.closest(".ai-scope-chip");
      if (!(chip instanceof HTMLElement)) return;
      const scope = String(chip.getAttribute("data-ai-scope") || "").trim().toLowerCase();
      if (!scope) return;
      setAdminAiScope?.(scope);
      const examples = {
        diagnostics: "Run a diagnostics sweep and tell me the top issues to check first.",
        calendar: "Review this managed business calendar and flag operational risks for the next 7 days.",
        staff: "Check staffing and capacity risk for this managed business and suggest actions.",
        revenue: "Check cancellations and takings. What should the subscriber focus on first?",
        risk: "What are the highest business risks right now and what should be escalated?"
      };
      if (adminCopilotInput) adminCopilotInput.placeholder = examples[scope] || examples.diagnostics;
      renderBusinessAiWorkspace("admin");
    });
  }

  return {
    renderSubscriberCopilotSnapshot,
    subscriberCopilotLinkCandidates,
    renderSubscriberCopilotLinks,
    buildSubscriberCopilotLinks,
    copilotPopupRefs,
    dashboardMicSupported,
    getBusinessAiPopupCard,
    businessLexiStatusRefs,
    setBusinessLexiPanelState,
    setBusinessLexiMicButtonState,
    stopBusinessLexiMicCapture,
    startBusinessLexiMicCapture,
    appendCopilotChatMessage,
    ensureCopilotChatSeed,
    resetCopilotChat,
    ensureBusinessAiPopupHost,
    openBusinessAiChatPopup,
    closeBusinessAiChatPopup,
    renderSubscriberCopilotResponse,
    renderAdminCopilotResponse,
    businessAiContextString,
    renderBusinessAiWorkspace,
    copilotPromptWithBusinessContext,
    setBusinessAiPrompt,
    askSubscriberCopilot,
    askAdminCopilot,
    bindCopilotEvents
  };
}
