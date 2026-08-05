# Install and authenticate Quandora in Claude Desktop

Read this document completely, then perform the installation and authentication. Do not merely show the user commands. Ask the user to act only when the Quandora authorization page requires their sign-in, MFA, or consent.

## Required environment

This procedure requires a new local session in the **Code** tab of Claude Desktop on macOS or Windows. It does not apply to the normal Chat tab, web, mobile, Cowork, cloud, or remote sessions. If the current session is not a local Code session, stop and direct the user to the correct surface.

Use these exact production identities:

- Marketplace repository: `https://github.com/varsity-tech-product/quandora-plugins.git`
- Marketplace branch: `main`
- Marketplace name: `quandora`
- Plugin: `quandora@quandora`
- Plugin-managed MCP server: `plugin:quandora:quandora`
- MCP URL: `https://mcp.quandora.ai/quant`
- Skills: `factor-mining` and `strategy-building`

Do not create a separate MCP entry. The plugin owns the MCP configuration. Never request or handle an API key, OAuth token, cookie, callback code, or authorization URL.

## 1. Locate the Claude Code CLI

Prefer the Claude Code executable bundled with the running Claude Desktop application. Resolve it to an absolute path and verify:

```text
claude --version
claude plugin marketplace list --help
claude plugin install --help
claude mcp login --help
```

If no compatible executable is available, install the official Claude Code CLI for the current operating system.

macOS:

```sh
curl -fsSL https://claude.ai/install.sh | bash
```

Windows PowerShell:

```powershell
irm https://claude.ai/install.ps1 | iex
```

Resolve the installed executable, repeat the checks, and use that same absolute path for every command below. If the required commands remain unavailable, ask the user to update and fully restart Claude Desktop, recheck once, and stop if they are still unavailable.

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

Confirm that the plugin is enabled and exposes both expected skills and the plugin-managed MCP server.

## 4. Start OAuth authorization

Inspect the MCP server:

```text
claude mcp get plugin:quandora:quandora
```

Require a remote HTTP server whose URL is exactly `https://mcp.quandora.ai/quant`. If the identity resolves to another URL or a local command, stop and report the conflict. If it is already authenticated and connected, continue to verification.

Claude Desktop command execution may not provide the interactive terminal required by `claude mcp login`. Start the official login command through the operating system's built-in interactive facility. Run only one login flow.

### macOS

Substitute the verified absolute Claude executable path for `<CLAUDE_BIN>`:

```sh
/usr/bin/nohup /usr/bin/script -q /dev/null /bin/sh -c \
  'exec "$1" mcp login "plugin:quandora:quandora"' \
  quandora-login "<CLAUDE_BIN>" </dev/null >/dev/null 2>&1 &
```

### Windows

Use Windows PowerShell. Substitute the verified absolute Claude executable path:

```powershell
$env:QUANDORA_CLAUDE_BIN = '<CLAUDE_BIN>'
Start-Process `
  -FilePath "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" `
  -ArgumentList @(
    '-NoLogo',
    '-NoProfile',
    '-Command',
    '& $env:QUANDORA_CLAUDE_BIN mcp login ''plugin:quandora:quandora''; exit $LASTEXITCODE'
  )
```

The user's browser should open automatically. Tell the user that Quandora is ready for authorization, then wait while they complete any required sign-in or MFA and approve access. Do not inspect or operate the consent page, capture the child process output, use `--no-browser`, or start a second login flow.

Poll the exact `claude mcp get` command for completion. If the first login process exits because of a timeout or transient network error, retry once after it has fully ended.

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
3. Both `factor-mining` and `strategy-building` are present.
4. `plugin:quandora:quandora` points to `https://mcp.quandora.ai/quant` over remote HTTP.
5. OAuth is complete and the MCP server is connected.

After verification, tell the user that Quandora is installed and authorized. Ask them to start a new local Claude Desktop Code session before using the newly installed skills and MCP tools.
