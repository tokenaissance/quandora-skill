# Install and authenticate Quandora in WorkBuddy 中国版

Read this document completely, then perform the installation and authentication for the user. Do not merely display commands and do not send the user through WorkBuddy's plugin-management UI.

The user is responsible only for approving local script execution when WorkBuddy asks and for completing sign-in, MFA, or the final authorization action in the browser. The Agent performs every read-only preflight, marketplace operation, plugin operation, OAuth launch, and verification step.

The canonical copy of this guide is `https://raw.githubusercontent.com/varsity-tech-product/quandora-plugins/main/agent-install-guide/workbuddy-cn.md`.

## Supported environment

This procedure supports a local WorkBuddy 中国版 task on macOS. It does not support WorkBuddy AI overseas, CodeBuddy IDE, web/mobile/cloud tasks, or Windows. Stop instead of adapting the scripts when the host does not match.

Require all of the following:

- Application: `/Applications/WorkBuddy.app`
- Bundle identifier: `com.tencent.workbuddy.mac`
- URL scheme: `workbuddy`
- WorkBuddy version: `5.4.4` or newer
- Configuration directory: `$HOME/.workbuddy`
- Bundled CLI: `/Applications/WorkBuddy.app/Contents/Resources/app.asar.unpacked/cli/bin/codebuddy`
- Bundled CLI version: `2.132.0` or newer
- Signed-in account at `$HOME/.workbuddy/storage/skeleton/account-snapshot.json`

Use these exact production identities:

- Marketplace repository: `varsity-tech-product/quandora-plugins`
- Marketplace name: `quandora`
- Plugin: `quandora@quandora`
- Installation scope: `user`
- MCP server: `quandora`
- MCP URL and OAuth resource: `https://mcp.quandora.ai/quant`
- OAuth authorization server: `https://mcp.quandora.ai`
- Protected verification tool: `fm_status`
- Skills: `factor-mining`, `factor-analysis`, `strategy-building`, `strategy-analysis`, and `paper-trading`

Do not create a separate MCP entry. The plugin owns the MCP configuration. Never request, read, print, copy, or relay an OAuth token, authorization code, client secret, authorization URL, password, passkey, MFA code, or cookie.

## 1. Verify the host and bundled runtime

Use `/usr/bin/plutil` to read the application bundle identifier, version, and first registered URL scheme from `/Applications/WorkBuddy.app/Contents/Info.plist`. Run the bundled CLI with `--version` and verify the required plugin commands with their `--help` output.

Do not install or update Node.js, npm, Python, Homebrew, another CodeBuddy CLI, or any package manager. If the application, account, embedded runtime, minimum version, or required command is unavailable, stop and explain the exact prerequisite to the user.

Use the same absolute bundled CLI path and set this environment variable for every command below:

```text
CODEBUDDY_CONFIG_DIR=$HOME/.workbuddy
```

## 2. Add or refresh the production marketplace

Inspect the marketplace inventory and `$HOME/.workbuddy/plugins/known_marketplaces.json`.

If `quandora` is absent, run:

```text
codebuddy plugin marketplace add varsity-tech-product/quandora-plugins --name quandora
```

If it exists, require this exact structured source before refreshing it:

```json
{
  "type": "github",
  "source": {
    "source": "github",
    "repo": "varsity-tech-product/quandora-plugins"
  }
}
```

Then run:

```text
codebuddy plugin marketplace update quandora
```

If the name points to any other source, stop and report the conflict. Do not replace or remove it.

## 3. Install or update the plugin

Inspect `codebuddy plugin list --json`.

If the exact user-scoped plugin is absent, run:

```text
codebuddy plugin install quandora@quandora --scope user
```

If it is present and its installed package already contains both WorkBuddy China helpers listed below, keep that verified package and continue to enable it. Do not replace an in-use cache merely to repeat installation.

If it is present but either helper is missing, run one update attempt:

```text
codebuddy plugin update quandora@quandora --scope user
```

Re-read the plugin list and installed package. If an update reports that the same-version cache is in use, or either helper remains missing, stop and explain that the installed preview package cannot be replaced safely from the running App. Do not quit WorkBuddy, kill its daemon, edit its cache, or ask the user to use the plugin UI.

Enable it:

```text
codebuddy plugin enable quandora@quandora --scope user
```

Read the plugin list again and record the one user-scoped entry's absolute `installPath` and `version`. Require it to be enabled and inside `$HOME/.workbuddy/plugins/cache`. Require the version to equal the refreshed marketplace entry.

Inside that exact installed directory, verify these package-owned files:

- `.codebuddy-plugin/plugin.json`
- `mcp.json`
- `scripts/workbuddy-cn-auth-macos.sh`
- `scripts/workbuddy-cn-oauth-macos.js`
- all five expected `skills/*/SKILL.md` files

Require the plugin manifest name to be `quandora` and the MCP declaration to be remote HTTP at exactly `https://mcp.quandora.ai/quant`. Do not download, recreate, patch, or copy either helper. Run only the helpers from the verified plugin manager `installPath`.

## 4. Launch App-native OAuth

Tell the user that the Quandora browser authorization page is about to open and that only browser sign-in, MFA, and the final authorization action belong to them.

Run one foreground helper process, substituting the verified absolute `installPath`:

```text
/bin/sh <INSTALL_PATH>/scripts/workbuddy-cn-auth-macos.sh /Applications/WorkBuddy.app $HOME/.workbuddy
```

Wait for it to finish. Do not start another OAuth attempt. The helper:

- uses WorkBuddy's bundled Electron and OAuth modules;
- reads only the installed Quandora manifests and the active WorkBuddy account identifier;
- discovers the production OAuth metadata and performs DCR, PKCE, and a loopback callback;
- opens the system browser without printing the authorization URL;
- stores only Quandora's client and token in WorkBuddy's account-scoped encrypted OAuth store;
- calls protected `fm_status` directly and touches the plugin registry so the running App reloads it.

It never reads another connector's credentials and never receives or prints browser credentials or consent data.

Success is one final JSON object with:

- `status` equal to `completed`
- `authenticated` equal to `true`
- `protectedProbe` equal to `fm_status`
- a positive integer `toolCount`

Any other result is a failure. Report its safe `message` and stop; do not expose helper logs or inspect credential files.

## 5. Verify completion

Recheck the marketplace source, plugin list, installed version, enabled state, manifest identities, MCP URL, five skills, and the successful protected helper result. Report success only when every check passes.

Tell the user that production Quandora is installed and authorized in WorkBuddy's active account. If the current task does not immediately expose the new skills, ask them to start one new WorkBuddy task; do not ask them to reinstall the plugin or add an MCP manually.
