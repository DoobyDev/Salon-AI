export function createLexiRealtimeSupportService({
  prisma,
  openai,
  openAiKey,
  buildPublicLexiSystemPrompt
}) {
  function buildLexiAvatarConfig(scope = "public") {
    const normalizedScope = ["public", "customer", "subscriber", "admin"].includes(scope) ? scope : "public";
    const avatarProvider = String(process.env.LEXI_AVATAR_PROVIDER || process.env.HEYGEN_PROVIDER || "pending").trim().toLowerCase() || "pending";
    const voiceProvider = String(process.env.LEXI_VOICE_PROVIDER || (process.env.ELEVENLABS_API_KEY ? "elevenlabs" : openai ? "openai" : "text")).trim().toLowerCase() || "text";
    const realtimeModel = String(process.env.OPENAI_REALTIME_MODEL || "").trim();
    const heygenApiKey = String(process.env.HEYGEN_API_KEY || "").trim();
    const heygenAvatarId = String(process.env.HEYGEN_AVATAR_ID || "").trim();
    const heygenVoiceId = String(process.env.HEYGEN_VOICE_ID || "").trim();
    const openAiReady = Boolean(openai);
    const avatarReady = avatarProvider === "heygen"
      ? Boolean(heygenApiKey && heygenAvatarId)
      : avatarProvider !== "pending" && avatarProvider !== "none";
    const voiceReady = voiceProvider !== "text";
    const realtimeReady = openAiReady && Boolean(realtimeModel);

    return {
      displayName: "Lexi",
      scope: normalizedScope,
      provider: avatarProvider,
      providerLabel: avatarProvider === "pending" ? "pending" : avatarProvider,
      voiceProvider,
      realtimeModel: realtimeModel || null,
      avatarEnabled: avatarReady,
      avatarSessionReady: avatarProvider === "heygen" ? Boolean(heygenApiKey && heygenAvatarId) : avatarReady,
      voiceEnabled: voiceReady,
      realtimeEnabled: realtimeReady,
      sessionEndpointReady: realtimeReady,
      avatarDefaults: avatarProvider === "heygen"
        ? {
            avatarId: heygenAvatarId || null,
            voiceId: heygenVoiceId || null
          }
        : null,
      transcriptMode: "text_fallback",
      supportMode: normalizedScope === "subscriber" || normalizedScope === "admin" ? "business_assistant" : "booking_assistant",
      notes: avatarReady && realtimeReady
        ? "Lexi popup is ready for provider wiring and client session brokerage."
        : "Lexi popup is ready for avatar wiring. Connect provider keys and realtime session brokerage next."
    };
  }

  async function createHeyGenSessionToken() {
    const heygenApiKey = String(process.env.HEYGEN_API_KEY || "").trim();
    if (!heygenApiKey) throw new Error("HEYGEN_API_KEY is not configured.");
    const response = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: {
        "X-Api-Key": heygenApiKey,
        "Content-Type": "application/json"
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(String(data?.error?.message || data?.message || "Unable to create a HeyGen session token.").trim());
    }
    const token = String(data?.data?.token || "").trim();
    if (!token) throw new Error("HeyGen session token missing.");
    return token;
  }

  async function createHeyGenAvatarSession({ business, scope }) {
    const avatarId = String(process.env.HEYGEN_AVATAR_ID || "").trim();
    const voiceId = String(process.env.HEYGEN_VOICE_ID || "").trim();
    if (!avatarId) throw new Error("HEYGEN_AVATAR_ID is not configured.");

    const token = await createHeyGenSessionToken();
    const businessName = String(business?.name || "Lexi").trim();
    const openingText = scope === "customer"
      ? `Hi, I'm Lexi for ${businessName}. Ask me about services, timings, or booking help whenever you're ready.`
      : `Hi, I'm Lexi. I'm ready to help with bookings, salon questions, and day-to-day support.`;
    const response = await fetch("https://api.heygen.com/v1/streaming.new", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        quality: "medium",
        avatar_id: avatarId,
        version: "v2",
        video_encoding: "H264",
        voice: voiceId
          ? { voice_id: voiceId, rate: 1 }
          : undefined,
        activity_idle_timeout: 120,
        knowledge_base_id: undefined,
        opening_text: openingText
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(String(data?.error?.message || data?.message || "Unable to create a HeyGen avatar session.").trim());
    }
    return {
      sessionToken: token,
      data: data?.data || data
    };
  }

  async function startHeyGenAvatarSession({ sessionToken, sessionId }) {
    const response = await fetch("https://api.heygen.com/v1/streaming.start", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session_id: sessionId
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(String(data?.error?.message || data?.message || "Unable to start the HeyGen avatar session.").trim());
    }
    return data;
  }

  async function stopHeyGenAvatarSession({ sessionToken, sessionId }) {
    const response = await fetch("https://api.heygen.com/v1/streaming.stop", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session_id: sessionId
      })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(String(data?.error?.message || data?.message || "Unable to stop the HeyGen avatar session.").trim());
    }
  }

  function buildLexiRealtimeInstructions({ scope, business }) {
    if (scope === "subscriber" || scope === "admin") {
      const businessName = String(business?.name || "the salon business").trim();
      return [
        `You are Lexi, the live salon business copilot for ${businessName}.`,
        "Speak like a polished salon manager: warm, concise, practical, and commercially aware.",
        "Help with pricing, staffing, diary flow, cancellations, finance, customer communication, and daily business decisions.",
        "Do not reveal private customer data, secrets, payment credentials, or internal security details.",
        "When the user asks for operational advice, answer directly first and then suggest the clearest next action.",
        "Keep voice replies short and natural."
      ].join(" ");
    }
    return buildPublicLexiSystemPrompt(business);
  }

  async function resolveLexiRealtimeBusiness({ scope, auth, businessId }) {
    const normalizedScope = ["public", "customer", "subscriber", "admin"].includes(scope) ? scope : "public";
    const requestedBusinessId = String(businessId || "").trim();
    let targetBusinessId = "";

    if ((normalizedScope === "subscriber" || normalizedScope === "admin") && auth) {
      if (auth.role === "subscriber") {
        targetBusinessId = String(auth.businessId || "").trim();
      } else if (auth.role === "admin") {
        targetBusinessId = requestedBusinessId;
      }
    } else {
      targetBusinessId = requestedBusinessId;
    }

    if (!targetBusinessId) return null;
    return prisma.business.findFirst({
      where: {
        id: targetBusinessId,
        subscription: { is: { status: { in: ["active", "trialing", "trial", "past_due"] } } }
      },
      include: { services: true, subscription: true }
    });
  }

  async function createOpenAiRealtimeClientSecret({ instructions, model, voice }) {
    const transcriptModel = String(process.env.LEXI_REALTIME_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe").trim();
    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model,
          instructions,
          audio: {
            input: {
              transcription: {
                model: transcriptModel,
                language: "en"
              },
              turn_detection: {
                type: "server_vad",
                create_response: true,
                interrupt_response: true,
                silence_duration_ms: 450,
                prefix_padding_ms: 300
              }
            },
            output: {
              voice
            }
          },
          include: [
            "item.input_audio_transcription.logprobs"
          ]
        }
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = String(data?.error?.message || data?.message || "Failed to create OpenAI Realtime client secret.").trim();
      throw new Error(message);
    }
    return data;
  }

  return {
    buildLexiAvatarConfig,
    createHeyGenSessionToken,
    createHeyGenAvatarSession,
    startHeyGenAvatarSession,
    stopHeyGenAvatarSession,
    buildLexiRealtimeInstructions,
    resolveLexiRealtimeBusiness,
    createOpenAiRealtimeClientSecret
  };
}
