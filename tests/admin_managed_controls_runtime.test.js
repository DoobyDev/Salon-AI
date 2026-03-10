import { describe, expect, it, vi } from "vitest";
import { createAdminManagedControlsRuntime } from "../public/dashboard-admin-managed-controls.js";

function createElement(initial = {}) {
  return {
    value: "",
    listeners: {},
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    async dispatch(type, event = {}) {
      const handler = this.listeners[type];
      if (!handler) return undefined;
      return handler(event);
    },
    ...initial
  };
}

describe("admin managed controls runtime", () => {
  it("opens calendar and hub sections for the selected managed business", async () => {
    const subscriberCalendarSection = { scrollIntoView: vi.fn() };
    const businessGrowthSection = { scrollIntoView: vi.fn() };
    const showSection = vi.fn();
    const adminManagedOpenCalendarBtn = createElement();
    const adminManagedOpenHubBtn = createElement();

    const runtime = createAdminManagedControlsRuntime({
      getUserRole: () => "admin",
      getManagedBusinessId: () => "biz_1",
      getAdminBusinessOptions: () => [{ id: "biz_1", name: "North Lane Studio" }],
      showSection,
      openInteractiveModulePopup: vi.fn(),
      openBusinessAiChatPopup: vi.fn(),
      subscriberCalendarSection,
      businessGrowthSection,
      adminManagedOpenCalendarBtn,
      adminManagedOpenHubBtn,
      adminManagedOpenProfileBtn: createElement(),
      adminManagedAskLexiBtn: createElement(),
      adminCopilotInput: createElement(),
      adminCopilotForm: { requestSubmit: vi.fn() }
    });

    runtime.bindAdminManagedControlsEvents();

    await adminManagedOpenCalendarBtn.dispatch("click");
    await adminManagedOpenHubBtn.dispatch("click");

    expect(showSection).toHaveBeenNthCalledWith(1, subscriberCalendarSection);
    expect(showSection).toHaveBeenNthCalledWith(2, businessGrowthSection);
    expect(subscriberCalendarSection.scrollIntoView).toHaveBeenCalled();
    expect(businessGrowthSection.scrollIntoView).toHaveBeenCalled();
  });

  it("opens business profile and primes admin Lexi guidance for the selected business", async () => {
    const openInteractiveModulePopup = vi.fn();
    const openBusinessAiChatPopup = vi.fn();
    const adminCopilotInput = createElement();
    const adminCopilotForm = { requestSubmit: vi.fn() };
    const adminManagedOpenProfileBtn = createElement();
    const adminManagedAskLexiBtn = createElement();

    const runtime = createAdminManagedControlsRuntime({
      getUserRole: () => "admin",
      getManagedBusinessId: () => "biz_1",
      getAdminBusinessOptions: () => [{ id: "biz_1", name: "North Lane Studio" }],
      showSection: vi.fn(),
      openInteractiveModulePopup,
      openBusinessAiChatPopup,
      subscriberCalendarSection: { scrollIntoView: vi.fn() },
      businessGrowthSection: { scrollIntoView: vi.fn() },
      adminManagedOpenCalendarBtn: createElement(),
      adminManagedOpenHubBtn: createElement(),
      adminManagedOpenProfileBtn,
      adminManagedAskLexiBtn,
      adminCopilotInput,
      adminCopilotForm
    });

    runtime.bindAdminManagedControlsEvents();

    await adminManagedOpenProfileBtn.dispatch("click");
    await adminManagedAskLexiBtn.dispatch("click");

    expect(openInteractiveModulePopup).toHaveBeenCalledWith("business_information");
    expect(adminCopilotInput.value).toContain("Review North Lane Studio.");
    expect(openBusinessAiChatPopup).toHaveBeenCalledWith("admin", { trigger: adminManagedAskLexiBtn });
    expect(adminCopilotForm.requestSubmit).toHaveBeenCalled();
  });

  it("ignores managed-business controls when no admin-managed business is selected", async () => {
    const showSection = vi.fn();
    const openInteractiveModulePopup = vi.fn();

    const adminManagedOpenCalendarBtn = createElement();
    const adminManagedOpenHubBtn = createElement();
    const adminManagedOpenProfileBtn = createElement();

    const runtime = createAdminManagedControlsRuntime({
      getUserRole: () => "admin",
      getManagedBusinessId: () => "",
      getAdminBusinessOptions: () => [],
      showSection,
      openInteractiveModulePopup,
      openBusinessAiChatPopup: vi.fn(),
      subscriberCalendarSection: { scrollIntoView: vi.fn() },
      businessGrowthSection: { scrollIntoView: vi.fn() },
      adminManagedOpenCalendarBtn,
      adminManagedOpenHubBtn,
      adminManagedOpenProfileBtn,
      adminManagedAskLexiBtn: createElement(),
      adminCopilotInput: createElement(),
      adminCopilotForm: { requestSubmit: vi.fn() }
    });

    runtime.bindAdminManagedControlsEvents();

    await adminManagedOpenCalendarBtn.dispatch("click");
    await adminManagedOpenHubBtn.dispatch("click");
    await adminManagedOpenProfileBtn.dispatch("click");

    expect(showSection).not.toHaveBeenCalled();
    expect(openInteractiveModulePopup).not.toHaveBeenCalled();
  });
});
