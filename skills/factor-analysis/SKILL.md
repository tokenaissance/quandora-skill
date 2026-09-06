---
name: factor-analysis
description: Analyze, diagnose, compare, and propose controlled improvements for existing Quandora Factor Mining results from owner-scoped server-persisted evidence. Use when a user asks why a factor or rating passed or failed, requests a Factor Card Health Check or data-quality diagnosis, wants optimization ideas grounded in evidence, or asks whether a factor is ready for Strategy Building. Do not use for creating or submitting a new factor; route those requests to factor-mining.
metadata:
  fastagent:
    emoji: "🔬"
mcpServers:
  quandora:
    url: https://mcp.quandora.ai/quant
    oauthResource: https://mcp.quandora.ai/quant
---

# Factor Analysis

Bundled plugin version: 1.3.0

Analyze one exact factor result as a read-only research workflow. Use Quandora's owner-scoped,
server-persisted Factor Card, chart data, and job-linked source. Separate observed evidence from
inference, alternative explanations, and proposed experiments. Never turn an optimization idea
into an automatic submission.

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

Use this skill for deep diagnosis of an existing factor result, including:

- performance, stability, coverage, turnover, decay, and style interpretation;
- Factor Card Health Check, rating-gate, missingness, and applicability diagnosis;
- mechanism hypotheses and plausible alternative explanations;
- prioritized, controlled factor improvement experiments;
- readiness assessment for handing a factor to Strategy Building.

Use `$factor-mining` for factor ideation, plugin construction, submission, resume, history browsing,
explicit Result Bundle export, or a short ordinary result summary. Use `$strategy-analysis` for a
completed multi-factor Strategy result. Use `$strategy-building` only after the user explicitly
chooses a proposed Strategy experiment.

## Execution Resources

Read the reference for the phase before executing that phase.

- `references/safety.md` — Non-Negotiable Safety rules (read before acting).
- `references/workflow.md` — the full read-only analysis workflow: establish the
  exact target, read server-persisted evidence, build the evidence inventory,
  diagnose mechanism, and propose controlled improvements.
- `references/output-contract.md` — the final diagnosis report contract.

On FastAgent these resolve under `{baseDir}/references/…`; on other hosts they
are the sibling `references/` files next to this SKILL.md.
