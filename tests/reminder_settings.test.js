import { describe, it, expect, vi } from "vitest";
import { createReminderSettingsService } from "../src/services/reminder_settings.js";

describe("reminder settings service", () => {
  it("returns normalized defaults when a business has no saved settings", async () => {
    const service = createReminderSettingsService({
      readReminderSettingsFile: vi.fn().mockResolvedValue({}),
      writeReminderSettingsFile: vi.fn()
    });

    const result = await service.getReminderSettingsForBusiness("biz_1");

    expect(result).toEqual({
      liveRemindersEnabled: true,
      channelPreference: "auto",
      reminderLeadHours: 24,
      manualFallbackEnabled: true,
      updatedAt: null
    });
  });

  it("normalizes unsupported channel and lead-hour values on save", async () => {
    const writeReminderSettingsFile = vi.fn().mockResolvedValue(undefined);
    const service = createReminderSettingsService({
      readReminderSettingsFile: vi.fn().mockResolvedValue({}),
      writeReminderSettingsFile
    });

    const result = await service.saveReminderSettingsForBusiness("biz_1", {
      liveRemindersEnabled: false,
      channelPreference: "carrier-pigeon",
      reminderLeadHours: 12,
      manualFallbackEnabled: false
    });

    expect(result.liveRemindersEnabled).toBe(false);
    expect(result.channelPreference).toBe("auto");
    expect(result.reminderLeadHours).toBe(24);
    expect(result.manualFallbackEnabled).toBe(false);
    expect(typeof result.updatedAt).toBe("string");
    expect(writeReminderSettingsFile).toHaveBeenCalledTimes(1);
    expect(writeReminderSettingsFile).toHaveBeenCalledWith({
      biz_1: expect.objectContaining({
        liveRemindersEnabled: false,
        channelPreference: "auto",
        reminderLeadHours: 24,
        manualFallbackEnabled: false
      })
    });
  });
});
