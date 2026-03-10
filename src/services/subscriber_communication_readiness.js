export function evaluateSubscriberCommunicationReadiness({
  settings,
  providerStatus,
  communicationSummary,
  futureConfirmedBookings,
  reachableUpcoming,
  missingContactUpcoming,
  contactCoveragePct
} = {}) {
  const safeProviderStatus = providerStatus && typeof providerStatus === "object" ? providerStatus : {};
  const safeSummary = communicationSummary && typeof communicationSummary === "object" ? communicationSummary : {};
  const upcomingBookings = Array.isArray(futureConfirmedBookings) ? futureConfirmedBookings : [];
  const reachableBookings = Array.isArray(reachableUpcoming) ? reachableUpcoming : [];
  const issues = [];
  const nextSteps = [];
  let status = "ready";
  let label = "Ready to send";
  let summary = "Communication setup looks workable for current bookings.";

  if (settings && !settings.liveRemindersEnabled) {
    status = "manual";
    label = "Manual follow-up only";
    summary = "Live reminders are currently switched off for this salon.";
    issues.push("The team has live reminders turned off, so diary follow-up depends on manual action.");
    nextSteps.push("Turn live reminders back on if you want automatic SMS or email follow-up.");
  } else if (!safeProviderStatus.smsConfigured && !safeProviderStatus.emailConfigured) {
    status = "setup";
    label = "Setup incomplete";
    summary = "Live SMS and email providers are not configured yet.";
    issues.push("This salon cannot send live booking notifications until at least one channel is configured.");
    nextSteps.push("Connect SMS or email delivery before relying on automated reminders.");
  } else if (Number(missingContactUpcoming || 0) >= 3 || (upcomingBookings.length && Number(contactCoveragePct || 0) < 70)) {
    status = "contacts";
    label = "Contact details need work";
    summary = "Too many upcoming bookings do not have a phone number or email saved.";
    issues.push("A noticeable share of upcoming bookings cannot be reached automatically.");
    nextSteps.push("Capture a phone number or email during booking so reminders have somewhere to go.");
  } else if (Number(safeSummary.notificationsFailed || 0) >= Math.max(2, Number(safeSummary.notificationsSent || 0))) {
    status = "risk";
    label = "Delivery risk";
    summary = "Recent notification failures are outweighing successful sends.";
    issues.push("Live reminders are trying to send, but too many recent attempts are failing.");
    nextSteps.push("Review provider setup and invalid contact details before busy days are affected.");
  } else if (upcomingBookings.length >= 3 && Number(safeSummary.notificationsSent || 0) === 0) {
    status = "quiet";
    label = "Reminder flow looks quiet";
    summary = "Upcoming bookings are in the diary, but no recent live reminder sends are showing.";
    issues.push("The team may be relying on manual follow-up or reminders are not running yet.");
    nextSteps.push("Check that reminder sending is enabled and being used for upcoming bookings.");
  } else {
    issues.push("At least one live delivery channel is available and recent activity does not show a major warning.");
    nextSteps.push("Keep customer phone and email details complete so reminders stay reliable.");
  }

  if (safeProviderStatus.smsConfigured && !safeProviderStatus.emailConfigured) {
    issues.push("SMS is ready, but email delivery is not configured.");
  } else if (!safeProviderStatus.smsConfigured && safeProviderStatus.emailConfigured) {
    issues.push("Email is ready, but SMS delivery is not configured.");
  }

  if (!nextSteps.length) {
    nextSteps.push("Use the recovery and messaging areas to keep follow-up activity visible to the team.");
  }

  return {
    status,
    label,
    summary,
    upcomingBookings: upcomingBookings.length,
    reachableUpcoming: reachableBookings.length,
    missingContactUpcoming: Math.max(0, Number(missingContactUpcoming || 0)),
    contactCoveragePct: Number(contactCoveragePct ?? 100),
    availableChannels: Array.isArray(safeProviderStatus.availableChannels) ? safeProviderStatus.availableChannels : [],
    issues: issues.slice(0, 3),
    nextSteps: nextSteps.slice(0, 3)
  };
}

export function computeSubscriberRemindersDueSoon({
  futureConfirmedBookings,
  reminderLeadHours = 24,
  nowMs = Date.now()
} = {}) {
  const bookings = Array.isArray(futureConfirmedBookings) ? futureConfirmedBookings : [];
  const leadHours = Number(reminderLeadHours || 24);

  return bookings
    .map((booking) => {
      const startsAtMs = booking?.startsAt instanceof Date ? booking.startsAt.getTime() : Number.NaN;
      if (Number.isNaN(startsAtMs)) return null;
      const dueAtMs = startsAtMs - leadHours * 60 * 60 * 1000;
      const msUntilDue = dueAtMs - nowMs;
      return {
        bookingId: booking.id,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail || "",
        customerPhone: booking.customerPhone || "",
        service: booking.service,
        date: booking.normalizedDate,
        time: booking.time,
        dueAt: new Date(dueAtMs).toISOString(),
        hoursUntilDue: Number((msUntilDue / (1000 * 60 * 60)).toFixed(1)),
        reachable: Boolean(String(booking.customerPhone || "").trim() || String(booking.customerEmail || "").trim()),
        hasPhone: Boolean(String(booking.customerPhone || "").trim()),
        hasEmail: Boolean(String(booking.customerEmail || "").trim())
      };
    })
    .filter((row) => row && row.hoursUntilDue >= -1 && row.hoursUntilDue <= 24)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 8);
}
