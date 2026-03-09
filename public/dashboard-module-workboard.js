// Module info popup workboard renderer.
export function createModuleWorkboardRuntime(deps) {
  const {
    getUserRole,
    escapeHtml,
    loadHubAutoRoutinePrefs
  } = deps || {};

  function renderModuleWorkboardPanel(mod, blueprint) {
    if (!mod) return "";
    const isCustomerMinimal = getUserRole?.() === "customer";
    if (isCustomerMinimal) {
      return `
      <section class="module-workboard" aria-label="AI next-step workboard">
        <div class="module-workboard-head">
          <div>
            <h5>Quick Next Step</h5>
            <p>Minimal customer view: fast next action and only the details needed to complete the booking task.</p>
          </div>
        </div>
        <div class="module-workboard-grid">
          <section class="module-workboard-pane">
            <h6>AI Guide</h6>
            <ul class="module-workboard-list">
              <li><strong>Ask one question at a time</strong><small>Services, availability, contact info, or booking guidance.</small></li>
              <li><strong>Use one-tap actions</strong><small>Open the exact tool instead of browsing the whole dashboard.</small></li>
            </ul>
          </section>
          <section class="module-workboard-pane">
            <h6>What Happens Next</h6>
            <ul class="module-workboard-list">
              ${(Array.isArray(blueprint?.nextSteps) ? blueprint.nextSteps : []).slice(0, 3).map((step) => `<li><strong>${escapeHtml(step)}</strong><small>Customer flow stays minimal and focused.</small></li>`).join("")}
            </ul>
          </section>
        </div>
      </section>
    `;
    }

    const key = String(mod.key || "").trim();
    const categoryLabel = /account|revenue|profit|cash|payout|finance|payroll/i.test(`${key} ${mod.label}`) ? "Finance Ops"
      : /crm|review|referral|growth|social|commercial|membership|package/i.test(`${key} ${mod.label}`) ? "Growth Ops"
        : "Operations";
    const watchItems = (() => {
      if (key === "service_recovery_playbook") {
        return [
          ["Complaint risk", "Cancelled/no-show appointments, repeat complaints, and same-client friction patterns."],
          ["Recovery queue", "AI-generated apology, recovery offer and rebooking prompts ready for approval."],
          ["Outcome tracking", "Logs who was contacted, accepted offer, and rebooked."]
        ];
      }
      if (key === "cashflow_forecast") {
        return [
          ["Pressure dates", "Next 7/14/30 day periods where takings may not cover payroll or fixed costs."],
          ["Revenue assumptions", "Bookings in diary, completion rates and cancellation risk impact."],
          ["Mitigation options", "Push waitlist, run offer, tighten costs, or shift payroll timing."]
        ];
      }
      if (key === "payout_reconciliation") {
        return [
          ["Expected vs paid", "Compare booking takings, provider fees and actual payouts."],
          ["Mismatch alerts", "Flag gaps that need a note or export for accounting review."],
          ["Audit trail", "Mark reviewed and keep clean reconciliation notes."]
        ];
      }
      if (/review|reputation/i.test(key)) {
        return [
          ["Reply priority", "Negative/urgent reviews first, then neutral, then praise replies."],
          ["Brand tone draft", "AI writes responses in your chosen tone and service style."],
          ["Review request list", "Suggests happy clients to ask after completed appointments."]
        ];
      }
      return [
        ["Exceptions first", "Flags issues that need decisions so routine tasks stay lightweight."],
        ["One-tap routines", "Use AI actions to prep checks, drafts or recovery steps quickly."],
        ["Report-ready output", "Capture a clean summary for owner/admin review when needed."]
      ];
    })();
    const taskItems = (() => {
      if (key === "service_recovery_playbook") {
        return [
          ["Triage issue", "Tag severity, service type, and whether a response is needed today."],
          ["Draft recovery", "Generate message + offer + rebooking windows."],
          ["Confirm follow-up", "Set reminder and mark ownership for team/admin."]
        ];
      }
      if (key === "cashflow_forecast") {
        return [
          ["Run forecast", "Estimate 7/14/30 day takings and pressure points."],
          ["Check payroll pressure", "Compare payroll/costs against upcoming booking income."],
          ["Plan action", "Choose an offer, waitlist push, or spend reduction."]
        ];
      }
      if (key === "payout_reconciliation") {
        return [
          ["Run mismatch scan", "Highlight provider payout differences and likely causes."],
          ["Reconcile notes", "Add notes for fees, refunds or payout delays."],
          ["Export for accounts", "Prepare a clean handoff for bookkeeper/accountant."]
        ];
      }
      return [
        ["Review AI summary", blueprint?.focus || "Check what the AI surfaced first."],
        ["Run one-tap action", "Use quick actions to stage or complete common tasks."],
        ["Open full workspace", "Move into the interactive module only if deeper edits are needed."]
      ];
    })();
    const automationRows = [
      { key: `${key}:monitor`, label: "AI Monitor", note: `Tracks ${categoryLabel.toLowerCase()} signals and exceptions.`, defaultOn: true },
      { key: `${key}:prep`, label: "AI Prep", note: "Prepares drafts/checklists before you open the full module.", defaultOn: false },
      { key: `${key}:report`, label: "Report Include", note: "Include this module's summary in business PDF/email reports.", defaultOn: true }
    ];
    const autoPrefs = loadHubAutoRoutinePrefs?.() || {};
    const reportReady = [
      `Useful for ${categoryLabel.toLowerCase()} handovers and owner/admin reviews.`,
      "Print to PDF or queue email from the Business Hub Report Center.",
      "Use popup notes + AI actions to keep an audit trail of what was changed."
    ];
    return `
    <section class="module-workboard" aria-label="AI workboard">
      <div class="module-workboard-head">
        <div>
          <h5>AI Workboard - ${escapeHtml(categoryLabel)}</h5>
          <p>Built for daily salon operations: exception-first, one-tap routines, and report-ready outputs without forcing full-screen admin work.</p>
        </div>
        <span class="module-chip muted">${escapeHtml(String(mod.cadence || "Use daily"))}</span>
      </div>
      <div class="module-workboard-grid">
        <section class="module-workboard-pane">
          <h6>What AI Watches</h6>
          <ul class="module-workboard-list">
            ${watchItems.map(([title, note]) => `<li><strong>${escapeHtml(title)}</strong><small>${escapeHtml(note)}</small></li>`).join("")}
          </ul>
        </section>
        <section class="module-workboard-pane">
          <h6>Daily Actions</h6>
          <ul class="module-workboard-list">
            ${taskItems.map(([title, note]) => `<li><strong>${escapeHtml(title)}</strong><small>${escapeHtml(note)}</small></li>`).join("")}
          </ul>
        </section>
      </div>
      <section class="module-workboard-pane">
        <h6>Autopilot Modes</h6>
        <div class="module-workboard-automation">
          ${automationRows.map((row) => {
            const enabled = autoPrefs[row.key] === undefined ? row.defaultOn : autoPrefs[row.key] === true;
            return `
              <div class="module-workboard-automation-row">
                <div class="module-workboard-automation-copy">
                  <strong>${escapeHtml(row.label)}</strong>
                  <small>${escapeHtml(row.note)}</small>
                </div>
                <button type="button" class="btn btn-ghost" data-hub-auto-toggle="${escapeHtml(row.key)}" aria-pressed="${enabled ? "true" : "false"}">${enabled ? "Auto On" : "Auto Off"}</button>
              </div>`;
          }).join("")}
        </div>
      </section>
      <section class="module-workboard-pane">
        <h6>Business Output</h6>
        <ul class="module-workboard-list">
          ${reportReady.map((line) => `<li><strong>${escapeHtml(line)}</strong><small>Useful for running and managing a salon with less manual admin.</small></li>`).join("")}
        </ul>
      </section>
    </section>
  `;
  }

  return {
    renderModuleWorkboardPanel
  };
}
