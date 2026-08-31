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

Invoke the following block unchanged as one foreground shell tool call and set that tool call's timeout to `600000` milliseconds. Do not split it into separate approvals, run bare `codebuddy` commands, add a TTY, pipe a CLI through `head`, retry in a loop, or use `--serve` or `--prewarm`.

```sh
umask 077
quandora_tmp_root="${TMPDIR:-/tmp}"
quandora_tmp_dir=$(/usr/bin/mktemp -d "${quandora_tmp_root%/}/quandora-workbuddy.XXXXXX") || exit 1
quandora_installer="${quandora_tmp_dir}/workbuddy-cn-install-macos.js"
/usr/bin/curl --proto '=https' --tlsv1.2 --location --fail --silent --show-error \
  --output "$quandora_installer" \
  'https://raw.githubusercontent.com/varsity-tech-product/quandora-plugins/main/plugins/quandora/scripts/workbuddy-cn-install-macos.js' || exit 1
quandora_installer_sha=$(/usr/bin/shasum -a 256 "$quandora_installer" | /usr/bin/awk '{print $1}')
if [ "$quandora_installer_sha" != '01f827fb1c902a6491d3df260060161557f290178474477d10f23f62013beb50' ]; then
  echo 'Quandora installer integrity check failed.' >&2
  exit 1
fi
ELECTRON_RUN_AS_NODE=1 /Applications/WorkBuddy.app/Contents/MacOS/Electron \
  "$quandora_installer" /Applications/WorkBuddy.app "$HOME/.workbuddy"
```

This bootstrap downloads one reviewed installer without executing the network stream and verifies its exact SHA-256. The reviewed installer then downloads the OAuth helper completely, verifies the helper SHA-256 embedded in the reviewed installer, writes it only beside the installer in the private temporary directory, and executes it only after verification. On exit, the installer removes those two exact files only when its exact filename and private `quandora-workbuddy.*` temporary directory are both inside the operating system's temporary root. The installer owns every preflight, marketplace operation, plugin operation, package check, OAuth launch, and verification step.

For plugin-manager operations the installer closes stdin, uses argument arrays without shell interpolation, forces WorkBuddy's public `--print` headless mode, removes only inherited Agent session-routing variables from those child processes, and preserves WorkBuddy's sandbox and approval environment. Each CLI call is bounded to two minutes, the whole installer to nine and a half minutes, and no server or prewarm process is started.

The installer reads only the WorkBuddy application identity, active account snapshot, marketplace registry, plugin inventory, and the exact installed Quandora package. It writes plugin state only through WorkBuddy's bundled plugin manager and never edits an in-use plugin cache. After installation it runs the separately hash-pinned OAuth helper against that managed package; this also repairs existing `3.0-preview` installations whose cache cannot be replaced while WorkBuddy is running. The helper accepts only an exact loopback callback, bounds each OAuth request, closes the browser callback connection after token exchange, stores only Quandora's account-scoped encrypted OAuth slots, and touches the plugin registry so the running App reloads it.

## User action and completion

When the installer emits `{"status":"progress","step":"browser_authorization_starting"}`, tell the user that the Quandora browser page is opening. Do not ask whether to continue. Wait while they complete any required sign-in, MFA, and final authorization action. Do not operate the browser consent page for them and do not start a second authorization attempt.

Success is one final JSON object whose `status` is `completed`, `installed` and `authenticated` are `true`, `plugin` is `quandora@quandora`, `version` is `3.0-preview`, `protectedProbe` is `fm_status`, and `toolCount` is a positive integer.

On a `failed` result, report only its safe `message` and stop. Do not expose captured subprocess output, inspect credential files, replace a conflicting marketplace, quit WorkBuddy, kill its daemon, or edit an in-use plugin cache.

After success, tell the user that production Quandora is installed and authorized. If the current task does not immediately expose the new skills, ask them to start one new WorkBuddy task; do not ask them to reinstall the plugin or add an MCP manually.
