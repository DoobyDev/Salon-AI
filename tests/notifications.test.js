import { describe, it, expect } from "vitest";
import { sendBookingNotifications } from "../src/services/notifications.js";

const booking = {
  businessId: "biz_1",
  customerName: "Alex",
  service: "Cut & Finish",
  date: "2026-03-20",
  time: "14:00"
};

describe("booking notifications", () => {
  it("returns manual fallback when reminders are manual-only", async () => {
    const result = await sendBookingNotifications({
      businessName: "Glow Studio",
      booking,
      customerEmail: "alex@example.com",
      customerPhone: "+12025550111",
      reminderSettings: {
        liveRemindersEnabled: true,
        channelPreference: "manual",
        manualFallbackEnabled: true
      },
      deliveryType: "scheduled_reminder"
    });

    expect(result.channels).toEqual([
      { channel: "sms", outcome: "skipped", reason: "manual_only" },
      { channel: "email", outcome: "skipped", reason: "manual_only" },
      { channel: "manual", outcome: "skipped", reason: "manual_follow_up_selected" }
    ]);
    expect(String(result.message || "")).toMatch(/Reminder from Glow Studio/i);
  });

  it("marks live channels disabled when automatic reminders are turned off", async () => {
    const result = await sendBookingNotifications({
      businessName: "Glow Studio",
      booking,
      customerEmail: "alex@example.com",
      customerPhone: "+12025550111",
      reminderSettings: {
        liveRemindersEnabled: false,
        channelPreference: "auto",
        manualFallbackEnabled: true
      },
      deliveryType: "scheduled_reminder"
    });

    expect(result.channels).toEqual([
      { channel: "sms", outcome: "skipped", reason: "live_reminders_disabled" },
      { channel: "email", outcome: "skipped", reason: "live_reminders_disabled" },
      { channel: "manual", outcome: "skipped", reason: "manual_follow_up_selected" }
    ]);
  });

  it("falls back to manual follow-up when auto mode has no live providers available", async () => {
    const result = await sendBookingNotifications({
      businessName: "Glow Studio",
      booking,
      customerEmail: "",
      customerPhone: "",
      reminderSettings: {
        liveRemindersEnabled: true,
        channelPreference: "auto",
        manualFallbackEnabled: true
      },
      deliveryType: "booking_confirmation"
    });

    expect(result.channels).toEqual([
      { channel: "sms", outcome: "skipped", reason: "no_recipient" },
      { channel: "email", outcome: "skipped", reason: "no_recipient" },
      { channel: "manual", outcome: "skipped", reason: "all_live_channels_unavailable" }
    ]);
    expect(String(result.message || "")).toMatch(/Booking confirmed at Glow Studio/i);
  });
});
