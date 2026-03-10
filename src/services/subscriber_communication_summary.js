function parseAuditMetadata(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export function buildSubscriberCommunicationSummary(communicationLogs = []) {
  const logs = Array.isArray(communicationLogs) ? communicationLogs : [];
  const deliveryLogs = logs.filter((row) => row.action === "notification.delivery");
  const deliveryWithMetadata = deliveryLogs.map((row) => ({
    row,
    metadata: parseAuditMetadata(row.metadata)
  }));
  const confirmationDeliveries = deliveryWithMetadata.filter(
    ({ metadata }) => metadata.deliveryType === "booking_confirmation"
  );
  const scheduledReminderDeliveries = deliveryWithMetadata.filter(
    ({ metadata }) => metadata.deliveryType === "scheduled_reminder"
  );

  return {
    remindersLogged: logs.filter((row) => row.action === "booking.reminder_marked").length,
    confirmationsLogged: logs.filter((row) => row.action === "booking.confirmation_marked").length,
    rebookingLogged: logs.filter((row) => row.action === "rebooking.prompt_sent").length,
    notificationsSent: deliveryWithMetadata.filter(({ metadata }) => metadata.outcome === "sent").length,
    notificationsFailed: deliveryWithMetadata.filter(({ metadata }) => metadata.outcome === "failed").length,
    confirmationNotificationsSent: confirmationDeliveries.filter(({ metadata }) => metadata.outcome === "sent").length,
    scheduledReminderNotificationsSent: scheduledReminderDeliveries.filter(
      ({ metadata }) => metadata.outcome === "sent"
    ).length,
    scheduledReminderNotificationsFailed: scheduledReminderDeliveries.filter(
      ({ metadata }) => metadata.outcome === "failed"
    ).length
  };
}

export function buildSubscriberRecentCommunications(communicationLogs = []) {
  const logs = Array.isArray(communicationLogs) ? communicationLogs : [];

  return logs.map((row) => ({
    action: row.action,
    createdAt: row.createdAt,
    metadata: parseAuditMetadata(row.metadata)
  }));
}
