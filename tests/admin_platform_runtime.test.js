import { describe, expect, it, vi } from "vitest";
import { createAdminPlatformRuntime } from "../public/dashboard-admin-platform.js";

function createElement(initial = {}) {
  return {
    innerHTML: "",
    textContent: "",
    style: {
      setProperty: vi.fn()
    },
    ...initial
  };
}

function createHarness() {
  let adminPlatformAnalytics = null;
  let adminRevenueAnalytics = null;
  let adminUsageAnalytics = null;

  const fetchImpl = vi.fn();
  const setDashActionStatus = vi.fn();
  const renderAdminManagedBusinessSummary = vi.fn();
  const adminPlatformExportBtn = {
    listeners: {},
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    async dispatch(type, event = {}) {
      const handler = this.listeners[type];
      if (!handler) return undefined;
      return handler(event);
    }
  };

  const win = {
    URL: {
      createObjectURL: vi.fn(() => "blob:admin-export"),
      revokeObjectURL: vi.fn()
    }
  };
  const anchor = { click: vi.fn(), remove: vi.fn() };
  const doc = {
    body: { appendChild: vi.fn() },
    createElement: vi.fn(() => anchor)
  };

  const runtime = createAdminPlatformRuntime({
    win,
    doc,
    fetchImpl,
    getUserRole: () => "admin",
    headers: () => ({ Authorization: "Bearer test" }),
    escapeHtml: (value) => String(value ?? ""),
    formatMoney: (value) => `GBP ${Number(value || 0)}`,
    formatDateShort: (value) => String(value || "").slice(0, 10),
    setDashActionStatus,
    renderAdminManagedBusinessSummary,
    parseExportFileName: (value, fallback) => value || fallback,
    adminPlatformMetricGrid: createElement(),
    adminRevenueSummaryGrid: createElement(),
    adminRevenueMixChart: createElement(),
    adminRevenueHealthGauge: createElement(),
    adminRevenueYieldGauge: createElement(),
    adminRevenueTrendGraph: createElement(),
    adminRevenueMonthlyList: createElement(),
    adminRevenueSignalList: createElement(),
    adminRevenuePeriodPill: createElement(),
    adminRevenueNote: createElement(),
    adminUsageSummaryGrid: createElement(),
    adminUsageHourlyList: createElement(),
    adminUsageWeekdayList: createElement(),
    adminUsageRoleGrid: createElement(),
    adminUsageOperationsGrid: createElement(),
    adminUsagePeriodPill: createElement(),
    adminUsageNote: createElement(),
    adminPlatformExportBtn,
    getAdminPlatformAnalytics: () => adminPlatformAnalytics,
    setAdminPlatformAnalytics: (value) => {
      adminPlatformAnalytics = value;
    },
    getAdminRevenueAnalytics: () => adminRevenueAnalytics,
    setAdminRevenueAnalytics: (value) => {
      adminRevenueAnalytics = value;
    },
    getAdminUsageAnalytics: () => adminUsageAnalytics,
    setAdminUsageAnalytics: (value) => {
      adminUsageAnalytics = value;
    }
  });

  return {
    runtime,
    fetchImpl,
    setDashActionStatus,
    renderAdminManagedBusinessSummary,
    adminPlatformExportBtn,
    win,
    doc,
    anchor,
    getAdminPlatformAnalytics: () => adminPlatformAnalytics,
    getAdminRevenueAnalytics: () => adminRevenueAnalytics,
    getAdminUsageAnalytics: () => adminUsageAnalytics
  };
}

describe("admin platform runtime", () => {
  it("loads admin platform/revenue analytics and renders overview content", async () => {
    const harness = createHarness();
    harness.fetchImpl
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          analytics: {
            totalBusinesses: 12,
            totalUsers: 88,
            totalBookings: 430,
            cancelledBookings: 27,
            conversionRate: 63.5
          },
          usage: {
            hourly: [{ label: "09:00", total: 18, loginCount: 5, lexiCount: 6 }],
            weekdays: [{ label: "Mon", total: 43 }],
            summary: {
              periodDays: 14,
              busiestHourLabel: "09:00",
              quietestHourLabel: "02:00",
              bestUpdateWindowLabel: "02:00-05:00",
              bestUpdateWindowEvents: 7,
              roleCounts: { subscriber: 30, customer: 18, admin: 4, anonymous: 2 }
            }
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: {
            activeSubscriptions: 9,
            estimatedMrr: 441,
            avgPlanValue: 49,
            periodMonths: 6,
            estimatedRevenueInPeriod: 2646,
            subscriptionCancellationsInPeriod: 2,
            bookingCancellationsInPeriod: 11
          },
          monthly: [
            {
              label: "Jan",
              estimatedSubscriptionRevenue: 390,
              subscriptionCancellations: 1,
              bookingCancellations: 2
            }
          ],
          note: "Revenue trend is stable."
        })
      });

    await harness.runtime.loadAdminPlatformOverview();

    expect(harness.fetchImpl).toHaveBeenNthCalledWith(1, "/api/dashboard/admin", {
      headers: { Authorization: "Bearer test" }
    });
    expect(harness.fetchImpl).toHaveBeenNthCalledWith(2, "/api/dashboard/admin/revenue-analytics", {
      headers: { Authorization: "Bearer test" }
    });
    expect(harness.getAdminPlatformAnalytics()).toEqual(
      expect.objectContaining({
        analytics: expect.objectContaining({
          totalBusinesses: 12
        })
      })
    );
    expect(harness.getAdminRevenueAnalytics()).toEqual(
      expect.objectContaining({
        summary: expect.objectContaining({
          estimatedMrr: 441
        })
      })
    );
    expect(harness.getAdminUsageAnalytics()).toEqual(
      expect.objectContaining({
        summary: expect.objectContaining({
          periodDays: 14
        })
      })
    );
  });

  it("exports admin platform revenue analytics as CSV", async () => {
    const harness = createHarness();
    harness.fetchImpl.mockResolvedValueOnce({
      ok: true,
      headers: {
        get(name) {
          return name === "Content-Disposition" ? "admin_revenue_export.csv" : null;
        }
      },
      blob: async () => ({ size: 32 })
    });

    harness.runtime.bindAdminPlatformEvents();
    await harness.adminPlatformExportBtn.dispatch("click");

    expect(harness.fetchImpl).toHaveBeenCalledWith("/api/dashboard/admin/revenue-analytics/export?format=csv", {
      headers: { Authorization: "Bearer test" }
    });
    expect(harness.doc.createElement).toHaveBeenCalledWith("a");
    expect(harness.doc.body.appendChild).toHaveBeenCalledWith(harness.anchor);
    expect(harness.anchor.download).toBe("admin_revenue_export.csv");
    expect(harness.anchor.click).toHaveBeenCalled();
    expect(harness.win.URL.createObjectURL).toHaveBeenCalled();
    expect(harness.win.URL.revokeObjectURL).toHaveBeenCalledWith("blob:admin-export");
    expect(harness.setDashActionStatus).toHaveBeenCalledWith("Platform revenue CSV exported.");
  });

  it("falls back to mock admin analytics when live analytics are empty", async () => {
    const harness = createHarness();
    harness.fetchImpl
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          analytics: {
            totalBusinesses: 0,
            totalUsers: 0,
            totalBookings: 0,
            cancelledBookings: 0,
            conversionRate: 0
          },
          usage: {
            hourly: [],
            weekdays: [],
            summary: {
              periodDays: 14,
              busiestHourLabel: "00:00",
              quietestHourLabel: "00:00",
              bestUpdateWindowLabel: "00:00-03:00",
              bestUpdateWindowEvents: 0,
              roleCounts: { subscriber: 0, customer: 0, admin: 0, anonymous: 0 }
            }
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: {
            activeSubscriptions: 0,
            estimatedMrr: 0,
            avgPlanValue: 0,
            periodMonths: 6,
            estimatedRevenueInPeriod: 0,
            subscriptionCancellationsInPeriod: 0,
            bookingCancellationsInPeriod: 0
          },
          monthly: [],
          note: ""
        })
      });

    await harness.runtime.loadAdminPlatformOverview();

    expect(harness.getAdminPlatformAnalytics().analytics.totalBusinesses).toBeGreaterThan(0);
    expect(harness.getAdminRevenueAnalytics().summary.activeSubscriptions).toBeGreaterThan(0);
    expect(harness.getAdminUsageAnalytics().hourly.length).toBeGreaterThan(0);
    expect(harness.setDashActionStatus).toHaveBeenCalledWith(
      "Showing mock admin analytics so the dashboard stays fully populated.",
      false,
      2400
    );
  });
});
