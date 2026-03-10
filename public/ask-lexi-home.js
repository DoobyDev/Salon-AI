import { registerServiceWorker } from "./pwa-runtime.js";

const homePreviewThread = document.getElementById("homePreviewThread");
const homeBookingFeed = document.getElementById("homeBookingFeed");
const homeRefreshFeedBtn = document.getElementById("homeRefreshFeedBtn");
const homeAskLexiBtn = document.getElementById("homeAskLexiBtn");
const homeBookingFlowBtn = document.getElementById("homeBookingFlowBtn");
const homeLexiFab = document.getElementById("homeLexiFab");
const homeLexiModal = document.getElementById("homeLexiModal");
const homeLexiCloseBtn = document.getElementById("homeLexiCloseBtn");
const homeLexiAssistantThread = document.getElementById("homeLexiAssistantThread");
const homeLexiAssistantForm = document.getElementById("homeLexiAssistantForm");
const homeLexiAssistantInput = document.getElementById("homeLexiAssistantInput");
const homePromptButtons = Array.from(document.querySelectorAll("[data-home-lexi-prompt]"));
const modalCloseTargets = Array.from(document.querySelectorAll("[data-close-home-lexi]"));

const PUBLIC_HISTORY = [];

registerServiceWorker();

function appendAssistantMessage(container, role, text) {
  if (!container) return;
  const article = document.createElement("article");
  article.className = `assistant-message ${role === "user" ? "is-user" : role === "system" ? "is-system" : "is-assistant"}`;
  article.textContent = String(text || "");
  container.appendChild(article);
  container.scrollTop = container.scrollHeight;
}

function setDefaultHomeLexiMessages() {
  if (!homeLexiAssistantThread || homeLexiAssistantThread.childElementCount) return;
  appendAssistantMessage(
    homeLexiAssistantThread,
    "assistant",
    "Hello, I'm Lexi. I can help with salon bookings, service questions, prep advice, or how the owner dashboard works."
  );
}

function openHomeLexiModal(prefill = "") {
  if (!homeLexiModal) return;
  homeLexiModal.hidden = false;
  document.body.style.overflow = "hidden";
  setDefaultHomeLexiMessages();
  if (homeLexiAssistantInput) {
    homeLexiAssistantInput.value = String(prefill || "");
    homeLexiAssistantInput.focus();
  }
}

function closeHomeLexiModal() {
  if (!homeLexiModal) return;
  homeLexiModal.hidden = true;
  document.body.style.overflow = "";
}

function formatCurrencyGbp(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatDisplayDate(value) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

async function loadPublicBookingFeed() {
  if (!homeBookingFeed) return;
  homeBookingFeed.innerHTML = '<div class="empty-state">Loading recent bookings...</div>';
  try {
    const response = await fetch("/api/bookings/public-demo?limit=6");
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || "Unable to load booking feed.");
    const bookings = Array.isArray(data?.bookings) ? data.bookings : [];
    if (!bookings.length) {
      homeBookingFeed.innerHTML = '<div class="empty-state">No recent bookings are available yet.</div>';
      return;
    }
    homeBookingFeed.innerHTML = "";
    bookings.forEach((booking) => {
      const row = document.createElement("article");
      row.className = "feed-row";
      row.innerHTML = `
        <strong>${escapeHtml(booking.service || "Booking")}</strong>
        <small>${escapeHtml(booking.businessName || "Salon")}</small>
        <div class="feed-row-meta">
          <span>${escapeHtml(formatDisplayDate(booking.date || ""))} at ${escapeHtml(booking.time || "")}</span>
          <span>${escapeHtml(String(booking.customerName || "Guest"))}</span>
        </div>
      `;
      homeBookingFeed.appendChild(row);
    });
  } catch (error) {
    homeBookingFeed.innerHTML = `<div class="empty-state">${escapeHtml(
      error?.message || "Booking feed unavailable."
    )}</div>`;
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendPublicLexiMessage(message) {
  const text = String(message || "").trim();
  if (!text || !homeLexiAssistantThread) return;

  appendAssistantMessage(homeLexiAssistantThread, "user", text);
  PUBLIC_HISTORY.push({ role: "user", content: text });
  appendAssistantMessage(homeLexiAssistantThread, "system", "Lexi is checking that now.");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: PUBLIC_HISTORY
      })
    });
    const data = await response.json();
    const systemMessage = homeLexiAssistantThread.querySelector(".assistant-message.is-system:last-child");
    if (systemMessage) systemMessage.remove();
    if (!response.ok) throw new Error(data?.error || "Lexi could not reply right now.");
    const reply = String(data?.reply || data?.answer || "I could not answer that right now.");
    appendAssistantMessage(homeLexiAssistantThread, "assistant", reply);
    PUBLIC_HISTORY.push({ role: "assistant", content: reply });
  } catch (error) {
    const systemMessage = homeLexiAssistantThread.querySelector(".assistant-message.is-system:last-child");
    if (systemMessage) systemMessage.remove();
    appendAssistantMessage(homeLexiAssistantThread, "assistant", error?.message || "Lexi could not reply right now.");
  }
}

function rotatePreviewConversation() {
  if (!homePreviewThread) return;
  const sequences = [
    [
      ["user", "Can Lexi book same-day barber appointments?"],
      ["lexi", "Yes. She can offer live slots, gather details, and confirm the booking in one flow."],
      ["user", "What if the client asks about beard treatment too?"],
      ["lexi", "Lexi can recommend the add-on and include it in the appointment if the schedule allows."]
    ],
    [
      ["user", "How do owners export bookings for accounting?"],
      ["lexi", "From the owner dashboard they can export accountant-ready CSV with gross and realized revenue."],
      ["user", "Can they still ask Lexi from that screen?"],
      ["lexi", "Yes. Ask Lexi stays available throughout the app, including diary and revenue views."]
    ]
  ];
  let sequenceIndex = 0;

  setInterval(() => {
    sequenceIndex = (sequenceIndex + 1) % sequences.length;
    const sequence = sequences[sequenceIndex];
    homePreviewThread.innerHTML = "";
    sequence.forEach(([role, text]) => {
      const article = document.createElement("article");
      article.className = `bubble ${role === "user" ? "bubble-user" : "bubble-lexi"}`;
      article.textContent = text;
      homePreviewThread.appendChild(article);
    });
  }, 7000);
}

homeRefreshFeedBtn?.addEventListener("click", () => {
  loadPublicBookingFeed();
});

homeAskLexiBtn?.addEventListener("click", () => openHomeLexiModal());
homeLexiFab?.addEventListener("click", () => openHomeLexiModal());
homeBookingFlowBtn?.addEventListener("click", () =>
  openHomeLexiModal("How does Ask Lexi take a customer from question to confirmed booking?")
);
homeLexiCloseBtn?.addEventListener("click", closeHomeLexiModal);
modalCloseTargets.forEach((node) => node.addEventListener("click", closeHomeLexiModal));

homePromptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const prompt = String(button.getAttribute("data-home-lexi-prompt") || "").trim();
    if (!prompt) return;
    sendPublicLexiMessage(prompt);
  });
});

homeLexiAssistantForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = String(homeLexiAssistantInput?.value || "").trim();
  if (!message) return;
  homeLexiAssistantInput.value = "";
  await sendPublicLexiMessage(message);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && homeLexiModal && !homeLexiModal.hidden) {
    closeHomeLexiModal();
  }
});

loadPublicBookingFeed();
rotatePreviewConversation();
