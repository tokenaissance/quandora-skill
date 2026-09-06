---
name: quandora-skills
description: |
  Install, connect, and verify Quandora on one FastAgent agent. Use when the agent owner asks to set up Quandora capabilities, to install or restore the five Quandora skills (factor-mining, factor-analysis, strategy-building, strategy-analysis, paper-trading), to connect, re-connect, or verify the Quandora OAuth-protected MCP server, or to republish this package. Once capabilities are installed, route factor, strategy, and paper-trading work to the corresponding skill; do not perform it here.
metadata:
  author: Tokenaissance
  version: "1.4.1"
  upstream_inspiration: fastagent-meta-skill
---

# FastAgent Quandora Meta Skill

Wire Quandora capabilities onto a FastAgent agent — not a long prompt.

## FastAgent runtime — read this first

This package runs inside FastAgent. Its five capability skills are discovered
by **directory name** and follow progressive disclosure:

1. **Metadata** (name + description) — always in the skill catalog.
2. **SKILL.md body** — loaded when the agent calls `load_skill`.
3. **Bundled resources** — `references/` under each capability folder, loaded
   on demand through `{baseDir}`.

Installing a capability means installing its **whole folder**: `SKILL.md`,
`references/`, and `agents/openai.yaml` (plus `assets/` when present). A
partial copy that drops any of these leaves broken pointers or missing host
metadata. The host catalogs installed skills on its next reload/build. When
that reload completes within the current conversation, discover and verify
in-session; only start a new chat if the host requires a restart.

The capability skills declare the MCP server they need in their own SKILL.md
frontmatter (`mcpServers`), so this meta skill never repeats the declaration.
The Quandora MCP connection is **owner-only**: visitors and shared sessions
must be told to ask the owner to connect or re-authorize.

MCP tool names are server-defined and may change between releases. Never
hardcode a method list; treat the server's live tool list as authoritative.

## Router Rules

- Trigger on setup intent: installing Quandora skills, connecting or
  re-connecting Quandora, verifying the connection, checking what is
  installed, or republishing the package.
- Route business work away once capabilities exist:
  - Factor mining / backtests → `$factor-mining`
  - Factor diagnosis → `$factor-analysis`
  - Strategy composition / backtests → `$strategy-building`
  - Strategy diagnosis → `$strategy-analysis`
  - Simulated trading / Portfolio Paper → `$paper-trading`
- Refuse install/connect/re-authorize when the caller is not the agent owner.
- Never act as a capability skill; never call Quandora business actions from
  this meta skill; never install a duplicate capability or a second Quandora
  server entry.
- Audit-only requests stay read-only: report installed skills, connection
  state, and verification evidence without mutating anything.
- Match the user's action: setup/republish requests may edit; audit requests
  remain read-only; publish only when explicitly requested.

## Modes

- `Scaffold`: inspect what is installed and explain the setup path; minimum
  useful output, no mutation.
- `Production`: install missing capability folders, connect Quandora, hand
  the owner the authorization step, verify in the current session once the
  host reloads the catalog; only start a new chat if the host requires a
  restart.
- `Governed`: multi-agent or multi-owner deployment; owner-only OAuth,
  explicit per-agent install scope, re-authorization only on terminal
  failure, and a clean record of installed/connected/verified state.
- `Release`: republish the package (feature branch → PR → merge → versioned
  GitHub Release), keeping `SKILL.md` metadata and `manifest.json` version in
  lockstep.

Choose the lightest mode that fits the request.

## Capability Inventory

The five capability folders under `skills/` are the only discoverable
entrypoints for business work:

```text
skills/
  factor-mining/        construct, validate, backtest, resume, export
  factor-analysis/      read-only diagnosis of one factor result
  strategy-building/    eligible lists, composition, backtests, export
  strategy-analysis/    read-only diagnosis of one strategy result
  paper-trading/        simulated Paper runs and Portfolio Paper
```

Each folder is a complete package: `SKILL.md` + `references/` +
`agents/openai.yaml` (+ `assets/` icons when present). Never flatten them
into a single-file skill.

## Compact Workflow

1. Confirm the caller owns the target agent.
2. Inventory: list installed capability folders and the Quandora connection
   state without assuming anything is present.
3. Install the missing capability folders from this package folder-intact
   (`SKILL.md` + `references/` + `agents/openai.yaml`), one folder per
   install.
4. Connect the Quandora MCP server the skills declare; hand the owner the
   authorization step. The host owns OAuth and credentials.
5. When the host's reload/build lands, verify catalog discovery and the
   connection in the current session with a read-only Quandora call from the
   live server tool list; only start a new chat if the host requires a
   restart.
6. On failure, report the terminal error and re-authorize once; never loop,
   never re-add, never fabricate success.

Full checklist: [references/install-and-verify.md](references/install-and-verify.md).

## Gate Ladder

- `Scaffold`: valid frontmatter, natural triggers, explicit exclusions, and
  capability folders listed.
- `Production`: Scaffold plus interface metadata
  (`agents/interface.yaml`), trigger cases (`evals/trigger_cases.json`),
  manifest (`manifest.json`), folder-intact installs, and live verification.
- `Governed`: Production plus owner-only OAuth enforcement, cross-agent scope
  isolation, and an evidence record of installed / connected / verified.
- `Release`: Governed plus version lockstep (`SKILL.md` ↔ `manifest.json`),
  feature-branch-only publication, PR review, and a verified GitHub Release.

## Output Contract

For setup requests, provide only what the mode earns:

1. inventory of installed capability folders and connection state;
2. the five capability skills installed folder-intact (when asked to install);
3. the owner-facing authorization step (when connection is required);
4. verification result from a live read-only Quandora call;
5. next-step summary (business use may begin once in-session discovery and
   verification pass; no new chat required unless the host demands a restart).

For audit requests: findings and evidence only — no edits, no installs, no
connection attempts. For release requests: a feature branch, PR, merge, and
versioned GitHub Release, never a direct default-branch push.

Never claim installation or connection success without matching verification
evidence; planned work is not proof.

## Publish Flow

1. Bump the version in `SKILL.md` metadata and `manifest.json` together.
2. Update the MCP-related capability content that this release covers.
3. Audit without mutation when useful (`git diff`, trigger cases, JSON/YAML
   validity).
4. Publish only after an explicit request: feature branch → PR → merge →
   GitHub Release tag `v<version>`.
5. Verify the merged default branch, the Release, and a clean install before
   reporting completion.

## Defaults

- Keep the meta skill host-neutral: give facts and steps, never pin a command
  or method name; FastAgent performs the mechanics itself.
- Preserve capability folders intact (`SKILL.md` + `references/` +
  `agents/openai.yaml`).
- Route business work to capability skills; never duplicate their workflow
  here.
- Public claims must match actual install, connection, or verification
  evidence.

## Reference Map

- Setup detail: [references/install-and-verify.md](references/install-and-verify.md)
- Interface and gates: [agents/interface.yaml](agents/interface.yaml)
- Trigger cases: [evals/trigger_cases.json](evals/trigger_cases.json)
- Package manifest: [manifest.json](manifest.json)
