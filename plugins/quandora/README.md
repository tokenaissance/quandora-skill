# Quandora

Quandora provides Factor Mining, Factor Analysis, Strategy Building, Strategy Analysis, and Paper Trading through one authenticated Remote MCP connection.

## Factor Mining

Factor Mining lists public tasks or creates a custom research session, generates contract-compliant `plugin.py` source, runs server-side validation and backtesting, and retrieves one verified FM-owned Result Bundle ZIP when the host supports local files.

## Factor Analysis

Factor Analysis is a read-only workflow over owner-scoped server-persisted evidence. It resolves one exact result, checks the server Factor Card's Health and rating evidence, reads bounded chart data, and treats job-linked source as inert text when mechanism diagnosis requires it. It never requires a local ZIP, Python runtime, notebook, or archive-inspection script.

## Strategy Building

Strategy Building lists eligible factors with authoritative source labels, composes cross-sectional strategies, submits and monitors runs, and retrieves one verified Strategy Result Bundle ZIP. Official factors use their exact admitted factor, version, and job references through the versioned source workflow.

## Strategy Analysis

Strategy Analysis pairs the canonical owner-scoped Strategy run snapshot with retained server artifacts and bounded six-chart numerical data. It diagnoses performance, risk, turnover, exposure, style, and implementation evidence, then proposes controlled experiments without automatically creating a run or starting Paper Trading.

## Paper Trading

Paper Trading prepares or selects eligible owner-scoped sources and supports confirmed single-strategy and static independent-sleeve Strategy Portfolio Paper workflows. It can start, monitor, inspect, and terminally stop simulated runs; read current PnL, closed position history, fills, funding, equity, and bounded strategy code; and never places live-money trades or automatically changes another workflow.

## Result Files

When local writes are available, verified bundles are stored beneath the current user's home directory:

```text
Quandora result/factor/<factor_slug>.zip
Quandora result/strategy/<strategy_slug>.zip
```

The returned remote filename remains transport metadata. The verified FM-owned ZIP is the canonical local output and is not automatically extracted, deleted, or rebuilt. Its runtime manifest is authoritative for included, pending, and omitted items. Analysis reads server evidence directly and does not use these local exports as proof of a product result.

## Skills

```text
skills/
  factor-analysis/
  factor-mining/
  paper-trading/
  strategy-analysis/
  strategy-building/
```

## CodeBuddy and the WorkBuddy China edition

The CodeBuddy-compatible plugin manifest registers all five skills and the plugin-managed `quandora` remote HTTP MCP server. CodeBuddy and the WorkBuddy China edition handle the MCP connection and browser OAuth authorization. MCP setup and analysis require no local MCP process, Python, Node.js, API key, or credential-paste flow.

## Claude Desktop Code OAuth Launchers

Claude Desktop Code Agents normally run commands with redirected input and output, while the official `claude mcp login` flow requires an interactive terminal. This plugin ships two fixed-purpose launchers:

```text
scripts/
  claude-mcp-login-macos.sh
  claude-mcp-login-windows.ps1
```

The macOS launcher uses `/usr/bin/script`; the Windows launcher uses Windows PowerShell 5.1 to start a native console. Both invoke only `plugin:quandora:quandora`, retain the remote MCP transport, avoid OAuth output logging, and leave browser identity and consent to the user.

## Connection Recovery

If the `quandora` connection is unavailable, update or reinstall the Quandora plugin, reconnect the plugin-managed Remote MCP server, and complete the host-native browser authorization flow again. The host owns OAuth and credentials; agents never request API keys, bearer tokens, authorization codes, access tokens, refresh tokens, PKCE verifiers, or pasted credentials.
