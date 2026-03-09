export function createRequestAuthContextUtils({ jwt, jwtSecret }) {
  function rateKeyByIp(req) {
    return String(req.headers["x-forwarded-for"] || req.ip || "unknown").split(",")[0].trim();
  }

  function rateKeyByUserOrIp(req) {
    return req.auth?.sub ? `user:${req.auth.sub}` : `ip:${rateKeyByIp(req)}`;
  }

  function getOptionalAuth(req) {
    const header = String(req.headers.authorization || "");
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return null;
    try {
      return jwt.verify(token, jwtSecret);
    } catch {
      return null;
    }
  }

  return {
    rateKeyByIp,
    rateKeyByUserOrIp,
    getOptionalAuth
  };
}
