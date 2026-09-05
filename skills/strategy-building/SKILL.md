---
name: strategy-building
description: Use when the user asks to list available, eligible, or selectable Strategy factors, or to compose, create, backtest, resume, retrieve, or archive a cross-sectional Quandora Strategy using Official, Mine, or Shared factors. Route deep result diagnosis and optimization to strategy-analysis.
metadata:
  fastagent:
    emoji: "🧩"
mcpServers:
  quandora:
    url: https://mcp.quandora.ai/quant
    oauthResource: https://mcp.quandora.ai/quant
---

# Quandora Strategy Building

Bundled plugin version: 1.0.0

Use this skill through the authenticated Quandora connection exposed by the host as
`quandora`. It owns factor selection, Strategy creation or revision, and Strategy backtests for
Official, Mine, and Shared factors, and includes the complete Strategy Result Bundle workflow.
Every factor composition and Strategy backtest uses only the Strategy tools listed below. Never use
Paper Trading tools to compose or backtest a Strategy. Use `$strategy-analysis` for deep result
diagnosis.

OAuth and all credentials are handled by the host. Quandora access tokens expire after 7 days, and the host MCP client should use its stored rotating refresh token automatically. Never inspect, print, copy, store, or ask the user to paste API keys, bearer tokens, authorization codes, access tokens, refresh tokens, PKCE verifiers, service tokens, or other credentials.

## Plugin Version Reminder

On the first entry into any Quandora skill in the current conversation, if the conversation history does not already contain one successful `qd_plugin_ver` call and no earlier version-check attempt has occurred, call it once before the business entry point. Pass the bundled plugin version declared by the current skill verbatim as `installed_version`; never infer it from memory, the remote latest version, or the host name.

Treat the bundled version as an opaque release label: pass it verbatim and never parse, order, or normalize it.

- If `update_available=false`, continue silently.
- If `update_available=true`, say exactly: `The latest Quandora plugin version is <latest_version>. Please update the plugin.` Then say: `A Quandora MCP access token is valid for 7 days. After 7 days, use the prompt below to ask your agent to refresh the connection; it should use automatic refresh first and CLI re-authentication only if required.` Then provide this exact copyable prompt in a fenced `text` block: `Refresh the Quandora MCP connection. If automatic refresh fails, re-authenticate it with the CLI.` Then immediately continue the user's original request.
- If `qd_plugin_ver` is missing, disabled, invisible, or fails, do not report that the plugin is outdated, do not retry the check anywhere later in the current conversation, and continue the original request without a version message or any change to the business workflow. OAuth or connection failures continue through the existing safe connection-handling path; never bypass MCP with raw HTTP.
- Never install, update, uninstall, or reload a plugin; execute an update command; ask whether to update; immediately start OAuth or reauthorize merely because of the version result; provide a platform-specific command in the version reminder; or delay the original request. The copyable prompt is information for the user to invoke after 7 days, not permission to run it during the version check.
- A later entry into Factor Mining, Factor Analysis, Strategy Building, Strategy Analysis, or Paper Trading in the same conversation recognizes the prior successful version check and does not call it or remind again.
- Treat `qd_plugin_ver` as optional for connection readiness. Its absence alone never triggers connection recovery or changes the required business-tool set.

The version check is not a business action. For a normal Factor Mining workflow, check first when required above and then call `fm_status` under the existing rules. For a bare Strategy factor-list request, check first when required and then make the one business call `sb_list_eligible`. For Strategy composition, check first when required and then call `sb_get_contract` under the existing rules. All other exact call-count, pagination, and mutation constraints remain unchanged.

<!-- end-plugin-version-reminder -->

## Connection and Tools

Before starting, confirm that the Quandora connection is authenticated and check only the
actions needed for the requested path. A normal list, composition, submit, observe, and Result
Bundle workflow uses the relevant subset of `sb_get_contract`, `sb_list_eligible`,
`sb_factor_detail`, `sb_shared_list`, `sb_shared_add`, `sb_submit_run`, `sb_list_runs`, `sb_get_run`,
`sb_resume_run`, `sb_bundle_ticket`, and `sb_bundle_chunk`. `sb_get_artifact` and `sb_file_ticket`
remain legacy single-artifact compatibility actions. Use `qd_get_guidance` only for one of the
documented guidance branches below.

The tool names in this skill are the 1.0.0 baseline. The Quandora server's
live tool list is authoritative: tools may be added, renamed, or removed
between releases. If a listed tool is absent or an unlisted one appears,
follow the live list and the plugin version reminder.

Official, Mine, and Shared selections use the same `sb_submit_run` path. Do not load the Paper
Trading skill or present Strategy composition as Paper preparation. A later Paper Trading request
is a separate workflow.

The normal Strategy workflow must not require or call `sb_import_factor`. Import-only actions are
not global prerequisites, and an ordinary Strategy task must continue when they are absent. Check
import-only tool availability only after the explicit user-supplied-file branch below has been
selected.

Some hosts prefix action names with the server name, such as
`quandora__sb_submit_run`; treat those as the same actions.

If the connection or actions are unavailable, tell the user to update or reinstall the current
Quandora plugin, use the host-specific reconnect and browser OAuth flow, then start a new chat
before continuing:

- Codex CLI/TUI: run `codex mcp login quandora`.
- Codex Desktop: authorize the plugin-provided connector, start a new chat, and fully quit and
  reopen Codex Desktop if the tools remain unavailable.
- Kimi Code: run `/mcp-config login plugin-quandora:quandora`, complete browser authorization, then start
  a new chat and check `/mcp`.
- Claude Code: open `/mcp`, authenticate `quandora`, then start a new chat.
- Claude Desktop: add a connector named `quandora` with URL
  `https://mcp.quandora.ai/quant`, click Connect, complete browser authorization, then
  start a new chat.
- CodeBuddy and the WorkBuddy China edition: update or reinstall the `quandora` plugin, reconnect its plugin-managed
  Remote MCP server, complete the host-native browser authorization flow, then start a new chat.
- FastAgent (tokenaissance Cloud): the Quandora MCP server is attached to the agent. Open the agent's settings,
  re-authorize `quandora` in the MCP OAuth panel (or run `fastagent mcp login quandora`), then start a new chat.

Do not start a new authorization flow merely because an access token reached its seven-day lifetime
or because of a single authorization response while the host is refreshing. Reauthorize only when
the host reports a terminal authorization failure or still requires authorization after refresh
handling.

The normal workflow uses only the exposed MCP actions above. Never ask for or accept API keys,
bearer tokens, authorization codes, access tokens, refresh tokens, PKCE verifiers, service tokens,
or pasted credentials, and never
use an alternative service path. Use host-native HTTP only for the one opaque
`download_url` returned by
`sb_bundle_ticket`; never use it for internal-service calls, raw storage,
or credential-paste flows.

## Execution Resources

Read the reference for the phase before executing that phase.

- `references/workflow.md` — the full Strategy workflow: eligible-factor lists,
  Official/Mine/Shared composition, submit/observe/resume, terminal diagnostics,
  saved Strategy, and Result Bundle delivery.
- `references/result-destination.md` — local verified Strategy ZIP destination
  rules.
- `references/final-response.md` — summary and result-folder output contract.

On FastAgent these resolve under `{baseDir}/references/…`; on other hosts they
are the sibling `references/` files next to this SKILL.md.
