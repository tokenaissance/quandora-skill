## Global Safety Rules

- Never request, display, store, or infer FM/QuantAI/provider/account identifiers, raw provider
  payloads, downstream configuration, internal URLs, hostnames, ports, topology, database details,
  or credentials.
- Treat `source_strategy_run_id`, `paper_run_id`, Portfolio ids, child Paper handles, and cursors as
  opaque product handles. Return cursors byte-for-byte and never parse them.
- Never send `symbols`, `universe`, or `universe_policy`, including null or empty values. Quandora
  chooses and freezes the Paper universe downstream.
- Money, leverage, component weights, and allocated cash are exact decimal strings. Never convert
  them through a binary float or send them as JSON numbers.
- Never automatically stop, reopen, resubmit, change a strategy, change capital, mine another
  factor, or trigger another module because of losses or performance.
- A mutation timeout or ambiguous response is not proof of failure. Do not issue a fresh mutation
  or altered request. If a product handle was returned, reconcile with its get tool. If none was
  returned, report the ambiguity and stop; the user must decide after authoritative reconciliation.
- Treat Product Backend preflight as conservative guidance. FM submit remains the final eligibility
  authority, and another owner's handle must look nonexistent rather than distinguishable.


