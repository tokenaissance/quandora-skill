## Safe Errors

Explain safe failures as actionable product states without exposing downstream text:

- `source_strategy_ineligible`: choose another eligible completed source or complete the missing
  source prerequisite. Use only its returned closed `eligibility_reasons`.
- `paper_initial_balance_unavailable`: the requested Paper balance cannot be used safely; omit an
  override only when the user intended FM's default.
- `source_validation_unavailable`: source discovery could not complete its bounded FM validation;
  do not describe the source as eligible.
- `quantai_unavailable` or another retryable mutation error: the mutation can still be ambiguous.
  Reconcile authoritatively and never change its idempotency identity or blindly submit again.
- Authoritative authorization/scope failure: complete fresh Quandora consent for
  the minimum required Paper scopes.
- Rate/freshness response: honor returned cache, stale, and retry-after information.

If the response contains no recognized closed reason, report only the generic safe error code and
retryability. Never quote, reinterpret, or ask for a hidden provider message.

