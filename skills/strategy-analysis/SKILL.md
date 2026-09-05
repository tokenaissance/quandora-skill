---
name: strategy-analysis
description: Analyze, diagnose, compare, and propose controlled improvements for existing Quandora cross-sectional Strategy results from owner-scoped server-persisted evidence. Use when a user asks why a Strategy worked or failed, wants six-chart diagnostics, requests factor-combination optimization ideas, or asks whether a completed backtest is ready for Paper Trading. Do not use to compose or submit a Strategy; route those requests to strategy-building.
metadata:
  fastagent:
    emoji: "📊"
mcpServers:
  quandora:
    url: https://mcp.quandora.ai/quant
    oauthResource: https://mcp.quandora.ai/quant
---

# Strategy Analysis

Bundled plugin version: 1.1.0

Analyze one exact cross-sectional Strategy run as a read-only research workflow. Pair Product
Backend's canonical run snapshot with owner-scoped retained artifacts and bounded six-chart data.
Distinguish observed evidence from inference, alternatives, and proposed experiments.

OAuth and all credentials are handled by the host. Quandora access tokens expire after 7 days, and
the host MCP client should use its stored rotating refresh token automatically. Never inspect,
print, copy, store, or ask the user to paste API keys, bearer tokens, authorization codes, access
tokens, refresh tokens, PKCE verifiers, service tokens, or other credentials.

## Plugin Version Reminder

On the first entry into any Quandora skill in the current conversation, if the conversation history
does not already contain one successful `qd_plugin_ver` call and no earlier version-check
attempt has occurred, call it once before the business entry point. Pass the bundled plugin version
declared by the current skill verbatim as `installed_version`; never infer it from memory, the
remote latest version, or the host name.

Treat the bundled version as an opaque release label: pass it verbatim and never parse, order, or
normalize it.

- If `update_available=false`, continue silently.
- If `update_available=true`, say exactly: `The latest Quandora plugin version is <latest_version>.
  Please update the plugin.` Then say: `A Quandora MCP access token is valid for 7 days.
  After 7 days, use the prompt below to ask your agent to refresh the connection; it should use
  automatic refresh first and CLI re-authentication only if required.` Then provide this exact
  copyable prompt in a fenced `text` block: `Refresh the Quandora MCP connection. If
  automatic refresh fails, re-authenticate it with the CLI.` Then immediately continue the user's
  original request.
- If `qd_plugin_ver` is missing, disabled, invisible, or fails, do not report that the
  plugin is outdated, do not retry the check anywhere later in the current conversation, and
  continue the original request without a version message or any change to the business workflow.
  OAuth or connection failures continue through the existing safe connection-handling path; never
  bypass MCP with raw HTTP.
- Never install, update, uninstall, or reload a plugin; execute an update command; ask whether to
  update; immediately start OAuth or reauthorize merely because of the version result; provide a
  platform-specific command in the version reminder; or delay the original request. The copyable
  prompt is information for the user to invoke after 7 days, not permission to run it during the
  version check.
- A later entry into Factor Mining, Factor Analysis, Strategy Building, Strategy Analysis, or Paper
  Trading in the same conversation recognizes the prior successful version check and does not call
  it or remind again.
- Treat `qd_plugin_ver` as optional for connection readiness. Its absence alone never
  triggers connection recovery or changes the required business-tool set.

The version check is not a business action and does not change any exact call-count, pagination, or
mutation constraint below.

<!-- end-plugin-version-reminder -->

## Scope And Routing

Use this skill for:

- performance, risk, turnover, exposure, and stability diagnosis;
- the six QuantAI cross-sectional diagnostic charts and their retained numeric data;
- factor-combination and style interpretation;
- controlled Strategy experiment design;
- Paper readiness assessment without starting or managing Paper Trading.

Use `$strategy-building` to list eligible factors, compose, submit, resume, retrieve, explicitly
export, or archive a Strategy. Use `$factor-analysis` for one Factor Mining result. Use
`$paper-trading` only after the user explicitly asks to start, monitor, inspect, or stop Paper
Trading.

## Execution Resources

Read the reference for the phase before executing that phase.

- `references/safety.md` — Non-Negotiable Safety rules (read before acting).
- `references/workflow.md` — the full read-only Strategy analysis workflow:
  establish the exact run, read canonical composition/parameters and retained
  artifacts, read six-chart evidence, diagnose, and propose controlled
  experiments without Paper mutation.
- `references/output-contract.md` — the final diagnosis report contract.

On FastAgent these resolve under `{baseDir}/references/…`; on other hosts they
are the sibling `references/` files next to this SKILL.md.
