export function assertSecureRuntimeSettings({
  nodeEnv,
  jwtSecret,
  insecureJwtSecret,
  corsOrigin
}) {
  if (nodeEnv !== "production") return;
  if (!jwtSecret || jwtSecret === insecureJwtSecret) {
    throw new Error("JWT_SECRET is insecure. Set a strong production value.");
  }
  if (corsOrigin === "*") {
    throw new Error("CORS_ORIGIN cannot be '*' in production.");
  }
}

export function createAuditLogWriter({ prisma }) {
  return async function writeAuditLog({
    actorId = null,
    actorRole = null,
    action,
    entityType,
    entityId = null,
    metadata = null
  }) {
    if (!action || !entityType) return;
    try {
      await prisma.auditLog.create({
        data: {
          actorId,
          actorRole,
          action,
          entityType,
          entityId,
          metadata: metadata ? JSON.stringify(metadata) : null
        }
      });
    } catch {
      // Audit writes should never break primary request flow.
    }
  };
}
