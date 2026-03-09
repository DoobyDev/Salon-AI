// Customer Lexi popup and mic control runtime.
export function createCustomerLexiPopupRuntime(deps) {
  const {
    doc = document,
    t,
    getDashboardSpeechRecognition,
    customerReceptionSection,
    customerReceptionForm,
    customerReceptionInput,
    getPopupOverlay,
    setPopupOverlay,
    getPopupContainer,
    setPopupContainer,
    getSpeechRecognition,
    setSpeechRecognition,
    getMicListening,
    setMicListening,
    getPopupOpen,
    setPopupOpen,
    getPopupLastFocus,
    setPopupLastFocus,
    getChatPlaceholder,
    setChatPlaceholder,
    updateCustomerLexiTranscript,
    setDashActionStatus,
    hydrateCustomerLexiAvatarPanel,
    cleanupCustomerLexiRealtimeConnection,
    cleanupCustomerLexiAvatarSession,
    resetCustomerLexiVoiceControls
  } = deps || {};

  function setCustomerLexiAvatarPanelState(state, status, transcript) {
    const overlay = getPopupOverlay?.();
    const shell = overlay?.querySelector(".lexi-avatar-shell");
    if (shell instanceof HTMLElement) shell.setAttribute("data-avatar-state", state);
    const statusNode = overlay?.querySelector("#customerLexiAvatarStatus");
    const transcriptNode = overlay?.querySelector("#customerLexiAvatarTranscript");
    if (statusNode) statusNode.textContent = status;
    if (transcriptNode) transcriptNode.textContent = transcript;
  }

  function getCustomerLexiAvatarVideo() {
    return getPopupOverlay?.()?.querySelector("#customerLexiAvatarVideo") || null;
  }

  function setCustomerLexiAvatarVideoActive(active) {
    const video = getCustomerLexiAvatarVideo();
    const stage = getPopupOverlay?.()?.querySelector(".lexi-avatar-stage");
    if (video instanceof HTMLVideoElement) {
      video.classList.toggle("is-active", Boolean(active));
    }
    if (stage instanceof HTMLElement) {
      stage.classList.toggle("has-video", Boolean(active));
    }
  }

  function customerLexiMicSupported() {
    const SpeechCtor = getDashboardSpeechRecognition?.();
    return typeof SpeechCtor === "function";
  }

  function setCustomerLexiMicButtonState(listening = false) {
    const overlay = getPopupOverlay?.();
    const voiceBtn = overlay?.querySelector("#customerLexiVoiceBtn");
    const stopBtn = overlay?.querySelector("#customerLexiMuteBtn");
    const supported = customerLexiMicSupported();
    if (voiceBtn instanceof HTMLButtonElement) {
      voiceBtn.disabled = !supported;
      voiceBtn.textContent = listening ? t?.("dashboard.listening", "Listening...") : t?.("common.push_to_talk", "Push to Talk");
    }
    if (stopBtn instanceof HTMLButtonElement) {
      stopBtn.disabled = !supported || !listening;
      stopBtn.textContent = "Stop";
    }
  }

  function stopCustomerLexiMicCapture() {
    try {
      getSpeechRecognition?.()?.stop?.();
    } catch {}
  }

  function toggleCustomerLexiMicCapture() {
    if (getMicListening?.()) {
      stopCustomerLexiMicCapture();
      return;
    }
    const SpeechCtor = getDashboardSpeechRecognition?.();
    if (typeof SpeechCtor !== "function") {
      updateCustomerLexiTranscript?.("Push-to-talk is not supported in this browser.");
      setDashActionStatus?.("Push-to-talk is not supported in this browser.", true, 2600);
      return;
    }
    const recognition = new SpeechCtor();
    let finalTranscript = "";
    recognition.lang = "en-GB";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setMicListening?.(true);
      setSpeechRecognition?.(recognition);
      setCustomerLexiMicButtonState(true);
      setCustomerLexiAvatarPanelState("listening", "Lexi is listening.", "Say your question, then review the text before sending it.");
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results || [])
        .map((result) => String(result?.[0]?.transcript || ""))
        .join(" ")
        .trim();
      if (!transcript) return;
      finalTranscript = transcript;
      if (customerReceptionInput) customerReceptionInput.value = transcript;
      updateCustomerLexiTranscript?.(`You: ${transcript}`);
    };
    recognition.onerror = (event) => {
      const message = String(event?.error || "speech error").replace(/_/g, " ").trim();
      updateCustomerLexiTranscript?.(`Mic error: ${message}`);
      setDashActionStatus?.(`Mic error: ${message}`, true, 2600);
    };
    recognition.onend = () => {
      setMicListening?.(false);
      setSpeechRecognition?.(null);
      setCustomerLexiMicButtonState(false);
      setCustomerLexiAvatarPanelState(
        "idle",
        "Push-to-talk is ready.",
        finalTranscript
          ? t?.("dashboard.review_words_then_send", "Review your words in the chat box, then send them to Lexi.")
          : t?.("common.push_to_talk_ready_prompt", "Press Push to Talk when you want to speak.")
      );
      customerReceptionInput?.focus();
    };
    recognition.start();
  }

  function closeCustomerLexiPopup() {
    if (!getPopupOpen?.()) return;
    stopCustomerLexiMicCapture();
    cleanupCustomerLexiRealtimeConnection?.();
    cleanupCustomerLexiAvatarSession?.();
    resetCustomerLexiVoiceControls?.();
    const customerChatShell = customerReceptionSection?.querySelector(".customer-chat-shell") || null;
    const placeholder = getChatPlaceholder?.();
    if (placeholder?.parentNode && customerChatShell instanceof HTMLElement) {
      placeholder.parentNode.insertBefore(customerChatShell, placeholder);
      placeholder.remove();
    }
    customerChatShell?.classList.add("customer-chat-inline-hidden");
    const overlay = getPopupOverlay?.();
    if (overlay) {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
    }
    doc.body.classList.remove("home-lexi-popup-open");
    setPopupOpen?.(false);
    const lastFocus = getPopupLastFocus?.();
    if (lastFocus instanceof HTMLElement && doc.contains(lastFocus)) {
      lastFocus.focus();
    }
    setPopupLastFocus?.(null);
  }

  function ensureCustomerLexiPopup() {
    const overlayExisting = getPopupOverlay?.();
    const containerExisting = getPopupContainer?.();
    if (overlayExisting && containerExisting) {
      return { overlay: overlayExisting, container: containerExisting };
    }
    const overlay = doc.createElement("div");
    overlay.className = "home-lexi-popup-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
    <section class="home-lexi-popup" role="dialog" aria-modal="true" aria-labelledby="customerLexiPopupTitle">
      <div class="home-lexi-popup-head">
        <div>
          <p class="home-lexi-popup-kicker">Ask Lexi</p>
          <h3 id="customerLexiPopupTitle">Ask Lexi</h3>
          <p>Ask questions, get recommendations, and move straight into booking from one focused popup.</p>
        </div>
        <button type="button" class="home-lexi-popup-close" aria-label="Close Lexi chat popup">x</button>
      </div>
      <div class="home-lexi-popup-body">
        <section class="lexi-avatar-shell" data-avatar-state="idle" aria-label="Lexi live assistant">
          <div class="lexi-avatar-stage">
            <video id="customerLexiAvatarVideo" class="lexi-avatar-video" playsinline autoplay muted></video>
            <div class="lexi-avatar-figure">
              <div class="lexi-avatar-orb" aria-hidden="true"></div>
              <div class="lexi-avatar-label">
                <strong id="customerLexiAvatarTitle">Lexi live assistant</strong>
                <small id="customerLexiAvatarStatus">Push to talk is ready.</small>
              </div>
            </div>
          </div>
          <div class="lexi-avatar-meta">
            <div class="lexi-avatar-chip-row">
              <span class="lexi-avatar-chip" id="customerLexiAvatarModeChip">Text + booking</span>
              <span class="lexi-avatar-chip" id="customerLexiAvatarProviderChip">Provider pending</span>
              <span class="lexi-avatar-chip" id="customerLexiAvatarReadyChip">Avatar offline</span>
            </div>
            <div class="lexi-avatar-note">
              <strong>Lexi focus</strong>
              <p id="customerLexiAvatarNote">Ask about services, treatments, timings, aftercare, and the best next step for a booking.</p>
            </div>
            <div class="lexi-avatar-transcript">
              <strong>Live status</strong>
              <p id="customerLexiAvatarTranscript">Use text now or press Push to Talk and review your words before sending them.</p>
            </div>
          </div>
        </section>
        <div class="home-lexi-popup-chat-slot"></div>
      </div>
    </section>
  `;
    doc.body.appendChild(overlay);
    const container = overlay.querySelector(".home-lexi-popup-chat-slot");
    const micSlot = doc.createElement("div");
    micSlot.className = "lexi-popup-mic-actions";
    micSlot.innerHTML = `
    <button class="btn lexi-mic-btn" id="customerLexiVoiceBtn" type="button" disabled>Push to Talk</button>
    <button class="btn btn-ghost lexi-mic-btn" id="customerLexiMuteBtn" type="button" disabled>Stop</button>
  `;
    container?.appendChild(micSlot);
    overlay.querySelector(".home-lexi-popup-close")?.addEventListener("click", closeCustomerLexiPopup);
    overlay.querySelector("#customerLexiVoiceBtn")?.addEventListener("click", toggleCustomerLexiMicCapture);
    overlay.querySelector("#customerLexiMuteBtn")?.addEventListener("click", stopCustomerLexiMicCapture);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeCustomerLexiPopup();
    });
    setPopupOverlay?.(overlay);
    setPopupContainer?.(container);
    return { overlay, container };
  }

  function openCustomerLexiPopup() {
    const customerChatShell = customerReceptionSection?.querySelector(".customer-chat-shell") || null;
    if (!(customerChatShell instanceof HTMLElement)) {
      customerReceptionSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      customerReceptionInput?.focus();
      return;
    }
    const { overlay, container } = ensureCustomerLexiPopup();
    if (!(container instanceof HTMLElement)) return;
    if (!getChatPlaceholder?.()) {
      const placeholder = doc.createElement("div");
      placeholder.className = "home-lexi-chat-placeholder";
      setChatPlaceholder?.(placeholder);
    }
    const placeholder = getChatPlaceholder?.();
    if (customerChatShell.parentNode && customerChatShell.parentNode !== container) {
      customerChatShell.parentNode.insertBefore(placeholder, customerChatShell);
    }
    customerChatShell.classList.remove("customer-chat-inline-hidden");
    setPopupLastFocus?.(doc.activeElement instanceof HTMLElement ? doc.activeElement : null);
    container.appendChild(customerChatShell);
    const popupMicActions = overlay.querySelector(".lexi-popup-mic-actions");
    if (popupMicActions instanceof HTMLElement && customerReceptionForm instanceof HTMLElement) {
      const submitBtn = customerReceptionForm.querySelector('button[type="submit"]');
      if (submitBtn instanceof HTMLElement) {
        customerReceptionForm.insertBefore(popupMicActions, submitBtn);
      } else {
        customerReceptionForm.appendChild(popupMicActions);
      }
    }
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    doc.body.classList.add("home-lexi-popup-open");
    setPopupOpen?.(true);
    hydrateCustomerLexiAvatarPanel?.();
    customerReceptionInput?.focus();
  }

  return {
    ensureCustomerLexiPopup,
    customerLexiMicSupported,
    setCustomerLexiMicButtonState,
    stopCustomerLexiMicCapture,
    toggleCustomerLexiMicCapture,
    setCustomerLexiAvatarPanelState,
    getCustomerLexiAvatarVideo,
    setCustomerLexiAvatarVideoActive,
    openCustomerLexiPopup,
    closeCustomerLexiPopup
  };
}
