import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app, prisma } from "../server.js";

beforeEach(() => {
  prisma.user = {
    findFirst: vi.fn().mockResolvedValue({ id: "user_1" })
  };
});

describe("readiness endpoint", () => {
  it("returns ready when prisma responds", async () => {
    const res = await request(app).get("/readyz");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ready");
    expect(res.body.checks.prisma).toBe(true);
    expect(res.body.checks).toHaveProperty("redis");
    expect(res.body.checks).toHaveProperty("queues");
  });

  it("returns degraded when prisma is unavailable", async () => {
    prisma.user.findFirst.mockRejectedValue(new Error("db offline"));

    const res = await request(app).get("/readyz");

    expect(res.status).toBe(503);
    expect(res.body.status).toBe("degraded");
    expect(res.body.checks.prisma).toBe(false);
    expect(String(res.body.checks.prismaError || "")).toContain("db offline");
  });
});

describe("billing webhook guardrails", () => {
  it("rejects stripe webhook when stripe is not configured", async () => {
    const res = await request(app)
      .post("/api/billing/webhook")
      .set("Content-Type", "application/json")
      .send({ id: "evt_test", type: "checkout.session.completed" });

    expect(res.status).toBe(400);
    expect(
      ["Stripe not configured", "Missing signature"].some((msg) => res.text.includes(msg))
    ).toBe(true);
  });

  it("rejects paypal webhook when paypal is not configured", async () => {
    const res = await request(app)
      .post("/api/billing/paypal-webhook")
      .send({ event_type: "BILLING.SUBSCRIPTION.ACTIVATED" });

    expect(res.status).toBe(400);
    expect(
      ["PayPal not configured", "PayPal webhook signature invalid"].some((msg) => res.text.includes(msg))
    ).toBe(true);
  });
});
