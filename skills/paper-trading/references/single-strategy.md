## Single-Strategy Workflow

### 1. Require an Existing Eligible Source

Paper Trading begins with an exact existing source StrategyRun supplied by the user or returned by
`pt_list_sources`. This skill must not list or choose factors, create or revise a Strategy, inspect a
prepared StrategyVersion, or submit a Strategy backtest.

If no suitable eligible source exists, or the user asks to create, change, or backtest a Strategy,
hand that work to `$strategy-building` and stop before any Paper mutation. Strategy Building uses
only its `sb_*` tools. After it produces a completed source with `paper_eligibility=eligible`,
continue only when the user still wants Paper, then select the exact source and obtain the separate
Paper confirmation below.

### 2. Select a Source

If the user did not provide an exact source StrategyRun handle, call `pt_list_sources`. Show a
compact table with source handle, lifecycle/submit state, strategy kind, initial cash, safe
strategy/version information, `paper_eligibility`, and the returned closed
`eligibility_reasons`.

Ask the user to select one exact returned source. Never probe guessed handles. Explain eligibility
without downstream internals:

- `eligible`: local and safe execution evidence passed preflight; final submit validation still
  belongs to FM.
- `provider_validation_required`: source validation could not be completed; it is not guaranteed
  eligible.
- `ineligible`: use only the returned closed reason codes, such as incomplete/unsubmitted source,
  unsupported strategy kind, or missing semantic lineage.

A source must ultimately be owner-scoped, completed, successfully submitted, cross-sectional, and
semantically reconstructable. `source_validation_unavailable` means the bounded source read failed
or exhausted its deadline. Describe validation as incomplete and retry only the read later if the
user asks. Unknown reason values fail closed; do not infer their meaning or request downstream
payloads. Missing displayed capital does not by itself make an ordinary source ineligible.

### 3. Confirm and Submit

Before `pt_submit_run`, display and obtain explicit confirmation for:

- exact source StrategyRun handle and safe strategy/version label;
- exact `initial_balance` when the user supplies one;
- optional ISO `start_date`;
- optional exact `leverage`.

Send only `source_strategy_run_id`, `start_date`, `initial_balance`, and `leverage`, omitting optional
fields the user did not choose. When the caller omits `initial_balance`, omit it from the tool call;
FM retains its existing default. Creating or revising a source, completing its backtest, and
submitting Paper are separate mutations and each requires the appropriate explicit confirmation.

### 4. Observe Lifecycle and Read Data

Use the submit response as the first snapshot. For lifecycle monitoring, call `pt_get_run`; never
poll `pt_get_portfolio`. Keep polling bounded and user-visible, and stop when terminal. If a caller
asks only for current state, make one detail call.

When presenting `pt_list_runs` or `pt_get_run`, use the returned `strategy_name` when it is present.
If it is null, reuse a safe source name already returned in
the current workflow; if the user specifically needs missing names, resolve only the distinct
returned source handles with bounded `pt_get_source` reads (at most 20 per request) and use
`source.strategy.name` when present. Otherwise label the name unavailable. Never infer a name from
submission time, PnL, ROI, direction, code, or neighboring rows, and never probe a guessed handle.

Use each data tool for its distinct meaning:

- Current assets/current PnL: call `pt_get_portfolio` once. Report `freshness.age_ms`, `stale`, and
  `retry_after_s`; explain cached or stale data without forcing refresh. This is a live manual
  collection protected by a PB 60-second per-run guard, and failed downstream attempts also consume
  that window.
- Historical positions: call `pt_list_pos`. This is a history of closed net-position lifecycles
  only: an item appears after the net position returns from nonzero to zero. Open positions and
  positions that were partially closed but remain nonzero are absent from this history and remain
  visible only through the current `pt_get_portfolio` snapshot. Honor symbol, side, open/close time
  filters, sort/order, bounded limit, and opaque cursor exactly. Closed-position realized return
  and current PnL are different semantics; never rename or derive one from the other, and never
  describe this list as arbitrary point-in-time portfolio replay.
- Execution records: use `pt_list_fills` for fills and `pt_list_funding` for funding cash flows.
  Do not infer closed-position semantics from fills.
- Strategy code: use `pt_get_code` only when asked and present only its bounded text/content type.
  Never expose a rejected internal reference.

### 5. Equity Curves

Choose exactly one mode from the user's intent and never mix their parameters:

- Legacy/full mode: omit lookback/bounds/sampling, or use only a bounded legacy `limit`.
- Bounded mode: use `max_points` and optional `started_at`/`ended_at`; do not send `limit` or
  `lookback`.
- Fixed lookback: send only one `lookback` plus `paper_run_id`.

| lookback | interval | total points |
|---|---:|---:|
| `7D` | `30m` | 336 |
| `30D` | `1.5h` | 480 |
| `90D` | `6h` | 360 |
| `180D` | `12h` | 360 |
| `1Y` | `1d` | 365 |
| `3Y` | `3d` | 365 |

Fixed windows return ROI values, `interval`, `total_points`, `live_start_index`, and `is_live` per
point. Explicitly label points before `live_start_index` as synthetic pre-live zero padding. Never
describe those zeros as observed returns or imply the strategy existed during that interval.

### 6. Stop

Before `pt_stop_run`, show the exact run handle and current known status, state that stop is terminal,
and obtain explicit confirmation. Make one stop call; do not automatically retry it. Then use
`pt_get_run` to observe authoritative state. Never call it pause and never offer resume. Running the
same strategy again requires a new user-confirmed submit and produces a new Paper run from a flat
book.


