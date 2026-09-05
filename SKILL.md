---
name: fastagent-quandora
description: |
  Install, connect, and verify Quandora on one FastAgent agent. Use when the agent owner asks to set up Quandora capabilities, to install the five Quandora skills (factor-mining, factor-analysis, strategy-building, strategy-analysis, paper-trading), or to check or restore the Quandora OAuth-protected MCP connection. Once installed, route factor, strategy, and paper-trading business work to the corresponding capability skill; never duplicate its workflow here.
metadata:
  author: Tokenaissance
  version: "3.0-preview"
  upstream_inspiration: fastagent-meta-skill
---

# FastAgent · Quandora (Meta)

Manage the Quandora capability set on one FastAgent agent: install the five
skills, connect the Quandora MCP server, and verify the connection. This is a
meta skill — it installs and wires capabilities, it does not perform factor,
strategy, or paper-trading work itself.

## FastAgent runtime — read this first

This meta skill runs inside a FastAgent agent. Skills installed from this
package are agent-scoped: each install lands in the agent's private skills
directory and becomes visible on the **next turn**, not mid-turn. Tell the
owner something like "the skill is installed — use it in your next message" so
they do not expect immediate availability.

The five capability skills are complete packages: each folder contains
`SKILL.md` plus its `references/`. Install the whole folder, never just the
SKILL.md file. On FastAgent, reference paths inside a skill resolve through
`{baseDir}`; keep the folders intact so the references stay reachable.

The capability skills declare the MCP server they need in their own SKILL.md
frontmatter (`mcpServers`). This meta skill does not repeat that declaration.

## Router Rules

- Trigger on setup intent: installing Quandora skills, connecting or
  re-connecting Quandora, verifying the connection, or restoring it after a
  failure.
- Route business work away from this meta skill once capabilities exist:
  factor mining/backtests to `$factor-mining`, factor diagnosis to
  `$factor-analysis`, strategy composition to `$strategy-building`, strategy
  diagnosis to `$strategy-analysis`, and paper trading to `$paper-trading`.
- Refuse to install, connect, or re-authorize when the caller is not the
  agent owner. OAuth-protected MCP servers are owner-gated; visitors and
  shared sessions must be told to ask the owner.
- Never act as a capability skill, never call Quandora business actions from
  this meta skill, and never hardcode MCP method names — the live server tool
  list is authoritative because the server may add, rename, or remove tools.
- Never install a second Quandora server entry or duplicate an existing
  capability skill.
- Keep this package's root SKILL.md to meta routing and the minimal workflow;
  put judgment and detail in `references/` and trigger cases in `evals/`.

## Capability Map

The five skills under `skills/` provide the actual capabilities:

- `skills/factor-mining` — construct, validate, backtest, resume, and export
  Factor Mining runs.
- `skills/factor-analysis` — read-only diagnosis of one factor result.
- `skills/strategy-building` — eligible-factor lists, strategy composition and
  backtests, and Result Bundle export.
- `skills/strategy-analysis` — read-only diagnosis of one strategy result and
  Paper-readiness assessment.
- `skills/paper-trading` — simulated Paper runs and Strategy Portfolio Paper.

Each skill's own description decides routing after installation. This meta
skill only needs to know they exist and where they live.

## Compact Workflow

1. Confirm the caller owns the target agent.
2. Check what is already installed (`skills/` folders present on the agent).
3. Install the missing capability skills, one complete folder per install,
   from this package (`skills/factor-mining`,
   `skills/factor-analysis`, `skills/strategy-building`,
   `skills/strategy-analysis`, `skills/paper-trading`).
4. Connect the Quandora MCP server the skills declare, and hand the owner the
   authorization step. The host owns OAuth; never handle credentials.
5. Ask the owner to start a new chat, then verify the connection with a
   read-only Quandora call from the live server tool list.
6. If verification fails, do not loop or re-add; report the failure and ask
   the owner to re-authorize once, then retry in a new chat.

Detail for install and verification lives in
`references/install-and-verify.md` (`{baseDir}/references/…` on FastAgent).

## Gate Ladder

- `Scaffold`: valid frontmatter, natural triggers, explicit exclusions, and
  the five capability folders present.
- `Production`: Scaffold plus interface metadata (`agents/interface.yaml`),
  trigger cases (`evals/trigger_cases.json`), manifest (`manifest.json`), and
  verified folder-intact installs.
- `Governed`: Production plus owner-only OAuth gate, live-tool-list
  verification, and a clean record of what was installed, connected, and
  verified.

Choose the lightest gate that fits the request. Audit-only requests are
read-only: report findings without installing or connecting anything.

## Output Contract

For setup requests, provide only what the request earns:

1. the five capability skills installed on the target agent (folder-intact);
2. the Quandora connection state (installed / connected / authorized / failed);
3. the owner-facing authorization step when connection is required;
4. a verification result based on a live read-only Quandora call;
5. a short next-step summary (new chat before first business use), never raw
   credentials, tokens, or internal identifiers.

Never claim installation or connection success without the corresponding
verification evidence. Planned work is not proof.

## Defaults

- Keep the meta skill host-neutral: give facts and steps, never pin a command
  or method name; FastAgent performs the mechanics itself.
- Prefer the lightest valid action: install only missing skills, connect only
  when needed, and re-authorize only on a terminal authorization failure.
- Preserve the capability skills as folders with their `references/` intact.
- Public claims must match actual install, connection, or verification
  evidence.

## Reference Map

- Setup detail: [references/install-and-verify.md](references/install-and-verify.md)
- Trigger cases: [evals/trigger_cases.json](evals/trigger_cases.json)
- Interface and gates: [agents/interface.yaml](agents/interface.yaml)
- Package manifest: [manifest.json](manifest.json)
