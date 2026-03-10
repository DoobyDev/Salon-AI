import { describe, expect, it } from "vitest";
import {
  computeSubscriberRemindersDueSoon,
  evaluateSubscriberCommunicationReadiness
} from "../src/services/subscriber_communication_readiness.js";

describe("subscriber communication readiness helper", () => {
  it("marks disabled live reminders as manual follow-up only", () => {
    const result = evaluateSubscriberCommunicationReadiness({
      settings: { liveRemindersEnabled: false },
      providerStatus: { smsConfigured: true, emailConfigured: true, availableChannels: ["sms", "email"] },
      communicationSummary: { notificationsSent: 1, notificationsFailed: 0 },
      futureConfirmedBookings: [{ id: "b1" }],
      reachableUpcoming: [{ id: "b1" }],
      missingContactUpcoming: 0,
      contactCoveragePct: 100
    });

    expect(result.status).toBe("manual");
    expect(result.label).toBe("Manual follow-up only");
    expect(result.summary).toMatch(/switched off/i);
  });

  it("marks missing channels as setup incomplete", () => {
    const result = evaluateSubscriberCommunicationReadiness({
      settings: { liveRemindersEnabled: true },
      providerStatus: { smsConfigured: false, emailConfigured: false, availableChannels: [] },
      communicationSummary: { notificationsSent: 0, notificationsFailed: 0 },
      futureConfirmedBookings: [{ id: "b1" }],
      reachableUpcoming: [{ id: "b1" }],
      missingContactUpcoming: 0,
      contactCoveragePct: 100
    });

    expect(result.status).toBe("setup");
    expect(result.nextSteps[0]).toMatch(/connect sms or email/i);
  });

  it("marks poor coverage as contacts risk", () => {
    const result = evaluateSubscriberCommunicationReadiness({
      settings: { liveRemindersEnabled: true },
      providerStatus: { smsConfigured: true, emailConfigured: false, availableChannels: ["sms"] },
      communicationSummary: { notificationsSent: 2, notificationsFailed: 0 },
      futureConfirmedBookings: [{ id: "b1" }, { id: "b2" }, { id: "b3" }, { id: "b4" }],
      reachableUpcoming: [{ id: "b1" }],
      missingContactUpcoming: 3,
      contactCoveragePct: 25
    });

    expect(result.status).toBe("contacts");
    expect(result.issues[0]).toMatch(/cannot be reached automatically/i);
  });

  it("marks low send activity with busy upcoming diary as quiet", () => {
    const result = evaluateSubscriberCommunicationReadiness({
      settings: { liveRemindersEnabled: true },
      providerStatus: { smsConfigured: true, emailConfigured: true, availableChannels: ["sms", "email"] },
      communicationSummary: { notificationsSent: 0, notificationsFailed: 0 },
      futureConfirmedBookings: [{ id: "b1" }, { id: "b2" }, { id: "b3" }],
      reachableUpcoming: [{ id: "b1" }, { id: "b2" }, { id: "b3" }],
      missingContactUpcoming: 0,
      contactCoveragePct: 100
    });

    expect(result.status).toBe("quiet");
    expect(result.summary).toMatch(/no recent live reminder sends/i);
  });

  it("computes due-soon reminders within the next 24 hours and sorts them by due time", () => {
    const now = new Date("2026-03-10T10:00:00.000Z").getTime();
    const rows = computeSubscriberRemindersDueSoon({
      reminderLeadHours: 24,
      nowMs: now,
      futureConfirmedBookings: [
        {
          id: "later",
          customerName: "Later Client",
          customerPhone: "07111111111",
          customerEmail: "",
          service: "Cut",
          normalizedDate: "2026-03-11",
          time: "18:00",
          startsAt: new Date("2026-03-11T18:00:00.000Z")
        },
        {
          id: "sooner",
          customerName: "Sooner Client",
          customerPhone: "",
          customerEmail: "soon@example.com",
          service: "Colour",
          normalizedDate: "2026-03-11",
          time: "12:00",
          startsAt: new Date("2026-03-11T12:00:00.000Z")
        },
        {
          id: "too_far",
          customerName: "Far Client",
          customerPhone: "07222222222",
          customerEmail: "",
          service: "Style",
          normalizedDate: "2026-03-13",
          time: "10:00",
          startsAt: new Date("2026-03-13T10:00:00.000Z")
        }
      ]
    });

    expect(rows).toHaveLength(2);
    expect(rows[0].bookingId).toBe("sooner");
    expect(rows[1].bookingId).toBe("later");
    expect(rows[0].reachable).toBe(true);
    expect(rows[0].hasEmail).toBe(true);
  });
});
