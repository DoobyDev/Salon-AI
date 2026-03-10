import { describe, expect, it, vi } from "vitest";
import { createBookingFilterRuntime } from "../public/dashboard-booking-filters.js";

function createButton() {
  return {
    classList: {
      toggle: vi.fn()
    }
  };
}

describe("booking filter runtime", () => {
  it("updates booking range controls and selection status from filter state", () => {
    const bookingRangeToday = createButton();
    const bookingRangeWeek = createButton();
    const bookingRangeMonth = createButton();
    const bookingRangeClear = createButton();
    const bookingCalendarSelectionStatus = { textContent: "" };

    const runtime = createBookingFilterRuntime({
      bookingRangeToday,
      bookingRangeWeek,
      bookingRangeMonth,
      bookingRangeClear,
      bookingCalendarSelectionStatus,
      getBookingDateFilterPreset: () => "week",
      getSelectedCalendarDateKey: () => "",
      getBookingDateFilterKeys: () => new Set(["2026-03-10"]),
      getBookingDateFilterLabel: () => "This Week",
      setBookingDateFilterState: vi.fn(),
      applyBookingFilters: vi.fn(),
      renderSubscriberCalendar: vi.fn(),
      toDateKey: (date) => date.toISOString().slice(0, 10)
    });

    runtime.updateBookingRangeControls();

    expect(bookingRangeWeek.classList.toggle).toHaveBeenCalledWith("active", true);
    expect(bookingRangeToday.classList.toggle).toHaveBeenCalledWith("active", false);
    expect(bookingCalendarSelectionStatus.textContent).toBe("Calendar filter: This Week");
  });

  it("applies date presets and clears them when requested", () => {
    const setBookingDateFilterState = vi.fn();
    const applyBookingFilters = vi.fn();
    const renderSubscriberCalendar = vi.fn();

    const runtime = createBookingFilterRuntime({
      bookingRangeToday: createButton(),
      bookingRangeWeek: createButton(),
      bookingRangeMonth: createButton(),
      bookingRangeClear: createButton(),
      bookingCalendarSelectionStatus: { textContent: "" },
      getBookingDateFilterPreset: () => "",
      getSelectedCalendarDateKey: () => "",
      getBookingDateFilterKeys: () => null,
      getBookingDateFilterLabel: () => "All dates",
      setBookingDateFilterState,
      applyBookingFilters,
      renderSubscriberCalendar,
      toDateKey: (date) => date.toISOString().slice(0, 10)
    });

    runtime.applyBookingDatePreset("today");
    expect(setBookingDateFilterState).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "Today",
        preset: "today",
        selectedDateKey: "",
        keys: expect.any(Set)
      })
    );

    runtime.applyBookingDatePreset("");
    expect(setBookingDateFilterState).toHaveBeenLastCalledWith(
      expect.objectContaining({
        keys: null,
        label: "All dates"
      })
    );
    expect(applyBookingFilters).toHaveBeenCalledTimes(2);
    expect(renderSubscriberCalendar).toHaveBeenCalledTimes(2);
  });
});
