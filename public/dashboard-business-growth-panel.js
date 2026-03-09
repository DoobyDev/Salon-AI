// Business Hub growth panel rendering, including billing banner, onboarding checklist, and first-week summary.
export function createBusinessGrowthPanelRuntime(deps) {
  const {
    getUserRole,
    hideSection,
    showSection,
    renderBusinessHubCards,
    formatDateShort,
    formatMoney,
    escapeHtml,
    businessGrowthSection,
    businessHubIntro,
    billingLiveBanner,
    billingLiveMeta,
    yearlySavingsLine,
    onboardingSummaryList,
    onboardingQuickActionsList,
    onboardingStatusList,
    onboardingChecklist,
    first7DaysGrid,
    getBillingSummary,
    getBusinessProfileName,
    getBusinessProfilePhone,
    getBusinessProfileEmail,
    getBusinessProfileServices,
    getBusinessHoursInputs,
    getSocialInputs,
    getAccountingRows,
    getBookingRows,
    getStaffRosterRows,
    getWaitlistRows
  } = deps || {};

  function renderBusinessGrowthPanel() {
    const role = getUserRole?.();
    if (!(role === "subscriber" || role === "admin")) {
      hideSection?.(businessGrowthSection);
      return;
    }
    showSection?.(businessGrowthSection);
    const businessHubKicker = document.getElementById("businessHubKicker");
    const businessHubTitle = document.getElementById("businessHubTitle");
    if (businessHubKicker) {
      businessHubKicker.textContent = "Business Hub workspace";
    }
    if (businessHubTitle) {
      businessHubTitle.textContent = "Business Hub";
    }
    if (businessHubIntro) {
      businessHubIntro.textContent = "Open a card to see what this business area does, then launch the full workspace or Ask Lexi for help.";
    }
    renderBusinessHubCards?.();

    const billingSummary = getBillingSummary?.();
    if (billingLiveBanner) {
      const status = String(billingSummary?.status || "inactive").toLowerCase();
      const plan = String(billingSummary?.planLabel || "Subscriber");
      billingLiveBanner.textContent = `Plan: ${plan} (${status})`;
    }
    if (billingLiveMeta) {
      const renewal = billingSummary?.currentPeriodEnd
        ? `Next renewal: ${formatDateShort?.(billingSummary.currentPeriodEnd)}`
        : "Next renewal: Not available yet";
      billingLiveMeta.textContent = renewal;
    }
    if (yearlySavingsLine) {
      const pct = Number(billingSummary?.yearlyDiscountPercent || 16.7).toFixed(1);
      const savePerYear = Number((Number(billingSummary?.monthlyFee || 9.99) * 12 - Number(billingSummary?.yearlyFee || 99.99)).toFixed(2));
      yearlySavingsLine.textContent = `Yearly billing saves £${savePerYear} per year (${pct}% off).`;
    }

    if (onboardingChecklist || onboardingSummaryList || onboardingQuickActionsList || onboardingStatusList) {
      const profileDone = Boolean(String(getBusinessProfileName?.()?.value || "").trim() && String(getBusinessProfilePhone?.()?.value || "").trim() && String(getBusinessProfileEmail?.()?.value || "").trim());
      const servicesCount = String(getBusinessProfileServices?.()?.value || "").split("\n").map((line) => line.trim()).filter(Boolean).length;
      const servicesDone = servicesCount >= 3;
      const hoursDone = (getBusinessHoursInputs?.() || []).every((input) => Boolean(String(input?.value || "").trim()));
      const socialInputs = getSocialInputs?.() || [];
      const socialDone = socialInputs.some((input) => Boolean(String(input?.value || "").trim()));
      const accountingRows = getAccountingRows?.() || [];
      const bookingRows = getBookingRows?.() || [];
      const staffRosterRows = getStaffRosterRows?.() || [];
      const waitlistRows = getWaitlistRows?.() || [];
      const accountingDone = accountingRows.some((row) => row?.connected);
      const bookingsDone = bookingRows.length > 0;
      const staffCount = staffRosterRows.length;
      const waitlistCount = waitlistRows.length;
      const socialCount = socialInputs.filter((input) => Boolean(String(input?.value || "").trim())).length;
      const configuredHoursCount = (getBusinessHoursInputs?.() || []).filter((input) => Boolean(String(input?.value || "").trim())).length;

      const items = [
        {
          label: "Finish your business profile",
          note: "Add your salon name, contact details and email so everything is ready for clients.",
          ok: profileDone,
          moduleKey: "business_profile"
        },
        {
          label: "Set up your service menu",
          note: `Add at least 3 services with prices and timings (currently ${servicesCount}).`,
          ok: servicesDone,
          moduleKey: "business_profile"
        },
        {
          label: "Set your opening hours",
          note: "Fill in your weekly opening hours so availability and planning work properly.",
          ok: hoursDone,
          moduleKey: "business_profile"
        },
        {
          label: "Add your social links",
          note: "Connect at least one social profile to build trust and make your brand look complete.",
          ok: socialDone,
          moduleKey: "social"
        },
        {
          label: "Connect accounting",
          note: "Link your accounting provider to start tracking takings and exports in one place.",
          ok: accountingDone,
          moduleKey: "accounting"
        },
        {
          label: "Get your first booking",
          note: "Once a booking comes in, your calendar, reports and daily signals start filling up.",
          ok: bookingsDone,
          moduleKey: "frontdesk"
        }
      ];
      const completeCount = items.filter((item) => item.ok).length;
      const completionPct = Math.round((completeCount / Math.max(items.length, 1)) * 100);
      const nextPending = items.find((item) => !item.ok) || null;
      if (onboardingSummaryList) onboardingSummaryList.innerHTML = "";
      if (onboardingQuickActionsList) onboardingQuickActionsList.innerHTML = "";
      if (onboardingStatusList) onboardingStatusList.innerHTML = "";
      if (onboardingChecklist) onboardingChecklist.innerHTML = "";
      const legacySingleListMode = !onboardingSummaryList && !onboardingQuickActionsList && !onboardingStatusList;
      const summaryTarget = onboardingSummaryList || onboardingChecklist;
      const quickActionsTarget = onboardingQuickActionsList || (legacySingleListMode ? onboardingChecklist : null);
      const setupStatusTarget = onboardingStatusList || (legacySingleListMode ? onboardingChecklist : null);
      const checklistTarget = onboardingChecklist;
      const summary = document.createElement("li");
      summary.className = "onboarding-summary";
      summary.innerHTML = `
        <div class="onboarding-summary-head">
          <div>
            <strong>${completeCount}/${items.length} setup steps complete</strong>
            <small>${completeCount === items.length ? "Your salon setup is looking strong." : "Work through these steps for a clean, professional launch."}</small>
          </div>
          <span class="onboarding-score-pill">${completionPct}% ready</span>
        </div>
        <div class="onboarding-progress-track" aria-hidden="true">
          <div class="onboarding-progress-fill" style="--onboarding-progress:${completionPct}%;"></div>
        </div>
        <div class="onboarding-summary-note">
          ${escapeHtml?.(nextPending ? `Next best step: ${nextPending.label}.` : "Everything on the launch checklist is done. Keep an eye on your first-week bookings and revenue signals.")}
        </div>
      `;
      if (summaryTarget) summaryTarget.appendChild(summary);

      const quickActions = document.createElement("li");
      quickActions.className = "onboarding-step";
      quickActions.innerHTML = `
        <div class="onboarding-step-head">
          <span class="onboarding-step-title">Business Setup Hub</span>
          <span class="onboarding-badge done">Quick setup</span>
        </div>
        <div class="onboarding-step-note">Use these shortcuts to set up your team, hours, services, and the key parts of your dashboard faster.</div>
        <div class="onboarding-quick-actions">
          <button class="onboarding-quick-btn" type="button" data-module-jump="business_profile">
            <strong>Business Profile</strong>
            <small>Name, contact details, services and opening hours</small>
          </button>
          <button class="onboarding-quick-btn" type="button" data-module-jump="staff">
            <strong>Team Setup</strong>
            <small>Add staff and set up your working cover</small>
          </button>
          <button class="onboarding-quick-btn" type="button" data-module-jump="frontdesk">
            <strong>Front Desk View</strong>
            <small>Check how your salon looks to clients</small>
          </button>
          <button class="onboarding-quick-btn" type="button" data-module-jump="social">
            <strong>Social & Brand</strong>
            <small>Add links and make your profile look complete</small>
          </button>
          <button class="onboarding-quick-btn" type="button" data-module-jump="accounting">
            <strong>Takings & Accounts</strong>
            <small>Connect accounting and review revenue tracking</small>
          </button>
          <button class="onboarding-quick-btn" type="button" data-module-jump="commercial">
            <strong>Packages & Memberships</strong>
            <small>Set up offers, bundles and gift cards</small>
          </button>
        </div>
      `;
      if (quickActionsTarget) quickActionsTarget.appendChild(quickActions);

      const setupStatus = document.createElement("li");
      setupStatus.className = "onboarding-step";
      setupStatus.innerHTML = `
        <div class="onboarding-step-head">
          <span class="onboarding-step-title">Status</span>
          <span class="onboarding-badge ${completeCount === items.length ? "done" : "pending"}">${completeCount === items.length ? "Ready" : "In progress"}</span>
        </div>
        <div class="onboarding-setup-grid">
          <article class="onboarding-setup-card">
            <p>Team Members</p>
            <strong>${staffCount}</strong>
            <small>${staffCount ? "Your team is showing in the dashboard." : "Add your first staff member to start planning cover."}</small>
          </article>
          <article class="onboarding-setup-card">
            <p>Working Days Set</p>
            <strong>${configuredHoursCount}/7</strong>
            <small>${configuredHoursCount === 7 ? "Weekly hours are set." : "Fill in all 7 days so your availability is accurate."}</small>
          </article>
          <article class="onboarding-setup-card">
            <p>Services Listed</p>
            <strong>${servicesCount}</strong>
            <small>${servicesCount ? "Service menu is starting to take shape." : "Add services with pricing and timing."}</small>
          </article>
          <article class="onboarding-setup-card">
            <p>Social Links</p>
            <strong>${socialCount}</strong>
            <small>${socialCount ? "Your profile looks more complete to clients." : "Add at least one social link for trust."}</small>
          </article>
          <article class="onboarding-setup-card">
            <p>Waitlist Entries</p>
            <strong>${waitlistCount}</strong>
            <small>${waitlistCount ? "You can use these to fill cancellations." : "Add waitlist names once clients ask for full slots."}</small>
          </article>
          <article class="onboarding-setup-card">
            <p>Bookings Received</p>
            <strong>${bookingRows.length}</strong>
            <small>${bookingRows.length ? "Your diary and reports are now feeding data." : "Your diary, gauges and reports will fill as bookings come in."}</small>
          </article>
        </div>
      `;
      if (setupStatusTarget) setupStatusTarget.appendChild(setupStatus);

      items.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = `onboarding-step${item.ok ? " is-done" : ""}`;
        li.innerHTML = `
          <div class="onboarding-step-head">
            <span class="onboarding-step-title">${index + 1}. ${escapeHtml?.(item.label)}</span>
            <span class="onboarding-badge ${item.ok ? "done" : "pending"}">${item.ok ? "Done" : "To do"}</span>
          </div>
          <div class="onboarding-step-note">${escapeHtml?.(item.note || "")}</div>
          <div class="onboarding-step-actions">
            <span class="onboarding-summary-note">${item.ok ? "Looks good. You can review it anytime." : "Open this area to complete the step."}</span>
            <button class="btn btn-ghost" type="button" data-module-jump="${item.moduleKey}" style="padding:0.25rem 0.55rem;font-size:0.72rem;">${item.ok ? "Review" : "Open"}</button>
          </div>
        `;
        if (checklistTarget) checklistTarget.appendChild(li);
      });
    }

    if (first7DaysGrid) {
      const bookingRows = getBookingRows?.() || [];
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      const recent = bookingRows.filter((row) => {
        const ts = new Date(row.createdAt || `${row.date || ""}T${String(row.time || "00:00").slice(0, 5)}:00`).getTime();
        return Number.isFinite(ts) && ts >= sevenDaysAgo;
      });
      const bookings = recent.length;
      const completed = recent.filter((row) => String(row.status || "").toLowerCase() === "completed").length;
      const cancelled = recent.filter((row) => String(row.status || "").toLowerCase() === "cancelled").length;
      const revenue = recent
        .filter((row) => String(row.status || "").toLowerCase() !== "cancelled")
        .reduce((sum, row) => sum + Number(row.price || 0), 0);
      const cards = [
        { label: "Bookings", value: String(bookings) },
        { label: "Completed", value: String(completed) },
        { label: "Cancelled", value: String(cancelled) },
        { label: "Revenue", value: formatMoney?.(revenue) }
      ];
      first7DaysGrid.innerHTML = "";
      cards.forEach((card) => {
        const article = document.createElement("article");
        article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
        first7DaysGrid.appendChild(article);
      });
    }
  }

  return {
    renderBusinessGrowthPanel
  };
}
