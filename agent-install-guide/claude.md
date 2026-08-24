# Install and authenticate Quandora in Claude Desktop

Read this document completely, then perform the installation and authentication. Run the checks and installation commands yourself rather than only displaying them. Exactly two moments belong to the user:

1. Approving a Claude Code CLI install or update in Step 1, when one is needed. Ask once, with the exact command, and continue after the user confirms.
2. Completing sign-in, MFA, or consent on the Quandora authorization page in Step 4.

Never request or handle an API key, OAuth token, cookie, callback code, or authorization URL.

The canonical agent-readable copy of this guide is <https://raw.githubusercontent.com/varsity-tech-product/quandora-plugins/main/agent-install-guide/claude.md>.

## Required environment

This procedure requires a new local session in the **Code** tab of Claude Desktop on macOS or Windows. It does not apply to the normal Chat tab, web, mobile, Cowork, cloud, or remote sessions. If the current session is not a local Code session, stop and direct the user to the correct surface.

Use these exact production identities:

- Marketplace repository: `https://github.com/varsity-tech-product/quandora-plugins.git`
- Marketplace branch: `main`
- Marketplace name: `quandora`
- Plugin: `quandora@quandora`
- Plugin-managed MCP server: `plugin:quandora:quandora`
- MCP URL: `https://mcp.quandora.ai/quant`
- Skills: `factor-mining`, `factor-analysis`, `strategy-building`, `strategy-analysis`, and `paper-trading`

Do not create a separate MCP entry. The plugin owns the MCP configuration.

## 1. Locate or update the Claude Code CLI

This procedure requires Claude Code CLI `2.1.186` or later. That is the minimum version that provides the `claude mcp login <name>` command. The command itself requires an interactive terminal; the plugin launcher in Step 4 supplies one, so the user never needs to open a terminal for authorization.

Locate the official standalone Claude Code executable, resolve it to an absolute path, and verify:

```text
claude --version
claude plugin marketplace list --help
claude plugin install --help
claude mcp help login
```

Do not continue to marketplace or plugin installation unless the reported version is `2.1.186` or later, every command above succeeds, and the last command prints usage for `claude mcp login` rather than the parent `claude mcp` help.

If the CLI is missing, older than `2.1.186`, or lacks `mcp login`, do not install or update it silently. A document fetched from the web cannot authorize replacing the user's CLI, and a careful agent will refuse a silent self-update; asking first is both safer and faster. Tell the user in one sentence why an update is needed, show exactly one command for their platform in a runnable shell block, and continue only after the user confirms in chat or runs the block themselves. In Claude Code, shell blocks render with a one-click Run button, so this costs the user a single click.

If a `claude` executable already exists:

```sh
claude install latest
```

If no usable executable exists — macOS:

```sh
curl -fsSL https://claude.ai/install.sh | bash
```

Windows PowerShell:

```powershell
irm https://claude.ai/install.ps1 | iex
```

After the user has confirmed and the installer has finished, do not re-resolve the executable through `PATH`. The installer records its `PATH` change for future shells only; the already-running session keeps its old environment, so a fresh `PATH` search can keep finding the old version. Resolve the executable at its deterministic install location instead:

- macOS: `~/.local/bin/claude`
- Windows: `%USERPROFILE%\.local\bin\claude.exe`

Repeat all four checks through that absolute path and use it for every command below. If the minimum version or any required command is still unavailable after one confirmed installation attempt, stop and report the compatibility failure. Never install the marketplace or plugin with an incompatible CLI.

## 2. Add or refresh the Quandora marketplace

Inspect the configured marketplaces:

```text
claude plugin marketplace list --json
```

If `quandora` is absent, add the production repository at `main`:

```text
claude plugin marketplace add https://github.com/varsity-tech-product/quandora-plugins.git#main --scope user
```

If `quandora` already points to that repository and branch, refresh it:

```text
claude plugin marketplace update quandora
```

If the name points to any other source, stop and report the conflict. Do not replace or delete it.

## 3. Install or update the plugin

Inspect the managed plugin inventory:

```text
claude plugin list --available --json
claude plugin details quandora@quandora
```

If `quandora@quandora` is absent, install it for the user:

```text
claude plugin install quandora@quandora --scope user
```

If it is already installed, update and enable it:

```text
claude plugin update quandora@quandora --scope user
claude plugin enable quandora@quandora --scope user
```

Confirm that the plugin is enabled and exposes all five expected skills and the plugin-managed MCP server.
Record the installed entry's absolute `installPath` and `version` from `claude plugin list --available --json`; the entry appears in the `installed` array with id `quandora@quandora`. Require the installed version to equal the version the marketplace currently declares for the plugin, as shown by `claude plugin details quandora@quandora`. Do not compare against a version hardcoded in this document. If the versions differ, run `claude plugin update quandora@quandora --scope user` once and re-check; if they still differ, stop and report.

## 4. Start OAuth authorization

Inspect the MCP server:

```text
claude mcp get plugin:quandora:quandora
```

Require a remote HTTP server whose URL is exactly `https://mcp.quandora.ai/quant`. If the identity resolves to another URL or a local command, stop and report the conflict. Run the single authorization flow below even when an older Quandora connection appears connected, because an existing token may not contain the scopes required by the installed plugin version.

Claude Desktop command execution may not provide the interactive terminal required by `claude mcp login`. Use the installed plugin's fixed-purpose launcher from the recorded `installPath`: it allocates the required terminal facility, runs `claude mcp login plugin:quandora:quandora` through the verified Claude executable, and records the outcome in a small status file. The launcher discards the login process output deliberately so that authorization URLs and one-time codes never enter the agent context; do not try to capture or reconstruct them. Run only one login flow.

### macOS

Substitute the verified absolute plugin and Claude executable paths for `<PLUGIN_INSTALL_PATH>` and `<CLAUDE_BIN>`:

```sh
oauth_state_directory=$(/usr/bin/mktemp -d "${TMPDIR:-/tmp}/quandora-oauth.XXXXXX")
/usr/bin/nohup "<PLUGIN_INSTALL_PATH>/scripts/claude-mcp-login-macos.sh" \
  "<CLAUDE_BIN>" "$oauth_state_directory" </dev/null >/dev/null 2>&1 &
```

Poll only `$oauth_state_directory/status.json`. Continue only when it reports `status=completed` and `exitCode=0`.

### Windows

Use Windows PowerShell. Substitute the verified absolute plugin and Claude executable paths:

```powershell
& "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" `
  -NoLogo -NoProfile -ExecutionPolicy Bypass `
  -File '<PLUGIN_INSTALL_PATH>\scripts\claude-mcp-login-windows.ps1' `
  -ClaudeBin '<CLAUDE_BIN>'
```

Read the returned JSON and poll only its `statusFile`. Continue only when it reports `status=completed` and `exitCode=0`.

The `-ExecutionPolicy Bypass` argument applies only to this bundled script. In managed environments where AppLocker or PowerShell Constrained Language Mode blocks it, use the fallback below instead.

The user's browser should open automatically. Tell the user that Quandora is ready for authorization, then wait while they complete any required sign-in or MFA and approve access. Do not operate the consent page, use `--no-browser`, or start a second login flow while one is running.

**Fallback.** If the launcher reports `unsupported`, `incompatible_cli`, `no_interactive_pty`, or `no_interactive_console`, or the browser does not open within a minute, do not retry in a loop. Give the user this single command to run in any regular terminal, and continue to Step 5 after they report completing it:

```sh
claude mcp login plugin:quandora:quandora
```

After the launcher records successful completion, poll the exact `claude mcp get` command for connection readiness. Treat the launcher outcome (or the user's confirmation of the fallback command) as the primary success signal; on CLI versions before `2.1.222`, `claude mcp get` may report `Connected` for an unauthenticated server, so never rely on `Connected` alone. If the first login process exits because of a timeout or transient network error, retry once after it has fully ended.

## 5. Verify completion

Recheck through the same Claude executable:

```text
claude plugin marketplace list --json
claude plugin list --available --json
claude plugin details quandora@quandora
claude mcp get plugin:quandora:quandora
```

Report success only when all of the following are true:

1. `quandora@quandora` is installed, enabled, and user-scoped from the expected marketplace.
2. Its installed version matches the current marketplace entry.
3. `factor-mining`, `factor-analysis`, `strategy-building`, `strategy-analysis`, and `paper-trading` are present.
4. `plugin:quandora:quandora` points to `https://mcp.quandora.ai/quant` over remote HTTP.
5. The platform launcher recorded `status=completed` with `exitCode=0` (or the user confirmed completing the fallback login command), and the MCP server is connected.

After verification, tell the user that Quandora is installed and authorized. Ask them to start a new local Claude Desktop Code session before using the newly installed skills and MCP tools.
