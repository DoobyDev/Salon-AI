export function createCustomerRecordsService({
  readCustomerRecordsFile,
  writeCustomerRecordsFile
} = {}) {
  function normalizeRecordRows(rows) {
    const source = Array.isArray(rows) ? rows : [];
    return source
      .map((row) => ({
        customerKey: String(row?.customerKey || "").trim(),
        customerName: String(row?.customerName || "").trim(),
        customerEmail: String(row?.customerEmail || "").trim().toLowerCase(),
        customerPhone: String(row?.customerPhone || "").trim(),
        allergies: String(row?.allergies || "").trim(),
        formulaNotes: String(row?.formulaNotes || "").trim(),
        consultationNotes: String(row?.consultationNotes || "").trim(),
        visitPrepNotes: String(row?.visitPrepNotes || "").trim(),
        preferredStylist: String(row?.preferredStylist || "").trim(),
        patchTestRequired: Boolean(row?.patchTestRequired),
        createdAt: row?.createdAt || null,
        updatedAt: row?.updatedAt || null
      }))
      .filter((row) => row.customerKey && row.customerName);
  }

  async function getCustomerRecordsForBusiness(businessId) {
    const all = await readCustomerRecordsFile();
    return normalizeRecordRows(all?.[businessId]?.records || []);
  }

  async function upsertCustomerRecordForBusiness(businessId, payload) {
    const all = await readCustomerRecordsFile();
    const businessRecord = all?.[businessId] && typeof all[businessId] === "object" ? all[businessId] : {};
    const records = normalizeRecordRows(businessRecord.records || []);
    const index = records.findIndex((row) => row.customerKey === payload.customerKey);
    const now = new Date().toISOString();
    const next = {
      customerKey: payload.customerKey,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail || "",
      customerPhone: payload.customerPhone || "",
      allergies: payload.allergies || "",
      formulaNotes: payload.formulaNotes || "",
      consultationNotes: payload.consultationNotes || "",
      visitPrepNotes: payload.visitPrepNotes || "",
      preferredStylist: payload.preferredStylist || "",
      patchTestRequired: Boolean(payload.patchTestRequired),
      createdAt: index >= 0 ? records[index].createdAt || now : now,
      updatedAt: now
    };
    if (index >= 0) records[index] = next;
    else records.push(next);
    businessRecord.records = records;
    all[businessId] = businessRecord;
    await writeCustomerRecordsFile(all);
    return next;
  }

  return {
    getCustomerRecordsForBusiness,
    upsertCustomerRecordForBusiness
  };
}
