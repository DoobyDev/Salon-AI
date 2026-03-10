// Admin notification-health evaluation and Lexi prompt helpers.
export function evaluateAdminNotificationHealth(business) {
  const sent = Number(business?.stats?.notificationSentCount || 0);
  const failed = Number(business?.stats?.notificationFailedCount || 0);
  const upcoming = Number(business?.stats?.upcomingBookings || 0);
  const total = sent + failed;
  const failureRate = total ? failed / total : 0;
  const issues = [];
  const nextSteps = [];
  let status = "stable";
  let summary = "Delivery looks steady.";

  if (!total) {
    status = upcoming > 0 ? "quiet" : "inactive";
    summary = upcoming > 0 ? "No recent reminder delivery is showing." : "No recent delivery activity is showing.";
    issues.push(upcoming > 0 ? "Upcoming bookings exist, but recent reminder delivery is not showing yet." : "No recent notification delivery activity is logged for this business.");
    nextSteps.push("Check reminder settings and make sure this salon is actually sending confirmations or reminders.");
  } else if (failed && !sent) {
    status = "critical";
    summary = "Recent sends are failing without any logged successes.";
    issues.push("Failed delivery activity is showing, but there are no recent successful sends.");
    nextSteps.push("Check provider setup, sender details, and whether customer contact data is complete.");
  } else if (failureRate >= 0.5 && failed >= 3) {
    status = "critical";
    summary = "Delivery failures are high against successful sends.";
    issues.push("More than half of recent logged delivery attempts are failing.");
    nextSteps.push("Review provider credentials, message channel setup, and invalid phone or email data.");
  } else if (failed > 0) {
    status = "warning";
    summary = "Some recent reminder sends are failing.";
    issues.push("Delivery is partly working, but some channels are failing.");
    nextSteps.push("Check whether failures are tied to SMS, email, or poor contact details.");
  }

  if (upcoming >= 8 && sent < Math.max(2, Math.floor(upcoming / 4))) {
    issues.push("This salon has a healthy number of upcoming bookings but relatively little recent reminder activity.");
    nextSteps.push("Review reminder timing so busy days are still getting confirmations and reminders.");
  }

  if (!nextSteps.length) {
    nextSteps.push("Keep an eye on reminder delivery so busy days stay protected against no-shows.");
  }

  return {
    sent,
    failed,
    total,
    failureRate,
    status,
    summary,
    issues: issues.slice(0, 3),
    nextSteps: nextSteps.slice(0, 3)
  };
}

export function buildAdminNotificationLexiPrompt(business, mode = "fix") {
  const row = business || null;
  if (!row) return "Which salon has the biggest notification problem right now, and what should I check first?";
  const health = evaluateAdminNotificationHealth(row);
  if (mode === "checks") {
    return `Give me a short admin checklist for fixing notification delivery at ${row.name}. Current issue: ${health.summary} Failed sends: ${health.failed}. Successful sends: ${health.sent}.`;
  }
  return `Help me fix notification delivery for ${row.name}. Current issue: ${health.summary} Failed sends: ${health.failed}. Successful sends: ${health.sent}. Tell me the most likely cause and the next admin step.`;
}
