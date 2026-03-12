import path from "node:path";
import { readJsonObjectFile, writeJsonFile } from "./json_file_store.js";

function createJsonFileBinding(filePath) {
  return {
    read: () => readJsonObjectFile(filePath),
    write: (payload) => writeJsonFile(filePath, payload)
  };
}

export function createAppFileStores({ baseDir } = {}) {
  const dataDir = path.join(baseDir, "data");

  const accountingIntegrations = createJsonFileBinding(path.join(dataDir, "accounting_integrations.json"));
  const staffRoster = createJsonFileBinding(path.join(dataDir, "staff_roster.json"));
  const waitlist = createJsonFileBinding(path.join(dataDir, "waitlist.json"));
  const customerRecords = createJsonFileBinding(path.join(dataDir, "customer_records.json"));
  const commercialControls = createJsonFileBinding(path.join(dataDir, "commercial_controls.json"));
  const revenueSpend = createJsonFileBinding(path.join(dataDir, "revenue_spend.json"));
  const profitabilityInputs = createJsonFileBinding(path.join(dataDir, "profitability_inputs.json"));
  const socialMedia = createJsonFileBinding(path.join(dataDir, "social_media.json"));
  const businessReportQueue = createJsonFileBinding(path.join(dataDir, "business_report_email_queue.json"));
  const reminderSettings = createJsonFileBinding(path.join(dataDir, "reminder_settings.json"));
  const freeSubscriberAccess = createJsonFileBinding(path.join(dataDir, "free_subscriber_access.json"));

  return {
    accountingIntegrations,
    staffRoster,
    waitlist,
    customerRecords,
    commercialControls,
    revenueSpend,
    profitabilityInputs,
    socialMedia,
    businessReportQueue,
    reminderSettings,
    freeSubscriberAccess
  };
}
