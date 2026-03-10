import { describe, it, expect, vi } from "vitest";
import { createSubscriberBillingHandlers } from "../src/services/subscriber_billing_handlers.js";
import { createPayPalBillingService } from "../src/services/paypal_billing.js";

describe("billing redirect paths", () => {
  it("uses canonical /dashboard route for Stripe checkout and portal return URLs", async () => {
    const checkoutCreate = vi.fn().mockResolvedValue({ url: "https://stripe.example/session" });
    const portalCreate = vi.fn().mockResolvedValue({ url: "https://stripe.example/portal" });
    const prisma = {
      user: {
        findUnique: vi
          .fn()
          .mockResolvedValueOnce({ id: "user_1", email: "owner@example.com", businessId: "biz_1" })
          .mockResolvedValueOnce({ id: "user_1", email: "owner@example.com", businessId: "biz_1" })
      },
      business: {
        findUnique: vi.fn().mockResolvedValue({ id: "biz_1", name: "Glow Studio" })
      },
      subscription: {
        findUnique: vi.fn().mockResolvedValue({ id: "sub_1", stripeCustomerId: "cus_123" })
      }
    };
    const handlers = createSubscriberBillingHandlers({
      prisma,
      stripe: {
        checkout: { sessions: { create: checkoutCreate } },
        billingPortal: { sessions: { create: portalCreate } }
      },
      appUrl: "https://app.example.com",
      clearReadCache: vi.fn(),
      writeAuditLog: vi.fn(),
      paypalBillingService: { isPayPalConfigured: () => false },
      resolveManagedBusinessId: vi.fn(),
      subscriberMonthlyFeeGbp: 49,
      subscriberYearlyFeeGbp: 490,
      yearlyDiscountPercent: 17
    });

    const checkoutRes = { json: vi.fn(), status: vi.fn().mockReturnThis() };
    await handlers.createCheckoutSessionHandler(
      { auth: { sub: "user_1" }, body: { billingCycle: "monthly", priceId: "price_monthly_123" } },
      checkoutRes
    );

    expect(checkoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: "https://app.example.com/dashboard?billing=success",
        cancel_url: "https://app.example.com/dashboard?billing=cancel"
      })
    );

    const portalRes = { json: vi.fn(), status: vi.fn().mockReturnThis() };
    await handlers.createPortalSessionHandler({ auth: { sub: "user_1" } }, portalRes);

    expect(portalCreate).toHaveBeenCalledWith({
      customer: "cus_123",
      return_url: "https://app.example.com/dashboard"
    });
  });

  it("uses canonical /dashboard route for PayPal subscription redirects", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "access_token_1" })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "sub_123",
          links: [{ rel: "approve", href: "https://paypal.example/approve" }]
        })
      });

    const service = createPayPalBillingService({
      clientId: "client_1",
      clientSecret: "secret_1",
      env: "sandbox",
      appUrl: "https://app.example.com",
      fetchImpl
    });

    await service.createPayPalSubscriptionSession({
      planId: "plan_monthly",
      businessId: "biz_1",
      userId: "user_1",
      userEmail: "owner@example.com",
      billingCycle: "monthly"
    });

    const secondCall = fetchImpl.mock.calls[1];
    const payload = JSON.parse(secondCall[1].body);
    expect(payload.application_context.return_url).toBe(
      "https://app.example.com/dashboard?billing=success&provider=paypal"
    );
    expect(payload.application_context.cancel_url).toBe(
      "https://app.example.com/dashboard?billing=cancel&provider=paypal"
    );
  });
});
