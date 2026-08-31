#!/usr/bin/env python3
"""Validate the production WorkBuddy China package contract without credentials."""

from __future__ import annotations

import hashlib
import json
import re
import stat
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PLUGIN = ROOT / "plugins" / "quandora"
GUIDE = ROOT / "agent-install-guide" / "workbuddy-cn.md"
BOOTSTRAP = PLUGIN / "scripts" / "workbuddy-cn-bootstrap-macos.sh"
INSTALLER = PLUGIN / "scripts" / "workbuddy-cn-install-macos.js"
OAUTH = PLUGIN / "scripts" / "workbuddy-cn-oauth-macos.js"
CALLBACK_TEST = ROOT / "scripts" / "test-workbuddy-cn-oauth-callback.js"


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    marketplace_paths = [
        ROOT / ".claude-plugin" / "marketplace.json",
        ROOT / ".codebuddy-plugin" / "marketplace.json",
    ]
    plugin_paths = [
        ROOT / "kimi.plugin.json",
        PLUGIN / ".claude-plugin" / "plugin.json",
        PLUGIN / ".codebuddy-plugin" / "plugin.json",
        PLUGIN / ".codex-plugin" / "plugin.json",
        PLUGIN / ".cursor-plugin" / "plugin.json",
    ]
    versions: list[str] = []
    for path in marketplace_paths:
        payload = read_json(path)
        require(payload["name"] == "quandora", f"wrong marketplace name: {path}")
        require(len(payload["plugins"]) == 1, f"unexpected plugin count: {path}")
        require(
            payload["plugins"][0]["name"] == "quandora"
            and payload["plugins"][0]["source"] == "./plugins/quandora",
            f"wrong marketplace plugin source: {path}",
        )
        versions.extend([payload["version"], payload["plugins"][0]["version"]])
    for path in plugin_paths:
        payload = read_json(path)
        require(payload["name"] == "quandora", f"wrong plugin name: {path}")
        versions.append(payload["version"])
    require(len(versions) == 9 and len(set(versions)) == 1, "package versions differ")
    require(versions[0] == "3.0-preview", "WorkBuddy repair changed package version")

    mcp = read_json(PLUGIN / "mcp.json")["mcpServers"]
    require(
        mcp
        == {
            "quandora": {
                "type": "http",
                "url": "https://mcp.quandora.ai/quant",
            }
        },
        "production MCP declaration differs",
    )
    for skill in (
        "factor-mining",
        "factor-analysis",
        "strategy-building",
        "strategy-analysis",
        "paper-trading",
    ):
        require((PLUGIN / "skills" / skill / "SKILL.md").is_file(), f"missing {skill}")

    guide = GUIDE.read_text(encoding="utf-8")
    bootstrap = BOOTSTRAP.read_text(encoding="utf-8")
    installer = INSTALLER.read_text(encoding="utf-8")
    oauth = OAUTH.read_text(encoding="utf-8")
    require(
        "quandora-staging" not in guide + bootstrap + installer + oauth,
        "staging identity leaked",
    )

    bootstrap_url = (
        "https://raw.githubusercontent.com/varsity-tech-product/"
        "quandora-plugins/main/plugins/quandora/scripts/"
        "workbuddy-cn-bootstrap-macos.sh"
    )
    for expected in (
        bootstrap_url,
        "varsity-tech-product/quandora-plugins",
        "quandora@quandora",
        "https://mcp.quandora.ai/quant",
        "600000",
        "curl --proto '=https' --tlsv1.2 --location --fail",
        '/bin/sh "$quandora_bootstrap"',
        "Personal Center",
        "https://www.codebuddy.cn/work/",
    ):
        require(expected in guide, f"guide is missing {expected}")
    require(digest(BOOTSTRAP) in guide, "guide does not pin the bootstrap SHA-256")
    for forbidden in (
        "/Applications/WorkBuddy.app",
        "$HOME/.workbuddy",
        "3.0-preview",
        "workbuddy-cn-install-macos.js'",
        "workbuddy-cn-oauth-macos.js'",
        "codebuddy plugin",
        "ELECTRON_RUN_AS_NODE",
        "const fs =",
        "| /bin/sh",
        "| sh",
    ):
        require(forbidden not in guide, f"guide contains implementation detail: {forbidden}")
    shell_blocks = re.findall(r"\x60\x60\x60sh\n(.*?)\x60\x60\x60", guide, flags=re.S)
    require(len(shell_blocks) == 1, "guide must contain one shell bootstrap block")
    require(
        len([line for line in shell_blocks[0].splitlines() if line.strip()]) <= 14,
        "guide bootstrap is too large",
    )

    for expected in (
        "#!/bin/sh\n\nset -eu\numask 077\n",
        'com.tencent.workbuddy.mac',
        "path to application id",
        "CODEBUDDY_CONFIG_DIR",
        "https://www.codebuddy.cn/work/",
        "raw.githubusercontent.com/varsity-tech-product/quandora-plugins/main",
        "curl",
        "shasum -a 256",
        "MAX_SCRIPT_BYTES=1048576",
        'ELECTRON_RUN_AS_NODE=1 "$electron"',
    ):
        require(expected in bootstrap, f"bootstrap is missing {expected}")
    require(digest(INSTALLER) in bootstrap, "bootstrap does not pin installer SHA-256")
    require(digest(OAUTH) in bootstrap, "bootstrap does not pin OAuth SHA-256")
    for forbidden in (
        "MIN_APP_VERSION",
        "MIN_CLI_VERSION",
        "PLUGIN_VERSION",
        "3.0-preview",
        "2.132.0",
        "5.4.4",
        "/internal/mcp/",
        "OAUTH_PORT",
        "--serve",
        "--prewarm",
        "curl -fsSL",
        "| bash",
        "| sh",
        "npm install",
        "brew install",
    ):
        require(forbidden not in bootstrap, f"bootstrap exceeds scope: {forbidden}")

    installer_requirements = (
        'const MARKETPLACE_REPOSITORY = "varsity-tech-product/quandora-plugins";',
        'const PLUGIN_ID = "quandora@quandora";',
        'const MCP_URL = "https://mcp.quandora.ai/quant";',
        'stdio: ["ignore", "pipe", "pipe"]',
        "shell: false",
        "const CLI_TIMEOUT_MS = 2 * 60 * 1000;",
        "const INSTALL_TIMEOUT_MS = 9 * 60 * 1000 + 30 * 1000;",
        "env.CODEBUDDY_CONFIG_DIR = configRoot;",
        'return ["plugin", ...args, "--", "--print"];',
        'pluginArgs("marketplace", "add", MARKETPLACE_REPOSITORY, "--name", MARKETPLACE_NAME)',
        'pluginArgs("install", PLUGIN_ID, "--scope", "user")',
        'pluginArgs("enable", PLUGIN_ID, "--scope", "user")',
        '"CODEBUDDY_SESSION_ID"',
        '"CODEBUDDY_TOOL_CALL_ID"',
        '"CODEBUDDY_CONVERSATION_REQUEST_ID"',
        '"CODEBUDDY_MCP_CONFIG"',
        '"CODEBUDDY_SERVICE_PROXY_URL"',
        'path.basename(installerPath) !== "workbuddy-cn-install-macos.js"',
        "!isInside(temporaryRoot, installerDirectory)",
        "fs.unlinkSync(installerPath)",
        "fs.rmdirSync(installerDirectory)",
        'path.basename(reviewedHelperPath) !== "workbuddy-cn-oauth-macos.js"',
        "path.dirname(reviewedHelperPath) !== path.dirname(installerPath)",
        'realpath(process.execPath, "Active runtime") !== electron',
        'pluginArgs("--help")',
        'env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" }',
        "onStderrLine: relayOAuthProgress",
        '"browser_opened"',
        "oauthFailureRequiresHostUpdate",
    )
    for expected in installer_requirements:
        require(expected in installer, f"installer is missing {expected}")
    for forbidden in (
        "--serve",
        "--prewarm",
        "execSync",
        "spawnSync",
        "shell: true",
        "readdirSync",
        "globSync",
        ".credentials.json",
        "purgeByServerName",
        "runningInstallerHash",
        "MIN_APP_VERSION",
        "MIN_CLI_VERSION",
        "PLUGIN_VERSION",
        "OAUTH_HELPER_URL",
        "/Applications/WorkBuddy.app",
        '["plugin", "marketplace"',
        '["plugin", "install"',
        '["plugin", "enable"',
    ):
        require(forbidden not in installer, f"installer exceeds scope: {forbidden}")

    oauth_requirements = (
        'const CONFIG_ID = "custom-mcp:quandora";',
        'const MCP_URL = "https://mcp.quandora.ai/quant";',
        'const AUTHORIZATION_SERVER = "https://mcp.quandora.ai";',
        'mcpServers?.["quandora"]',
        'path.join(configRoot, "storage", "skeleton", "account-snapshot.json")',
        'path.join(configRoot, "plugins", "cache")',
        'fs.realpathSync(process.execPath) !== electron',
        "ConnectorOAuthStore",
        "store.loadTokens(CONFIG_ID, MCP_URL)",
        "store.saveClientInfo(CONFIG_ID, MCP_URL, clientInformation)",
        "store.saveTokens(CONFIG_ID, MCP_URL, tokens)",
        'name: "fm_status"',
        'spawnSync("/usr/bin/open"',
        'fs.utimesSync(registry, now, now)',
        "AbortSignal.timeout(REQUEST_TIMEOUT_MS)",
        "AbortSignal.any([init.signal, timeoutSignal])",
        "fetchFn: boundedFetch",
        'emitProgress("callback_received")',
        'emitProgress("token_exchange_completed")',
        "callbackResponse.shouldKeepAlive = false",
        'Connection: "close"',
        "server.closeAllConnections?.()",
        '"host_update_required"',
        "module.exports = { createCallbackServer };",
        "error instanceof SafeError",
    )
    for expected in oauth_requirements:
        require(expected in oauth, f"OAuth helper is missing {expected}")
    for forbidden in (
        "readdirSync",
        "globSync",
        "execSync",
        "shell: true",
        "purgeByServerName",
        "deleteAll(",
        "clearLegacyPlaintext",
        ".credentials.json",
        "QUANDORA_WORKBUDDY_FORCE_REAUTH",
        "/Applications/WorkBuddy.app",
    ):
        require(forbidden not in oauth, f"OAuth helper exceeds scope: {forbidden}")
    require(
        len(re.findall(r"fs\.readFileSync\(", oauth)) == 1,
        "OAuth helper gained another raw file-read primitive",
    )
    require(
        not (PLUGIN / "scripts" / "workbuddy-cn-auth-macos.sh").exists(),
        "obsolete WorkBuddy China OAuth wrapper remains",
    )

    for executable in (BOOTSTRAP, INSTALLER, CALLBACK_TEST):
        require(
            executable.stat().st_mode & stat.S_IXUSR,
            f"required executable bit missing: {executable.name}",
        )

    print(
        json.dumps(
            {
                "status": "ok",
                "packageVersion": versions[0],
                "platform": "workbuddy-cn-macos",
                "guideBootstrapLines": len(
                    [line for line in shell_blocks[0].splitlines() if line.strip()]
                ),
                "hostDiscovery": "bundle-and-capability",
                "credentialReads": "quandora-slot-only",
                "installerCliStdin": "closed",
                "installerCliMode": "headless-print",
                "agentRoutingEnvironment": "removed",
                "installerComponents": "bootstrap-hash-pinned",
            },
            separators=(",", ":"),
        )
    )


if __name__ == "__main__":
    main()
