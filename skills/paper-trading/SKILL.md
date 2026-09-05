---
name: paper-trading
description: Use when the user asks for simulated trading, paper trading, current Paper PnL or assets, Paper positions/fills/funding/equity/code, stopping a Paper run, or a Strategy Portfolio Paper workflow on Quandora. Use strategy-building for factor selection and Strategy creation or backtests.
metadata:
  fastagent:
    emoji: "📈"
mcpServers:
  quandora:
    url: https://mcp.quandora.ai/quant
    oauthResource: https://mcp.quandora.ai/quant
---

# Quandora Paper Trading

Bundled plugin version: 1.0.0

Use this skill through the authenticated `quandora` MCP connection. It operates only on
the current user's product-safe StrategyRun, Paper run, and Strategy Portfolio handles. It is
simulated trading and must never be described as live-money trading.

Route requests for simulated trading, paper trading, current Paper assets/PnL, Paper history,
or Portfolio Paper here directly. Factor selection, Strategy composition or revision, and Strategy
backtests always belong to `$strategy-building` and use its `sb_*` tools. If no eligible source
exists, hand off to Strategy Building; do not prepare one in this skill.

OAuth and credentials are host-managed. Never inspect, print, copy, store, or ask the user to paste
API keys, bearer/access/refresh tokens, authorization codes, PKCE verifiers, service tokens,
account credentials, or any other secret.

## Plugin Version Reminder

On the first entry into any Quandora skill in the current conversation, if the conversation history
does not already contain one successful `qd_plugin_ver` call and no earlier version-check
attempt has occurred, call it once before the business entry point. Pass `1.0.0` verbatim as
`installed_version`; treat it as an opaque release label and never parse, order, or normalize it.

- If `update_available=false`, continue silently.
- If `update_available=true`, say exactly: `The latest Quandora plugin version is <latest_version>. Please update the plugin.` Then say: `A Quandora MCP access token is valid for 7 days. After 7 days, use the prompt below to ask your agent to refresh the connection; it should use automatic refresh first and CLI re-authentication only if required.` Then provide this exact copyable prompt in a fenced `text` block: `Refresh the Quandora MCP connection. If automatic refresh fails, re-authenticate it with the CLI.` Then immediately continue the original request.
- If the version tool is missing, invisible, disabled, or fails, do not retry it later in the
  conversation and do not claim the plugin is outdated. Continue the business workflow.
- Never install, update, reload, or reauthorize merely because of this reminder.
- A later entry into Factor Mining, Factor Analysis, Strategy Building, Strategy Analysis, or Paper Trading recognizes the first check
  and does not call it again.

## Tools and Routing

Route read-only diagnosis of a completed Strategy result or Paper-readiness assessment to
`$strategy-analysis`. Keep actual Paper discovery, start, monitoring, data reads, and stop here.

The tool names in this skill are the 1.0.0 baseline. The Quandora server's
live tool list is authoritative: tools may be added, renamed, or removed
between releases. If a listed tool is absent or an unlisted one appears,
follow the live list and the plugin version reminder.

Use only the minimum relevant subset of these Paper tools:

- Existing-source discovery: `pt_list_sources`, `pt_get_source`.
- Single runs: `pt_list_runs`, `pt_get_run`, `pt_submit_run`, `pt_stop_run`.
- Single-run data: `pt_get_portfolio`, `pt_list_pos`, `pt_get_equity`, `pt_list_fills`,
  `pt_list_funding`, `pt_get_code`.
- Strategy Portfolio setup and backtest: `pt_sp_create`,
  `pt_sp_revise`, `pt_sp_get`,
  `pt_sp_version`, `pt_sp_bt_submit`,
  `pt_sp_bt_get`, `pt_sp_bt_result`.
- Portfolio Paper: `pt_sp_run_submit`, `pt_sp_run_get`,
  `pt_sp_run_stop`.

Some hosts prefix names with the server name, for example
`quandora__pt_get_run`; treat it as the same tool. If no `pt_*` tools are visible, use the normal
Quandora connection-recovery path. When an authoritative safe error or tool signal shows that the
token lacks the required Paper scopes, fresh Quandora consent is required because refreshed old
tokens do not gain newly granted scopes automatically. Do not loop authorization. Use only the
host-native reconnect/browser consent flow; never bypass MCP with raw HTTP, inspect credentials,
or ask for pasted tokens.

The exact Paper OAuth scope set is `paper_trading:sources.read`,
`paper_trading:sources.write`, `paper_trading:runs.read`, `paper_trading:runs.create`,
`paper_trading:runs.stop`, `paper_trading:code.read`, `paper_trading:portfolios.read`, and
`paper_trading:portfolios.write`. This skill uses source read only to discover and monitor an
existing Paper-eligible source. Tool visibility does not authorize this skill to compose, create,
revise, or backtest a Strategy. Tools remain invisible when the relevant gate is closed or the
token lacks their exact scope.

There is deliberately no Paper archive, unarchive, resume, parent Portfolio list, parent aggregate
positions, parent net position, or parent Paper equity tool. Never invent or imply these abilities.
Do not call `sb_submit_run` from this skill. Hand Strategy work to `$strategy-building`; use Paper
tools here only after an eligible source exists.

## Execution Resources

Read the reference for the phase before executing that phase.

- `references/safety.md` — Global Safety Rules (read before any action).
- `references/single-strategy.md` — the Single-Strategy Paper workflow.
- `references/portfolio-paper.md` — Strategy Portfolio and Portfolio Paper.
- `references/safe-errors.md` — safe-error handling and scope gates.

On FastAgent these resolve under `{baseDir}/references/…`; on other hosts they
are the sibling `references/` files next to this SKILL.md.
