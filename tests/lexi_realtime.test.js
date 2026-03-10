import { afterEach, describe, expect, it, vi } from "vitest";
import { createLexiRealtimeSupportService } from "../src/services/lexi_realtime_support.js";
import { createLexiRealtimeRouteHandlers } from "../src/services/lexi_realtime_route_handlers.js";

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

describe("Lexi realtime support", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports realtime as unavailable when OPENAI_REALTIME_MODEL is missing", () => {
    vi.stubEnv("OPENAI_REALTIME_MODEL", "");
    vi.stubEnv("LEXI_AVATAR_PROVIDER", "pending");

    const service = createLexiRealtimeSupportService({
      prisma: {},
      openai: { responses: {} },
      openAiKey: "test-key",
      buildPublicLexiSystemPrompt: () => "Public Lexi prompt"
    });

    const config = service.buildLexiAvatarConfig("customer");
    expect(config.realtimeEnabled).toBe(false);
    expect(config.sessionEndpointReady).toBe(false);
    expect(config.avatarEnabled).toBe(false);
    expect(config.supportMode).toBe("booking_assistant");
  });

  it("reports realtime and heygen avatar as ready when all required env vars exist", () => {
    vi.stubEnv("OPENAI_REALTIME_MODEL", "gpt-4o-realtime-preview");
    vi.stubEnv("LEXI_AVATAR_PROVIDER", "heygen");
    vi.stubEnv("HEYGEN_API_KEY", "heygen-key");
    vi.stubEnv("HEYGEN_AVATAR_ID", "avatar-123");
    vi.stubEnv("HEYGEN_VOICE_ID", "voice-123");

    const service = createLexiRealtimeSupportService({
      prisma: {},
      openai: { responses: {} },
      openAiKey: "test-key",
      buildPublicLexiSystemPrompt: () => "Public Lexi prompt"
    });

    const config = service.buildLexiAvatarConfig("subscriber");
    expect(config.realtimeEnabled).toBe(true);
    expect(config.avatarEnabled).toBe(true);
    expect(config.avatarSessionReady).toBe(true);
    expect(config.avatarDefaults).toEqual({
      avatarId: "avatar-123",
      voiceId: "voice-123"
    });
    expect(config.supportMode).toBe("business_assistant");
  });
});

describe("Lexi realtime route handlers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns a pending response when realtime env is incomplete", async () => {
    vi.stubEnv("OPENAI_REALTIME_MODEL", "");

    const handlers = createLexiRealtimeRouteHandlers({
      openai: { responses: {} },
      getOptionalAuth: () => null,
      buildLexiAvatarConfig: () => ({ provider: "pending" }),
      buildLexiRealtimeInstructions: () => "Prompt",
      resolveLexiRealtimeBusiness: vi.fn(),
      createOpenAiRealtimeClientSecret: vi.fn(),
      createHeyGenAvatarSession: vi.fn(),
      startHeyGenAvatarSession: vi.fn(),
      stopHeyGenAvatarSession: vi.fn()
    });

    const req = {
      body: {
        scope: "public"
      }
    };
    const res = createMockRes();

    await handlers.lexiRealtimeSessionHandler(req, res);

    expect(res.statusCode).toBe(202);
    expect(res.body.sessionReady).toBe(false);
    expect(res.body.nextStep).toBe("configure_openai_realtime");
  });

  it("requires auth for subscriber realtime sessions", async () => {
    vi.stubEnv("OPENAI_REALTIME_MODEL", "gpt-4o-realtime-preview");

    const handlers = createLexiRealtimeRouteHandlers({
      openai: { responses: {} },
      getOptionalAuth: () => null,
      buildLexiAvatarConfig: () => ({ provider: "pending" }),
      buildLexiRealtimeInstructions: () => "Prompt",
      resolveLexiRealtimeBusiness: vi.fn(),
      createOpenAiRealtimeClientSecret: vi.fn(),
      createHeyGenAvatarSession: vi.fn(),
      startHeyGenAvatarSession: vi.fn(),
      stopHeyGenAvatarSession: vi.fn()
    });

    const req = {
      body: {
        scope: "subscriber"
      }
    };
    const res = createMockRes();

    await handlers.lexiRealtimeSessionHandler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/sign in/i);
  });

  it("returns a client secret payload when realtime env and auth are ready", async () => {
    vi.stubEnv("OPENAI_REALTIME_MODEL", "gpt-4o-realtime-preview");
    vi.stubEnv("LEXI_REALTIME_VOICE", "marin");

    const createSecret = vi.fn().mockResolvedValue({
      id: "sess_123",
      client_secret: {
        value: "client_secret_123",
        expires_at: 1730000000
      }
    });
    const resolveBusiness = vi.fn().mockResolvedValue({ id: "biz_1", name: "Salon One" });

    const handlers = createLexiRealtimeRouteHandlers({
      openai: { responses: {} },
      getOptionalAuth: () => ({ role: "subscriber", businessId: "biz_1" }),
      buildLexiAvatarConfig: () => ({ provider: "pending" }),
      buildLexiRealtimeInstructions: ({ scope, business }) => `${scope}:${business?.name || "none"}`,
      resolveLexiRealtimeBusiness: resolveBusiness,
      createOpenAiRealtimeClientSecret: createSecret,
      createHeyGenAvatarSession: vi.fn(),
      startHeyGenAvatarSession: vi.fn(),
      stopHeyGenAvatarSession: vi.fn()
    });

    const req = {
      body: {
        scope: "subscriber",
        businessId: "biz_1"
      }
    };
    const res = createMockRes();

    await handlers.lexiRealtimeSessionHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(resolveBusiness).toHaveBeenCalledWith({
      scope: "subscriber",
      auth: { role: "subscriber", businessId: "biz_1" },
      businessId: "biz_1"
    });
    expect(createSecret).toHaveBeenCalledWith({
      instructions: "subscriber:Salon One",
      model: "gpt-4o-realtime-preview",
      voice: "marin"
    });
    expect(res.body.sessionReady).toBe(true);
    expect(res.body.session.clientSecret).toBe("client_secret_123");
    expect(res.body.session.model).toBe("gpt-4o-realtime-preview");
  });
});
