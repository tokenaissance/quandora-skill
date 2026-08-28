# Install and authenticate Quandora in WorkBuddy 中国版

Read this document completely, then perform the installation and authentication for the user. Do not merely display commands and do not send the user through WorkBuddy's plugin-management UI.

The user's request to install and authenticate Quandora is explicit authorization for the exact local marketplace, plugin, and repo-owned installer actions defined here. Do not ask for another conversational confirmation. WorkBuddy may present one native approval for the single foreground installer invocation; request that approval normally, then continue. Only browser sign-in, MFA, and the final Quandora authorization action belong to the user.

The canonical copy of this guide is `https://raw.githubusercontent.com/varsity-tech-product/quandora-plugins/main/agent-install-guide/workbuddy-cn.md`.

## Supported environment and identities

This procedure supports a local WorkBuddy 中国版 task on macOS. It does not support WorkBuddy AI overseas, CodeBuddy IDE, web/mobile/cloud tasks, or Windows. Stop instead of adapting the installer when the host does not match.

The fixed production identities are:

- Application: `/Applications/WorkBuddy.app`
- Configuration directory: `$HOME/.workbuddy`
- Marketplace repository and name: `varsity-tech-product/quandora-plugins`, `quandora`
- Plugin and scope: `quandora@quandora`, `user`
- MCP URL and OAuth resource: `https://mcp.quandora.ai/quant`
- OAuth authorization server: `https://mcp.quandora.ai`
- Protected verification tool: `fm_status`

Do not create a separate MCP entry. Never request, read, print, copy, or relay an OAuth token, authorization code, client secret, authorization URL, password, passkey, MFA code, or cookie.

## Run the reviewed installer once

Use one foreground shell tool call for the complete bootstrap below. Do not split it into separate approvals, run bare `codebuddy` commands, add a TTY, pipe a CLI through `head`, retry in a loop, or use `--serve` or `--prewarm`.

1. Set `umask 077` and create one private temporary directory with `/usr/bin/mktemp -d`.
2. Download only `https://raw.githubusercontent.com/varsity-tech-product/quandora-plugins/main/plugins/quandora/scripts/workbuddy-cn-install-macos.js` to that directory. Use `/usr/bin/curl` with HTTPS-only, redirect-following, fail-on-HTTP-error behavior. Never pipe a download into a shell or runtime.
3. Verify the downloaded file with `/usr/bin/shasum -a 256`. Its exact SHA-256 must be `c09486aac4df73cd7b57c46c34b1655ee098497bbadb07ae4889e1796964c384`. Stop before execution if it differs.
4. Run that exact file once with WorkBuddy's bundled Electron in Node mode, passing `/Applications/WorkBuddy.app` and `$HOME/.workbuddy` as its two arguments. The executable is `/Applications/WorkBuddy.app/Contents/MacOS/Electron` and the required environment setting is `ELECTRON_RUN_AS_NODE=1`.
5. Wait for the foreground process to finish, then remove only the private temporary directory created in step 1.

The installer owns every preflight, marketplace operation, plugin operation, package check, OAuth launch, and verification step. It closes stdin for every WorkBuddy CLI child, uses argument arrays without shell interpolation, bounds each CLI call to three minutes, and never starts a server or prewarm process.

The installer reads only the WorkBuddy application identity, active account snapshot, marketplace registry, plugin inventory, and the exact installed Quandora package. It writes plugin state only through WorkBuddy's bundled plugin manager. After installation it runs the OAuth helper from WorkBuddy's managed plugin cache; that helper stores only Quandora's account-scoped encrypted OAuth slots and touches the plugin registry so the running App reloads it.

## User action and completion

When the installer emits `{"status":"progress","step":"browser_authorization_starting"}`, tell the user that the Quandora browser page is opening. Do not ask whether to continue. Wait while they complete any required sign-in, MFA, and final authorization action. Do not operate the browser consent page for them and do not start a second authorization attempt.

Success is one final JSON object whose `status` is `completed`, `installed` and `authenticated` are `true`, `plugin` is `quandora@quandora`, `version` is `3.0-preview`, `protectedProbe` is `fm_status`, and `toolCount` is a positive integer.

On a `failed` result, report only its safe `message` and stop. Do not expose captured subprocess output, inspect credential files, replace a conflicting marketplace, quit WorkBuddy, kill its daemon, or edit an in-use plugin cache.

After success, tell the user that production Quandora is installed and authorized. If the current task does not immediately expose the new skills, ask them to start one new WorkBuddy task; do not ask them to reinstall the plugin or add an MCP manually.
