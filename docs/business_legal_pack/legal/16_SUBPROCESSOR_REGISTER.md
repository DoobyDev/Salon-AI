# Sub-Processor Register (Template)

Last updated: [PLACEHOLDER: DATE]

Maintain this list and provide updates to subscribers as required by contract/law.

## Register Fields

- Vendor name
- Service provided
- Data categories processed
- Location / transfer regions
- Contract in place (Yes/No)
- DPA/SCC/IDTA status
- Security review date
- Notes

## Example Entries (Adapt to Actual Setup)

1. Stripe
- Service: subscription billing/payment processing
- Data: billing identifiers, payment metadata

2. PayPal
- Service: subscription billing/payment processing
- Data: billing identifiers, payment metadata

3. Twilio
- Service: SMS notifications
- Data: phone numbers, booking notification content

4. SendGrid
- Service: email notifications
- Data: emails, booking notification content

5. OpenAI
- Service: AI assistant text-generation and tool-calling support
- Data: user prompts, operational context, booking/support request content as configured by the app
- Notes: realtime voice usage is deferred until the paid rollout is enabled

6. [PLACEHOLDER: Hosting provider]
- Service: application hosting/infrastructure
- Data: account, booking, logs

7. [PLACEHOLDER: Database/managed Postgres provider]
- Service: database hosting
- Data: account, booking, business, audit, and billing-support records

8. [PLACEHOLDER: Redis/queue provider]
- Service: cache, rate limiting, and job queue support
- Data: transient cache keys, limiter counters, notification/billing job metadata

9. [PLACEHOLDER: avatar provider if enabled later]
- Service: live avatar rendering / streaming
- Data: session metadata, voice/avatar session identifiers
- Notes: leave out of published register until the paid avatar rollout is actually enabled
