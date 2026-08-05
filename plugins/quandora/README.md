# Quandora

Quandora provides Factor Mining and Strategy Building skills through one authenticated Remote MCP connection.

## What Factor Mining Does

Quandora Factor Mining helps an agent:

1. Connect to the user's Quandora account through the host's MCP authorization flow.
2. Inspect reusable factor families and controlled factor history.
3. Select a public factor-mining task or create a custom factor session.
4. Generate and validate a contract-compliant `plugin.py`.
5. Submit the exact validated source and follow the backtest to a terminal state.
6. Retrieve factor cards, chart artifacts, and the raw signal artifact when available.

## What Strategy Building Does

Quandora Strategy Building helps an agent:

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
  strategy-building/
```

## CodeBuddy and WorkBuddy

The CodeBuddy-compatible plugin manifest registers both skills and the plugin-managed `quandora` remote HTTP MCP server. CodeBuddy and WorkBuddy handle the MCP connection and browser OAuth authorization natively. The package requires no local MCP process, Python, Node.js, API key, or credential-paste flow.

## Claude Desktop Code OAuth Launchers

Claude Desktop Code Agents normally run commands with redirected input and output, while the official `claude mcp login` flow requires an interactive terminal. This plugin ships two fixed-purpose launchers:

```text
scripts/
  claude-mcp-login-macos.sh
  claude-mcp-login-windows.ps1
```

The macOS launcher uses `/usr/bin/script`; the Windows launcher uses Windows PowerShell 5.1 to start a native console. Both invoke only `plugin:quandora:quandora`, retain the remote MCP transport, avoid OAuth output logging, and leave browser identity and consent to the user.

## Connection Recovery

If the `quandora` connection is unavailable, update or reinstall the production plugin, reconnect the plugin-managed Remote MCP server, and complete the host-native browser authorization flow again. The host owns OAuth and credentials; agents never request API keys, bearer tokens, authorization codes, access tokens, refresh tokens, PKCE verifiers, or pasted credentials.
