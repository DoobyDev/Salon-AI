export function createAppRuntimeConfig({
  OpenAI,
  Stripe,
  insecureJwtSecret
} = {}) {
  const port = Number(process.env.PORT || 3000);
  const jwtSecret = process.env.JWT_SECRET || insecureJwtSecret;
  const openAiKey = process.env.OPENAI_API_KEY || "";
  const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const paypalClientId = String(process.env.PAYPAL_CLIENT_ID || "").trim();
  const paypalClientSecret = String(process.env.PAYPAL_CLIENT_SECRET || "").trim();
  const paypalEnv = String(process.env.PAYPAL_ENV || "sandbox").trim().toLowerCase();
  const paypalWebhookId = String(process.env.PAYPAL_WEBHOOK_ID || "").trim();
  const appUrl = process.env.APP_URL || `http://localhost:${port}`;
  const configuredCorsOrigin = String(process.env.CORS_ORIGIN || "").trim();
  const corsOrigin = configuredCorsOrigin || (process.env.NODE_ENV === "production" ? appUrl : "*");
  const openai = openAiKey ? new OpenAI({ apiKey: openAiKey }) : null;
  const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

  return {
    port,
    jwtSecret,
    openAiKey,
    stripeWebhookSecret,
    paypalClientId,
    paypalClientSecret,
    paypalEnv,
    paypalWebhookId,
    appUrl,
    corsOrigin,
    openai,
    stripe
  };
}
