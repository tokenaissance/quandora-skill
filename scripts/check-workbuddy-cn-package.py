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
INSTALLER = PLUGIN / "scripts" / "workbuddy-cn-install-macos.js"
WRAPPER = PLUGIN / "scripts" / "workbuddy-cn-auth-macos.sh"
OAUTH = PLUGIN / "scripts" / "workbuddy-cn-oauth-macos.js"
CALLBACK_TEST = ROOT / "scripts" / "test-workbuddy-cn-oauth-callback.js"


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


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
    require(versions[0] == "3.0-preview", "WorkBuddy fix must not change package version")

    mcp = read_json(PLUGIN / "mcp.json")["mcpServers"]
    require(
        mcp == {
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
    installer = INSTALLER.read_text(encoding="utf-8")
    wrapper = WRAPPER.read_text(encoding="utf-8")
    oauth = OAUTH.read_text(encoding="utf-8")
    require(
        "quandora-staging" not in guide + installer + wrapper + oauth,
        "staging identity leaked",
    )
    for expected in (
        "varsity-tech-product/quandora-plugins",
        "quandora@quandora",
        "https://mcp.quandora.ai/quant",
        "plugins/quandora/scripts/workbuddy-cn-install-macos.js",
        "Do not ask for another conversational confirmation.",
        "600000",
        "curl --proto '=https' --tlsv1.2 --location --fail",
        'ELECTRON_RUN_AS_NODE=1 /Applications/WorkBuddy.app/Contents/MacOS/Electron',
    ):
        require(expected in guide, f"guide is missing {expected}")
    installer_sha256 = hashlib.sha256(INSTALLER.read_bytes()).hexdigest()
    require(installer_sha256 in guide, "guide does not pin the installer SHA-256")
    require("codebuddy plugin" not in guide, "guide still orchestrates bare plugin commands")
    require("/bin/rm" not in guide, "guide asks the shell to delete files")

    installer_requirements = (
        'const MARKETPLACE_REPOSITORY = "varsity-tech-product/quandora-plugins";',
        'const PLUGIN_ID = "quandora@quandora";',
        'const PLUGIN_VERSION = "3.0-preview";',
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
        '!isInside(temporaryRoot, installerDirectory)',
        "fs.unlinkSync(installerPath)",
        "fs.rmdirSync(installerDirectory)",
        'step: "browser_authorization_starting"',
        'path.join(pluginRoot, "scripts", "workbuddy-cn-auth-macos.sh")',
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
        'require("node:crypto")',
        '["plugin", "marketplace"',
        '["plugin", "install"',
        '["plugin", "enable"',
    ):
        require(forbidden not in installer, f"installer exceeds scope: {forbidden}")

    require(wrapper.startswith("#!/bin/sh\nset -eu\numask 077\n"), "unsafe shell prelude")
    require("ELECTRON_RUN_AS_NODE=1" in wrapper, "bundled Electron is not used")
    require("codebuddy" not in wrapper.lower(), "OAuth wrapper must not start another CLI")
    require("curl" not in wrapper.lower(), "OAuth wrapper must not make shell HTTP calls")

    oauth_requirements = (
        'const CONFIG_ID = "custom-mcp:quandora";',
        'const MCP_URL = "https://mcp.quandora.ai/quant";',
        'const AUTHORIZATION_SERVER = "https://mcp.quandora.ai";',
        'mcpServers?.["quandora"]',
        'path.join(configRoot, "storage", "skeleton", "account-snapshot.json")',
        'path.join(configRoot, "plugins", "cache")',
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
    ):
        require(forbidden not in oauth, f"OAuth helper exceeds scope: {forbidden}")
    require(
        len(re.findall(r"fs\.readFileSync\(", oauth)) == 1,
        "OAuth helper gained another raw file-read primitive",
    )

    wrapper_mode = WRAPPER.stat().st_mode
    require(wrapper_mode & stat.S_IXUSR, "macOS wrapper is not executable")
    installer_mode = INSTALLER.stat().st_mode
    require(installer_mode & stat.S_IXUSR, "macOS installer is not executable")
    callback_test_mode = CALLBACK_TEST.stat().st_mode
    require(callback_test_mode & stat.S_IXUSR, "OAuth callback test is not executable")
    print(
        json.dumps(
            {
                "status": "ok",
                "packageVersion": versions[0],
                "platform": "workbuddy-cn-macos",
                "credentialReads": "quandora-slot-only",
                "installerCliStdin": "closed",
                "installerCliMode": "headless-print",
                "agentRoutingEnvironment": "removed",
            },
            separators=(",", ":"),
        )
    )


if __name__ == "__main__":
    main()
