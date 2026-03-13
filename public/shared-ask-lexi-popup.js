export function createSharedAskLexiPopup(options = {}) {
  const {
    doc = document,
    fetchImpl = fetch,
    triggerButtons = [],
    pageLabel = "Homepage",
    title = "Ask Lexi",
    subtitle = "Professional salon support in one conversation.",
    description = "Ask about bookings, services, timings, prep, rebooking, or how the workspace works.",
    assistantIntro = "Hello, I'm Lexi. Ask me about bookings, treatments, prep, rebooking, or how Ask Lexi works.",
    portraitNote = "Lexi keeps customer questions, booking intent, and next-step guidance in one polished chat flow.",
    capabilityChips = ["Bookings", "Service guidance", "Next steps"],
    supportBadge = "Reception-grade guidance",
    statusLabel = "Ready now",
    promptHeading = "Start with a focused prompt",
    formNote = "Lexi replies best when you ask one clear question at a time.",
    insightRows = [
      { label: "Role", value: "AI receptionist" },
      { label: "Best for", value: "Bookings and guidance" },
      { label: "Style", value: "Clear and calm" }
    ],
    promptChips = [
      { label: "Book balayage", prompt: "Book a balayage this Friday after 4 PM." },
      { label: "Prep advice", prompt: "What should I do before a colour appointment?" },
      { label: "Owner overview", prompt: "What does Ask Lexi do for salon owners?" }
    ],
    inputPlaceholder = "Ask Lexi about bookings, services, timings, prep, or the dashboard",
    buildRequestBody
  } = options;

  const history = [];
  let overlay = null;
  let thread = null;
  let form = null;
  let input = null;
  let lastTrigger = null;

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function appendMessage(role, text) {
    if (!(thread instanceof HTMLElement)) return null;
    const article = doc.createElement("article");
    article.className = `assistant-message ${role === "user" ? "is-user" : role === "system" ? "is-system" : "is-assistant"}`;
    article.textContent = String(text || "");
    thread.appendChild(article);
    thread.scrollTop = thread.scrollHeight;
    return article;
  }

  function seedIntro() {
    if (!(thread instanceof HTMLElement) || thread.childElementCount > 0) return;
    appendMessage("assistant", assistantIntro);
  }

  function ensurePopup() {
    if (overlay instanceof HTMLElement) return overlay;
    overlay = doc.createElement("section");
    overlay.className = "lexi-modal shared-lexi-modal";
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="lexi-modal-backdrop" data-shared-lexi-close></div>
      <div class="lexi-modal-card home-lexi-dialog shared-lexi-dialog" role="dialog" aria-modal="true" aria-labelledby="sharedLexiDialogTitle">
        <div class="home-lexi-dialog-head">
          <div class="home-lexi-dialog-title">
            <p class="kicker">Ask Lexi</p>
            <h2 id="sharedLexiDialogTitle">${escapeHtml(title)}</h2>
            <p class="home-lexi-dialog-copy">${escapeHtml(description)}</p>
          </div>
          <button class="btn btn-ghost btn-small" type="button" data-shared-lexi-close>Close</button>
        </div>
        <div class="home-lexi-dialog-body">
          <aside class="home-lexi-dialog-aside shared-lexi-dialog-aside" aria-label="Lexi overview">
            <div class="home-lexi-dialog-portrait shared-lexi-dialog-portrait">
              <img
                src="/3d-lexi.png"
                alt="Lexi AI salon receptionist portrait"
                class="home-lexi-dialog-image shared-lexi-dialog-image"
                width="626"
                height="626"
                loading="eager"
                decoding="async"
              />
            </div>
            <div class="home-lexi-dialog-aside-copy">
              <span>${escapeHtml(pageLabel)}</span>
              <strong>${escapeHtml(subtitle)}</strong>
              <p>${escapeHtml(portraitNote)}</p>
            </div>
            <div class="shared-lexi-dialog-meta">
              <div class="shared-lexi-dialog-badge-row">
                <span class="shared-lexi-dialog-support-badge">${escapeHtml(supportBadge)}</span>
                <span class="shared-lexi-dialog-support-badge is-status">${escapeHtml(statusLabel)}</span>
              </div>
              <div class="shared-lexi-dialog-insights">
                ${insightRows
                  .map(
                    (row) => `
                      <article class="shared-lexi-dialog-insight">
                        <span>${escapeHtml(row?.label || "")}</span>
                        <strong>${escapeHtml(row?.value || "")}</strong>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            </div>
            <div class="home-lexi-dialog-pills">
              ${capabilityChips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join("")}
            </div>
          </aside>
          <section class="home-lexi-dialog-chat shared-lexi-dialog-chat" aria-label="Lexi chat">
            <div class="home-lexi-dialog-chat-head">
              <div>
                <p class="kicker">Conversation</p>
                <strong>${escapeHtml(subtitle)}</strong>
              </div>
              <span class="home-lexi-dialog-status">Live</span>
            </div>
            <div class="assistant-thread assistant-thread-public home-lexi-dialog-thread" id="sharedLexiAssistantThread"></div>
            <div class="shared-lexi-dialog-prompt-block">
              <span class="shared-lexi-dialog-prompt-heading">${escapeHtml(promptHeading)}</span>
              <div class="assistant-quick-prompts home-lexi-dialog-prompts">
              ${promptChips
                .map(
                  (chip) =>
                    `<button class="prompt-chip" type="button" data-shared-lexi-prompt="${escapeHtml(chip.prompt)}">${escapeHtml(chip.label)}</button>`
                )
                .join("")}
              </div>
            </div>
            <form class="assistant-form home-lexi-dialog-form" id="sharedLexiAssistantForm">
              <label class="sr-only" for="sharedLexiAssistantInput">Ask Lexi a question</label>
              <input id="sharedLexiAssistantInput" type="text" placeholder="${escapeHtml(inputPlaceholder)}" />
              <button class="btn ask-lexi-btn" type="submit">Send</button>
            </form>
            <p class="shared-lexi-dialog-form-note">${escapeHtml(formNote)}</p>
          </section>
        </div>
      </div>
    `;
    doc.body.appendChild(overlay);
    thread = overlay.querySelector("#sharedLexiAssistantThread");
    form = overlay.querySelector("#sharedLexiAssistantForm");
    input = overlay.querySelector("#sharedLexiAssistantInput");

    overlay.querySelectorAll("[data-shared-lexi-close]").forEach((node) => {
      node.addEventListener("click", close);
    });
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });
    overlay.querySelectorAll("[data-shared-lexi-prompt]").forEach((button) => {
      button.addEventListener("click", () => {
        const prompt = String(button.getAttribute("data-shared-lexi-prompt") || "").trim();
        if (!prompt) return;
        sendMessage(prompt);
      });
    });
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = String(input?.value || "").trim();
      if (!message) return;
      input.value = "";
      await sendMessage(message);
    });
    doc.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && overlay && !overlay.hidden) close();
    });
    return overlay;
  }

  async function sendMessage(message) {
    const text = String(message || "").trim();
    if (!text) return;
    ensurePopup();
    seedIntro();
    appendMessage("user", text);
    history.push({ role: "user", content: text });
    const pending = appendMessage("system", "Lexi is checking that now.");
    try {
      const body = typeof buildRequestBody === "function"
        ? buildRequestBody({ message: text, history: history.slice() })
        : { message: text, history: history.slice() };
      const response = await fetchImpl("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      pending?.remove();
      if (!response.ok) throw new Error(data?.error || "Lexi could not reply right now.");
      const reply = String(data?.reply || data?.answer || "I could not answer that right now.");
      appendMessage("assistant", reply);
      history.push({ role: "assistant", content: reply });
    } catch (error) {
      pending?.remove();
      appendMessage("assistant", error?.message || "Lexi could not reply right now.");
    }
  }

  function open(prefill = "", trigger = null) {
    ensurePopup();
    seedIntro();
    lastTrigger = trigger instanceof HTMLElement ? trigger : null;
    overlay.hidden = false;
    doc.body.classList.add("home-lexi-popup-open");
    if (input) input.value = String(prefill || "");
    window.requestAnimationFrame(() => input?.focus());
  }

  function setInputValue(value = "") {
    ensurePopup();
    if (input) input.value = String(value || "");
  }

  function getInputValue() {
    return String(input?.value || "");
  }

  function reset(initialMessage = "") {
    ensurePopup();
    history.length = 0;
    if (thread instanceof HTMLElement) {
      thread.innerHTML = "";
    }
    seedIntro();
    const message = String(initialMessage || "").trim();
    if (message) {
      history.push({ role: "assistant", content: message });
      appendMessage("assistant", message);
    }
  }

  function close() {
    if (!(overlay instanceof HTMLElement)) return;
    overlay.hidden = true;
    doc.body.classList.remove("home-lexi-popup-open");
    if (lastTrigger instanceof HTMLElement && doc.contains(lastTrigger)) {
      lastTrigger.focus();
    }
    lastTrigger = null;
  }

  triggerButtons
    .filter((button) => button instanceof HTMLElement)
    .forEach((button) => {
      button.addEventListener("click", () => open("", button));
    });

  return {
    open,
    close,
    sendMessage,
    setInputValue,
    getInputValue,
    reset
  };
}
