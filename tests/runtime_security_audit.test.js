import { describe, expect, it } from "vitest";
import { assertSecureRuntimeSettings } from "../src/services/runtime_security_audit.js";

describe("runtime security audit", () => {
  it("allows insecure defaults outside production", () => {
    expect(() =>
      assertSecureRuntimeSettings({
        nodeEnv: "development",
        jwtSecret: "dev-insecure-change-me",
        insecureJwtSecret: "dev-insecure-change-me",
        corsOrigin: "*"
      })
    ).not.toThrow();
  });

  it("rejects insecure JWT configuration in production", () => {
    expect(() =>
      assertSecureRuntimeSettings({
        nodeEnv: "production",
        jwtSecret: "dev-insecure-change-me",
        insecureJwtSecret: "dev-insecure-change-me",
        corsOrigin: "https://app.example.com"
      })
    ).toThrow(/JWT_SECRET is insecure/i);
  });

  it("rejects wildcard CORS in production", () => {
    expect(() =>
      assertSecureRuntimeSettings({
        nodeEnv: "production",
        jwtSecret: "a-very-secure-random-value",
        insecureJwtSecret: "dev-insecure-change-me",
        corsOrigin: "*"
      })
    ).toThrow(/CORS_ORIGIN cannot be '\*' in production/i);
  });
});
