# Quandora

Quandora provides Factor Mining and Strategy skills through one authenticated Remote MCP connection.

## What Factor Mining Does

Quandora Factor Mining helps an agent:

1. Connect to the user's Quandora account through the host's MCP authorization flow.
2. Inspect reusable factor families and controlled factor history.
3. Select a public factor-mining task or create a custom factor session.
4. Generate and validate a contract-compliant `plugin.py`.
5. Submit the exact validated source and follow the backtest to a terminal state.
6. Retrieve factor cards, chart artifacts, and the raw signal artifact when available.

## What Strategy Does

Quandora Strategy helps an agent:

1. Inspect the current strategy capability contract and eligible factors.
2. Compare factor quality and retrieve detail only for selected factors.
3. Add an approved shared factor or import a complete factor plugin.
4. Build a cross-sectional strategy from equal or custom factor weights.
5. Apply user-selected settings or contract defaults for direction and ranking.
6. Submit, monitor, and archive the strategy run and its verified artifacts.

## Result Files

When the host supports local files, Factor Mining archives each run under:

```text
Quandora result/factor-mining/aggressive_flow_exhaustion_reversal/
```

The archive is named from the factor slug, preferably the generated `FACTOR_TYPE`. It contains the submitted `plugin.py`, a redacted `run_summary.json`, `factor_card_is.json` when available, `artifact_manifest.json`, PNG charts under `artifacts/is/`, and the raw signal parquet at `signal_raw.parquet` when available. API calls use the returned server `source_name`; local files use the returned `standard_local_path`.

Strategy runs are archived under:

```text
Quandora result/strategy/<strategy_slug>/
```

The strategy archive contains a redacted `run_summary.json`, verified JSON/text artifacts, PNG files under `artifacts/image/`, and `artifact_manifest.json`. The agent prints absolute result and artifact paths so the user can open locally saved files directly.

## Skills

```text
skills/
  factor-mining/
  strategy/
```
