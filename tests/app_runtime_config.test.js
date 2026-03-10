import { afterEach, describe, expect, it, vi } from "vitest";
import { createAppRuntimeConfig } from "../src/services/app_runtime_config.js";

const ORIGINAL_ENV = { ...process.env };

describe("app runtime config", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.restoreAllMocks();
  });

  it("defaults app URL to localhost port and uses wildcard CORS outside production", () => {
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: "development",
      PORT: "3130",
      APP_URL: "",
      CORS_ORIGIN: "",
      OPENAI_API_KEY: "",
      STRIPE_SECRET_KEY: ""
    };

    const OpenAI = vi.fn();
    const Stripe = vi.fn();
    const config = createAppRuntimeConfig({
      OpenAI,
      Stripe,
      insecureJwtSecret: "dev-insecure-change-me"
    });

    expect(config.appUrl).toBe("http://localhost:3130");
    expect(config.corsOrigin).toBe("*");
    expect(config.openai).toBeNull();
    expect(config.stripe).toBeNull();
  });

  it("falls back CORS to APP_URL in production when CORS_ORIGIN is unset", () => {
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: "production",
      PORT: "3000",
      APP_URL: "https://app.example.com",
      CORS_ORIGIN: "",
      OPENAI_API_KEY: "",
      STRIPE_SECRET_KEY: ""
    };

    const config = createAppRuntimeConfig({
      OpenAI: vi.fn(),
      Stripe: vi.fn(),
      insecureJwtSecret: "dev-insecure-change-me"
    });

    expect(config.appUrl).toBe("https://app.example.com");
    expect(config.corsOrigin).toBe("https://app.example.com");
  });

  it("initializes OpenAI and Stripe clients when keys are present", () => {
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: "production",
      APP_URL: "https://app.example.com",
      CORS_ORIGIN: "https://app.example.com",
      OPENAI_API_KEY: "openai_key_123",
      STRIPE_SECRET_KEY: "stripe_key_456",
      STRIPE_WEBHOOK_SECRET: "whsec_789"
    };

    const openAiInstance = { client: "openai" };
    const stripeInstance = { client: "stripe" };
    const OpenAI = vi.fn().mockImplementation(() => openAiInstance);
    const Stripe = vi.fn().mockImplementation(() => stripeInstance);

    const config = createAppRuntimeConfig({
      OpenAI,
      Stripe,
      insecureJwtSecret: "dev-insecure-change-me"
    });

    expect(OpenAI).toHaveBeenCalledWith({ apiKey: "openai_key_123" });
    expect(Stripe).toHaveBeenCalledWith("stripe_key_456");
    expect(config.openai).toBe(openAiInstance);
    expect(config.stripe).toBe(stripeInstance);
    expect(config.stripeWebhookSecret).toBe("whsec_789");
  });
});
