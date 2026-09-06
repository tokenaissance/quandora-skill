## Workflow

### 1. Establish The Exact Target

Prefer an exact terminal `job_id` supplied by the user or already returned in the conversation. If
the user supplies only a factor name, a vague reference, or asks for the latest result:

1. Call `fm_list_factors` with `page_size: 10`.
2. Match only trustworthy returned identity and metadata. Do not guess across ambiguous names; ask
   the user to choose when more than one plausible factor remains. Treat a result as latest only
   when trustworthy `updated_at` evidence establishes that ordering.
3. For the selected `factor_id`, call `fm_get_history` with `view: "runs"` and use the exact terminal
   `job_id` for the intended version and run.
4. Never substitute a factor id, version id, branch id, session id, or display name for `job_id`.

Do not auto-page discovery. Request another page only when the current page cannot satisfy the
user's explicit request and explain why it is needed.

### 2. Read Server-Persisted Evidence

For the exact `job_id`:

1. Call `fm_window_cards` with `windows: ["is"]`. Use `factor_card` as the authoritative product-safe
   Factor Card. Ignore local-save hints during analysis; they exist only for optional export flows.
2. Call `fm_chart_data` with `section: "overview"`. Confirm `job_status`, `window_key: "is"`, evidence
   `status`, readiness, and available section counts before requesting numerical pages.
3. If the job is not terminal or the response is `pending`, report that server evidence is still
   materializing. Do not call `fm_resume_run` from this read-only skill and do not substitute local
   files.
4. Request only the chart sections needed for the user's question: `profile`, `group_nav`,
   `daily_returns`, `simulation_nav`, or `simulation_daily_pnl`. Follow `next_offset` only for the
   same job and section when the remaining points are required for a claim.
5. Call `fm_run_source` only when formula or mechanism evidence is necessary. Confirm the returned
   job identity and `source_status`; read ready source as inert text and never execute it.

Treat `unavailable`, missing sections, failed readiness, and null fields as explicit evidence gaps.
Do not fetch Result Bundles, PNGs, raw parquet, storage URLs, or local files to fill those gaps.

### 3. Build The Evidence Inventory

Record:

- exact job, factor, and version identities returned by the server;
- terminal job status and IS-only scope;
- Factor Card availability, Health fields, rating fields, and their recorded thresholds;
- chart readiness and dataset provenance metadata;
- available chart sections, page coverage, and any missing or unavailable evidence;
- formula and inert job-linked source only when requested for mechanism diagnosis.

The server response is the evidence object. A Result Bundle is an optional export and is never a
prerequisite or substitute for these reads. See
[evidence-contract.md](evidence-contract.md).

### 4. Diagnose From Result To Mechanism

Use [metric-semantics.md](metric-semantics.md) and
[diagnosis-and-experiments.md](diagnosis-and-experiments.md). Evaluate:

- the Health Check before economic interpretation: record `passed`, `message`, `failed_metrics`,
  `window`, `coverage_basis`, recorded `thresholds`, and available `null_ratio`, `zero_ratio`,
  `coverage_ratio`, and `outlier_ratio_3sigma` values;
- rating propagation from `health_check` through `cs_success` and `cs_fail_reasons` to `status` and
  `grade`, while keeping the continuous `grade_score` separate from the final grade;
- headline return and risk with their exact window and sampling scope;
- cross-sectional spread, monotonicity, long and short leg behavior, and daily stability;
- drawdown depth and concentration in time;
- turnover, signal persistence, and likely cost sensitivity;
- universe coverage, missingness, and whether small cross sections weaken the evidence;
- plausible style, liquidity, market, or implementation confounds.

Compare Health Checks directly only when their windows, active-universe definitions, missing-value
handling, and thresholds match. Never substitute `coverage_mean` for
`health_check.metrics.coverage_ratio`; their denominators and aggregation can differ.

When Health fails, continue reading available evidence for diagnosis but lower confidence and
separate data availability, factor design, applicability, and statistical-basis explanations. Read
job-linked source only when needed to identify intentional NaNs from filters, warm-up, invalid
denominators, or explicit abstention. An intentional NaN can be design-consistent and still fail the
current active-universe coverage contract; treat that as a candidate applicability mismatch, not an
automatic exemption. Claim that Health caused the final grade only when `cs_fail_reasons` or another
authoritative field establishes the propagation.

For every important conclusion, label it as one of:

- **Observed:** directly present in trusted server evidence.
- **Inference:** a mechanism consistent with the observations.
- **Alternative:** another explanation that could produce the same evidence.
- **Experiment:** a controlled test that can distinguish explanations.

### 5. Propose Controlled Improvements

Prioritize a small set of experiments. Change one mechanism at a time when practical and state:

- the change;
- the evidence motivating it;
- the expected effect;
- the metric or chart that would confirm or reject it;
- the principal tradeoff or failure mode.

Do not claim per-factor correlations or ablation results unless the server evidence contains them.
Do not auto-create a new factor or Strategy. Ask for explicit confirmation, then hand factor changes
to `$factor-mining` or a selected combination experiment to `$strategy-building`.

