// Subscriber emergency admin contact storage + modal flow.
export function createContactAdminRuntime(deps) {
  const {
    doc = document,
    localStorageImpl = localStorage,
    contactAdminMessagesStorageKey,
    getUser,
    getUserRole,
    getCloseModulePopupActive,
    setCloseModulePopupActive,
    ensureManageModalOverlay,
    setDashActionStatus,
    showManageToast
  } = deps || {};

  function saveLocalAdminContactMessage(payload) {
    try {
      const existing = JSON.parse(localStorageImpl.getItem(contactAdminMessagesStorageKey) || "[]");
      const rows = Array.isArray(existing) ? existing : [];
      rows.unshift(payload);
      localStorageImpl.setItem(contactAdminMessagesStorageKey, JSON.stringify(rows.slice(0, 200)));
      return true;
    } catch {
      return false;
    }
  }

  function openContactAdminModal() {
    if (getUserRole?.() !== "subscriber") return;
    const closeModulePopupActive = getCloseModulePopupActive?.();
    if (typeof closeModulePopupActive === "function") {
      closeModulePopupActive();
    }
    const overlay = ensureManageModalOverlay?.();
    if (!overlay) return;
    overlay.innerHTML = "";
    overlay.style.display = "flex";

    const shell = doc.createElement("section");
    shell.className = "contact-admin-modal";
    shell.setAttribute("role", "dialog");
    shell.setAttribute("aria-modal", "true");
    shell.setAttribute("aria-labelledby", "contactAdminModalTitle");
    shell.innerHTML = `
      <div class="contact-admin-modal-head">
        <div>
          <h3 id="contactAdminModalTitle">Emergency Admin Contact</h3>
          <p>Use this only for urgent issues that need admin support (for example access problems or a critical dashboard issue).</p>
        </div>
        <button type="button" class="module-info-close" aria-label="Close contact admin window">x</button>
      </div>
      <p class="contact-admin-note">Urgent messages only. We usually reply within 24 hours.</p>
      <form class="contact-admin-form" novalidate>
        <input id="contactAdminSubject" type="text" maxlength="120" placeholder="Subject (e.g. Urgent login issue)" />
        <textarea id="contactAdminMessage" required maxlength="2000" placeholder="Describe the urgent issue and what you need help with..."></textarea>
        <p class="contact-admin-status" id="contactAdminStatus" aria-live="polite"></p>
        <div class="contact-admin-actions">
          <small>For urgent issues only.</small>
          <div style="display:flex;gap:0.45rem;flex-wrap:wrap;">
            <button type="button" class="btn btn-ghost contact-admin-cancel">Close</button>
            <button type="submit" class="btn contact-admin-send">Send Message</button>
          </div>
        </div>
      </form>
    `;
    overlay.appendChild(shell);

    const form = shell.querySelector(".contact-admin-form");
    const messageInput = shell.querySelector("#contactAdminMessage");
    const subjectInput = shell.querySelector("#contactAdminSubject");
    const statusEl = shell.querySelector("#contactAdminStatus");

    const close = () => {
      if (typeof getCloseModulePopupActive?.() !== "function") return;
      doc.removeEventListener("keydown", onKeyDown);
      overlay.removeEventListener("click", onOverlayClick);
      overlay.style.display = "none";
      overlay.innerHTML = "";
      setCloseModulePopupActive?.(null);
    };

    const setStatus = (message, isError = false) => {
      if (!(statusEl instanceof HTMLElement)) return;
      statusEl.textContent = String(message || "");
      statusEl.classList.toggle("is-error", Boolean(isError));
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    const onOverlayClick = (event) => {
      if (event.target === overlay) close();
    };

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = String(messageInput?.value || "").trim();
      const subject = String(subjectInput?.value || "").trim();
      if (!message) {
        setStatus("Please write a message before sending.", true);
        messageInput?.focus();
        return;
      }

      const user = getUser?.() || {};
      const payload = {
        id: `msg_${Date.now()}`,
        fromUserId: String(user.id || ""),
        fromName: String(user.name || user.email || "Subscriber"),
        fromEmail: String(user.email || ""),
        role: "subscriber",
        subject,
        message,
        createdAt: new Date().toISOString(),
        status: "new"
      };

      const saved = saveLocalAdminContactMessage(payload);
      if (!saved) {
        setStatus("Could not save your message on this device. Please try again.", true);
        return;
      }

      setDashActionStatus?.("Emergency message sent to admin. Usually responds within 24hrs.");
      showManageToast?.("Emergency message sent to admin.");
      close();
    });

    setCloseModulePopupActive?.(close);
    doc.addEventListener("keydown", onKeyDown);
    overlay.addEventListener("click", onOverlayClick);
    shell.querySelector(".module-info-close")?.addEventListener("click", close);
    shell.querySelector(".contact-admin-cancel")?.addEventListener("click", close);

    if (messageInput instanceof HTMLElement) messageInput.focus();
  }

  return {
    saveLocalAdminContactMessage,
    openContactAdminModal
  };
}
