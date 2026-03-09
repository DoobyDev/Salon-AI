// Staff roster summary rendering, roster UI rendering, payload application, and CRUD requests.
export function createStaffRosterRuntime(deps) {
  const {
    canManageBusinessModules,
    withManagedBusiness,
    headers,
    escapeHtml,
    formatStaffWeekRange,
    getManageModeEnabled,
    renderSubscriberCalendar,
    buildStaffRotaSnapshot,
    getStaffColorForId,
    roleLabel,
    getStaffStatusLabel,
    getStaffShiftLabel,
    getStaffInitials,
    normalizeIncomingRotaWeek,
    saveStaffRotaOverrides,
    getStaffMemberId,
    pruneStaffRotaOverridesForCurrentRoster,
    getStaffWeekKey,
    getStaffRotaSelectedMemberId,
    setStaffRotaSelectedMemberId,
    getStaffRotaOverrides,
    setStaffRotaOverrides,
    setStaffRotaOverridesLoaded,
    getStaffSummaryCards,
    getStaffRosterList,
    getStaffWeekLabel,
    getStaffRotaHint,
    getStaffRotaGrid,
    getStaffCoverageStrip,
    getStaffCoverageAlerts,
    getStaffColorLegend,
    getStaffRosterRows,
    setStaffRosterRows,
    setStaffSummary
  } = deps || {};

  function renderStaffSummary() {
    const staffSummaryCards = getStaffSummaryCards?.();
    if (!staffSummaryCards) return;
    const snapshot = buildStaffRotaSnapshot?.();
    const totalMembers = snapshot?.rows?.length || 0;
    const onDutyCount = (snapshot?.rows || []).filter((row) => row.member?.availability === "on_duty").length;
    const offDutyCount = Math.max(0, totalMembers - onDutyCount);
    const totalSickCalls = (snapshot?.dayStats || []).reduce((sum, day) => sum + day.sick, 0);
    const totalCovering = (snapshot?.dayStats || []).reduce((sum, day) => sum + day.covering, 0);
    const capacityRiskDays = (snapshot?.dayStats || []).filter((day) => day.gap > 0).length;
    const cards = [
      { label: "Team Members", value: totalMembers },
      { label: "Available Team", value: onDutyCount },
      { label: "Off Duty", value: offDutyCount },
      { label: "Sick Calls (Week)", value: totalSickCalls },
      { label: "Cover Actions", value: totalCovering + (capacityRiskDays ? ` / ${capacityRiskDays} risk` : "") }
    ];
    staffSummaryCards.innerHTML = "";
    cards.forEach((card) => {
      const article = document.createElement("article");
      article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
      staffSummaryCards.appendChild(article);
    });
  }

  function renderStaffRoster() {
    const staffRosterList = getStaffRosterList?.();
    if (!staffRosterList) return;
    const snapshot = buildStaffRotaSnapshot?.();
    const staffWeekLabel = getStaffWeekLabel?.();
    const staffRotaHint = getStaffRotaHint?.();
    const staffRotaGrid = getStaffRotaGrid?.();
    const staffCoverageStrip = getStaffCoverageStrip?.();
    const staffCoverageAlerts = getStaffCoverageAlerts?.();
    const staffColorLegend = getStaffColorLegend?.();

    if (staffWeekLabel) staffWeekLabel.textContent = formatStaffWeekRange?.();
    if (staffRotaHint) {
      staffRotaHint.textContent = getManageModeEnabled?.()
        ? "Paint rota cells with the Status + Shift controls. Drag across the grid to fill multiple cells."
        : "Switch Edit Mode on to paint rota cells, mark sickness, and auto-fill cover.";
    }
    staffRosterList.innerHTML = "";
    if (!snapshot?.rows?.length) {
      staffRosterList.innerHTML =
        "<li><div class='staff-meta'><strong>No team members added yet.</strong><br /><small>Add your team here so you can plan cover and capacity properly.</small><br /><button class='btn btn-ghost' type='button' data-module-jump='staff' style='margin-top:0.45rem;padding:0.32rem 0.65rem;font-size:0.75rem;'>Open Team Setup</button></div></li>";
      if (staffRotaGrid) {
        staffRotaGrid.innerHTML = `
          <div class="staff-rota-col-head"><strong>Staff</strong><small>Rota</small></div>
          ${(snapshot.weekDays || []).map((d) => `<div class="staff-rota-col-head"><strong>${escapeHtml?.(d.label)}</strong><small>${escapeHtml?.(d.dateLabel)}</small></div>`).join("")}
        `;
      }
      if (staffCoverageStrip) staffCoverageStrip.innerHTML = "";
      if (staffCoverageAlerts) {
        staffCoverageAlerts.innerHTML = "<li><strong>Coverage planner ready.</strong><small>Add employees and assign rota days to see daily capacity and sickness cover suggestions.</small></li>";
      }
      return;
    }
    if (!(snapshot.rows || []).some((row) => row.memberId === getStaffRotaSelectedMemberId?.())) {
      setStaffRotaSelectedMemberId?.(snapshot.rows[0]?.memberId || "");
    }
    snapshot.rows.forEach((row) => {
      const member = row.member;
      const li = document.createElement("li");
      const staffColor = getStaffColorForId?.(row.memberId);
      li.style.setProperty("--staff-color", staffColor);
      const days = Array.isArray(member.shiftDays) && member.shiftDays.length ? member.shiftDays.join(", ") : "No rota days";
      const sickDays = row.days.filter((d) => d.status === "sick").map((d) => d.label).join(", ");
      if (row.memberId === getStaffRotaSelectedMemberId?.()) li.classList.add("is-selected");
      li.innerHTML = `
        <div class="staff-meta">
          <div class="staff-meta-line">
            <strong>${escapeHtml?.(member.name || "Staff Member")}</strong>
            <span class="staff-role-pill"><span class="staff-color-dot"></span>${escapeHtml?.(roleLabel?.(member.role))}</span>
          </div>
          <small>${member.availability === "on_duty" ? "Available for scheduling" : "Off-duty profile"} • Base rota: ${escapeHtml?.(days)}</small>
          <small>${sickDays ? `Sick call flagged: ${escapeHtml?.(sickDays)}` : "No sickness alerts this week."}</small>
        </div>
        <div class="staff-actions">
          <button class="btn btn-ghost staff-select" type="button" data-id="${member.id}">Focus</button>
          <button class="btn btn-ghost manage-only staff-sick" type="button" data-id="${member.id}">Report Sick</button>
          <button class="btn btn-ghost manage-only staff-toggle" type="button" data-id="${member.id}" data-next="${member.availability === "on_duty" ? "off_duty" : "on_duty"}">
            ${member.availability === "on_duty" ? "Set Off Duty" : "Set Available"}
          </button>
          <button class="btn btn-ghost manage-only staff-edit" type="button" data-id="${member.id}">Edit</button>
          <button class="btn btn-ghost manage-only staff-remove" type="button" data-id="${member.id}">Delete</button>
        </div>
      `;
      staffRosterList.appendChild(li);
    });

    if (staffRotaGrid) {
      const pieces = [];
      snapshot.weekDays.forEach((d) => {
        const stat = snapshot.dayStats.find((s) => s.key === d.key);
        pieces.push(
          `<div class="staff-rota-col-head">
            <strong>${escapeHtml?.(d.label)}</strong>
            <small>${escapeHtml?.(d.dateLabel)} • ${stat ? `${stat.activeCoverage}/${stat.target}` : "0/0"}</small>
          </div>`
        );
      });
      snapshot.weekDays.forEach((d) => {
        const workingDots = [];
        snapshot.rows.forEach((row) => {
          const day = row.days.find((entry) => entry.key === d.key);
          if (!day) return;
          const isWorking = day.status === "scheduled" || day.status === "covering";
          if (!isWorking) return;
          const staffColor = getStaffColorForId?.(row.memberId);
          const statusLabel = getStaffStatusLabel?.(day.status);
          const shiftLabel = getStaffShiftLabel?.(day.shift);
          workingDots.push(
            `<button
              class="staff-rota-dot-btn${row.memberId === getStaffRotaSelectedMemberId?.() ? " is-selected" : ""}"
              type="button"
              style="--staff-color:${escapeHtml?.(staffColor)};"
              data-id="${escapeHtml?.(row.memberId)}"
              data-day="${escapeHtml?.(day.key)}"
              data-status="${escapeHtml?.(day.status)}"
              data-shift="${escapeHtml?.(day.shift || "full")}"
              title="${escapeHtml?.(`${row.member.name || "Staff"} • ${shiftLabel}`)}"
              aria-label="${escapeHtml?.(`${row.member.name || "Staff"} ${day.longLabel} ${statusLabel} ${shiftLabel}`)}">
              ${escapeHtml?.(getStaffInitials?.(row.member.name || "Staff"))}
            </button>`
          );
        });
        pieces.push(`
          <div class="staff-rota-day-cell" data-day="${escapeHtml?.(d.key)}" aria-label="${escapeHtml?.(`${d.label} working staff`)}">
            <div class="staff-rota-day-dots">
              ${workingDots.join("") || `<span class="staff-rota-day-empty">No cover</span>`}
            </div>
          </div>
        `);
      });
      staffRotaGrid.innerHTML = pieces.join("");
    }

    if (staffColorLegend) {
      const chips = snapshot.rows.slice(0, 8).map((row) => {
        const color = getStaffColorForId?.(row.memberId);
        return `<span class="staff-color-chip" style="--staff-color:${escapeHtml?.(color)};"><span class="staff-color-dot"></span>${escapeHtml?.(row.member.name || "Staff")}</span>`;
      });
      if (snapshot.rows.length > 8) {
        chips.push(`<span class="staff-color-chip">+${snapshot.rows.length - 8} more</span>`);
      }
      staffColorLegend.innerHTML = chips.join("");
    }

    if (staffCoverageStrip) {
      staffCoverageStrip.innerHTML = snapshot.dayStats.map((day) => {
        const cls = day.gap > 1 ? "staff-capacity-pill is-risk" : day.gap === 1 || day.sick > 0 ? "staff-capacity-pill is-warning" : "staff-capacity-pill";
        return `
          <div class="${cls}">
            <small>${escapeHtml?.(day.label)} ${escapeHtml?.(day.dateLabel)}</small>
            <strong>${day.activeCoverage}/${day.target} covered</strong>
            <small>${day.sick ? `${day.sick} sick` : day.available ? `${day.available} backup` : "No backup"}</small>
          </div>
        `;
      }).join("");
    }

    if (staffCoverageAlerts) {
      const alerts = [];
      snapshot.dayStats.forEach((day) => {
        if (day.sick > 0) {
          alerts.push({
            title: `${day.label}: sickness cover needed`,
            detail: day.gap > 0
              ? `Capacity short by ${day.gap}. Use Auto-fill Cover or assign a replacement manually.`
              : `Coverage remains stable, but confirm replacements for ${day.sick} sickness alert${day.sick > 1 ? "s" : ""}.`
          });
        } else if (day.gap > 0) {
          alerts.push({
            title: `${day.label}: capacity risk`,
            detail: `Roster is short by ${day.gap}. Move an available team member or add cover.`
          });
        }
      });
      if (!alerts.length) {
        alerts.push({
          title: "Rota healthy this week",
          detail: "No uncovered days detected. You can still use the grid to adjust shifts or pre-plan sickness cover."
        });
      }
      if (Array.isArray(snapshot.sicknessLogs) && snapshot.sicknessLogs.length) {
        const recent = snapshot.sicknessLogs.slice(-2).reverse();
        recent.forEach((log) => {
          alerts.unshift({
            title: `${log.staffName || "Staff"} sickness logged (${String(log.day || "").toUpperCase()})`,
            detail: `${getStaffShiftLabel?.(log.shift)} shift • ${log.replacementMode === "auto" ? "auto-cover attempted" : "manual cover review pending"}`
          });
        });
      }
      const selectedId = getStaffRotaSelectedMemberId?.();
      if (selectedId) {
        const selected = snapshot.rows.find((row) => row.memberId === selectedId);
        if (selected) {
          const sickCells = selected.days.filter((d) => d.status === "sick");
          if (sickCells.length) {
            alerts.unshift({
              title: `${selected.member.name} flagged sick`,
              detail: `Affected days: ${sickCells.map((d) => d.label).join(", ")}. Suggested cover appears inside red rota cells.`
            });
          }
        }
      }
      staffCoverageAlerts.innerHTML = alerts.slice(0, 5).map((alert) => `
        <li>
          <strong>${escapeHtml?.(alert.title)}</strong>
          <small>${escapeHtml?.(alert.detail)}</small>
        </li>
      `).join("");
    }
    renderSubscriberCalendar?.();
  }

  function applyStaffRosterPayload(data) {
    setStaffRosterRows?.(Array.isArray(data?.members) ? data.members : []);
    setStaffSummary?.(data?.summary || null);
    if (data?.rotaWeek) {
      const normalizedWeek = normalizeIncomingRotaWeek?.(data.rotaWeek);
      const currentOverrides = getStaffRotaOverrides?.();
      const nextOverrides = currentOverrides && typeof currentOverrides === "object" ? currentOverrides : {};
      nextOverrides[normalizedWeek.weekStart] = normalizedWeek;
      setStaffRotaOverrides?.(nextOverrides);
      setStaffRotaOverridesLoaded?.(true);
      saveStaffRotaOverrides?.();
    }
    const rosterRows = getStaffRosterRows?.() || [];
    if (!getStaffRotaSelectedMemberId?.() && rosterRows.length) {
      setStaffRotaSelectedMemberId?.(getStaffMemberId?.(rosterRows[0]));
    }
    pruneStaffRotaOverridesForCurrentRoster?.();
    renderStaffSummary();
    renderStaffRoster();
  }

  async function loadStaffRoster() {
    if (!canManageBusinessModules?.()) return;
    const res = await fetch(withManagedBusiness?.(`/api/staff-roster?weekStart=${encodeURIComponent(getStaffWeekKey?.())}`), { headers: headers?.() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load staff roster.");
    applyStaffRosterPayload(data);
  }

  async function upsertStaffMember(payload) {
    const res = await fetch(withManagedBusiness?.("/api/staff-roster/upsert"), {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify({ ...payload, weekStart: getStaffWeekKey?.() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to save staff member.");
    applyStaffRosterPayload(data);
  }

  async function updateStaffAvailability(staffId, availability) {
    const res = await fetch(withManagedBusiness?.(`/api/staff-roster/${encodeURIComponent(staffId)}/availability`), {
      method: "POST",
      headers: headers?.(),
      body: JSON.stringify({ availability, weekStart: getStaffWeekKey?.() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to update staff availability.");
    applyStaffRosterPayload(data);
  }

  async function removeStaffMember(staffId) {
    const res = await fetch(withManagedBusiness?.(`/api/staff-roster/${encodeURIComponent(staffId)}?weekStart=${encodeURIComponent(getStaffWeekKey?.())}`), {
      method: "DELETE",
      headers: headers?.()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to remove staff member.");
    applyStaffRosterPayload(data);
  }

  return {
    renderStaffSummary,
    renderStaffRoster,
    applyStaffRosterPayload,
    loadStaffRoster,
    upsertStaffMember,
    updateStaffAvailability,
    removeStaffMember
  };
}
