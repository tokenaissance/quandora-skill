# Install and authenticate Quandora in ChatGPT/Codex Desktop

Read this document completely, then perform the installation and authentication. Do not merely show the user commands. Ask the user to act only when the Quandora authorization page requires their sign-in, MFA, or consent.

## Required environment

This procedure requires a local ChatGPT/Codex Desktop task that can run local commands and manage Codex plugins. If the current task is web-only, cloud-hosted, mobile, or otherwise cannot access the local plugin manager, stop and ask the user to open a local Codex task in the desktop application.

Use these exact production identities:

- Marketplace repository: `https://github.com/varsity-tech-product/quandora-plugins.git`
- Marketplace branch: `main`
- Marketplace name: `quandora`
- Plugin: `quandora@quandora`
- MCP server: `quandora`
- MCP URL: `https://mcp.quandora.ai/quant`
- Skills: `factor-mining` and `strategy-building`

Do not create a separate MCP entry. The plugin owns the MCP configuration. Never request or handle an API key, OAuth token, cookie, callback code, or authorization URL.

## 1. Locate the Codex CLI

Prefer the Codex executable bundled with or used by the desktop application. Verify it before continuing:

```text
codex --version
codex plugin marketplace list --help
codex plugin add --help
codex mcp login --help
```

If no compatible Codex executable is available and `npm` is already installed, install the official CLI:

```text
npm install -g @openai/codex
```

Then resolve the new executable and repeat the checks. Do not install a package manager or another runtime. If the required commands remain unavailable, ask the user to update and restart the desktop application, recheck once, and stop if they are still unavailable.

Use the same resolved executable for every command below.

## 2. Add or refresh the Quandora marketplace

Inspect the configured marketplaces:

```text
codex plugin marketplace list --json
```

If `quandora` is absent, add the production repository:

```text
codex plugin marketplace add https://github.com/varsity-tech-product/quandora-plugins.git --ref main --json
```

If `quandora` already points to that repository and branch, refresh it:

```text
codex plugin marketplace upgrade quandora --json
```

If the name points to any other source, stop and report the conflict. Do not replace or delete it.

## 3. Install or update the plugin

Inspect the managed plugin inventory:

```text
codex plugin list --marketplace quandora --available --json
```

If `quandora@quandora` is not installed, install it:

```text
codex plugin add quandora@quandora --json
```

If it is installed and its version is older than the refreshed marketplace entry, reinstall only this exact plugin:

```text
codex plugin remove quandora@quandora --json
codex plugin add quandora@quandora --json
```

Confirm that it is installed and enabled and that it exposes both expected skills.

## 4. Start OAuth authorization

Inspect the plugin-managed MCP server:

```text
codex mcp get quandora --json
```

Require an enabled remote Streamable HTTP server whose URL is exactly `https://mcp.quandora.ai/quant`. If the name resolves to another URL or a local command, stop and report the conflict.

If it is not authenticated, start one foreground native OAuth flow:

```text
codex mcp login quandora
```

The user's browser should open automatically. Tell the user that Quandora is ready for authorization, then wait while they complete any required sign-in or MFA and approve access. Do not operate the consent page for them and do not start a second login while the first is active.

If the first attempt ends because of a timeout or a transient network error, retry once after it has fully exited. Do not use an API key or a local MCP server as a fallback.

## 5. Verify completion

Recheck:

```text
codex plugin list --marketplace quandora --available --json
codex mcp get quandora --json
codex mcp list --json
```

Report success only when all of the following are true:

1. `quandora@quandora` is installed and enabled from the expected marketplace.
2. Its installed version matches the current marketplace entry.
3. Both `factor-mining` and `strategy-building` are present.
4. `quandora` points to `https://mcp.quandora.ai/quant` over remote Streamable HTTP.
5. OAuth is complete and the MCP server is connected.

After verification, tell the user that Quandora is installed and authorized. Ask them to start a new local desktop task before using the newly installed skills and MCP tools.
