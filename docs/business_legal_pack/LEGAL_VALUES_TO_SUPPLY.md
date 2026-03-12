# Legal Values To Supply

Last updated: 2026-03-11

Purpose:
- Provide one place to collect the remaining real business/legal values still needed across the public-facing legal documents.
- Avoid editing the same company details separately in multiple policy files.

Instructions:
- Replace each `TODO:` line with the real value.
- Once completed, use this sheet to update the linked legal documents.
- Have a solicitor review the final wording before publication.

## Minimum For Public Launch

If the immediate goal is to finalize the public legal pages first, these are the minimum values you need before publishing:

### Required now

- legal entity name
- registered address
- legal contact email
- privacy contact email
- Terms and Conditions effective date
- Privacy Policy effective date
- Subscription and Billing Policy effective date
- Refund and Cancellation Policy effective date
- governing law
- court venue
- VAT wording
- monthly refund rule
- annual/cooling-off refund rule

### Needed for these files first

- `legal/01_TERMS_AND_CONDITIONS.md`
- `legal/02_PRIVACY_POLICY_UK_GDPR.md`
- `legal/05_SUBSCRIPTION_AND_BILLING_POLICY.md`
- `legal/06_REFUND_AND_CANCELLATION_POLICY.md`

### Can wait until the next legal pass

- detailed retention schedule values
- subprocessor register completion
- security owner names
- patch SLAs
- backup/RTO/RPO values
- business-plan assumptions

## Company Identity

- Legal entity name:
  - Stuart Hall
- Trading/brand display name:
  - Suggested repo default: `Ask Lexi | AI Salon Receptionist`
  - Ask Lexi | AI Salon Receptionist
- Registered address:
  - 10 Wilson House, Denton Drive, Northwich, Cheshire, CW97XJ
- Legal contact email:
  - stuhall44@gmail.com
- Privacy contact email:
  - stuhall44@gmail.com
- Abuse/report email:
  - TODO:
- IP/takedown contact email:
  - TODO:

Used in:
- `legal/01_TERMS_AND_CONDITIONS.md`
- `legal/02_PRIVACY_POLICY_UK_GDPR.md`
- `legal/04_ACCEPTABLE_USE_POLICY.md`
- `legal/11_INTELLECTUAL_PROPERTY_AND_TAKEDOWN_POLICY.md`

## Dates

- Terms and Conditions effective date:
  - TBD
- Privacy Policy effective date:
  - TBD
- Cookie Policy effective date:
  - TODO:
- Acceptable Use Policy effective date:
  - TODO:
- Subscription and Billing Policy effective date:
  - TBD
- Refund and Cancellation Policy effective date:
  - TBD
- AI Service Disclosure effective date:
  - TODO:
- DPA effective date:
  - TODO:
- Information Security Policy effective date:
  - TODO:
- Incident Response policy effective date:
  - TODO:
- IP and Takedown Policy effective date:
  - TODO:
- Data Retention Schedule effective date:
  - TODO:
- Data Subject Rights Procedure effective date:
  - TODO:
- Subprocessor Register last updated date:
  - TODO:
- Access Control and Password Policy effective date:
  - TODO:
- Backup and Business Continuity Policy effective date:
  - TODO:
- Vulnerability and Patch Management Policy effective date:
  - TODO:

## Jurisdiction

- Governing law:
  - Suggested common UK default: `England and Wales`
  - England and Wales
- Court venue:
  - TODO:

Used in:
- `legal/01_TERMS_AND_CONDITIONS.md`

## Pricing And Tax

- VAT wording:
  - Choose one: `VAT inclusive` or `VAT exclusive`
  - VAT exclusive
- If VAT exclusive, should invoices/pricing pages show VAT separately?
  - TODO:

Used in:
- `legal/05_SUBSCRIPTION_AND_BILLING_POLICY.md`

## Refund Policy Decisions

- Monthly subscription refund rule:
  - Unless required by applicable law, subscription fees are non-refundable once a billing period has started, and no partial-month refunds are provided after renewal.
- Annual plan refund / cooling-off rule:
  - If a mandatory consumer cooling-off right applies under applicable law, cancellation and refund requests made within that period will be handled in line with those legal requirements. After any applicable cooling-off period ends, annual plans are generally non-refundable except where required by law.
- Are pro-rata refunds ever offered?
  - No, unless required by applicable law
- Does cancellation take effect immediately or at period end?
  - At period end unless required otherwise by applicable law or provider handling

Used in:
- `legal/06_REFUND_AND_CANCELLATION_POLICY.md`

## Privacy / Data Governance

- Final hosting provider:
  - TODO:
- Final database / managed Postgres provider:
  - TODO:
- Final Redis / queue provider:
  - TODO:
- Avatar provider, if later enabled:
  - TODO:
- Standard retention after account closure:
  - TODO:
- Accounting/tax retention period:
  - TODO:
- Security log retention period:
  - TODO:
- Marketing/contact-data retention period:
  - TODO:

Used in:
- `legal/02_PRIVACY_POLICY_UK_GDPR.md`
- `legal/12_GDPR_DATA_RETENTION_SCHEDULE.md`
- `legal/16_SUBPROCESSOR_REGISTER.md`

## Security / Operations Ownership

- Incident Lead:
  - TODO:
- Security Owner:
  - TODO:
- Legal/Compliance Contact:
  - TODO:
- Minimum password length:
  - Suggested default: `12`
  - TODO: confirm or replace
- MFA policy:
  - TODO:
- Critical patch SLA:
  - TODO:
- High patch SLA:
  - TODO:
- Medium patch SLA:
  - TODO:
- Low patch SLA:
  - TODO:
- Backup frequency:
  - TODO:
- Backup retention:
  - TODO:
- Backup encryption standard:
  - TODO:
- Restore testing cadence:
  - TODO:
- RTO:
  - TODO:
- RPO:
  - TODO:

Used in:
- `legal/10_INCIDENT_RESPONSE_AND_BREACH_NOTIFICATION.md`
- `legal/17_ACCESS_CONTROL_AND_PASSWORD_POLICY.md`
- `legal/18_BACKUP_AND_BUSINESS_CONTINUITY_POLICY.md`
- `legal/19_VULNERABILITY_AND_PATCH_MANAGEMENT_POLICY.md`

## Business Planning Inputs

- Executive plan company name:
  - TODO:
- Starting subscribers:
  - TODO:
- Monthly new subscribers:
  - TODO:
- Monthly churn percentage:
  - TODO:
- Annual plan adoption percentage:
  - TODO:

Used in:
- `business/20_BUSINESS_PLAN_EXECUTIVE.md`
- `business/22_FINANCIAL_MODEL_TEMPLATE.md`
