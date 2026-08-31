#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const APP_ROOT = "/Applications/WorkBuddy.app";
const BUNDLE_ID = "com.tencent.workbuddy.mac";
const URL_SCHEME = "workbuddy";
const MIN_APP_VERSION = "5.4.4";
const MIN_CLI_VERSION = "2.132.0";
const MARKETPLACE_REPOSITORY = "varsity-tech-product/quandora-plugins";
const MARKETPLACE_NAME = "quandora";
const PLUGIN_ID = "quandora@quandora";
const PLUGIN_NAME = "quandora";
const PLUGIN_VERSION = "3.0-preview";
const MCP_URL = "https://mcp.quandora.ai/quant";
const OAUTH_HELPER_URL = "https://raw.githubusercontent.com/varsity-tech-product/quandora-plugins/main/plugins/quandora/scripts/workbuddy-cn-oauth-macos.js";
const OAUTH_HELPER_SHA256 = "fae478ad6ef10858397154e18da41ae778c2a75880ef6aaee12e8b6afa032464";
const OAUTH_HELPER_LIMIT_BYTES = 1024 * 1024;
const CLI_TIMEOUT_MS = 2 * 60 * 1000;
const OAUTH_TIMEOUT_MS = 7 * 60 * 1000;
const INSTALL_TIMEOUT_MS = 9 * 60 * 1000 + 30 * 1000;
const OUTPUT_LIMIT_BYTES = 1024 * 1024;
const AGENT_ROUTING_ENV_KEYS = [
  "CODEBUDDY_SESSION_ID",
  "CODEBUDDY_TOOL_CALL_ID",
  "CODEBUDDY_CONVERSATION_REQUEST_ID",
  "CODEBUDDY_MCP_CONFIG",
  "CODEBUDDY_SERVICE_PROXY_URL",
  "CODEBUDDY_PROJECT_DIR",
  "CODEBUDDY_CURRENT_MODEL_ID",
  "CLAUDE_SESSION_ID",
  "CLAUDE_PROJECT_DIR",
];
const EXPECTED_SKILLS = [
  "factor-mining",
  "factor-analysis",
  "strategy-building",
  "strategy-analysis",
  "paper-trading",
];

class SafeError extends Error {}

function fail(message) {
  throw new SafeError(message);
}

function requireString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${label} is missing.`);
  }
  return value.trim();
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    fail(`${label} is missing or invalid.`);
  }
}

function realpath(filePath, label) {
  try {
    return fs.realpathSync(filePath);
  } catch {
    fail(`${label} is missing.`);
  }
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative !== "" && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function compareVersions(left, right) {
  const parse = (value) => {
    const match = String(value).match(/^(\d+)\.(\d+)\.(\d+)/);
    if (!match) fail("A required WorkBuddy version has an unsupported format.");
    return match.slice(1).map(Number);
  };
  const a = parse(left);
  const b = parse(right);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] < b[index] ? -1 : 1;
  }
  return 0;
}

function emit(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function validateBootstrapOAuthHelper(helperPath, installerPath) {
  const reviewedHelperPath = realpath(helperPath, "Reviewed Quandora OAuth helper");
  if (
    path.basename(reviewedHelperPath) !== "workbuddy-cn-oauth-macos.js" ||
    path.dirname(reviewedHelperPath) !== path.dirname(installerPath) ||
    sha256(reviewedHelperPath) !== OAUTH_HELPER_SHA256
  ) {
    fail("The reviewed Quandora OAuth helper is missing or invalid.");
  }
  return reviewedHelperPath;
}

async function prepareBootstrapOAuthHelper() {
  const installerPath = realpath(__filename, "Reviewed Quandora installer");
  const helperPath = path.join(path.dirname(installerPath), "workbuddy-cn-oauth-macos.js");
  if (fs.existsSync(helperPath)) {
    return validateBootstrapOAuthHelper(helperPath, installerPath);
  }

  let response;
  try {
    response = await fetch(OAUTH_HELPER_URL, {
      redirect: "error",
      signal: AbortSignal.timeout(30 * 1000),
    });
  } catch {
    fail("The reviewed Quandora OAuth helper could not be downloaded.");
  }
  if (!response.ok) fail("The reviewed Quandora OAuth helper could not be downloaded.");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (
    bytes.length === 0 ||
    bytes.length > OAUTH_HELPER_LIMIT_BYTES ||
    crypto.createHash("sha256").update(bytes).digest("hex") !== OAUTH_HELPER_SHA256
  ) {
    fail("The downloaded Quandora OAuth helper failed its integrity check.");
  }
  try {
    fs.writeFileSync(helperPath, bytes, { flag: "wx", mode: 0o600 });
  } catch {
    fail("The reviewed Quandora OAuth helper could not be prepared.");
  }
  return validateBootstrapOAuthHelper(helperPath, installerPath);
}

function createCliEnv(configRoot) {
  const env = { ...process.env };
  for (const key of AGENT_ROUTING_ENV_KEYS) delete env[key];
  env.CODEBUDDY_CONFIG_DIR = configRoot;
  env.NO_COLOR = "1";
  return env;
}

function pluginArgs(...args) {
  return ["plugin", ...args, "--", "--print"];
}

function remainingTimeout(startedAt, maximumMs, label) {
  const remaining = INSTALL_TIMEOUT_MS - (Date.now() - startedAt);
  if (remaining <= 0) fail(`${label} could not start before the installer deadline.`);
  return Math.min(maximumMs, remaining);
}

function cleanupTemporaryBootstrap() {
  try {
    const installerPath = fs.realpathSync(__filename);
    const installerDirectory = path.dirname(installerPath);
    const temporaryRoot = fs.realpathSync(process.env.TMPDIR || "/tmp");
    if (
      path.basename(installerPath) !== "workbuddy-cn-install-macos.js" ||
      !/^quandora-workbuddy\.[A-Za-z0-9]{6,12}$/.test(path.basename(installerDirectory)) ||
      !isInside(temporaryRoot, installerDirectory)
    ) {
      return;
    }
    const oauthHelperPath = path.join(installerDirectory, "workbuddy-cn-oauth-macos.js");
    if (fs.existsSync(oauthHelperPath)) fs.unlinkSync(oauthHelperPath);
    fs.unlinkSync(installerPath);
    fs.rmdirSync(installerDirectory);
  } catch {
    // Cleanup is best-effort and never changes the installation result.
  }
}

async function runProcess(command, args, options) {
  const { label, timeoutMs, env = process.env } = options;
  return new Promise((resolve, reject) => {
    let settled = false;
    let timedOut = false;
    let oversized = false;
    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);
    let killTimer;
    let timeout;

    const child = spawn(command, args, {
      env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      clearTimeout(killTimer);
      if (error) reject(error);
      else resolve(result);
    };

    const terminate = () => {
      child.kill("SIGTERM");
      if (!killTimer) {
        killTimer = setTimeout(() => child.kill("SIGKILL"), 2000);
      }
    };

    const append = (current, chunk) => {
      if (current.length + chunk.length > OUTPUT_LIMIT_BYTES) {
        oversized = true;
        terminate();
        return current;
      }
      return Buffer.concat([current, chunk]);
    };

    child.stdout.on("data", (chunk) => {
      stdout = append(stdout, chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr = append(stderr, chunk);
    });
    child.on("error", () => {
      finish(new SafeError(`${label} could not be started.`));
    });
    child.on("close", (code, signal) => {
      if (timedOut) {
        finish(new SafeError(`${label} timed out.`));
        return;
      }
      if (oversized) {
        finish(new SafeError(`${label} returned too much output.`));
        return;
      }
      finish(null, {
        code,
        signal,
        stdout: stdout.toString("utf8"),
        stderr: stderr.toString("utf8"),
      });
    });

    timeout = setTimeout(() => {
      timedOut = true;
      terminate();
    }, timeoutMs);
  });
}

async function requireSuccess(command, args, options) {
  const result = await runProcess(command, args, options);
  if (result.code !== 0) fail(`${options.label} failed.`);
  return result.stdout;
}

async function plutilValue(infoPlist, key) {
  const stdout = await requireSuccess(
    "/usr/bin/plutil",
    ["-extract", key, "raw", "-o", "-", infoPlist],
    { label: "WorkBuddy application inspection", timeoutMs: 30 * 1000 },
  );
  return stdout.trim();
}

function validateAccount(configRoot) {
  const snapshot = readJson(
    path.join(configRoot, "storage", "skeleton", "account-snapshot.json"),
    "WorkBuddy account snapshot",
  );
  const userId = requireString(snapshot?.primary?.uid, "WorkBuddy user identity");
  if (!/^[A-Za-z0-9_-]{8,160}$/.test(userId)) {
    fail("The active WorkBuddy user identity has an unsupported format.");
  }
}

function validateMarketplace(marketplace, configRoot) {
  if (
    marketplace?.type !== "github" ||
    marketplace?.source?.source !== "github" ||
    marketplace?.source?.repo !== MARKETPLACE_REPOSITORY
  ) {
    fail("The Quandora marketplace name is already assigned to another source.");
  }
  const marketplaceRoot = realpath(
    requireString(marketplace.installLocation, "Quandora marketplace path"),
    "Quandora marketplace path",
  );
  const expectedMarketplaceRoot = realpath(
    path.join(configRoot, "plugins", "marketplaces", MARKETPLACE_NAME),
    "Quandora marketplace path",
  );
  if (marketplaceRoot !== expectedMarketplaceRoot) {
    fail("The Quandora marketplace is outside WorkBuddy's managed marketplace directory.");
  }
  const manifest = readJson(
    path.join(marketplaceRoot, ".codebuddy-plugin", "marketplace.json"),
    "Quandora marketplace manifest",
  );
  const entries = manifest?.plugins;
  if (!Array.isArray(entries)) fail("The Quandora marketplace manifest is invalid.");
  const plugin = entries.find((entry) => entry?.name === PLUGIN_NAME);
  if (
    manifest?.name !== MARKETPLACE_NAME ||
    manifest?.version !== PLUGIN_VERSION ||
    plugin?.version !== PLUGIN_VERSION ||
    plugin?.source !== "./plugins/quandora"
  ) {
    fail("The Quandora marketplace package declaration is invalid.");
  }
  return plugin.version;
}

function parsePluginList(stdout) {
  let payload;
  try {
    payload = JSON.parse(stdout);
  } catch {
    fail("WorkBuddy returned an invalid plugin inventory.");
  }
  if (!Array.isArray(payload)) fail("WorkBuddy returned an invalid plugin inventory.");
  return payload;
}

function selectUserPlugin(entries) {
  const matches = entries.filter(
    (entry) => entry?.id === PLUGIN_ID && entry?.scope === "user",
  );
  if (matches.length > 1) fail("WorkBuddy returned duplicate user-scoped Quandora plugins.");
  return matches[0];
}

function requiredRuntimeFiles(pluginRoot) {
  return [
    path.join(pluginRoot, ".codebuddy-plugin", "plugin.json"),
    path.join(pluginRoot, "mcp.json"),
    path.join(pluginRoot, "scripts", "workbuddy-cn-auth-macos.sh"),
    path.join(pluginRoot, "scripts", "workbuddy-cn-oauth-macos.js"),
    ...EXPECTED_SKILLS.map((skill) => path.join(pluginRoot, "skills", skill, "SKILL.md")),
  ];
}

function hasRequiredPackageFiles(entry, configRoot) {
  if (typeof entry?.installPath !== "string" || entry.installPath.trim() === "") return false;
  try {
    const pluginRoot = fs.realpathSync(entry.installPath);
    const pluginCache = fs.realpathSync(path.join(configRoot, "plugins", "cache"));
    if (!isInside(pluginCache, pluginRoot)) return false;
    return requiredRuntimeFiles(pluginRoot).every((filePath) => fs.statSync(filePath).isFile());
  } catch {
    return false;
  }
}

function validateInstalledPlugin(entry, configRoot, marketplaceVersion) {
  if (!entry || entry.enabled !== true) fail("Quandora is not enabled for the WorkBuddy user.");
  if (entry.version !== marketplaceVersion || entry.version !== PLUGIN_VERSION) {
    fail("The installed Quandora version does not match the marketplace.");
  }

  const pluginRoot = realpath(requireString(entry.installPath, "Quandora install path"), "Quandora install path");
  const pluginCache = realpath(path.join(configRoot, "plugins", "cache"), "WorkBuddy plugin cache");
  if (!isInside(pluginCache, pluginRoot)) {
    fail("Quandora is not installed inside WorkBuddy's managed plugin cache.");
  }
  for (const filePath of requiredRuntimeFiles(pluginRoot)) {
    try {
      if (!fs.statSync(filePath).isFile()) fail("The installed Quandora package is incomplete.");
    } catch (error) {
      if (error instanceof SafeError) throw error;
      fail("The installed Quandora package is incomplete.");
    }
  }

  const manifest = readJson(
    path.join(pluginRoot, ".codebuddy-plugin", "plugin.json"),
    "Installed Quandora plugin manifest",
  );
  if (manifest.name !== PLUGIN_NAME || manifest.version !== marketplaceVersion) {
    fail("The installed Quandora plugin identity is invalid.");
  }
  const mcp = readJson(path.join(pluginRoot, "mcp.json"), "Installed Quandora MCP manifest");
  if (
    mcp?.mcpServers?.quandora?.type !== "http" ||
    mcp?.mcpServers?.quandora?.url !== MCP_URL
  ) {
    fail("The installed Quandora MCP declaration is invalid.");
  }
  return pluginRoot;
}

function parseOAuthResult(stdout) {
  const lines = stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length !== 1) fail("Quandora authorization returned an invalid result.");
  let payload;
  try {
    payload = JSON.parse(lines[0]);
  } catch {
    fail("Quandora authorization returned an invalid result.");
  }
  if (
    payload?.status !== "completed" ||
    payload?.authenticated !== true ||
    payload?.protectedProbe !== "fm_status" ||
    !Number.isInteger(payload?.toolCount) ||
    payload.toolCount <= 0
  ) {
    fail("Quandora authorization or protected verification failed.");
  }
  return payload;
}

async function main() {
  const startedAt = Date.now();
  if (process.platform !== "darwin") fail("This installer supports macOS only.");
  const [appRootArgument, configRootArgument] = process.argv.slice(2);
  const appRoot = realpath(appRootArgument || APP_ROOT, "WorkBuddy application");
  const expectedAppRoot = realpath(APP_ROOT, "WorkBuddy application");
  if (appRoot !== expectedAppRoot) fail("The application is not the supported WorkBuddy China installation.");

  const home = realpath(requireString(process.env.HOME, "Home directory"), "Home directory");
  const expectedConfigRoot = realpath(path.join(home, ".workbuddy"), "WorkBuddy configuration directory");
  const configRoot = realpath(configRootArgument || expectedConfigRoot, "WorkBuddy configuration directory");
  if (configRoot !== expectedConfigRoot) fail("The config path is not the active WorkBuddy China directory.");

  const infoPlist = path.join(appRoot, "Contents", "Info.plist");
  const [bundleId, appVersion, urlScheme] = await Promise.all([
    plutilValue(infoPlist, "CFBundleIdentifier"),
    plutilValue(infoPlist, "CFBundleShortVersionString"),
    plutilValue(infoPlist, "CFBundleURLTypes.0.CFBundleURLSchemes.0"),
  ]);
  if (bundleId !== BUNDLE_ID || urlScheme !== URL_SCHEME) {
    fail("The application identity is not WorkBuddy China.");
  }
  if (compareVersions(appVersion, MIN_APP_VERSION) < 0) {
    fail(`WorkBuddy China ${MIN_APP_VERSION} or newer is required.`);
  }
  validateAccount(configRoot);
  const oauthHelper = await prepareBootstrapOAuthHelper();

  const cli = realpath(
    path.join(appRoot, "Contents", "Resources", "app.asar.unpacked", "cli", "bin", "codebuddy"),
    "WorkBuddy bundled CLI",
  );
  const cliEnv = createCliEnv(configRoot);
  const cliVersion = (
    await requireSuccess(cli, ["--version"], {
      label: "WorkBuddy CLI version check",
      timeoutMs: 30 * 1000,
      env: cliEnv,
    })
  ).trim();
  if (compareVersions(cliVersion, MIN_CLI_VERSION) < 0) {
    fail(`WorkBuddy's bundled CLI ${MIN_CLI_VERSION} or newer is required.`);
  }
  emit({ status: "progress", step: "host_verified" });

  const knownMarketplacesPath = path.join(configRoot, "plugins", "known_marketplaces.json");
  let knownMarketplaces = readJson(knownMarketplacesPath, "WorkBuddy marketplace registry");
  const existingMarketplace = knownMarketplaces[MARKETPLACE_NAME];
  if (existingMarketplace) {
    validateMarketplace(existingMarketplace, configRoot);
    await requireSuccess(cli, pluginArgs("marketplace", "update", MARKETPLACE_NAME), {
      label: "Quandora marketplace refresh",
      timeoutMs: remainingTimeout(startedAt, CLI_TIMEOUT_MS, "Quandora marketplace refresh"),
      env: cliEnv,
    });
  } else {
    await requireSuccess(
      cli,
      pluginArgs("marketplace", "add", MARKETPLACE_REPOSITORY, "--name", MARKETPLACE_NAME),
      {
        label: "Quandora marketplace installation",
        timeoutMs: remainingTimeout(startedAt, CLI_TIMEOUT_MS, "Quandora marketplace installation"),
        env: cliEnv,
      },
    );
  }
  knownMarketplaces = readJson(knownMarketplacesPath, "WorkBuddy marketplace registry");
  const marketplaceVersion = validateMarketplace(
    knownMarketplaces[MARKETPLACE_NAME],
    configRoot,
  );
  emit({ status: "progress", step: "marketplace_ready" });

  const listPlugins = async () => parsePluginList(
    await requireSuccess(cli, pluginArgs("list", "--json"), {
      label: "WorkBuddy plugin inventory",
      timeoutMs: remainingTimeout(startedAt, CLI_TIMEOUT_MS, "WorkBuddy plugin inventory"),
      env: cliEnv,
    }),
  );
  let plugin = selectUserPlugin(await listPlugins());
  if (!plugin) {
    await requireSuccess(cli, pluginArgs("install", PLUGIN_ID, "--scope", "user"), {
      label: "Quandora plugin installation",
      timeoutMs: remainingTimeout(startedAt, CLI_TIMEOUT_MS, "Quandora plugin installation"),
      env: cliEnv,
    });
  } else if (!hasRequiredPackageFiles(plugin, configRoot)) {
    await requireSuccess(cli, pluginArgs("update", PLUGIN_ID, "--scope", "user"), {
      label: "Quandora plugin update",
      timeoutMs: remainingTimeout(startedAt, CLI_TIMEOUT_MS, "Quandora plugin update"),
      env: cliEnv,
    });
  }

  plugin = selectUserPlugin(await listPlugins());
  if (!plugin) fail("Quandora was not installed for the WorkBuddy user.");
  if (!hasRequiredPackageFiles(plugin, configRoot)) {
    fail("The installed preview package cannot be replaced safely while WorkBuddy is using it.");
  }
  if (plugin.enabled !== true) {
    await requireSuccess(cli, pluginArgs("enable", PLUGIN_ID, "--scope", "user"), {
      label: "Quandora plugin enablement",
      timeoutMs: remainingTimeout(startedAt, CLI_TIMEOUT_MS, "Quandora plugin enablement"),
      env: cliEnv,
    });
    plugin = selectUserPlugin(await listPlugins());
  }

  const pluginRoot = validateInstalledPlugin(plugin, configRoot, marketplaceVersion);
  emit({ status: "progress", step: "plugin_ready" });
  emit({ status: "progress", step: "browser_authorization_starting" });

  const oauth = await runProcess(
    path.join(appRoot, "Contents", "MacOS", "Electron"),
    [
      oauthHelper,
      pluginRoot,
      configRoot,
      appRoot,
    ],
    {
      label: "Quandora authorization",
      timeoutMs: remainingTimeout(startedAt, OAUTH_TIMEOUT_MS, "Quandora authorization"),
      env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
    },
  );
  if (oauth.code !== 0) fail("Quandora authorization failed.");
  const result = parseOAuthResult(oauth.stdout);
  emit({
    status: "completed",
    installed: true,
    authenticated: true,
    plugin: PLUGIN_ID,
    version: plugin.version,
    protectedProbe: result.protectedProbe,
    toolCount: result.toolCount,
    browserAuthorizationOpened: result.browserAuthorizationOpened === true,
  });
}

main().catch((error) => {
  const message = error instanceof SafeError ? error.message : "The WorkBuddy China installation failed safely.";
  process.stderr.write(`${JSON.stringify({ status: "failed", message })}\n`);
  process.exitCode = 69;
}).finally(cleanupTemporaryBootstrap);
