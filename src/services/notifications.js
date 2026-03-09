import twilio from "twilio";
import OpenAI from "openai";

const twilioSid = process.env.TWILIO_ACCOUNT_SID || "";
const twilioToken = process.env.TWILIO_AUTH_TOKEN || "";
const twilioFrom = process.env.TWILIO_FROM_NUMBER || "";
const sendGridApiKey = process.env.SENDGRID_API_KEY || "";
const openAiKey = process.env.OPENAI_API_KEY || "";

let twilioClient = null;
if (twilioSid && twilioToken) {
  try {
    twilioClient = twilio(twilioSid, twilioToken);
  } catch (error) {
    console.warn("Twilio disabled:", error.message);
    twilioClient = null;
  }
}
const openai = openAiKey ? new OpenAI({ apiKey: openAiKey }) : null;

export function getNotificationProviderStatus() {
  return {
    smsConfigured: Boolean(twilioClient && twilioFrom),
    emailConfigured: Boolean(sendGridApiKey),
    smsProvider: twilioClient ? "twilio" : "",
    emailProvider: sendGridApiKey ? "sendgrid" : "",
    availableChannels: [twilioClient && twilioFrom ? "SMS" : "", sendGridApiKey ? "Email" : ""].filter(Boolean)
  };
}

async function sendSms(to, body) {
  if (!to) return { channel: "sms", outcome: "skipped", reason: "no_recipient" };
  if (!twilioClient || !twilioFrom) return { channel: "sms", outcome: "skipped", reason: "provider_not_configured" };
  try {
    await twilioClient.messages.create({ from: twilioFrom, to, body });
    return { channel: "sms", outcome: "sent" };
  } catch (error) {
    console.error("SMS send failure:", error.message);
    return { channel: "sms", outcome: "failed", reason: error.message || "send_failed" };
  }
}

async function sendEmailWithSendGrid(to, subject, text) {
  if (!to) return { channel: "email", outcome: "skipped", reason: "no_recipient" };
  if (!sendGridApiKey) return { channel: "email", outcome: "skipped", reason: "provider_not_configured" };
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendGridApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.SENDGRID_FROM_EMAIL || "noreply@salonai.app" },
        subject,
        content: [{ type: "text/plain", value: text }]
        })
    });
    if (!response.ok) {
      return { channel: "email", outcome: "failed", reason: `sendgrid_${response.status}` };
    }
    return { channel: "email", outcome: "sent" };
  } catch (error) {
    console.error("Email send failure:", error.message);
    return { channel: "email", outcome: "failed", reason: error.message || "send_failed" };
  }
}

async function buildFriendlyMessage(booking, businessName, deliveryType = "booking_confirmation") {
  const kind = String(deliveryType || "booking_confirmation").trim().toLowerCase();
  if (!openai) {
    return kind === "scheduled_reminder"
      ? `Reminder from ${businessName}: your ${booking.service} is booked for ${booking.date} at ${booking.time}.`
      : `Booking confirmed at ${businessName} for ${booking.service} on ${booking.date} at ${booking.time}.`;
  }
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            kind === "scheduled_reminder"
              ? "Create one short and friendly upcoming appointment reminder message."
              : "Create one short and friendly booking confirmation message."
        },
        {
          role: "user",
          content: `Business: ${businessName}. Service: ${booking.service}. Date: ${booking.date}. Time: ${booking.time}. Customer: ${booking.customerName}.`
        }
      ]
    });
    return completion.choices?.[0]?.message?.content?.trim() || "";
  } catch {
    return kind === "scheduled_reminder"
      ? `Reminder from ${businessName}: your ${booking.service} is booked for ${booking.date} at ${booking.time}.`
      : `Booking confirmed at ${businessName} for ${booking.service} on ${booking.date} at ${booking.time}.`;
  }
}

function buildManualFallbackRow(reason) {
  return { channel: "manual", outcome: "skipped", reason: reason || "manual_follow_up_required" };
}

export async function sendBookingNotifications({ businessName, booking, customerEmail, customerPhone, reminderSettings, deliveryType }) {
  const message = await buildFriendlyMessage(booking, businessName, deliveryType);
  const settings = reminderSettings && typeof reminderSettings === "object" ? reminderSettings : {};
  const liveRemindersEnabled = settings.liveRemindersEnabled !== false;
  const channelPreference = String(settings.channelPreference || "auto").trim().toLowerCase();
  const manualFallbackEnabled = settings.manualFallbackEnabled !== false;
  const subject = `Booking Confirmed - ${businessName}`;
  const channelResults = [];

  if (!liveRemindersEnabled || channelPreference === "manual") {
    channelResults.push({ channel: "sms", outcome: "skipped", reason: liveRemindersEnabled ? "manual_only" : "live_reminders_disabled" });
    channelResults.push({ channel: "email", outcome: "skipped", reason: liveRemindersEnabled ? "manual_only" : "live_reminders_disabled" });
    if (manualFallbackEnabled) channelResults.push(buildManualFallbackRow("manual_follow_up_selected"));
    return { message, channels: channelResults };
  }

  if (channelPreference === "sms") {
    const smsResult = await sendSms(customerPhone, message);
    channelResults.push(smsResult);
    if ((smsResult.outcome === "failed" || smsResult.outcome === "skipped") && manualFallbackEnabled) {
      channelResults.push(buildManualFallbackRow("sms_unavailable_manual_follow_up"));
    }
    return { message, channels: channelResults };
  }

  if (channelPreference === "email") {
    const emailResult = await sendEmailWithSendGrid(customerEmail, subject, message);
    channelResults.push(emailResult);
    if ((emailResult.outcome === "failed" || emailResult.outcome === "skipped") && manualFallbackEnabled) {
      channelResults.push(buildManualFallbackRow("email_unavailable_manual_follow_up"));
    }
    return { message, channels: channelResults };
  }

  channelResults.push(
    ...(await Promise.all([sendSms(customerPhone, message), sendEmailWithSendGrid(customerEmail, subject, message)]))
  );
  if (manualFallbackEnabled && channelResults.every((row) => row.outcome !== "sent")) {
    channelResults.push(buildManualFallbackRow("all_live_channels_unavailable"));
  }
  return {
    message,
    channels: channelResults
  };
}
