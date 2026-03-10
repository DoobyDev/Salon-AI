import { describe, expect, it } from "vitest";
import {
  buildSubscriberCommunicationSummary,
  buildSubscriberRecentCommunications
} from "../src/services/subscriber_communication_summary.js";

describe("subscriber communication summary helper", () => {
  it("counts reminder, confirmation, rebooking, and delivery outcomes", () => {
    const summary = buildSubscriberCommunicationSummary([
      { action: "booking.reminder_marked" },
      { action: "booking.reminder_marked" },
      { action: "booking.confirmation_marked" },
      { action: "rebooking.prompt_sent" },
      {
        action: "notification.delivery",
        metadata: JSON.stringify({ deliveryType: "scheduled_reminder", outcome: "sent" })
      },
      {
        action: "notification.delivery",
        metadata: JSON.stringify({ deliveryType: "scheduled_reminder", outcome: "failed" })
      },
      {
        action: "notification.delivery",
        metadata: JSON.stringify({ deliveryType: "booking_confirmation", outcome: "sent" })
      }
    ]);

    expect(summary).toEqual({
      remindersLogged: 2,
      confirmationsLogged: 1,
      rebookingLogged: 1,
      notificationsSent: 2,
      notificationsFailed: 1,
      confirmationNotificationsSent: 1,
      scheduledReminderNotificationsSent: 1,
      scheduledReminderNotificationsFailed: 1
    });
  });

  it("treats invalid metadata as empty and keeps counting safely", () => {
    const summary = buildSubscriberCommunicationSummary([
      {
        action: "notification.delivery",
        metadata: "{not-json"
      },
      {
        action: "notification.delivery",
        metadata: { deliveryType: "scheduled_reminder", outcome: "sent" }
      }
    ]);

    expect(summary.notificationsSent).toBe(1);
    expect(summary.notificationsFailed).toBe(0);
    expect(summary.scheduledReminderNotificationsSent).toBe(1);
  });

  it("normalizes recent communication metadata safely", () => {
    const createdAt = new Date("2026-03-10T12:00:00.000Z");
    const recent = buildSubscriberRecentCommunications([
      {
        action: "notification.delivery",
        createdAt,
        metadata: JSON.stringify({ outcome: "sent", deliveryType: "scheduled_reminder" })
      },
      {
        action: "booking.reminder_marked",
        createdAt,
        metadata: "{bad-json"
      }
    ]);

    expect(recent).toEqual([
      {
        action: "notification.delivery",
        createdAt,
        metadata: { outcome: "sent", deliveryType: "scheduled_reminder" }
      },
      {
        action: "booking.reminder_marked",
        createdAt,
        metadata: {}
      }
    ]);
  });
});
