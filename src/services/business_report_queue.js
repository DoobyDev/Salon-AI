export function createBusinessReportQueueService({
  getPrisma,
  readBusinessReportQueueFile,
  writeBusinessReportQueueFile
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  function isPrismaBusinessReportQueueStorageUnavailable(error) {
    const code = String(error?.code || "").trim();
    if (code === "P2021" || code === "P2022") return true;
    const msg = String(error?.message || "").toLowerCase();
    if (msg.includes("prisma is not initialized")) return true;
    return msg.includes("businessreport") || msg.includes("business report");
  }

  async function enqueueBusinessReportEmailRequest(item) {
    const model = prismaClient()?.businessReportEmailQueueItem;
    if (
      model &&
      typeof model.create === "function" &&
      typeof model.findMany === "function" &&
      typeof model.deleteMany === "function"
    ) {
      try {
        await model.create({
          data: {
            id: item.id,
            businessId: item.businessId,
            recipientEmail: item.recipientEmail,
            subject: item.subject,
            note: item.note || "",
            report: item.report || {},
            queuedAt: new Date(item.queuedAt),
            status: item.status || "queued",
            requestedBy: item.requestedBy || {}
          }
        });

        const rows = await model.findMany({
          where: { businessId: item.businessId },
          orderBy: [{ queuedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
          select: { id: true },
          skip: 100
        });
        if (rows.length) {
          await model.deleteMany({ where: { id: { in: rows.map((row) => row.id) } } });
        }
        return;
      } catch (error) {
        if (!isPrismaBusinessReportQueueStorageUnavailable(error)) throw error;
      }
    }

    const queue = await readBusinessReportQueueFile();
    const businessQueue = Array.isArray(queue?.[item.businessId]) ? queue[item.businessId] : [];
    queue[item.businessId] = [item, ...businessQueue].slice(0, 100);
    await writeBusinessReportQueueFile(queue);
  }

  return {
    enqueueBusinessReportEmailRequest
  };
}
