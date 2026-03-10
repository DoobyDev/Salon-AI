export function createLexiRealtimeRouteHandlers({
  openai,
  getOptionalAuth,
  buildLexiAvatarConfig,
  buildLexiRealtimeInstructions,
  resolveLexiRealtimeBusiness,
  createOpenAiRealtimeClientSecret,
  createHeyGenAvatarSession,
  startHeyGenAvatarSession,
  stopHeyGenAvatarSession
} = {}) {
  function lexiAvatarConfigHandler(req, res) {
    const scope = String(req.query.scope || "public").trim().toLowerCase();
    return res.json(buildLexiAvatarConfig(scope));
  }

  async function lexiRealtimeSessionHandler(req, res) {
    const scope = String(req.body?.scope || "public").trim().toLowerCase();
    const config = buildLexiAvatarConfig(scope);
    const auth = getOptionalAuth(req);

    if ((scope === "subscriber" || scope === "admin") && !auth) {
      return res.status(401).json({ error: "Sign in to start a subscriber Lexi realtime session." });
    }
    if (scope === "subscriber" && auth?.role !== "subscriber" && auth?.role !== "admin") {
      return res.status(403).json({ error: "Subscriber Lexi realtime is only available to subscriber or admin users." });
    }
    if (scope === "admin" && auth?.role !== "admin") {
      return res.status(403).json({ error: "Admin Lexi realtime is only available to admin users." });
    }

    const realtimeModel = String(process.env.OPENAI_REALTIME_MODEL || "").trim();
    if (!openai || !realtimeModel) {
      return res.status(202).json({
        ok: true,
        sessionReady: false,
        config,
        message: "Realtime voice is not active yet. Add OPENAI_API_KEY and OPENAI_REALTIME_MODEL on the server to mint a live session.",
        nextStep: "configure_openai_realtime"
      });
    }

    try {
      const business = await resolveLexiRealtimeBusiness({
        scope,
        auth,
        businessId: req.body?.businessId
      });
      const voice = String(process.env.LEXI_REALTIME_VOICE || "marin").trim();
      const instructions = buildLexiRealtimeInstructions({ scope, business });
      const sessionData = await createOpenAiRealtimeClientSecret({
        instructions,
        model: realtimeModel,
        voice
      });

      return res.json({
        ok: true,
        sessionReady: Boolean(sessionData?.client_secret?.value),
        config,
        session: {
          provider: "openai",
          type: "realtime",
          model: realtimeModel,
          voice,
          clientSecret: String(sessionData?.client_secret?.value || ""),
          expiresAt: sessionData?.client_secret?.expires_at || null,
          sessionId: String(sessionData?.id || "")
        },
        message: "Lexi realtime session is ready. The next client step is opening the WebRTC connection and attaching microphone audio.",
        nextStep: "connect_client_webrtc"
      });
    } catch (error) {
      return res.status(502).json({
        error: error instanceof Error ? error.message : "Unable to create a Lexi realtime session right now.",
        config
      });
    }
  }

  async function lexiAvatarSessionHandler(req, res) {
    const scope = String(req.body?.scope || "public").trim().toLowerCase();
    const config = buildLexiAvatarConfig(scope);
    const auth = getOptionalAuth(req);

    if ((scope === "subscriber" || scope === "admin") && !auth) {
      return res.status(401).json({ error: "Sign in to start a subscriber Lexi avatar session." });
    }
    if (scope === "subscriber" && auth?.role !== "subscriber" && auth?.role !== "admin") {
      return res.status(403).json({ error: "Subscriber Lexi avatar is only available to subscriber or admin users." });
    }
    if (scope === "admin" && auth?.role !== "admin") {
      return res.status(403).json({ error: "Admin Lexi avatar is only available to admin users." });
    }

    if (config.provider !== "heygen" || !config.avatarSessionReady) {
      return res.status(202).json({
        ok: true,
        sessionReady: false,
        config,
        message: "HeyGen avatar mode is not configured yet. Add HEYGEN_API_KEY and HEYGEN_AVATAR_ID to enable the visual avatar layer."
      });
    }

    try {
      const business = await resolveLexiRealtimeBusiness({
        scope,
        auth,
        businessId: req.body?.businessId
      });
      const { sessionToken, data } = await createHeyGenAvatarSession({ business, scope });
      const sessionId = String(data?.session_id || "").trim();
      if (!sessionId) throw new Error("HeyGen avatar session id missing.");
      await startHeyGenAvatarSession({ sessionToken, sessionId });

      return res.json({
        ok: true,
        sessionReady: true,
        config,
        session: {
          provider: "heygen",
          sessionId,
          sessionToken,
          livekitUrl: String(data?.url || "").trim(),
          livekitAccessToken: String(data?.access_token || "").trim()
        },
        message: "Lexi avatar session is ready. The client can now join the LiveKit room and render the avatar stream."
      });
    } catch (error) {
      return res.status(502).json({
        error: error instanceof Error ? error.message : "Unable to create a Lexi avatar session right now.",
        config
      });
    }
  }

  async function lexiAvatarSessionStopHandler(req, res) {
    const sessionId = String(req.body?.sessionId || "").trim();
    const sessionToken = String(req.body?.sessionToken || "").trim();
    if (!sessionId || !sessionToken) {
      return res.status(400).json({ error: "sessionId and sessionToken are required." });
    }

    try {
      await stopHeyGenAvatarSession({ sessionId, sessionToken });
      return res.json({ ok: true });
    } catch (error) {
      return res.status(502).json({
        error: error instanceof Error ? error.message : "Unable to stop the Lexi avatar session right now."
      });
    }
  }

  return {
    lexiAvatarConfigHandler,
    lexiRealtimeSessionHandler,
    lexiAvatarSessionHandler,
    lexiAvatarSessionStopHandler
  };
}
