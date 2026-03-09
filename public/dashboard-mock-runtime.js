// Mock/demo dashboard data bootstrap.
export function createMockDashboardRuntime(deps) {
  const {
    doc = document,
    getUserRole,
    getManagedBusinessId,
    setManagedBusinessId,
    setAdminBusinessOptions,
    adminBusinessSelect,
    setAdminBusinessStatus,
    setBillingSummary,
    renderSubscriberBillingControls,
    setBusinessProfileFormValues,
    setBusinessProfileStatus,
    setSocialMediaFormValues,
    renderSocialMediaPreview,
    clearMetricsGrid,
    addMetric,
    setBookingRows,
    setNextBookingsCursor,
    updateLoadMoreState,
    applyBookingFilters,
    renderSubscriberCalendar,
    setAccountingRows,
    renderAccountingIntegrations,
    setAccountingStatus,
    getAccountingLiveTimeframe,
    setAccountingLivePayload,
    renderAccountingLiveRevenue,
    setSubscriberCommandCenter,
    renderCommandCenter,
    setStaffRosterRows,
    setStaffSummary,
    renderStaffSummary,
    renderStaffRoster,
    setStaffStatus,
    setWaitlistRows,
    setWaitlistSummary,
    renderWaitlistSummary,
    renderWaitlist,
    setWaitlistStatus,
    setOperationsInsights,
    renderOperationsInsights,
    setOperationsStatus,
    setCrmSegmentsPayload,
    renderCrmSegments,
    setCrmStatus,
    setCommercialPayload,
    renderCommercialControls,
    renderMerchControls,
    setCommercialStatus,
    setMerchStatus,
    setRevenueAttributionPayload,
    renderRevenueAttribution,
    setRevenueStatus,
    setProfitabilityPayload,
    renderProfitabilitySummary,
    setProfitabilityStatus,
    renderBusinessGrowthPanel,
    enforceDashboardRoleLayoutVisibility,
    renderExecutivePulse
  } = deps || {};

  function loadMockDashboard() {
    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const year = now.getFullYear();
    const mm = String(thisMonth).padStart(2, "0");

    setBillingSummary?.({
      planLabel: "Pro Monthly",
      status: "active",
      billingCycle: "monthly",
      currentPeriodEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 24).toISOString(),
      monthlyFee: 49.99,
      yearlyFee: 499.99,
      yearlyDiscountPercent: 16.7,
      autoRenew: true
    });

    if (getUserRole?.() === "admin") {
      const mockAdminBusinessId = String(getManagedBusinessId?.() || "mock-admin-biz-lumen").trim();
      setManagedBusinessId?.(mockAdminBusinessId);
      const adminBusinessOptions = [
        { id: mockAdminBusinessId, name: "Lumen Studio", city: "Manchester", country: "United Kingdom" },
        { id: "mock-admin-biz-north-lane", name: "North Lane Studio", city: "Chester", country: "United Kingdom" },
        { id: "mock-admin-biz-river-and-rose", name: "River & Rose Salon", city: "Liverpool", country: "United Kingdom" },
        { id: "mock-admin-biz-crown-barber", name: "Crown Barber Co.", city: "Leeds", country: "United Kingdom" },
        { id: "mock-admin-biz-atelier-beauty", name: "Atelier Beauty Rooms", city: "Birmingham", country: "United Kingdom" }
      ];
      setAdminBusinessOptions?.(adminBusinessOptions);
      if (adminBusinessSelect) {
        adminBusinessSelect.innerHTML = "";
        adminBusinessOptions.forEach((business) => {
          const option = doc.createElement("option");
          option.value = String(business.id || "");
          const location = [business.city, business.country].filter(Boolean).join(", ");
          option.textContent = location ? `${business.name} (${location})` : String(business.name || "Unnamed business");
          adminBusinessSelect.appendChild(option);
        });
        adminBusinessSelect.value = mockAdminBusinessId;
      }
      setAdminBusinessStatus?.(`Viewing ${adminBusinessOptions.find((b) => b.id === mockAdminBusinessId)?.name || "selected business"} (mock data).`);
    }

    renderSubscriberBillingControls?.();
    setBusinessProfileFormValues?.({
      name: "Lumen Studio",
      type: "hair_salon",
      phone: "+44 161 555 0101",
      email: "hello@lumenstudio.example",
      city: "Manchester",
      country: "United Kingdom",
      postcode: "M1 2AB",
      address: "18 King Street, Manchester",
      description: "Modern salon offering color, styling, and front-desk AI booking support with Lexi.",
      websiteUrl: "https://lumenstudio.example",
      websiteTitle: "Lumen Studio",
      websiteSummary: "Premium color and styling salon with AI-assisted bookings and fast front-desk support.",
      websiteImageUrl: "/LEXI_IMG.png",
      hours: {
        monday: "09:00 - 18:00",
        tuesday: "09:00 - 18:00",
        wednesday: "09:00 - 19:00",
        thursday: "09:00 - 19:00",
        friday: "09:00 - 19:00",
        saturday: "08:30 - 17:00",
        sunday: "Closed"
      },
      services: [
        { name: "Cut + Blowdry", durationMin: 60, price: 55 },
        { name: "Balayage + Toner", durationMin: 150, price: 145 },
        { name: "Gloss + Blowdry", durationMin: 75, price: 68 },
        { name: "Keratin Treatment", durationMin: 120, price: 160 }
      ]
    });
    setBusinessProfileStatus?.("Mock business profile loaded.");

    const mockSocial = {
      socialFacebook: "https://facebook.com/lumenstudio.example",
      socialInstagram: "https://instagram.com/lumenstudio.example",
      socialTwitter: "",
      socialLinkedin: "",
      socialTiktok: "https://tiktok.com/@lumenstudio.example",
      customSocial: "https://linktr.ee/lumenstudio",
      socialImageUrl: "/LEXI_IMG.png"
    };
    setSocialMediaFormValues?.(mockSocial);
    renderSocialMediaPreview?.(mockSocial);

    clearMetricsGrid?.();
    addMetric?.("monthlyBookings", "128");
    addMetric?.("monthlyRevenue", "Â£14,920");
    addMetric?.("noShowRate", "3.6%");
    addMetric?.("repeatClientRate", "62%");

    setBookingRows?.([
      { id: "b1", customerName: "Ava Thompson", service: "Balayage + Toner", date: `${year}-${mm}-06`, time: "10:30", status: "confirmed", businessName: "Lumen Studio", createdAt: `${year}-${mm}-01T10:30:00Z` },
      { id: "b2", customerName: "Daniel Ruiz", service: "Skin Fade", date: `${year}-${mm}-08`, time: "14:00", status: "completed", businessName: "Lumen Studio", createdAt: `${year}-${mm}-02T11:00:00Z` },
      { id: "b2a", customerName: "Jade Carter", service: "Gloss + Blowdry", date: `${year}-${mm}-09`, time: "11:30", status: "pending_confirmation", businessName: "Lumen Studio", createdAt: `${year}-${mm}-02T15:20:00Z` },
      { id: "b3", customerName: "Priya Nair", service: "Blowout", date: `${year}-${mm}-12`, time: "16:15", status: "confirmed", businessName: "Lumen Studio", createdAt: `${year}-${mm}-03T12:00:00Z` },
      { id: "b4", customerName: "Mason Lee", service: "Beard Trim", date: `${year}-${mm}-15`, time: "09:45", status: "cancelled", businessName: "Lumen Studio", createdAt: `${year}-${mm}-04T12:10:00Z` },
      { id: "b5", customerName: "Chloe Martin", service: "Keratin Treatment", date: `${year}-${mm}-21`, time: "13:30", status: "confirmed", businessName: "Lumen Studio", createdAt: `${year}-${mm}-05T13:20:00Z` }
    ]);
    setNextBookingsCursor?.(null);
    updateLoadMoreState?.(false);
    applyBookingFilters?.();
    renderSubscriberCalendar?.();

    setAccountingRows?.([
      { provider: "quickbooks", status: "connected", connected: true, accountLabel: "Main Ledger", syncMode: "daily", updatedAt: new Date(now.getTime() - 86400000).toISOString() },
      { provider: "xero", status: "not_connected", connected: false, accountLabel: "", syncMode: "weekly", updatedAt: null },
      { provider: "freshbooks", status: "not_connected", connected: false, accountLabel: "", syncMode: "manual", updatedAt: null }
    ]);
    renderAccountingIntegrations?.();
    setAccountingStatus?.("Mock data loaded.");
    setAccountingLivePayload?.({
      timeframe: getAccountingLiveTimeframe?.(),
      generatedAt: new Date().toISOString(),
      refreshIntervalSec: 15,
      cards: {
        todayRevenue: 1860,
        todayCancelledRevenue: 190,
        todayBookings: 14,
        todayCancellations: 2,
        lastHourRevenue: 340,
        last15MinRevenue: 110,
        lastHourBookings: 3
      },
      gauges: {
        dailyTarget: 2500,
        targetProgressPct: 74.4,
        cancellationRatePct: 14.3
      },
      stream: {
        hourly: [
          { label: "9 AM", revenue: 180, cancellations: 0 },
          { label: "10 AM", revenue: 260, cancellations: 1 },
          { label: "11 AM", revenue: 320, cancellations: 0 },
          { label: "12 PM", revenue: 210, cancellations: 1 },
          { label: "1 PM", revenue: 410, cancellations: 0 },
          { label: "2 PM", revenue: 340, cancellations: 0 }
        ],
        weekly: []
      }
    });
    renderAccountingLiveRevenue?.();

    setSubscriberCommandCenter?.({
      today: { totalBookings: 6, confirmedBookings: 5, estimatedRevenue: 860, lastMinuteCancellations: 1 },
      next7Days: { confirmedBookings: 19, estimatedRevenue: 3240 },
      serviceHealth: { cancellationRate: 7.2 },
      recommendedActions: [
        { label: "Fill cancellation gaps", detail: "1 last-minute cancellation today. Offer waitlist slot." },
        { label: "Boost today's demand", detail: "Send same-day campaign to inactive clients." }
      ]
    });
    renderCommandCenter?.();

    setStaffRosterRows?.([
      { id: "s1", name: "Jordan Miles", role: "stylist", availability: "on_duty", shiftDays: ["mon", "tue", "wed"] },
      { id: "s2", name: "Amira Cole", role: "stylist", availability: "on_duty", shiftDays: ["thu", "fri", "sat"] },
      { id: "s3", name: "Riley West", role: "receptionist", availability: "off_duty", shiftDays: ["mon", "fri"] }
    ]);
    setStaffSummary?.({
      totalMembers: 3,
      onDutyCount: 2,
      offDutyCount: 1,
      scheduledTodayCount: 2,
      estimatedChairCapacityToday: 12
    });
    renderStaffSummary?.();
    renderStaffRoster?.();
    setStaffStatus?.("Mock roster loaded.");

    setWaitlistRows?.([
      { id: "w1", customerName: "Lina Patel", customerPhone: "+12025550111", customerEmail: "", service: "Skin Fade", preferredDate: "", preferredTime: "", status: "waiting" },
      { id: "w2", customerName: "Owen Price", customerPhone: "", customerEmail: "owen@example.com", service: "Blowout", preferredDate: "", preferredTime: "", status: "contacted" }
    ]);
    setWaitlistSummary?.({
      totalEntries: 2,
      waitingCount: 1,
      contactedCount: 1,
      bookedCount: 0
    });
    renderWaitlistSummary?.();
    renderWaitlist?.();
    setWaitlistStatus?.("Mock waitlist loaded.");

    setOperationsInsights?.({
      noShowRisk: [
        {
          bookingId: "b4",
          customerName: "Mason Lee",
          service: "Beard Trim",
          date: `${year}-${mm}-15`,
          time: "09:45",
          riskScore: 74,
          riskLevel: "high",
          reasons: ["Very short lead time.", "Moderate previous cancellation rate."]
        }
      ],
      rebookingPrompts: [
        {
          customerKey: "email:owen@example.com",
          customerName: "Owen Price",
          lastService: "Blowout",
          daysSinceLastVisit: 36,
          suggestedMessage: "Hi Owen Price, it has been 36 days since your Blowout. We have new availability this week and would love to book your next visit."
        }
      ]
    });
    renderOperationsInsights?.();
    setOperationsStatus?.("Operations insights loaded.");

    setCrmSegmentsPayload?.({
      summary: { totalCustomers: 14, actionableLeads: 4 },
      segments: [
        {
          id: "high_value_lapsed",
          label: "High-Value Lapsed",
          leads: [
            {
              customerKey: "email:ava@example.com",
              customerName: "Ava Thompson",
              message: "Hi Ava Thompson, we miss seeing you. Enjoy a loyalty priority slot this week for your next visit."
            }
          ]
        },
        {
          id: "new_clients_followup",
          label: "New Client Follow-Up",
          leads: [
            {
              customerKey: "email:daniel@example.com",
              customerName: "Daniel Ruiz",
              message: "Hi Daniel Ruiz, thanks for visiting us. We would love to welcome you back with a tailored follow-up appointment."
            }
          ]
        }
      ]
    });
    renderCrmSegments?.();
    setCrmStatus?.("CRM segments loaded.");

    setCommercialPayload?.({
      memberships: [
        { id: "m1", name: "Platinum Grooming Club", price: 79, billingCycle: "monthly", status: "active", benefits: "2 cuts + priority booking" }
      ],
      packages: [
        { id: "p1", name: "6x Blowout Bundle", price: 250, sessionCount: 6, remainingSessions: 4, status: "active" }
      ],
      giftCards: [
        {
          id: "g1",
          code: "GIFT-AB12CD34",
          purchaserName: "Lina Patel",
          recipientName: "Owen Price",
          initialBalance: 120,
          remainingBalance: 90,
          status: "active",
          issuedAt: new Date(now.getTime() - 172800000).toISOString(),
          expiresAt: null
        }
      ],
      merch: [
        {
          id: "m1",
          name: "Gloss Repair Serum",
          description: "Retail repair serum for shine, softness, and smoother blow-dries between salon visits.",
          imageUrl: "/icons/barber.svg",
          salePrice: 24,
          shippingAvailable: true,
          shippingCost: 4.99,
          inventory: 12,
          status: "active",
          shipments: [
            {
              id: "ms1",
              customerName: "Emma Cole",
              customerEmail: "emma.cole@example.com",
              shippingAddress: "17 Market Street",
              shippingCity: "Manchester",
              shippingPostcode: "M1 2AB",
              shippingCountry: "United Kingdom",
              shippingFee: 4.99,
              trackingRef: "TRACK-2048",
              status: "shipped",
              createdAt: new Date(now.getTime() - 86400000).toISOString(),
              updatedAt: new Date(now.getTime() - 43200000).toISOString()
            }
          ]
        }
      ],
      summary: {
        activeMemberships: 1,
        activePackages: 1,
        activeGiftCards: 1,
        outstandingGiftBalance: 90,
        activeMerchItems: 1,
        shippableMerchItems: 1,
        pendingMerchShipments: 1,
        merchCatalogValue: 288
      }
    });
    renderCommercialControls?.();
    renderMerchControls?.();
    setCommercialStatus?.("Commercial controls loaded.");
    setMerchStatus?.("Merch catalog loaded.");

    setRevenueAttributionPayload?.({
      channels: [
        { channel: "direct", label: "Direct", bookings: 9, cancelledBookings: 1, revenue: 1260, spend: 120, sharePercent: 56.3, roiPercent: 950 },
        { channel: "instagram", label: "Instagram", bookings: 4, cancelledBookings: 0, revenue: 580, spend: 220, sharePercent: 25, roiPercent: 163.6 },
        { channel: "ai_assistant", label: "AI Assistant", bookings: 3, cancelledBookings: 0, revenue: 430, spend: 0, sharePercent: 18.7, roiPercent: null }
      ],
      summary: {
        totalRevenue: 2270,
        totalSpend: 340,
        totalAttributedBookings: 16,
        blendedRoiPercent: 567.6,
        bestRevenueChannel: "direct",
        bestRoiChannel: "direct"
      }
    });
    renderRevenueAttribution?.();
    setRevenueStatus?.("Revenue attribution loaded.");

    setProfitabilityPayload?.({
      payrollEntries: [
        { id: "pr1", staffName: "Jordan Miles", role: "Barber", hours: 38, hourlyRate: 22, bonus: 75 },
        { id: "pr2", staffName: "Amira Cole", role: "Stylist", hours: 34, hourlyRate: 24, bonus: 90 }
      ],
      fixedCosts: { rent: 2200, utilities: 320, software: 210, other: 180 },
      cogsPercent: 12,
      summary: {
        grossRevenue: 2270,
        nonCancelledBookings: 16,
        averageTicket: 141.88,
        payrollTotal: 1819,
        fixedCostsTotal: 2910,
        cogsAmount: 272.4,
        totalCosts: 5001.4,
        estimatedProfit: -2731.4,
        profitMarginPercent: -120.3,
        breakevenRevenue: 5373.86
      }
    });
    renderProfitabilitySummary?.();
    setProfitabilityStatus?.("Profitability summary loaded.");
    renderBusinessGrowthPanel?.();
    enforceDashboardRoleLayoutVisibility?.();
    renderExecutivePulse?.();
  }

  return {
    loadMockDashboard
  };
}
