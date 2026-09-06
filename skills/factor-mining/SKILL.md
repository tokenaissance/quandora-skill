---
name: factor-mining
description: Use when the user explicitly asks about caller-owned or reusable Factor Mining factor families or history, or asks to construct, submit, backtest, resume, retrieve, or briefly summarize artifacts for a Factor Mining plugin. Route deep diagnosis and optimization of an existing factor result to factor-analysis.
metadata:
  fastagent:
    emoji: "🧪"
mcpServers:
  quandora:
    url: https://mcp.quandora.ai/quant
    oauthResource: https://mcp.quandora.ai/quant
---

# Quandora Factor Mining

Bundled plugin version: 1.4.1

Use this skill to run Factor Mining through the authenticated Quandora connection exposed by the host as `quandora`.

The agent drafts a valid Factor Mining `plugin.py`, submits the complete source inline, waits for the backtest result, saves one verified FM-owned Result Bundle ZIP when the host allows it, and summarizes the outcome.

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

If the required Quandora tools are visible, continue automatically. If they are not visible, tell the user to update or reinstall the current Quandora plugin, then use the host's normal Quandora reconnect and browser re-authorization path before stopping:

- Codex CLI/TUI: run `codex mcp login quandora`. Wait for the user to complete the browser authorization flow, then check again for `fm_status`.
- Codex Desktop: the plugin provides the Quandora connector. If the first use opens the authorization flow, wait for the user to authorize Quandora in the browser, then continue in a new chat. If the tools still are not visible, tell the user to fully quit and reopen Codex Desktop.
- Kimi Code: run `/mcp-config login plugin-quandora:quandora`, complete the browser authorization flow, then start a new chat and check `/mcp`.
- Claude Code: open `/mcp`, authenticate `quandora`, then start a new chat.
- Claude Desktop: the plugin alone is not enough. Tell the user to open Settings -> Connectors, add a Connector named `quandora` with URL `https://mcp.quandora.ai/quant`, click Connect, authorize Quandora in the browser, then start a new chat.
- CodeBuddy and the WorkBuddy China edition: update or reinstall the `quandora` plugin, reconnect its plugin-managed Remote MCP server, complete the host-native browser authorization flow, then start a new chat.
- FastAgent (tokenaissance Cloud): the Quandora MCP server is attached to the agent. Open the agent's settings, re-authorize `quandora` in the MCP OAuth panel (or run `fastagent mcp login quandora`), then start a new chat.

Do not start a new authorization flow merely because an access token reached its seven-day lifetime or because of a single authorization response while the host is refreshing. Reauthorize only when the host reports a terminal authorization failure or still requires authorization after refresh handling.

Do not ask for Quandora API keys, `vt_` keys, bearer tokens, authorization codes, access tokens, refresh tokens, PKCE verifiers, service tokens, or pasted credentials. Do not use raw HTTP calls, local helper scripts, direct internal service calls, local execution keys, or credential paste flows. The only permitted direct HTTP download is consuming a short-lived Remote MCP artifact URL returned by a Factor Mining download-ticket action; never construct, modify, reuse, or persist that URL.

## Available Actions

After routing has confirmed Factor Mining scope, use only the Factor Mining actions exposed by `quandora`. The artifact-ticket download exception above is only for consuming returned artifact bytes; it is not permission to call a service API directly.

The action names below are the 1.4.1 baseline. The Quandora server's live
tool list is authoritative: actions may be added, renamed, or removed between
releases. If a listed action is absent or an unlisted one appears, follow the
live list and the plugin version reminder.

- `fm_status`
- `fm_list_factors`
- `fm_get_history`
- `fm_list_tasks`
- `fm_get_contract`
- `fm_task_session`
- `fm_custom_sess`
- `fm_validate`
- `fm_dedup_context`
- `fm_run_backtest`
- `fm_resume_run`
- `fm_bundle_ticket`
- `fm_bundle_chunk`
- `qd_get_guidance`
- `qd_plugin_ver` (conversation-level read-only reminder check; not a business action)

Some hosts may prefix action names with the server name, such as `quandora__fm_status`. Treat those as the same actions.

## Execution Resources

The version reminder and available actions above stay load-bearing in this root.
Everything else lives in `references/`; read the reference for the phase before
executing that phase.

- `references/plugin-contract.md` — Plugin Construction Contract (call
  `fm_get_contract`; C# snippet and naming rules).
- `references/workflow.md` — the full Factor Mining workflow: routing, guidance,
  reuse/history, public-task and custom sessions, dedup, validation, upload,
  resume, mutation recovery, waiting, and Result Bundle handling.
- `references/plugin-py-contract.md` — canonical `plugin.py` shape and
  Python/C# alignment rules.
- `references/final-response.md` — summary and result-folder output contract.
- `references/security.md` — credential, network, and file rules.

On FastAgent these resolve under `{baseDir}/references/…`; on other hosts they
are the sibling `references/` files next to this SKILL.md.
