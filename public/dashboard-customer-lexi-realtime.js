// Customer Lexi realtime/avatar orchestration runtime.
export function createCustomerLexiRealtimeRuntime(deps) {
  const {
    win = window,
    doc = document,
    t,
    token = "",
    fetchImpl = fetch,
    getSelectedCustomerSalonId,
    getPopupOverlay,
    getAvatarConfigPromise,
    setAvatarConfigPromise,
    getRealtimeSessionPromise,
    setRealtimeSessionPromise,
    setRealtimeSession,
    getRealtimeConnection,
    setRealtimeConnection,
    getAvatarSessionPromise,
    setAvatarSessionPromise,
    getAvatarSession,
    setAvatarSession,
    getAvatarRoom,
    setAvatarRoom,
    getLivekitScriptPromise,
    setLivekitScriptPromise,
    getCustomerLexiAvatarVideo,
    setCustomerLexiAvatarVideoActive,
    customerLexiMicSupported,
    setCustomerLexiAvatarPanelState,
    setCustomerLexiMicButtonState,
    setDashActionStatus,
    getSelectedCustomerSalon,
    cleanupCustomerLexiRealtimeConnection,
    cleanupCustomerLexiAvatarSession
  } = deps || {};

  async function loadCustomerLexiAvatarConfig() {
    const currentPromise = getAvatarConfigPromise?.();
    if (currentPromise) return currentPromise;
    const nextPromise = fetchImpl("/api/lexi/avatar-config?scope=customer")
      .then(async (response) => {
        if (!response.ok) throw new Error(`Avatar config request failed: ${response.status}`);
        return response.json();
      })
      .catch(() => ({
        avatarEnabled: false,
        realtimeEnabled: false,
        provider: "pending",
        voiceProvider: "text",
        displayName: "Lexi",
        supportMode: "customer",
        transcriptMode: "text_fallback"
      }));
    setAvatarConfigPromise?.(nextPromise);
    return nextPromise;
  }

  async function requestCustomerLexiRealtimeSession() {
    const inflight = getRealtimeSessionPromise?.();
    if (inflight) return inflight;
    const requestHeaders = {
      "Content-Type": "application/json"
    };
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
    const nextPromise = fetchImpl("/api/lexi/realtime/session", {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({
        scope: "customer",
        businessId: getSelectedCustomerSalonId?.() || ""
      })
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(String(data?.error || `Realtime session request failed: ${response.status}`).trim());
        }
        setRealtimeSession?.(data);
        return data;
      })
      .finally(() => {
        setRealtimeSessionPromise?.(null);
      });
    setRealtimeSessionPromise?.(nextPromise);
    return nextPromise;
  }

  async function loadCustomerLivekitClient() {
    if (win.LivekitClient?.Room) return win.LivekitClient;
    const inflight = getLivekitScriptPromise?.();
    if (inflight) return inflight;
    const nextPromise = new Promise((resolve, reject) => {
      const existing = doc.querySelector('script[data-livekit-client="true"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(win.LivekitClient), { once: true });
        existing.addEventListener("error", () => reject(new Error("Failed to load LiveKit client.")), { once: true });
        return;
      }
      const script = doc.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js";
      script.async = true;
      script.setAttribute("data-livekit-client", "true");
      script.addEventListener("load", () => resolve(win.LivekitClient), { once: true });
      script.addEventListener("error", () => reject(new Error("Failed to load LiveKit client.")), { once: true });
      doc.head.appendChild(script);
    });
    setLivekitScriptPromise?.(nextPromise);
    return nextPromise;
  }

  async function requestCustomerLexiAvatarSession() {
    const inflight = getAvatarSessionPromise?.();
    if (inflight) return inflight;
    const requestHeaders = {
      "Content-Type": "application/json"
    };
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
    const nextPromise = fetchImpl("/api/lexi/avatar/session", {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({
        scope: "customer",
        businessId: getSelectedCustomerSalonId?.() || ""
      })
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(String(data?.error || `Avatar session request failed: ${response.status}`).trim());
        }
        setAvatarSession?.(data);
        return data;
      })
      .finally(() => {
        setAvatarSessionPromise?.(null);
      });
    setAvatarSessionPromise?.(nextPromise);
    return nextPromise;
  }

  async function connectCustomerLexiAvatarSession() {
    const config = await loadCustomerLexiAvatarConfig();
    if (config.provider !== "heygen" || !config.avatarSessionReady) return false;
    const avatarData = await requestCustomerLexiAvatarSession();
    if (!avatarData.sessionReady) {
      updateCustomerLexiTranscript(avatarData.message || "Avatar session is not ready yet.");
      return false;
    }
    const livekit = await loadCustomerLivekitClient();
    if (!livekit?.Room) throw new Error("LiveKit client did not load correctly.");
    if (getAvatarRoom?.()) return true;

    const room = new livekit.Room();
    room.on(livekit.RoomEvent.TrackSubscribed, (track) => {
      if (track.kind !== "video") return;
      const video = getCustomerLexiAvatarVideo?.();
      if (!(video instanceof HTMLVideoElement)) return;
      track.attach(video);
      video.muted = true;
      video.play().catch(() => {});
      setCustomerLexiAvatarVideoActive?.(true);
    });
    room.on(livekit.RoomEvent.Disconnected, () => {
      setCustomerLexiAvatarVideoActive?.(false);
      setAvatarRoom?.(null);
    });
    await room.connect(String(avatarData.session?.livekitUrl || ""), String(avatarData.session?.livekitAccessToken || ""));
    setAvatarRoom?.(room);
    updateCustomerLexiTranscript("Lexi avatar connected. Voice replies will play through the popup audio.");
    return true;
  }

  function extractCustomerLexiRealtimeText(response) {
    const outputs = Array.isArray(response?.output) ? response.output : [];
    const content = outputs.flatMap((item) => Array.isArray(item?.content) ? item.content : []);
    for (const part of content) {
      const transcript = String(part?.transcript || part?.text || "").trim();
      if (transcript) return transcript;
    }
    return "";
  }

  function updateCustomerLexiTranscript(text) {
    const transcriptNode = getPopupOverlay?.()?.querySelector("#customerLexiAvatarTranscript");
    if (transcriptNode) transcriptNode.textContent = text;
  }

  function resetCustomerLexiVoiceControls() {
    setCustomerLexiMicButtonState?.(false);
  }

  function getCustomerLexiVoiceButtonLabel(config = null) {
    if (config?.avatarSessionReady && !config?.realtimeEnabled) return "Start Demo";
    return t?.("common.push_to_talk", "Push to Talk");
  }

  function cleanupCustomerLexiRealtimeConnectionImpl() {
    const connection = getRealtimeConnection?.();
    if (!connection) return;
    try {
      connection.dataChannel?.close();
    } catch {}
    try {
      connection.peerConnection?.getSenders()?.forEach((sender) => sender.track?.stop());
    } catch {}
    try {
      connection.mediaStream?.getTracks()?.forEach((track) => track.stop());
    } catch {}
    try {
      connection.peerConnection?.close();
    } catch {}
    try {
      if (connection.audioElement) {
        connection.audioElement.pause();
        connection.audioElement.srcObject = null;
      }
    } catch {}
    setRealtimeConnection?.(null);
  }

  async function cleanupCustomerLexiAvatarSessionImpl() {
    try {
      await getAvatarRoom?.()?.disconnect?.();
    } catch {}
    setAvatarRoom?.(null);
    const video = getCustomerLexiAvatarVideo?.();
    if (video instanceof HTMLVideoElement) {
      try {
        video.pause();
        video.srcObject = null;
      } catch {}
    }
    setCustomerLexiAvatarVideoActive?.(false);
    const avatarSession = getAvatarSession?.();
    const sessionId = String(avatarSession?.session?.sessionId || "").trim();
    const sessionToken = String(avatarSession?.session?.sessionToken || "").trim();
    setAvatarSession?.(null);
    if (!sessionId || !sessionToken) return;
    try {
      await fetchImpl("/api/lexi/avatar/session/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sessionId, sessionToken })
      });
    } catch {}
  }

  function handleCustomerLexiRealtimeEvent(event) {
    const eventType = String(event?.type || "").trim();
    if (!eventType) return;

    if (eventType === "input_audio_buffer.speech_started") {
      setCustomerLexiAvatarPanelState?.("listening", "Lexi is listening.", "Speak naturally. Lexi will respond as soon as you finish.");
      return;
    }
    if (eventType === "input_audio_buffer.speech_stopped") {
      setCustomerLexiAvatarPanelState?.("thinking", "Lexi is thinking.", "Your request is being turned into Lexi's next reply.");
      return;
    }
    if (eventType === "conversation.item.input_audio_transcription.completed") {
      const transcript = String(event?.transcript || "").trim();
      if (transcript) updateCustomerLexiTranscript(`You: ${transcript}`);
      return;
    }
    if (eventType === "response.created") {
      setCustomerLexiAvatarPanelState?.("thinking", "Lexi is preparing her reply.", "Lexi is turning what she heard into the next step.");
      return;
    }
    if (eventType === "response.done") {
      const text = extractCustomerLexiRealtimeText(event?.response);
      if (text) {
        setCustomerLexiAvatarPanelState?.("speaking", "Lexi is replying live.", `Lexi: ${text}`);
        return;
      }
    }
    if (eventType === "error") {
      const message = String(event?.error?.message || "Realtime session error.").trim();
      setCustomerLexiAvatarPanelState?.("speaking", "Lexi hit a realtime error.", message);
      setDashActionStatus?.(message, true, 3200);
    }
  }

  async function connectCustomerLexiRealtimeSession(sessionPayload) {
    const session = sessionPayload?.session || {};
    const clientSecret = String(session.clientSecret || "").trim();
    const model = String(session.model || "").trim();
    if (!clientSecret || !model) {
      throw new Error("Realtime session details are incomplete.");
    }
    if (!win.navigator.mediaDevices?.getUserMedia || typeof win.RTCPeerConnection === "undefined") {
      throw new Error("This browser does not support live Lexi voice mode.");
    }

    cleanupCustomerLexiRealtimeConnectionImpl();

    const mediaStream = await win.navigator.mediaDevices.getUserMedia({ audio: true });
    const peerConnection = new win.RTCPeerConnection();
    const audioElement = new win.Audio();
    audioElement.autoplay = true;
    audioElement.playsInline = true;

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        audioElement.srcObject = remoteStream;
      }
    };
    peerConnection.onconnectionstatechange = () => {
      const state = String(peerConnection.connectionState || "").trim();
      if (state === "connected") {
        setCustomerLexiAvatarPanelState?.("listening", "Lexi is live and listening.", "Talk naturally. Lexi will answer out loud and keep the booking moving.");
        resetCustomerLexiVoiceControls();
        setDashActionStatus?.("Lexi voice is live.", false, 2200);
      } else if (state === "failed" || state === "disconnected" || state === "closed") {
        cleanupCustomerLexiRealtimeConnectionImpl();
        resetCustomerLexiVoiceControls();
        setCustomerLexiAvatarPanelState?.("speaking", "Lexi voice session ended.", "Text chat is still available in this popup.");
      }
    };

    mediaStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, mediaStream);
    });

    const dataChannel = peerConnection.createDataChannel("oai-events");
    dataChannel.addEventListener("message", (event) => {
      try {
        handleCustomerLexiRealtimeEvent(JSON.parse(String(event.data || "{}")));
      } catch {}
    });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    const response = await fetchImpl(`https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(model)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clientSecret}`,
        "Content-Type": "application/sdp"
      },
      body: offer.sdp || ""
    });
    const answerSdp = await response.text();
    if (!response.ok) {
      throw new Error(answerSdp || "Unable to complete the Lexi realtime connection.");
    }
    await peerConnection.setRemoteDescription({ type: "answer", sdp: answerSdp });

    setRealtimeConnection?.({
      peerConnection,
      dataChannel,
      mediaStream,
      audioElement,
      muted: false
    });
  }

  async function hydrateCustomerLexiAvatarPanel() {
    const overlay = getPopupOverlay?.();
    if (!overlay) return;
    setCustomerLexiAvatarPanelState?.(
      "thinking",
      "Lexi is loading her live assistant profile.",
      "Checking avatar, voice, and realtime readiness for customer guidance."
    );
    const config = await loadCustomerLexiAvatarConfig();
    const titleNode = overlay.querySelector("#customerLexiAvatarTitle");
    const modeChip = overlay.querySelector("#customerLexiAvatarModeChip");
    const providerChip = overlay.querySelector("#customerLexiAvatarProviderChip");
    const readyChip = overlay.querySelector("#customerLexiAvatarReadyChip");
    const noteNode = overlay.querySelector("#customerLexiAvatarNote");
    const voiceBtn = overlay.querySelector("#customerLexiVoiceBtn");
    const muteBtn = overlay.querySelector("#customerLexiMuteBtn");
    const salon = getSelectedCustomerSalon?.();

    if (titleNode) titleNode.textContent = `${config.displayName || "Lexi"} live assistant`;
    if (modeChip) modeChip.textContent = config.realtimeEnabled ? "Voice + booking" : "Text + booking";
    if (providerChip) providerChip.textContent = `Avatar ${config.providerLabel || config.provider || "pending"}`;
    if (readyChip) {
      readyChip.textContent = config.sessionEndpointReady ? "Realtime ready" : (config.avatarEnabled ? "Avatar ready" : "Avatar pending");
      readyChip.classList.toggle("is-live", Boolean(config.sessionEndpointReady || config.avatarEnabled));
    }
    if (noteNode) {
      noteNode.textContent = salon
        ? `Ask about services, timings, availability, or aftercare for ${salon.name}, and Lexi can guide the booking from here.`
        : "Pick a business, then ask about services, timings, recommendations, aftercare, or booking help from this popup.";
    }
    if (voiceBtn instanceof HTMLButtonElement) {
      const demoReady = Boolean(config.avatarSessionReady && !config.realtimeEnabled);
      voiceBtn.disabled = demoReady ? false : !customerLexiMicSupported?.();
      voiceBtn.textContent = getCustomerLexiVoiceButtonLabel(config);
    }
    if (muteBtn instanceof HTMLButtonElement) {
      muteBtn.disabled = true;
      muteBtn.textContent = "Stop";
    }
    setCustomerLexiAvatarPanelState?.(
      "idle",
      customerLexiMicSupported?.()
        ? "Push-to-talk is ready in this popup."
        : (config.avatarSessionReady ? "HeyGen demo mode is ready in this popup." : "Text booking mode is live now."),
      customerLexiMicSupported?.()
        ? t?.("dashboard.push_to_talk_then_send", "Press Push to Talk, speak your question, then send the text to Lexi.")
        : (config.avatarSessionReady
          ? "Start Demo to connect Lexi's live avatar. Text chat still works underneath."
          : "This browser does not support push-to-talk, but text chat still works.")
    );
  }

  async function startCustomerLexiAvatarDemo(config = null) {
    const avatarConfig = config || await loadCustomerLexiAvatarConfig();
    if (!avatarConfig.avatarSessionReady) throw new Error("HeyGen demo mode is not configured yet.");
    await connectCustomerLexiAvatarSession();
    setCustomerLexiAvatarPanelState?.(
      "speaking",
      "Lexi demo avatar is live.",
      "Lexi is connected in visual demo mode. Use text chat below while we validate the live avatar experience."
    );
    setDashActionStatus?.("Lexi demo avatar connected.", false, 2200);
  }

  async function startCustomerLexiVoicePreparation() {
    if (getRealtimeConnection?.()) {
      cleanupCustomerLexiRealtimeConnection?.();
      cleanupCustomerLexiAvatarSession?.();
      resetCustomerLexiVoiceControls();
      setCustomerLexiAvatarPanelState?.("idle", "Lexi voice session ended.", "Text chat is still available in this popup.");
      setDashActionStatus?.("Lexi voice disconnected.", false, 2200);
      return;
    }
    const voiceBtn = getPopupOverlay?.()?.querySelector("#customerLexiVoiceBtn");
    let config = null;
    try {
      config = await loadCustomerLexiAvatarConfig();
      if (voiceBtn instanceof HTMLButtonElement) {
        voiceBtn.disabled = true;
        voiceBtn.textContent = "Preparing...";
      }
      if (config.avatarSessionReady && !config.realtimeEnabled) {
        setCustomerLexiAvatarPanelState?.(
          "thinking",
          "Lexi is preparing a HeyGen demo session.",
          "Connecting the live avatar without OpenAI realtime voice yet."
        );
        await startCustomerLexiAvatarDemo(config);
        if (voiceBtn instanceof HTMLButtonElement) {
          voiceBtn.disabled = false;
          voiceBtn.textContent = "Restart Demo";
        }
        return;
      }
      setCustomerLexiAvatarPanelState?.(
        "thinking",
        "Lexi is preparing a realtime voice session.",
        "Requesting a short-lived client secret from the server."
      );
      const data = await requestCustomerLexiRealtimeSession();
      const readyChip = getPopupOverlay?.()?.querySelector("#customerLexiAvatarReadyChip");
      if (readyChip) {
        readyChip.textContent = data.sessionReady ? "Session ready" : "Session pending";
        readyChip.classList.toggle("is-live", Boolean(data.sessionReady));
      }
      if (!data.sessionReady) {
        if (config.avatarSessionReady) {
          await startCustomerLexiAvatarDemo(config);
          if (voiceBtn instanceof HTMLButtonElement) {
            voiceBtn.disabled = false;
            voiceBtn.textContent = "Restart Demo";
          }
          return;
        }
        resetCustomerLexiVoiceControls();
        if (voiceBtn instanceof HTMLButtonElement) {
          voiceBtn.disabled = !customerLexiMicSupported?.();
          voiceBtn.textContent = getCustomerLexiVoiceButtonLabel(config);
        }
        setCustomerLexiAvatarPanelState?.(
          "speaking",
          data.message || "Lexi voice session updated.",
          "The server responded, but a live session is not ready yet."
        );
        setDashActionStatus?.(data.message || "Lexi voice session is not ready yet.", true, 2600);
        return;
      }
      await connectCustomerLexiRealtimeSession(data);
      try {
        await connectCustomerLexiAvatarSession();
      } catch (avatarError) {
        updateCustomerLexiTranscript(avatarError instanceof Error ? avatarError.message : "Lexi avatar could not connect, but voice is still available.");
      }
      setCustomerLexiAvatarPanelState?.(
        "thinking",
        data.message || "Lexi voice session updated.",
        `OpenAI Realtime session ready for ${data.session?.model || "Lexi"} using the ${data.session?.voice || "default"} voice. Establishing the live connection now.`
      );
      setDashActionStatus?.("Lexi voice session prepared.", false, 2200);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to prepare a Lexi voice session right now.";
      cleanupCustomerLexiRealtimeConnection?.();
      cleanupCustomerLexiAvatarSession?.();
      if (voiceBtn instanceof HTMLButtonElement) {
        voiceBtn.disabled = !(config?.avatarSessionReady && !config?.realtimeEnabled) && !customerLexiMicSupported?.();
        voiceBtn.textContent = getCustomerLexiVoiceButtonLabel(config);
      }
      const readyChip = getPopupOverlay?.()?.querySelector("#customerLexiAvatarReadyChip");
      if (readyChip) {
        readyChip.textContent = "Session error";
        readyChip.classList.remove("is-live");
      }
      setCustomerLexiAvatarPanelState?.("speaking", "Lexi could not prepare the voice session.", message);
      setDashActionStatus?.(message, true, 3200);
    }
  }

  return {
    loadCustomerLexiAvatarConfig,
    requestCustomerLexiRealtimeSession,
    loadCustomerLivekitClient,
    requestCustomerLexiAvatarSession,
    connectCustomerLexiAvatarSession,
    extractCustomerLexiRealtimeText,
    updateCustomerLexiTranscript,
    resetCustomerLexiVoiceControls,
    getCustomerLexiVoiceButtonLabel,
    cleanupCustomerLexiRealtimeConnection: cleanupCustomerLexiRealtimeConnectionImpl,
    cleanupCustomerLexiAvatarSession: cleanupCustomerLexiAvatarSessionImpl,
    handleCustomerLexiRealtimeEvent,
    connectCustomerLexiRealtimeSession,
    hydrateCustomerLexiAvatarPanel,
    startCustomerLexiAvatarDemo,
    startCustomerLexiVoicePreparation
  };
}
