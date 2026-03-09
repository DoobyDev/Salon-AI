export const bookingDateRegex = /^\d{4}-\d{2}-\d{2}$/;
export const bookingTimeRegex = /^\d{2}:\d{2}$/;
export const maxPageSize = 100;
export const defaultPageSize = 25;

export const supportedAccountingProviders = ["quickbooks", "xero", "freshbooks", "sage"];
export const supportedStaffAvailability = new Set(["on_duty", "off_duty"]);
export const supportedShiftDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
export const supportedStaffRotaStatus = new Set(["scheduled", "available", "off", "sick", "covering"]);
export const supportedStaffRotaShift = new Set(["full", "am", "pm"]);
export const supportedWaitlistStatus = new Set(["waiting", "contacted", "booked", "cancelled"]);
export const supportedMembershipCycles = new Set(["weekly", "monthly", "quarterly", "yearly"]);
export const supportedCommercialStatus = new Set(["active", "inactive"]);
export const supportedGiftCardStatus = new Set(["active", "redeemed", "expired", "cancelled"]);
export const supportedShipmentStatus = new Set(["preparing", "shipped", "delivered", "cancelled"]);

export const cancellationPolicy = {
  feeRule: "Cancellation fees and policy windows are controlled by each subscriber business."
};

export const adminPlanPriceMap = {
  starter: 9.99,
  pro: 9.99,
  enterprise: 9.99,
  monthly: 9.99,
  yearly: 99.99
};

export const subscriberMonthlyFeeGbp = 9.99;
export const subscriberYearlyFeeGbp = 99.99;
export const yearlyDiscountPercent = Number(
  ((((subscriberMonthlyFeeGbp * 12 - subscriberYearlyFeeGbp) / (subscriberMonthlyFeeGbp * 12)) * 100).toFixed(1))
);
