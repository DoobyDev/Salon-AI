// Calendar Lexi sidebar rendering and action-launch runtime.
export function createCalendarLexiRuntime(deps) {
  const {
    getUserRole,
    getSelectedCalendarDateKey,
    escapeHtml,
    formatMoney,
    t,
    showToast,
    openBusinessAiChatPopup,
    requestLexiSubmit,
    calendarFeatureMeta,
    calendarFeatureStats,
    calendarSelectedDaySummary,
    calendarLexiCommandDeck
  } = deps || {};

  function renderCalendarFeatureSidebarLexi(summary) {
    const monthBookings = Number(summary?.monthlyBookings || 0);
    const activeDays = Number(summary?.activeDays || 0);
    const staffLegendCount = Number(summary?.staffLegendCount || 0);
    const selected = summary?.selectedDay || null;
    const avgPerActiveDay = activeDays ? Number((monthBookings / Math.max(1, activeDays)).toFixed(1)) : 0;
    const monthlyPressure =
      monthBookings >= 120 ? "High volume month" : monthBookings >= 60 ? "Steady trading month" : monthBookings > 0 ? "Light booking month" : "Open capacity month";
    const densityTone =
      avgPerActiveDay >= 8 ? "Pressure watch" : avgPerActiveDay >= 4 ? "Balanced flow" : avgPerActiveDay > 0 ? "Capacity available" : "No density yet";
    const selectedPressure =
      selected && Number(selected.bookings || 0) >= 10
        ? "Peak day"
        : selected && Number(selected.bookings || 0) >= 5
          ? "Busy day"
          : selected && Number(selected.bookings || 0) > 0
            ? "Open capacity"
            : "No bookings";

    if (calendarFeatureMeta) {
      const monthLabel = String(summary?.monthLabel || "This month");
      calendarFeatureMeta.innerHTML = `
        <div class="calendar-feature-meta-head">
          <p class="calendar-feature-meta-kicker">Lexi Diary Readout</p>
          <strong>${escapeHtml(monthLabel)} Calendar Command</strong>
        </div>
        <p class="calendar-feature-meta-copy">
          ${escapeHtml(String(monthBookings))} bookings across ${escapeHtml(String(activeDays))} active day${activeDays === 1 ? "" : "s"} and ${escapeHtml(
        String(staffLegendCount)
      )} rota staff in view.
        </p>
        <div class="calendar-lexi-badges" aria-label="Lexi calendar signals">
          <span>${escapeHtml(monthlyPressure)}</span>
          <span>${escapeHtml(densityTone)}</span>
          <span>${escapeHtml(selected ? `Selected: ${selectedPressure}` : "Select a day for spotlight")}</span>
        </div>
        ${
          selected
            ? `<p class="calendar-feature-meta-copy">Selected: <strong>${escapeHtml(selected.label)}</strong> (${escapeHtml(selected.dateKey)})</p>`
            : `<p class="calendar-feature-meta-copy">Click a date to spotlight staffing, bookings, and revenue context for Lexi.</p>`
        }
      `;
    }

    if (calendarFeatureStats) {
      const cards = [
        {
          label: "Month Bookings",
          value: String(monthBookings),
          note: `${activeDays} active days`,
          tone: monthBookings >= 100 ? "hot" : monthBookings >= 40 ? "balanced" : "open"
        },
        {
          label: "Avg / Active Day",
          value: String(avgPerActiveDay),
          note: densityTone,
          tone: avgPerActiveDay >= 8 ? "hot" : avgPerActiveDay >= 4 ? "balanced" : "open"
        },
        {
          label: "Rota Staff",
          value: String(staffLegendCount),
          note: "visible this month",
          tone: "neutral"
        },
        {
          label: "Selected Revenue",
          value: getSelectedCalendarDateKey?.() ? formatMoney(Number(summary?.selectedDay?.revenue || 0)) : "-",
          note: getSelectedCalendarDateKey?.() ? `${summary?.selectedDay?.bookings || 0} bookings` : "pick a day",
          tone: getSelectedCalendarDateKey?.() && Number(summary?.selectedDay?.revenue || 0) > 0 ? "balanced" : "neutral"
        }
      ];
      calendarFeatureStats.innerHTML = cards
        .map(
          (card) => `
        <article class="calendar-stat-card calendar-stat-card-${escapeHtml(card.tone || "neutral")}">
          <p>${escapeHtml(card.label)}</p>
          <strong>${escapeHtml(card.value)}</strong>
          <small>${escapeHtml(card.note)}</small>
        </article>
      `
        )
        .join("");
    }

    if (calendarLexiCommandDeck) {
      const selectedDateLabel = selected ? `${selected.label} (${selected.dateKey})` : "Select a date";
      const selectedBookings = Number(selected?.bookings || 0);
      const selectedRevenue = Number(selected?.revenue || 0);
      const priorityHeadline = !selected
        ? "Choose a date to unlock Lexi actions"
        : selectedBookings >= 8
          ? "High-pressure day: prioritize flow and delays"
          : selectedBookings >= 4
            ? "Balanced day: tighten timing and fill gaps"
            : "Open-capacity day: focus on rebooking and upsell";
      const fillGapNote = !selected
        ? "Lexi will highlight gap recovery and same-day opportunities after a date is selected."
        : selectedBookings > 0
          ? `Lexi can map cancellations, rebooking opportunities, and waitlist recovery around ${selectedDateLabel}.`
          : `Lexi can build a same-day fill plan for ${selectedDateLabel} and suggest outreach timing.`;
      const commsNote = !selected
        ? "Customer messaging prompts and front desk scripts will appear for the selected day."
        : `Generate booking reminders, delay scripts, and front desk handoff notes for ${selectedDateLabel}.`;
      calendarLexiCommandDeck.innerHTML = `
        <div class="calendar-lexi-command-card">
          <p class="calendar-lexi-command-kicker">Lexi Priority</p>
          <h4>${escapeHtml(priorityHeadline)}</h4>
          <p>${escapeHtml(
            selected
              ? `${selectedDateLabel} | ${selectedBookings} booking${selectedBookings === 1 ? "" : "s"} | Revenue signal ${formatMoney(selectedRevenue)}`
              : "Use the diary to spotlight a day, then launch a Lexi planning routine straight from the calendar."
          )}</p>
          ${
            selected
              ? `<button type="button" class="btn ask-lexi-btn calendar-lexi-action" data-lexi-calendar-action="plan-day" data-date-key="${escapeHtml(selected.dateKey)}" data-date-label="${escapeHtml(selected.label)}">${escapeHtml(t("dashboard.day_plan", "Ask Lexi for the day plan"))}</button>`
              : `<button type="button" class="btn ask-lexi-btn" disabled>${escapeHtml(t("dashboard.day_plan", "Ask Lexi for the day plan"))}</button>`
          }
        </div>
        <div class="calendar-lexi-command-card">
          <p class="calendar-lexi-command-kicker">Gap Recovery</p>
          <h4>${escapeHtml(selected ? "Recover booking gaps before they cost revenue" : "Select a day to run gap recovery")}</h4>
          <p>${escapeHtml(fillGapNote)}</p>
          ${
            selected
              ? `<button type="button" class="btn btn-ghost calendar-lexi-action" data-lexi-calendar-action="fill-gaps" data-date-key="${escapeHtml(selected.dateKey)}" data-date-label="${escapeHtml(selected.label)}">Find booking gaps</button>`
              : `<button type="button" class="btn btn-ghost" disabled>Find booking gaps</button>`
          }
        </div>
        <div class="calendar-lexi-command-card">
          <p class="calendar-lexi-command-kicker">Front Desk Prep</p>
          <h4>${escapeHtml(selected ? "Prep team timing and customer communication" : "Select a day to prep the front desk")}</h4>
          <p>${escapeHtml(commsNote)}</p>
          ${
            selected
              ? `<button type="button" class="btn btn-ghost calendar-lexi-action" data-lexi-calendar-action="staff-brief" data-date-key="${escapeHtml(selected.dateKey)}" data-date-label="${escapeHtml(selected.label)}">Prep staff + front desk</button>`
              : `<button type="button" class="btn btn-ghost" disabled>Prep staff + front desk</button>`
          }
        </div>
      `;
    }

    if (calendarSelectedDaySummary) {
      if (!selected) {
        calendarSelectedDaySummary.innerHTML = `
          <div class="calendar-spotlight-head">
            <h3>Selected Day Summary</h3>
            <span class="calendar-spotlight-tag">Waiting for date</span>
          </div>
          <p>Click a date to view bookings, staffing cover and revenue context for that day. Lexi will use it in the Business AI workspace automatically.</p>
          <div class="calendar-lexi-actions" aria-label="Lexi day actions">
            <button type="button" class="btn ask-lexi-btn calendar-lexi-action is-disabled" disabled>${escapeHtml(t("dashboard.day_plan", "Ask Lexi for the day plan"))}</button>
            <button type="button" class="btn btn-ghost calendar-lexi-action is-disabled" disabled>Find booking gaps</button>
          </div>
        `;
        return;
      }

      const staffNames = Array.isArray(selected.staffNames) ? selected.staffNames : [];
      const selectedDateLabel = `${selected.label} (${selected.dateKey})`;
      const selectedBookings = Number(selected.bookings || 0);
      const selectedRevenue = Number(selected.revenue || 0);
      const selectedTag = selectedBookings >= 10 ? "Peak day" : selectedBookings >= 5 ? "Busy day" : selectedBookings > 0 ? "Open capacity" : "No bookings";

      calendarSelectedDaySummary.innerHTML = `
        <div class="calendar-spotlight-head">
          <h3>Selected Day Summary</h3>
          <span class="calendar-spotlight-tag">${escapeHtml(selectedTag)}</span>
        </div>
        <p><strong>${escapeHtml(selectedDateLabel)}</strong></p>
        <ul class="calendar-selected-day-list">
          <li><strong>${escapeHtml(String(selectedBookings))} booking${selectedBookings === 1 ? "" : "s"}</strong><small>${escapeHtml(
        String(selected.completed || 0)
      )} completed &bull; ${escapeHtml(String(selected.cancelled || 0))} cancelled</small></li>
          <li><strong>${escapeHtml(formatMoney(selectedRevenue))}</strong><small>Revenue signal for selected day</small></li>
          <li><strong>${escapeHtml(String(selected.staffCount || 0))} staff on rota</strong><small>${escapeHtml(
        staffNames.length ? staffNames.join(", ") : "No rota coverage set for selected day."
      )}</small></li>
        </ul>
        <div class="calendar-lexi-actions" aria-label="Lexi day actions">
          <button type="button" class="btn ask-lexi-btn calendar-lexi-action" data-lexi-calendar-action="plan-day" data-date-key="${escapeHtml(
            selected.dateKey
          )}" data-date-label="${escapeHtml(selected.label)}">${escapeHtml(t("dashboard.day_plan", "Ask Lexi for the day plan"))}</button>
          <button type="button" class="btn btn-ghost calendar-lexi-action" data-lexi-calendar-action="fill-gaps" data-date-key="${escapeHtml(
            selected.dateKey
          )}" data-date-label="${escapeHtml(selected.label)}">Find booking gaps</button>
          <button type="button" class="btn btn-ghost calendar-lexi-action" data-lexi-calendar-action="staff-brief" data-date-key="${escapeHtml(
            selected.dateKey
          )}" data-date-label="${escapeHtml(selected.label)}">Prep staff + front desk</button>
        </div>
      `;
    }
  }

  function buildLexiCalendarPrompt(action, dateLabel, dateKey) {
    const safeDateLabel = String(dateLabel || dateKey || "the selected day").trim();
    const safeDateKey = String(dateKey || "").trim();
    if (action === "fill-gaps") {
      return `Review ${safeDateLabel}${safeDateKey ? ` (${safeDateKey})` : ""} and show me booking gaps, rebooking opportunities, and same-day recovery actions.`;
    }
    if (action === "staff-brief") {
      return `Prepare a front desk and staff briefing for ${safeDateLabel}${safeDateKey ? ` (${safeDateKey})` : ""}. Include pressure points, likely delays, and customer communication advice.`;
    }
    return `Plan ${safeDateLabel}${safeDateKey ? ` (${safeDateKey})` : ""} for me. Prioritize bookings, gaps, staffing coverage, and revenue protection actions.`;
  }

  function launchLexiCalendarActionFromButton(actionButton) {
    if (!(actionButton instanceof HTMLElement) || actionButton.hasAttribute("disabled")) return;
    const action = String(actionButton.getAttribute("data-lexi-calendar-action") || "plan-day");
    const dateKey = String(actionButton.getAttribute("data-date-key") || "").trim();
    const dateLabel = String(actionButton.getAttribute("data-date-label") || "").trim();
    const role = getUserRole?.() === "admin" ? "admin" : "subscriber";
    const prompt = buildLexiCalendarPrompt(action, dateLabel, dateKey);
    openBusinessAiChatPopup?.(role, {
      trigger: actionButton,
      focusInput: false,
      prompt
    });
    requestLexiSubmit?.();
    showToast?.(`Lexi is reviewing ${dateLabel || dateKey || "the selected day"}.`);
  }

  function handleCalendarLexiClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const actionButton = target.closest(".calendar-lexi-action");
    if (!(actionButton instanceof HTMLElement)) return;
    launchLexiCalendarActionFromButton(actionButton);
  }

  function bindCalendarLexiEvents() {
    calendarSelectedDaySummary?.addEventListener("click", handleCalendarLexiClick);
    calendarLexiCommandDeck?.addEventListener("click", handleCalendarLexiClick);
  }

  return {
    renderCalendarFeatureSidebarLexi,
    buildLexiCalendarPrompt,
    launchLexiCalendarActionFromButton,
    bindCalendarLexiEvents
  };
}
