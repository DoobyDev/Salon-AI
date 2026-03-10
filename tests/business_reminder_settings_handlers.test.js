import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBusinessProfileHandlers } from "../src/services/business_profile_handlers.js";

describe("business reminder settings handlers", () => {
  let reminderSettingsService;
  let writeAuditLog;
  let handlers;

  beforeEach(() => {
    reminderSettingsService = {
      getReminderSettingsForBusiness: vi.fn().mockResolvedValue({
        liveRemindersEnabled: true,
        channelPreference: "auto",
        reminderLeadHours: 24,
        manualFallbackEnabled: true,
        updatedAt: null
      }),
      saveReminderSettingsForBusiness: vi.fn().mockResolvedValue({
        liveRemindersEnabled: false,
        channelPreference: "email",
        reminderLeadHours: 48,
        manualFallbackEnabled: false,
        updatedAt: "2026-03-10T12:00:00.000Z"
      })
    };
    writeAuditLog = vi.fn().mockResolvedValue(undefined);
    handlers = createBusinessProfileHandlers({
      prisma: {},
      resolveManagedBusinessId: vi.fn().mockResolvedValue("biz_1"),
      businessProfileService: {},
      socialMediaService: {},
      reminderSettingsService,
      normalizeBusinessType: vi.fn(),
      isValidEmail: vi.fn(),
      isValidPhone: vi.fn(),
      isValidOptionalHttpUrl: vi.fn(),
      normalizeBookingDateTime: vi.fn(),
      parseOpenHours: vi.fn(),
      addMinutesToTime: vi.fn(),
      timeToMinutes: vi.fn(),
      dayKeyFromDate: vi.fn(),
      isBookingSlotInPast: vi.fn(),
      getSlotCapacityForBusinessDate: vi.fn(),
      isSlotAtCapacity: vi.fn(),
      clearReadCache: vi.fn(),
      writeAuditLog
    });
  });

  it("returns reminder settings for the scoped business", async () => {
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

    await handlers.businessReminderSettingsGetHandler({ auth: { sub: "user_1", role: "subscriber" } }, res);

    expect(reminderSettingsService.getReminderSettingsForBusiness).toHaveBeenCalledWith("biz_1");
    expect(res.json).toHaveBeenCalledWith({
      settings: expect.objectContaining({
        liveRemindersEnabled: true,
        channelPreference: "auto",
        reminderLeadHours: 24,
        manualFallbackEnabled: true
      })
    });
  });

  it("saves reminder settings and writes an audit log", async () => {
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

    await handlers.businessReminderSettingsSaveHandler(
      {
        auth: { sub: "user_1", role: "subscriber" },
        body: {
          liveRemindersEnabled: false,
          channelPreference: "email",
          reminderLeadHours: 48,
          manualFallbackEnabled: false
        }
      },
      res
    );

    expect(reminderSettingsService.saveReminderSettingsForBusiness).toHaveBeenCalledWith("biz_1", {
      liveRemindersEnabled: false,
      channelPreference: "email",
      reminderLeadHours: 48,
      manualFallbackEnabled: false
    });
    expect(writeAuditLog).toHaveBeenCalledWith({
      actorId: "user_1",
      actorRole: "subscriber",
      action: "business.reminder_settings_saved",
      entityType: "business_settings",
      entityId: "biz_1",
      metadata: {
        businessId: "biz_1",
        liveRemindersEnabled: false,
        channelPreference: "email",
        reminderLeadHours: 48,
        manualFallbackEnabled: false
      }
    });
    expect(res.json).toHaveBeenCalledWith({
      settings: expect.objectContaining({
        channelPreference: "email",
        reminderLeadHours: 48
      })
    });
  });
});
