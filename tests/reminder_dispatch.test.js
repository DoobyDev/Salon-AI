import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createReminderDispatchService } from "../src/services/reminder_dispatch.js";

function isoDateAndTime(offsetHoursFromNow) {
  const d = new Date(Date.now() + offsetHoursFromNow * 60 * 60 * 1000);
  const date = d.toISOString().slice(0, 10);
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return { date, time };
}

describe("reminder dispatch service", () => {
  let prisma;
  let reminderSettingsService;
  let processBookingNotificationDelivery;
  let service;

  beforeEach(() => {
    prisma = {
      __isAvailable: true,
      booking: {
        findMany: vi.fn().mockResolvedValue([])
      },
      auditLog: {
        findFirst: vi.fn().mockResolvedValue(null)
      }
    };
    reminderSettingsService = {
      getReminderSettingsForBusiness: vi.fn().mockResolvedValue({
        liveRemindersEnabled: true,
        channelPreference: "auto",
        reminderLeadHours: 24,
        manualFallbackEnabled: true
      })
    };
    processBookingNotificationDelivery = vi.fn().mockResolvedValue(undefined);
    service = createReminderDispatchService({
      getPrisma: () => prisma,
      reminderSettingsService,
      normalizeBookingDateTime: (date, time) => ({ date, time }),
      processBookingNotificationDelivery,
      dispatchWindowMs: 90 * 60 * 1000,
      maxLeadHours: 72
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("dispatches a scheduled reminder when a booking is due inside the dispatch window", async () => {
    const { date, time } = isoDateAndTime(23.5);
    prisma.booking.findMany.mockResolvedValue([
      {
        id: "booking_due",
        businessId: "biz_1",
        businessName: "Glow Studio",
        customerEmail: "alex@example.com",
        customerPhone: "+12025550111",
        date,
        time,
        status: "confirmed"
      }
    ]);

    await service.runSweep();

    expect(reminderSettingsService.getReminderSettingsForBusiness).toHaveBeenCalledWith("biz_1");
    expect(prisma.auditLog.findFirst).toHaveBeenCalledWith({
      where: {
        action: "notification.delivery",
        entityId: "booking_due",
        metadata: { contains: "scheduled_reminder" }
      },
      select: { id: true }
    });
    expect(processBookingNotificationDelivery).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId: "biz_1",
        deliveryType: "scheduled_reminder"
      })
    );
  });

  it("skips dispatch when a scheduled reminder log already exists", async () => {
    const { date, time } = isoDateAndTime(23.25);
    prisma.booking.findMany.mockResolvedValue([
      {
        id: "booking_existing",
        businessId: "biz_1",
        businessName: "Glow Studio",
        customerEmail: "alex@example.com",
        customerPhone: "+12025550111",
        date,
        time,
        status: "confirmed"
      }
    ]);
    prisma.auditLog.findFirst.mockResolvedValue({ id: "audit_1" });

    await service.runSweep();

    expect(processBookingNotificationDelivery).not.toHaveBeenCalled();
  });

  it("skips dispatch when reminders are manual-only or disabled", async () => {
    const { date, time } = isoDateAndTime(23.1);
    prisma.booking.findMany.mockResolvedValue([
      {
        id: "booking_manual",
        businessId: "biz_1",
        businessName: "Glow Studio",
        customerEmail: "alex@example.com",
        customerPhone: "+12025550111",
        date,
        time,
        status: "confirmed"
      }
    ]);
    reminderSettingsService.getReminderSettingsForBusiness.mockResolvedValue({
      liveRemindersEnabled: true,
      channelPreference: "manual",
      reminderLeadHours: 24,
      manualFallbackEnabled: true
    });

    await service.runSweep();

    expect(prisma.auditLog.findFirst).not.toHaveBeenCalled();
    expect(processBookingNotificationDelivery).not.toHaveBeenCalled();
  });
});
