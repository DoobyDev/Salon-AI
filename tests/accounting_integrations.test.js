import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app, prisma } from "../server.js";

function makeToken(payload = {}) {
  return jwt.sign(
    {
      sub: payload.sub || "subscriber_acc",
      role: payload.role || "subscriber",
      email: payload.email || "owner@example.com",
      businessId: payload.businessId || `biz_acc_${Date.now()}`
    },
    process.env.JWT_SECRET || "dev-insecure-change-me",
    { expiresIn: "1h" }
  );
}

beforeEach(() => {
  prisma.auditLog = {
    create: vi.fn().mockResolvedValue({})
  };
});

describe("accounting integrations", () => {
  it("connects, lists, and disconnects a provider", async () => {
    const businessId = `biz_acc_${Date.now()}`;
    const token = makeToken({ businessId });

    const connectRes = await request(app)
      .post("/api/accounting-integrations/connect")
      .set("Authorization", `Bearer ${token}`)
      .send({ provider: "xero", accountLabel: "Main Ledger", syncMode: "daily" });
    expect(connectRes.status).toBe(200);
    expect(connectRes.body.provider.provider).toBe("xero");
    expect(connectRes.body.provider.status).toBe("connected");

    const listRes = await request(app)
      .get("/api/accounting-integrations")
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    const xero = listRes.body.providers.find((row) => row.provider === "xero");
    expect(xero).toBeTruthy();
    expect(xero.connected).toBe(true);

    const disconnectRes = await request(app)
      .post("/api/accounting-integrations/xero/disconnect")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(disconnectRes.status).toBe(200);
    expect(disconnectRes.body.provider.status).toBe("not_connected");
  });
});
