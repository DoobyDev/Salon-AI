export function createSocialMediaService({
  getPrisma,
  readSocialMediaFile,
  writeSocialMediaFile
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  function isPrismaSocialMediaStorageUnavailable(error) {
    const code = String(error?.code || "").trim();
    if (code === "P2021" || code === "P2022") return true;
    const msg = String(error?.message || "").toLowerCase();
    if (msg.includes("prisma is not initialized")) return true;
    return msg.includes("social");
  }

  async function loadSocialMediaExtras(businessId) {
    const model = prismaClient()?.socialMediaProfile;
    if (model && typeof model.findUnique === "function") {
      try {
        const row = await model.findUnique({ where: { businessId } });
        if (row) {
          return {
            customSocial: String(row.customSocial || ""),
            socialImageUrl: String(row.socialImageUrl || "")
          };
        }
        return { customSocial: "", socialImageUrl: "" };
      } catch (error) {
        if (!isPrismaSocialMediaStorageUnavailable(error)) throw error;
      }
    }

    const all = await readSocialMediaFile();
    const scoped = all?.[businessId] && typeof all[businessId] === "object" ? all[businessId] : {};
    return {
      customSocial: String(scoped.customSocial || ""),
      socialImageUrl: String(scoped.socialImageUrl || "")
    };
  }

  async function saveSocialMediaExtras(businessId, payload) {
    const next = {
      customSocial: String(payload?.customSocial || "").trim(),
      socialImageUrl: String(payload?.socialImageUrl || "").trim()
    };

    const model = prismaClient()?.socialMediaProfile;
    if (model && typeof model.upsert === "function") {
      try {
        await model.upsert({
          where: { businessId },
          update: {
            customSocial: next.customSocial || "",
            socialImageUrl: next.socialImageUrl || ""
          },
          create: {
            businessId,
            customSocial: next.customSocial || "",
            socialImageUrl: next.socialImageUrl || ""
          }
        });
        return next;
      } catch (error) {
        if (!isPrismaSocialMediaStorageUnavailable(error)) throw error;
      }
    }

    const all = await readSocialMediaFile();
    all[businessId] = {
      ...next,
      updatedAt: new Date().toISOString()
    };
    await writeSocialMediaFile(all);
    return next;
  }

  return {
    loadSocialMediaExtras,
    saveSocialMediaExtras
  };
}
