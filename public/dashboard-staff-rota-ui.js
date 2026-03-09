// Staff rota UI/runtime for week controls, quick assign, and drag interactions.
export function createStaffRotaUiRuntime(deps) {
  const {
    STAFF_ROTA_DAYS = [],
    roleLabel,
    normalizeStaffCellStatus,
    normalizeStaffShiftType,
    openManageForm,
    openManageConfirm,
    showManageToast,
    isDashboardManagerRole,
    getManageModeEnabled,
    loadStaffRotaWeek,
    renderStaffSummary,
    renderStaffRoster,
    buildStaffRotaSnapshot,
    getCurrentRotaBrush,
    setStaffDayState,
    applyStaffRotaUpdates,
    applyAutoCoverForWeek,
    loadStaffDemoRotaPreview,
    resetStaffRotaWeekRemote,
    setStaffStatus,
    getStaffRotaSelectedMemberId,
    setStaffRotaSelectedMemberId,
    getStaffRotaWeekOffset,
    setStaffRotaWeekOffset,
    getStaffRotaDragPaint,
    setStaffRotaDragPaint,
    promptStaffSickReport,
    getStaffRosterRows,
    upsertStaffMember,
    updateStaffAvailability,
    removeStaffMember,
    getStaffMemberId,
    staffWeekPrevBtn,
    staffWeekTodayBtn,
    staffWeekNextBtn,
    staffAutoCoverBtn,
    staffLoadDemoRotaBtn,
    staffClearWeekOverridesBtn,
    staffRotaGrid,
    staffRosterList
  } = deps || {};

  async function loadAndRenderStaffRotaWeek() {
    await loadStaffRotaWeek?.({ silent: true });
    renderStaffSummary?.();
    renderStaffRoster?.();
  }

  async function openStaffDayQuickAssign(dayKey) {
    const normalizedDayKey = String(dayKey || "").trim().toLowerCase();
    if (!STAFF_ROTA_DAYS.some((d) => d.key === normalizedDayKey)) return;
    const snapshot = buildStaffRotaSnapshot?.();
    const dayMeta = snapshot?.weekDays?.find((d) => d.key === normalizedDayKey);
    const staffOptions = (Array.isArray(snapshot?.rows) ? snapshot.rows : []).map((row) => ({
      value: row.memberId,
      label: `${row.member?.name || "Staff"} (${roleLabel?.(row.member?.role)})`
    }));
    if (!staffOptions.length) {
      setStaffStatus?.("Add staff members first before assigning day cover.", true);
      return;
    }
    const values = await openManageForm?.({
      title: `Assign Staff | ${dayMeta?.label || normalizedDayKey.toUpperCase()}${dayMeta?.dateLabel ? ` (${dayMeta.dateLabel})` : ""}`,
      submitLabel: "Assign",
      fields: [
        { id: "staffId", label: "Staff Member", type: "select", required: true, value: getStaffRotaSelectedMemberId?.() || staffOptions[0].value, options: staffOptions },
        {
          id: "status",
          label: "Assignment",
          type: "select",
          required: true,
          value: "scheduled",
          options: [
            { value: "scheduled", label: "Scheduled" },
            { value: "covering", label: "Covering" },
            { value: "available", label: "Available (standby)" },
            { value: "off", label: "Off (remove from day)" },
            { value: "sick", label: "Sick" }
          ]
        },
        {
          id: "shift",
          label: "Shift",
          type: "select",
          required: true,
          value: "full",
          options: [
            { value: "full", label: "Full Day" },
            { value: "am", label: "AM" },
            { value: "pm", label: "PM" }
          ]
        }
      ]
    });
    if (!values) return;
    const staffId = String(values.staffId || "").trim();
    if (!staffId) return;
    const status = normalizeStaffCellStatus?.(values.status || "scheduled");
    const shift = normalizeStaffShiftType?.(values.shift || "full");
    setStaffRotaSelectedMemberId?.(staffId);
    try {
      await applyStaffRotaUpdates?.([{ staffId, day: normalizedDayKey, status, shift }], { silent: true });
      const assignedName = (Array.isArray(snapshot?.rows) ? snapshot.rows : []).find((row) => row.memberId === staffId)?.member?.name || "Staff";
      setStaffStatus?.(`${assignedName} updated for ${dayMeta?.label || normalizedDayKey.toUpperCase()}.`);
      showManageToast?.("Day assignment updated.");
    } catch (error) {
      setStaffStatus?.(error.message, true);
    }
  }

  function stageStaffRotaPaint(cell, updatesMap) {
    if (!(cell instanceof HTMLElement)) return;
    const staffId = String(cell.getAttribute("data-id") || "").trim();
    const dayKey = String(cell.getAttribute("data-day") || "").trim().toLowerCase();
    if (!staffId || !dayKey) return;
    const brush = getCurrentRotaBrush?.();
    setStaffRotaSelectedMemberId?.(staffId);
    setStaffDayState?.(staffId, dayKey, brush);
    updatesMap.set(`${staffId}:${dayKey}`, { staffId, day: dayKey, status: brush?.status, shift: brush?.shift });
    renderStaffSummary?.();
    renderStaffRoster?.();
  }

  async function flushStaffRotaDragPaint() {
    const dragPaint = getStaffRotaDragPaint?.();
    if (!dragPaint?.active) return;
    const updates = Array.from(dragPaint.updates?.values?.() || []);
    setStaffRotaDragPaint?.({ active: false, seen: new Set(), updates: new Map() });
    if (!updates.length) return;
    try {
      await applyStaffRotaUpdates?.(updates, { silent: true });
      setStaffStatus?.(`Rota updated (${updates.length} cell${updates.length > 1 ? "s" : ""}).`);
    } catch (error) {
      setStaffStatus?.(error.message, true);
    }
  }

  function bindStaffRotaUiEvents() {
    staffWeekPrevBtn?.addEventListener("click", async () => {
      setStaffRotaWeekOffset?.(Number(getStaffRotaWeekOffset?.() || 0) - 1);
      await loadAndRenderStaffRotaWeek();
    });

    staffWeekTodayBtn?.addEventListener("click", async () => {
      setStaffRotaWeekOffset?.(0);
      await loadAndRenderStaffRotaWeek();
    });

    staffWeekNextBtn?.addEventListener("click", async () => {
      setStaffRotaWeekOffset?.(Number(getStaffRotaWeekOffset?.() || 0) + 1);
      await loadAndRenderStaffRotaWeek();
    });

    staffAutoCoverBtn?.addEventListener("click", async () => {
      if (!isDashboardManagerRole?.() || !getManageModeEnabled?.()) {
        setStaffStatus?.("Turn Edit Mode on to auto-fill sickness cover.", true);
        return;
      }
      await applyAutoCoverForWeek?.();
    });

    staffLoadDemoRotaBtn?.addEventListener("click", () => {
      loadStaffDemoRotaPreview?.();
      showManageToast?.("Demo rota loaded.");
    });

    staffClearWeekOverridesBtn?.addEventListener("click", async () => {
      if (!isDashboardManagerRole?.() || !getManageModeEnabled?.()) {
        setStaffStatus?.("Turn Edit Mode on to reset rota changes.", true);
        return;
      }
      const confirmed = await openManageConfirm?.({
        title: "Reset Weekly Rota Edits",
        message: "Clear all rota status changes for the selected week (including sickness and cover flags)?",
        confirmLabel: "Reset Week"
      });
      if (!confirmed) return;
      try {
        await resetStaffRotaWeekRemote?.();
        renderStaffSummary?.();
        renderStaffRoster?.();
        setStaffStatus?.("Weekly rota changes reset.");
      } catch (error) {
        setStaffStatus?.(error.message, true);
      }
    });

    staffRotaGrid?.addEventListener("pointerdown", (event) => {
      const target = event.target;
      const cell = target instanceof HTMLElement ? target.closest(".staff-rota-cell, .staff-rota-dot-btn") : null;
      if (!(cell instanceof HTMLElement)) return;
      const staffId = String(cell.getAttribute("data-id") || "").trim();
      if (staffId) setStaffRotaSelectedMemberId?.(staffId);
      if (!isDashboardManagerRole?.() || !getManageModeEnabled?.()) {
        renderStaffRoster?.();
        setStaffStatus?.("Turn Edit Mode on to update rota cells.", true);
        return;
      }
      if (event.pointerType === "touch" || event.pointerType === "pen") return;
      if (typeof event.button === "number" && event.button !== 0) return;
      event.preventDefault();
      const updates = new Map();
      const seen = new Set();
      const firstKey = `${String(cell.getAttribute("data-id") || "").trim()}:${String(cell.getAttribute("data-day") || "").trim().toLowerCase()}`;
      if (firstKey) seen.add(firstKey);
      setStaffRotaDragPaint?.({ active: true, seen, updates });
      stageStaffRotaPaint(cell, updates);
    });

    staffRotaGrid?.addEventListener("pointerover", (event) => {
      const dragPaint = getStaffRotaDragPaint?.();
      if (!dragPaint?.active) return;
      const target = event.target;
      const cell = target instanceof HTMLElement ? target.closest(".staff-rota-cell, .staff-rota-dot-btn") : null;
      if (!(cell instanceof HTMLElement)) return;
      const key = `${String(cell.getAttribute("data-id") || "").trim()}:${String(cell.getAttribute("data-day") || "").trim().toLowerCase()}`;
      if (!key || dragPaint.seen?.has(key)) return;
      dragPaint.seen?.add(key);
      stageStaffRotaPaint(cell, dragPaint.updates);
    });

    document.addEventListener("pointerup", () => {
      flushStaffRotaDragPaint().catch(() => {});
    });

    staffRotaGrid?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const cell = target.closest(".staff-rota-cell, .staff-rota-dot-btn");
      if (cell instanceof HTMLElement) {
        const staffId = String(cell.getAttribute("data-id") || "").trim();
        if (!staffId) return;
        setStaffRotaSelectedMemberId?.(staffId);
        if (!getManageModeEnabled?.()) renderStaffRoster?.();
        return;
      }
      const dayCell = target.closest(".staff-rota-day-cell");
      if (!(dayCell instanceof HTMLElement)) return;
      const dayKey = String(dayCell.getAttribute("data-day") || "").trim().toLowerCase();
      if (!dayKey) return;
      if (!isDashboardManagerRole?.() || !getManageModeEnabled?.()) {
        setStaffStatus?.("Turn Edit Mode on to assign staff for a day.", true);
        return;
      }
      openStaffDayQuickAssign(dayKey).catch((error) => {
        setStaffStatus?.(error.message, true);
      });
    });

    staffRosterList?.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const staffId = String(target.getAttribute("data-id") || "").trim();
      if (!staffId) return;
      try {
        if (target.classList.contains("staff-select")) {
          setStaffRotaSelectedMemberId?.(staffId);
          renderStaffRoster?.();
          return;
        }
        if (target.classList.contains("staff-sick")) {
          if (!isDashboardManagerRole?.() || !getManageModeEnabled?.()) {
            setStaffStatus?.("Turn Edit Mode on to record staff sickness.", true);
            return;
          }
          const applied = await promptStaffSickReport?.(staffId);
          if (applied) {
            setStaffStatus?.("Sickness alert added to rota and coverage planner updated.");
            showManageToast?.("Sickness alert added.");
          }
          return;
        }
        if (!isDashboardManagerRole?.() || !getManageModeEnabled?.()) return;
        if (target.classList.contains("staff-edit")) {
          const member = (Array.isArray(getStaffRosterRows?.()) ? getStaffRosterRows() : []).find((row) => String(row.id || "") === staffId);
          if (!member) return;
          const values = await openManageForm?.({
            title: "Edit Staff Member",
            submitLabel: "Save",
            fields: [
              { id: "name", label: "Name", required: true, value: member.name || "" },
              { id: "role", label: "Role", value: member.role || "staff" },
              { id: "availability", label: "Availability", value: member.availability || "off_duty" },
              {
                id: "shiftDays",
                label: "Shift days comma-separated",
                value: Array.isArray(member.shiftDays) && member.shiftDays.length ? member.shiftDays.join(",") : ""
              }
            ]
          });
          if (!values) return;
          setStaffStatus?.("Saving staff member...");
          await upsertStaffMember?.({
            id: staffId,
            name: values.name,
            role: values.role,
            availability: values.availability,
            shiftDays: String(values.shiftDays || "")
              .split(",")
              .map((value) => String(value || "").trim().toLowerCase())
              .filter(Boolean)
          });
          setStaffStatus?.("Staff member updated.");
          showManageToast?.("Staff member updated.");
          return;
        }
        if (target.classList.contains("staff-toggle")) {
          const next = String(target.getAttribute("data-next") || "off_duty").trim();
          setStaffStatus?.("Updating availability...");
          await updateStaffAvailability?.(staffId, next);
          setStaffStatus?.("Availability updated.");
          return;
        }
        if (target.classList.contains("staff-remove")) {
          const confirmed = await openManageConfirm?.({
            title: "Delete Staff Member",
            message: "Remove this staff member?",
            confirmLabel: "Delete"
          });
          if (!confirmed) return;
          setStaffStatus?.("Removing staff member...");
          await removeStaffMember?.(staffId);
          if (getStaffRotaSelectedMemberId?.() === staffId) {
            setStaffRotaSelectedMemberId?.(getStaffMemberId?.((Array.isArray(getStaffRosterRows?.()) ? getStaffRosterRows() : [])[0] || null));
          }
          setStaffStatus?.("Staff member removed.");
          showManageToast?.("Staff member deleted.");
        }
      } catch (error) {
        setStaffStatus?.(error.message, true);
      }
    });
  }

  return {
    loadAndRenderStaffRotaWeek,
    openStaffDayQuickAssign,
    stageStaffRotaPaint,
    flushStaffRotaDragPaint,
    bindStaffRotaUiEvents
  };
}
