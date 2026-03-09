const CHANNEL_OPTIONS = new Set(["auto", "sms", "email", "manual"]);
const LEAD_HOUR_OPTIONS = new Set([2, 24, 48, 72]);

function defaultReminderSettings() {
  return {
    liveRemindersEnabled: true,
    channelPreference: "auto",
    reminderLeadHours: 24,
    manualFallbackEnabled: true,
    updatedAt: null
  };
}

function normalizeReminderSettings(input) {
  const defaults = defaultReminderSettings();
  const channelPreference = String(input?.channelPreference || defaults.channelPreference).trim().toLowerCase();
  const reminderLeadHours = Number(input?.reminderLeadHours || defaults.reminderLeadHours);
  return {
    liveRemindersEnabled: input?.liveRemindersEnabled === undefined ? defaults.liveRemindersEnabled : Boolean(input.liveRemindersEnabled),
    channelPreference: CHANNEL_OPTIONS.has(channelPreference) ? channelPreference : defaults.channelPreference,
    reminderLeadHours: LEAD_HOUR_OPTIONS.has(reminderLeadHours) ? reminderLeadHours : defaults.reminderLeadHours,
    manualFallbackEnabled: input?.manualFallbackEnabled === undefined ? defaults.manualFallbackEnabled : Boolean(input.manualFallbackEnabled),
    updatedAt: input?.updatedAt || defaults.updatedAt
  };
}

export function createReminderSettingsService({
  readReminderSettingsFile,
  writeReminderSettingsFile
} = {}) {
  async function getReminderSettingsForBusiness(businessId) {
    const all = await readReminderSettingsFile();
    return normalizeReminderSettings(all?.[businessId] || {});
  }

  async function saveReminderSettingsForBusiness(businessId, payload) {
    const all = await readReminderSettingsFile();
    const next = normalizeReminderSettings({
      ...payload,
      updatedAt: new Date().toISOString()
    });
    all[businessId] = next;
    await writeReminderSettingsFile(all);
    return next;
  }

  return {
    getReminderSettingsForBusiness,
    saveReminderSettingsForBusiness
  };
}
