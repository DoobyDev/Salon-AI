// Module snapshot lines shown inside module popups.
export function getModulePopupSnapshotItems(mod, ctx) {
  if (!mod) return [];
  const {
    userRole,
    businessProfileServicesValue,
    socialInputs,
    bookingRows,
    calendarCurrentMonth,
    adminAccountSupportResultsCache,
    adminAccountSupportSelectedAccount,
    metricsGrid,
    billingSummary,
    subscriptionCurrentPlanLabelText,
    formatDateShort,
    formatMoney,
    commandCenterCards,
    commandCenterActions,
    commandCenterStatus,
    businessProfileNameValue,
    businessHours,
    bookingDateFilterLabel,
    calendarMonthLabelText,
    selectedCalendarDateKey,
    accountingRows,
    accountingLivePayload,
    accountingLiveTimeframe,
    staffRosterRows,
    staffSummary,
    waitlistRows,
    waitlistSummary,
    operationsInsights,
    crmSegmentsPayload,
    commercialPayload,
    revenueAttributionPayload,
    profitabilityPayload
  } = ctx;

  const key = String(mod.key || "");
  const servicesCount = String(businessProfileServicesValue || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;
  const configuredSocialCount = (Array.isArray(socialInputs) ? socialInputs : [])
    .filter((input) => Boolean(String(input?.value || "").trim())).length;
  const safeBookingRows = Array.isArray(bookingRows) ? bookingRows : [];
  const baseBookingCounts = {
    total: safeBookingRows.length,
    cancelled: safeBookingRows.filter((row) => String(row?.status || "").toLowerCase().includes("cancel")).length,
    upcoming: safeBookingRows.filter((row) => {
      const when = new Date(row?.startAt || row?.date || row?.appointmentAt || "");
      return Number.isFinite(when.getTime()) && when.getTime() >= Date.now();
    }).length
  };
  const dayMs = 24 * 60 * 60 * 1000;
  const statusText = (row) => String(row?.status || "").toLowerCase();
  const bookingDateValue = (row) => {
    const direct = new Date(row?.startAt || row?.appointmentAt || row?.date || "");
    if (Number.isFinite(direct.getTime())) return direct;
    const datePart = String(row?.date || "").trim();
    const timePart = String(row?.time || "00:00").slice(0, 5);
    const fallback = new Date(datePart ? `${datePart}T${timePart}:00` : "");
    return fallback;
  };
  const pendingConfirmationCount = safeBookingRows.filter((row) => {
    const status = statusText(row);
    return status === "pending" || status === "pending_confirmation" || status === "awaiting_confirmation";
  }).length;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = todayStart.getTime() + dayMs;
  const todayBookings = safeBookingRows.filter((row) => {
    const when = bookingDateValue(row).getTime();
    return Number.isFinite(when) && when >= todayStart.getTime() && when < todayEnd;
  });
  const thisMonthBusyDays = new Set(
    safeBookingRows
      .map((row) => bookingDateValue(row))
      .filter((date) => Number.isFinite(date.getTime()))
      .filter((date) => date.getMonth() === calendarCurrentMonth.getMonth() && date.getFullYear() === calendarCurrentMonth.getFullYear())
      .map((date) => date.toISOString().slice(0, 10))
  ).size;
  const rescheduleSignals = safeBookingRows.filter((row) => {
    const status = statusText(row);
    if (status.includes("resched") || status.includes("change")) return true;
    if (row?.rescheduledAt || row?.previousStartAt || row?.previousDate || row?.oldDate) return true;
    const createdTs = new Date(row?.createdAt || "").getTime();
    const updatedTs = new Date(row?.updatedAt || "").getTime();
    return Number.isFinite(createdTs) && Number.isFinite(updatedTs) && updatedTs - createdTs > 5 * 60 * 1000;
  }).length;
  const todayTakings = todayBookings
    .filter((row) => !statusText(row).includes("cancel"))
    .reduce((sum, row) => sum + Number(row?.price || 0), 0);
  const todayCompletedCount = todayBookings.filter((row) => statusText(row) === "completed").length;
  const todayPendingCount = todayBookings.filter((row) => {
    const status = statusText(row);
    return status === "pending" || status === "pending_confirmation" || status === "awaiting_confirmation";
  }).length;

  switch (key) {
    case "account_support":
      return [
        "Search scope: subscriber and customer accounts",
        `Loaded results: ${adminAccountSupportResultsCache.length}`,
        `Selected account: ${adminAccountSupportSelectedAccount?.()?.name || "None"}`
      ];
    case "overview":
      return [
        `Visible KPI cards: ${metricsGrid?.children?.length ?? 0}`,
        `Bookings loaded: ${baseBookingCounts.total}`,
        `Current role: ${userRole || "unknown"}`
      ];
    case "subscription_plan":
      return [
        `Current plan: ${String(billingSummary?.planLabel || subscriptionCurrentPlanLabelText || "Subscriber").trim() || "Subscriber"}`,
        `Status: ${String(billingSummary?.status || "active").trim() || "active"}`,
        `${String(billingSummary?.currentPeriodEnd ? `Next renewal: ${formatDateShort(billingSummary.currentPeriodEnd)}` : "Next renewal: Not available yet")}`
      ];
    case "first_7_days_snapshot":
      {
        const now = Date.now();
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        const recent = safeBookingRows.filter((row) => {
          const ts = new Date(row.createdAt || `${row.date || ""}T${String(row.time || "00:00").slice(0, 5)}:00`).getTime();
          return Number.isFinite(ts) && ts >= sevenDaysAgo;
        });
        const bookings = recent.length;
        const completed = recent.filter((row) => String(row.status || "").toLowerCase() === "completed").length;
        const cancelled = recent.filter((row) => String(row.status || "").toLowerCase() === "cancelled").length;
        const revenue = recent
          .filter((row) => String(row.status || "").toLowerCase() !== "cancelled")
          .reduce((sum, row) => sum + Number(row.price || 0), 0);
        const completionRate = bookings ? Math.round((completed / bookings) * 100) : 0;
        const cancelRate = bookings ? Math.round((cancelled / bookings) * 100) : 0;
        const avgTicket = completed > 0 ? revenue / completed : bookings > cancelled ? revenue / Math.max(1, bookings - cancelled) : 0;
        return [
          `Last 7 days: ${bookings} bookings ? ${completed} completed ? ${cancelled} cancelled`,
          `Rates: ${completionRate}% completion ? ${cancelRate}% cancellation`,
          `Revenue snapshot: ${formatMoney(revenue)} total ? Avg ticket ${formatMoney(avgTicket)}`
        ];
      }
    case "command_center":
      return [
        `Action cards loaded: ${commandCenterCards?.children?.length ?? 0}`,
        `Action queue items: ${commandCenterActions?.children?.length ?? 0}`,
        `Daily action status: ${String(commandCenterStatus?.textContent || "Waiting for today's activity").trim() || "Waiting for today's activity"}`
      ];
    case "business_profile":
      return [
        `Business name: ${String(businessProfileNameValue || "Not set yet").trim() || "Not set yet"}`,
        `Services listed: ${servicesCount}`,
        `Hours configured: ${(Array.isArray(businessHours) ? businessHours : []).filter((input) => Boolean(String(input?.value || "").trim())).length}/7 days`
      ];
    case "booking_ops":
      return [
        `Bookings loaded: ${baseBookingCounts.total}`,
        `Pending confirmations: ${pendingConfirmationCount} ? Cancelled: ${baseBookingCounts.cancelled}`,
        `Active date filter: ${bookingDateFilterLabel || "All dates"}`
      ];
    case "reschedules_changes":
      return [
        `Reschedule/change signals: ${rescheduleSignals}`,
        `Pending confirmations needing review: ${pendingConfirmationCount}`,
        "Use Booking Operations popup actions to review and update changed appointments"
      ];
    case "calendar":
      return [
        `Viewing month: ${String(calendarMonthLabelText || "Current month").trim()}`,
        `Busy days this month: ${thisMonthBusyDays}`,
        `Selected day: ${selectedCalendarDateKey || "None"} ? Bookings mapped: ${baseBookingCounts.total}`
      ];
    case "accounting":
      return [
        `Accounting connections: ${Array.isArray(accountingRows) ? accountingRows.length : 0}`,
        `Live accounting feed: ${accountingLivePayload ? "Live" : "Waiting for data"}`,
        `Current timeframe: ${String(accountingLiveTimeframe || "today").toUpperCase()}`
      ];
    case "staff":
      return [
        `Staff records: ${Array.isArray(staffRosterRows) ? staffRosterRows.length : 0}`,
        `Team summary: ${staffSummary ? "Live" : "Waiting for team data"}`,
        `Capacity planning source: ${baseBookingCounts.upcoming} upcoming bookings`
      ];
    case "waitlist":
      return [
        `Waitlist entries: ${Array.isArray(waitlistRows) ? waitlistRows.length : 0}`,
        `Waitlist summary: ${waitlistSummary ? "Live" : "Waiting for entries"}`,
        `Recovery opportunity cue: ${baseBookingCounts.cancelled} cancellations in loaded bookings`
      ];
    case "daily_takings":
      return [
        `Today bookings in diary: ${todayBookings.length}`,
        `Today takings snapshot: ${formatMoney(todayTakings)} ? Completed: ${todayCompletedCount}`,
        `Awaiting confirmation today: ${todayPendingCount}`
      ];
    case "operations":
      return [
        `No-show & rebooking view: ${operationsInsights ? "Live" : "Waiting for booking patterns"}`,
        "At-risk workflow support: Enabled",
        `Booking base for risk checks: ${baseBookingCounts.total} loaded`
      ];
    case "crm":
      return [
        `Client segments: ${crmSegmentsPayload ? "Live" : "Waiting for data"}`,
        `Campaign planning source: ${baseBookingCounts.total} bookings`,
        "Reactivation support: Available"
      ];
    case "commercial":
      return [
        `Memberships & packages: ${commercialPayload ? "Live" : "Waiting for setup"}`,
        `Subscription summary: ${billingSummary ? "Live" : "Waiting for billing data"}`,
        "Recurring income tools: Available"
      ];
    case "revenue":
      return [
        `Revenue channel tracking: ${revenueAttributionPayload ? "Live" : "Waiting for tracked data"}`,
        `Bookings contributing to revenue view: ${baseBookingCounts.total}`,
        "Channel ROI analysis: Available"
      ];
    case "profitability":
      return [
        `Profit model: ${profitabilityPayload ? "Live" : "Waiting for costs and payroll"}`,
        "Payroll & cost review: Available",
        "Margin planning view: Available"
      ];
    case "social":
      return [
        `Configured social links: ${configuredSocialCount}`,
        "Profile visibility support: Active",
        "Brand tools: Available"
      ];
    case "frontdesk":
      return [
        `Front desk profile name: ${String(businessProfileNameValue || "Not set").trim() || "Not set"}`,
        `Social links connected: ${configuredSocialCount}`,
        "Public-facing profile controls: Available"
      ];
    case "subscriber_copilot":
      return [
        "Copilot scope: Salon day-to-day support only",
        `Booking summary source: ${baseBookingCounts.total} loaded bookings`,
        "Privacy mode: Sanitized summaries only"
      ];
    case "admin_copilot":
      return [
        "Copilot scope: Platform checks + subscriber support",
        "Privacy mode: Sanitized summaries only",
        "Suggested fixes: On (read-only guidance)"
      ];
    default:
      return [
        `Module role: ${userRole || "unknown"}`,
        `Loaded bookings context: ${baseBookingCounts.total}`,
        "Open this module for full controls and details"
      ];
  }
}
