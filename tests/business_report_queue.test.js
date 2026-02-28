import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app, prisma } from "../server.js";

function makeToken(payload = {}) {
  return jwt.sign(
    {
      sub: payload.sub || "subscriber_report",
      role: payload.role || "subscriber",
      email: payload.email || "owner@example.com",
      businessId: payload.businessId || `biz_report_${Date.now()}`
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

describe("business report email queue", () => {
  it("queues a business report email request", async () => {
    const token = makeToken({ businessId: `biz_report_${Date.now()}` });
    const res = await request(app)
      .post("/api/business-reports/email")
      .set("Authorization", `Bearer ${token}`)
      .send({
        recipientEmail: "manager@example.com",
        subject: "Weekly report",
        note: "Please review before payroll",
        report: { metrics: { revenue: 1200 } }
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.queued).toBe(true);
    expect(res.body.deliveryMode).toBe("queue");
    expect(typeof res.body.id).toBe("string");
    expect(typeof res.body.queuedAt).toBe("string");
  });

  it("validates recipient email", async () => {
    const token = makeToken({ businessId: `biz_report_${Date.now()}` });
    const res = await request(app)
      .post("/api/business-reports/email")
      .set("Authorization", `Bearer ${token}`)
      .send({
        recipientEmail: "not-an-email",
        report: { metrics: {} }
      });

    expect(res.status).toBe(400);
    expect(String(res.body.error || "").toLowerCase()).toContain("invalid recipient email");
  });
});
