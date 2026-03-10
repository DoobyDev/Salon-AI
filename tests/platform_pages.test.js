import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../server.js";

describe("platform page routes", () => {
  it("serves the canonical auth page route", async () => {
    const res = await request(app).get("/auth");
    expect(res.status).toBe(200);
    expect(String(res.text || "")).toContain("<!doctype html>");
  });

  it("serves the canonical dashboard page route", async () => {
    const res = await request(app).get("/dashboard");
    expect(res.status).toBe(200);
    expect(String(res.text || "")).toContain("<!doctype html>");
  });

  it("serves the canonical legal page route", async () => {
    const res = await request(app).get("/legal");
    expect(res.status).toBe(200);
    expect(String(res.text || "")).toContain("Legal &amp; Data Policies");
  });
});
