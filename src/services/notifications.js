import twilio from "twilio";
import OpenAI from "openai";

const twilioSid = process.env.TWILIO_ACCOUNT_SID || "";
const twilioToken = process.env.TWILIO_AUTH_TOKEN || "";
const twilioFrom = process.env.TWILIO_FROM_NUMBER || "";
const sendGridApiKey = process.env.SENDGRID_API_KEY || "";
const openAiKey = process.env.OPENAI_API_KEY || "";

const twilioClient = twilioSid && twilioToken ? twilio(twilioSid, twilioToken) : null;
const openai = openAiKey ? new OpenAI({ apiKey: openAiKey }) : null;

async function sendSms(to, body) {
  if (!twilioClient || !twilioFrom || !to) return;
  try {
    await twilioClient.messages.create({ from: twilioFrom, to, body });
  } catch (error) {
    console.error("SMS send failure:", error.message);
  }
}

async function sendEmailWithSendGrid(to, subject, text) {
  if (!sendGridApiKey || !to) return;
  try {
    await fetch("https://api.sendgrid.com/v3/mail/send", {
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
  } catch (error) {
    console.error("Email send failure:", error.message);
  }
}

async function buildFriendlyMessage(booking, businessName) {
  if (!openai) {
    return `Booking confirmed at ${businessName} for ${booking.service} on ${booking.date} at ${booking.time}.`;
  }
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "Create one short and friendly booking confirmation message."
        },
        {
          role: "user",
          content: `Business: ${businessName}. Service: ${booking.service}. Date: ${booking.date}. Time: ${booking.time}. Customer: ${booking.customerName}.`
        }
      ]
    });
    return completion.choices?.[0]?.message?.content?.trim() || "";
  } catch {
    return `Booking confirmed at ${businessName} for ${booking.service} on ${booking.date} at ${booking.time}.`;
  }
}

export async function sendBookingNotifications({ businessName, booking, customerEmail, customerPhone }) {
  const message = await buildFriendlyMessage(booking, businessName);
  await Promise.all([
    sendSms(customerPhone, message),
    sendEmailWithSendGrid(customerEmail, `Booking Confirmed - ${businessName}`, message)
  ]);
}
