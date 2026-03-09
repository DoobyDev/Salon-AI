export function createAuthUtils({ jwt, jwtSecret }) {
  function signToken(user) {
    return jwt.sign(
      { sub: user.id, role: user.role, email: user.email, businessId: user.businessId || null },
      jwtSecret,
      { expiresIn: "7d" }
    );
  }

  function authRequired(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Missing bearer token." });
    try {
      req.auth = jwt.verify(token, jwtSecret);
      return next();
    } catch {
      return res.status(401).json({ error: "Invalid or expired token." });
    }
  }

  function requireRole(...roles) {
    return (req, res, next) => {
      if (!req.auth || !roles.includes(req.auth.role)) {
        return res.status(403).json({ error: "Forbidden for this role." });
      }
      return next();
    };
  }

  return {
    signToken,
    authRequired,
    requireRole
  };
}
