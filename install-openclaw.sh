#!/usr/bin/env bash
set -euo pipefail

PLUGIN_NAME="${QUANDORA_PLUGIN_NAME:-quandora}"
MARKETPLACE_URL="${QUANDORA_PLUGIN_MARKETPLACE_URL:-https://github.com/varsity-tech-product/quandora-plugins.git}"
INSTALLER_URL="${QUANDORA_OPENCLAW_INSTALLER_URL:-https://raw.githubusercontent.com/varsity-tech-product/quandora-plugins/HEAD/install-openclaw.sh}"
MCP_NAME="${QUANDORA_MCP_NAME:-quandora}"
MCP_URL="${QUANDORA_MCP_URL:-https://mcp.quandora.ai/quant}"
FACTOR_MINING_SKILL_NAME="${QUANDORA_FACTOR_MINING_SKILL_NAME:-factor-mining}"
STRATEGY_SKILL_NAME="${QUANDORA_STRATEGY_SKILL_NAME:-strategy}"
SKILL_NAMES=("${FACTOR_MINING_SKILL_NAME}" "${STRATEGY_SKILL_NAME}")
ALLOW_SKILL=0
TARGET_AGENT="${QUANDORA_OPENCLAW_AGENT_ID:-}"

usage() {
  cat <<'USAGE'
Usage: install-openclaw.sh [options]

Options:
  --allow-skill       Add Quandora skills to the target agent skill allowlist
                      and verify the existing install.
  --agent <id>        Target agent for --allow-skill. Defaults to OpenClaw's
                      current default agent.
  -h, --help          Show this help.

Default install:
  Installs the Quandora plugin and registers the Quandora connection for OpenClaw.
USAGE
}

print_openclaw_auth_steps() {
  echo "Authorize Quandora before use:"
  echo "  openclaw mcp login ${MCP_NAME}"
  echo "After approval, run the code command printed by OpenClaw:"
  echo "  openclaw mcp login ${MCP_NAME} --code <code>"
  echo "Then verify the authorized MCP connection:"
  echo "  openclaw mcp doctor ${MCP_NAME} --probe"
}

mcp_has_oauth_tokens() {
  local status
  status="$(openclaw mcp status --verbose 2>/dev/null || true)"
  printf '%s\n' "${status}" | grep -A8 -E "^- ${MCP_NAME}: " | grep -q "oauth: tokens=yes"
}

verify_openclaw_install() {
  echo "Verifying OpenClaw plugin: ${PLUGIN_NAME}"
  openclaw plugins inspect "${PLUGIN_NAME}" >/dev/null

  echo "Verifying Quandora connection: ${MCP_NAME}"
  openclaw mcp show "${MCP_NAME}" >/dev/null

  local skill_name
  local skill_info
  local excluded_skills=()
  for skill_name in "${SKILL_NAMES[@]}"; do
    echo "Verifying OpenClaw skill: ${skill_name}"
    skill_info="$(openclaw skills info "${skill_name}" 2>&1)"
    if [[ "${skill_info}" == *"Excluded by agent allowlist"* ]]; then
      excluded_skills+=("${skill_name}")
    fi
  done

  if [[ "${#excluded_skills[@]}" -gt 0 ]]; then
    echo "Installed Quandora skills excluded by the current agent allowlist: ${excluded_skills[*]}"
    echo "Run:"
    echo "  curl -fsSL ${INSTALLER_URL} | bash -s -- --allow-skill"
    return 0
  fi

  echo "OpenClaw plugin and skill verification passed."
  if ! mcp_has_oauth_tokens; then
    echo "Quandora is registered but not authorized yet."
    print_openclaw_auth_steps
    return 0
  fi

  echo "Quandora is authorized."
  echo "Start OpenClaw:"
  echo "  openclaw chat"
  echo "Then run:"
  echo "  /${FACTOR_MINING_SKILL_NAME} show public tasks"
  echo "or:"
  echo "  /${STRATEGY_SKILL_NAME} list eligible factors"
}

allow_skill_for_agent() {
  if ! command -v node >/dev/null 2>&1; then
    echo "node is required for --allow-skill so the existing agent allowlist can be preserved." >&2
    exit 1
  fi

  local config_path
  config_path="$(openclaw config file)"
  config_path="${config_path/#\~/$HOME}"

  local patch_file
  patch_file="$(mktemp)"

  local result
  result="$(
    OPENCLAW_CONFIG_PATH="${config_path}" \
    QUANDORA_OPENCLAW_PATCH_FILE="${patch_file}" \
    QUANDORA_OPENCLAW_AGENT_ID="${TARGET_AGENT}" \
    QUANDORA_SKILL_NAMES="${SKILL_NAMES[*]}" \
    node <<'NODE'
const fs = require("fs");

const configPath = process.env.OPENCLAW_CONFIG_PATH;
const patchFile = process.env.QUANDORA_OPENCLAW_PATCH_FILE;
const targetAgentId = process.env.QUANDORA_OPENCLAW_AGENT_ID || "";
const skillNames = (process.env.QUANDORA_SKILL_NAMES || "factor-mining strategy")
  .split(/\s+/)
  .filter(Boolean);

const data = JSON.parse(fs.readFileSync(configPath, "utf8"));
const agents = Array.isArray(data?.agents?.list) ? data.agents.list : [];
if (agents.length === 0) {
  throw new Error("No OpenClaw agents are configured.");
}

let index = -1;
if (targetAgentId) {
  index = agents.findIndex((agent) => agent && agent.id === targetAgentId);
} else {
  index = agents.findIndex((agent) => agent && agent.default === true);
  if (index < 0) index = 0;
}

if (index < 0) {
  throw new Error(`OpenClaw agent not found: ${targetAgentId}`);
}

const agent = agents[index];
const agentId = agent.id || String(index);
if (!Array.isArray(agent.skills)) {
  console.log(`noop:${agentId}:all-skills`);
  process.exit(0);
}

const missingSkills = skillNames.filter((skillName) => !agent.skills.includes(skillName));
if (missingSkills.length === 0) {
  console.log(`noop:${agentId}:already-allowed`);
  process.exit(0);
}

const nextAgents = agents.map((entry, i) => {
  if (i !== index) return entry;
  return { ...entry, skills: [...entry.skills, ...missingSkills] };
});

fs.writeFileSync(patchFile, JSON.stringify({ agents: { list: nextAgents } }, null, 2) + "\n");
console.log(`patch:${agentId}:${missingSkills.join(",")}`);
NODE
  )"

  case "${result}" in
    patch:*)
      local value="${result#patch:}"
      local agent_id="${value%%:*}"
      local added_skills="${value#*:}"
      echo "Adding Quandora skills to OpenClaw agent allowlist (${added_skills}): ${agent_id}"
      openclaw config patch --file "${patch_file}" --replace-path agents.list >/dev/null
      echo "Reloading OpenClaw gateway."
      openclaw gateway restart >/dev/null || openclaw mcp reload >/dev/null || true
      ;;
    noop:*:all-skills)
      local value="${result#noop:}"
      echo "OpenClaw agent ${value%:all-skills} does not use an explicit skill allowlist."
      ;;
    noop:*:already-allowed)
      local value="${result#noop:}"
      echo "OpenClaw agent ${value%:already-allowed} already allows all Quandora skills."
      ;;
    *)
      echo "Unexpected --allow-skill result: ${result}" >&2
      exit 1
      ;;
  esac

  rm -f "${patch_file}"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --allow-skill)
      ALLOW_SKILL=1
      shift
      ;;
    --agent)
      if [[ $# -lt 2 ]]; then
        echo "--agent requires an OpenClaw agent id." >&2
        exit 2
      fi
      TARGET_AGENT="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if ! command -v openclaw >/dev/null 2>&1; then
  echo "OpenClaw CLI is required. Install or update OpenClaw, then run this script again." >&2
  exit 1
fi

if [[ "${ALLOW_SKILL}" -eq 1 ]]; then
  allow_skill_for_agent
  verify_openclaw_install
  exit 0
fi

echo "Installing OpenClaw plugin: ${PLUGIN_NAME}"
openclaw plugins install "${PLUGIN_NAME}" --marketplace "${MARKETPLACE_URL}" --force

echo "Registering Quandora connection: ${MCP_NAME}"
if openclaw mcp add "${MCP_NAME}" \
  --transport streamable-http \
  --url "${MCP_URL}" \
  --auth oauth \
  --no-probe >/dev/null 2>&1; then
  :
else
  openclaw mcp set "${MCP_NAME}" "{\"url\":\"${MCP_URL}\",\"transport\":\"streamable-http\",\"auth\":\"oauth\"}" >/dev/null
fi

echo "Quandora plugin is installed for OpenClaw."
verify_openclaw_install
