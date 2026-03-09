// Shared manage-mode UI helpers: toast stack, modal overlay, HTML escaping, forms, and confirmations.
export function createManageUiRuntime() {
  function ensureManageToastStack() {
    let stack = document.getElementById("manageToastStack");
    if (stack) return stack;
    stack = document.createElement("div");
    stack.id = "manageToastStack";
    stack.className = "manage-toast-stack";
    document.body.appendChild(stack);
    return stack;
  }

  function showManageToast(message, type = "success") {
    const text = String(message || "").trim();
    if (!text) return;
    const stack = ensureManageToastStack();
    const toast = document.createElement("div");
    toast.className = `manage-toast${type === "error" ? " error" : ""}`;
    toast.textContent = text;
    stack.appendChild(toast);
    window.setTimeout(() => {
      toast.remove();
    }, 2800);
  }

  function ensureManageModalOverlay() {
    let overlay = document.getElementById("manageModalOverlay");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "manageModalOverlay";
    overlay.className = "manage-modal-overlay";
    document.body.appendChild(overlay);
    return overlay;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  async function openManageForm({ title, fields = [], submitLabel = "Save" } = {}) {
    const overlay = ensureManageModalOverlay();
    overlay.innerHTML = "";
    overlay.style.display = "flex";
    const form = document.createElement("form");
    form.className = "manage-modal";
    form.innerHTML = `
      <h3>${escapeHtml(title || "Manage Item")}</h3>
      <div class="manage-modal-grid"></div>
      <div class="manage-modal-actions">
        <button type="button" class="btn btn-ghost manage-modal-cancel">Cancel</button>
        <button type="submit" class="btn">${escapeHtml(submitLabel)}</button>
      </div>
    `;
    const grid = form.querySelector(".manage-modal-grid");
    fields.forEach((field) => {
      const wrapper = document.createElement("label");
      wrapper.setAttribute("for", `manage-field-${field.id}`);
      const label = document.createElement("span");
      label.textContent = field.label || field.id;
      wrapper.appendChild(label);
      let control;
      const type = String(field.type || "text").toLowerCase();
      if (type === "select") {
        control = document.createElement("select");
        (field.options || []).forEach((option) => {
          const op = document.createElement("option");
          op.value = String(option.value);
          op.textContent = String(option.label);
          if (String(option.value) === String(field.value || "")) op.selected = true;
          control.appendChild(op);
        });
      } else if (type === "textarea") {
        control = document.createElement("textarea");
        control.rows = Number(field.rows || 3);
        control.value = String(field.value || "");
      } else {
        control = document.createElement("input");
        control.type = type;
        control.value = String(field.value || "");
        if (field.placeholder) control.placeholder = String(field.placeholder);
      }
      control.id = `manage-field-${field.id}`;
      control.name = field.id;
      if (field.required) control.required = true;
      wrapper.appendChild(control);
      grid?.appendChild(wrapper);
    });
    overlay.appendChild(form);
    const firstControl = form.querySelector("input,select,textarea");
    if (firstControl instanceof HTMLElement) firstControl.focus();

    return new Promise((resolve) => {
      const close = (result) => {
        overlay.style.display = "none";
        overlay.innerHTML = "";
        resolve(result);
      };
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const values = {};
        fields.forEach((field) => {
          const el = form.querySelector(`[name="${field.id}"]`);
          if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
            values[field.id] = String(el.value || "").trim();
          }
        });
        close(values);
      });
      const cancel = form.querySelector(".manage-modal-cancel");
      cancel?.addEventListener("click", () => close(null));
      overlay.addEventListener(
        "click",
        (event) => {
          if (event.target === overlay) close(null);
        },
        { once: true }
      );
    });
  }

  async function openManageConfirm({ title, message, confirmLabel = "Confirm" } = {}) {
    const overlay = ensureManageModalOverlay();
    overlay.innerHTML = "";
    overlay.style.display = "flex";
    const shell = document.createElement("div");
    shell.className = "manage-modal";
    shell.innerHTML = `
      <h3>${escapeHtml(title || "Confirm Action")}</h3>
      <p style="margin:0;color:var(--muted);">${escapeHtml(message || "Please confirm this action.")}</p>
      <div class="manage-modal-actions">
        <button type="button" class="btn btn-ghost manage-modal-cancel">Cancel</button>
        <button type="button" class="btn manage-modal-confirm">${escapeHtml(confirmLabel)}</button>
      </div>
    `;
    overlay.appendChild(shell);
    return new Promise((resolve) => {
      const close = (result) => {
        overlay.style.display = "none";
        overlay.innerHTML = "";
        resolve(result);
      };
      shell.querySelector(".manage-modal-cancel")?.addEventListener("click", () => close(false));
      shell.querySelector(".manage-modal-confirm")?.addEventListener("click", () => close(true));
      overlay.addEventListener(
        "click",
        (event) => {
          if (event.target === overlay) close(false);
        },
        { once: true }
      );
    });
  }

  return {
    ensureManageToastStack,
    showManageToast,
    ensureManageModalOverlay,
    escapeHtml,
    openManageForm,
    openManageConfirm
  };
}
