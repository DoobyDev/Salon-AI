# Subscription and Billing Policy

Effective date: [PLACEHOLDER: DATE]

## 1. Plans

Standard subscriber pricing:
- Monthly: GBP 29.99
- Yearly: GBP 299.99 (effective monthly GBP 24.99; save 16.7%)

## 2. Payment Providers

We support:
- Stripe
- PayPal

Current operational billing notes:
- Stripe checkout returns subscribers to the canonical `/dashboard` route after success or cancellation.
- PayPal subscription approval/cancel flows also return to the canonical `/dashboard` route.
- Stripe billing-portal returns also route back to `/dashboard`.

## 3. Renewal

Subscriptions renew automatically unless cancelled before renewal date.

## 4. Taxes

Prices are [PLACEHOLDER: VAT inclusive/exclusive].  
Subscribers are responsible for applicable taxes unless stated otherwise.

## 5. Failed Payments

On payment failure, service may be:
- Retried
- Grace-period limited
- Suspended/cancelled if unresolved

## 6. Cancellations

Users can cancel recurring billing through provider billing controls where available.
Where Stripe is used, subscriber self-service billing management may be available through the Stripe billing portal.

## 7. Price Changes

We may change pricing with prior notice.

## 8. Chargebacks and Disputes

Fraudulent chargebacks may lead to account suspension while investigated.
