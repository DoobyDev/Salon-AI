# Legal Input Checklist

Last updated: 2026-03-11

Purpose:
- Separate values the repo already establishes from values that still require real legal or business input.
- Speed up finalization of the public-facing legal pack without guessing at company information.

Use this alongside:
- `docs/business_legal_pack/legal/01_TERMS_AND_CONDITIONS.md`
- `docs/business_legal_pack/legal/02_PRIVACY_POLICY_UK_GDPR.md`
- `docs/business_legal_pack/legal/05_SUBSCRIPTION_AND_BILLING_POLICY.md`
- `docs/business_legal_pack/legal/06_REFUND_AND_CANCELLATION_POLICY.md`

## Values Already Established By The Repo

- Product/brand wording in live use:
  - Ask Lexi
  - AI Salon Receptionist
- Live web routes:
  - `/`
  - `/auth`
  - `/dashboard`
  - `/legal`
- Platform coverage:
  - web app
  - desktop shell
  - mobile wrapper / installable PWA shell
- Current billing providers:
  - Stripe
  - PayPal
- Current subscriber pricing documented in the repo:
  - Monthly: GBP 29.99
  - Yearly: GBP 299.99
- Current live workflow scope:
  - booking lifecycle
  - role-based dashboards
  - reminder settings
  - scheduled reminders
  - notification logging
  - accounting export
- Deferred scope that should not be described as generally live unless intentionally enabled:
  - realtime voice
  - avatar provider rollout

## Values Still Required From The Business

### Terms and Conditions

File:
- `docs/business_legal_pack/legal/01_TERMS_AND_CONDITIONS.md`

Needs real values for:
- effective date
- court venue

Already supplied in intake:
- legal entity name: `Stuart Hall`
- brand wording: `Ask Lexi | AI Salon Receptionist`
- governing law: `England and Wales`
- legal contact email: `stuhall44@gmail.com`
- registered address: `10 Wilson House, Denton Drive, Northwich, Cheshire, CW97XJ`

### Privacy Policy (UK GDPR)

File:
- `docs/business_legal_pack/legal/02_PRIVACY_POLICY_UK_GDPR.md`

Needs real values for:
- effective date

Already supplied in intake:
- controller legal entity name: `Stuart Hall`
- privacy contact email: `stuhall44@gmail.com`

Business confirmation still needed for:
- final hosting/infrastructure providers
- final notification providers
- final transfer wording after provider list is locked

### Subscription and Billing Policy

File:
- `docs/business_legal_pack/legal/05_SUBSCRIPTION_AND_BILLING_POLICY.md`

Needs real values for:
- effective date

Already supplied in intake:
- VAT wording: `VAT exclusive`

Business confirmation still needed for:
- whether pricing pages and invoices will show VAT separately
- any grace-period or suspension timing you want to state explicitly

### Refund and Cancellation Policy

File:
- `docs/business_legal_pack/legal/06_REFUND_AND_CANCELLATION_POLICY.md`

Needs real values for:
- effective date

Draft defaults now prepared in the repo:
- monthly refund rule: `Unless required by applicable law, subscription fees are non-refundable once a billing period has started, and no partial-month refunds are provided after renewal.`
- annual/cooling-off rule: `If a mandatory consumer cooling-off right applies under applicable law, cancellation and refund requests made within that period will be handled in line with those legal requirements. After any applicable cooling-off period ends, annual plans are generally non-refundable except where required by law.`
- pro-rata refunds: `No, unless required by applicable law`
- cancellation timing: `At period end unless required otherwise by applicable law or provider handling`

Legal review should confirm:
- UK consumer cancellation/cooling-off treatment for this service type
- whether any business-customer vs consumer-customer distinction should be stated more explicitly

## Other High-Priority Placeholder Areas

- `docs/business_legal_pack/legal/08_DATA_PROCESSING_ADDENDUM_DPA.md`
  Needs processor legal entity name and final processor/controller wording.
- `docs/business_legal_pack/legal/10_INCIDENT_RESPONSE_AND_BREACH_NOTIFICATION.md`
  Needs named owner/contact roles.
- `docs/business_legal_pack/legal/16_SUBPROCESSOR_REGISTER.md`
  Needs the actual hosting, database, queue/cache, and optional avatar providers.
- `docs/business_legal_pack/business/20_BUSINESS_PLAN_EXECUTIVE.md`
  Needs company identity inputs.
- `docs/business_legal_pack/business/22_FINANCIAL_MODEL_TEMPLATE.md`
  Needs operating assumptions.

## Recommended Fill Order

1. Legal entity name, registered address, legal/privacy email, jurisdiction, venue
2. VAT treatment and refund policy decisions
3. Provider/subprocessor list
4. Security/contact owner names
5. Business-plan and financial-model assumptions
