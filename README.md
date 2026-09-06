# quandora-skill

> Install, connect, and verify Quandora's five FastAgent capability skills on one agent — factor mining, factor analysis, strategy building, strategy analysis, and simulated paper trading — over Quandora's OAuth-protected MCP server.

[![GitHub Release](https://img.shields.io/github/v/release/tokenaissance/quandora-skill?display_name=tag&sort=semver)](https://github.com/tokenaissance/quandora-skill/releases)
[![Stars](https://img.shields.io/github/stars/tokenaissance/quandora-skill?style=flat)](https://github.com/tokenaissance/quandora-skill/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/tokenaissance/quandora-skill)](https://github.com/tokenaissance/quandora-skill/commits/main)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-black.svg)](LICENSE)

`quandora-skill` is the meta skill for wiring Quandora onto a FastAgent
agent. It does not perform quant work itself; it installs the five capability
skill packages, connects the Quandora MCP server the skills declare, and
verifies the connection with the live server tool list.

Give an agent owner session one instruction:

```text
Install the five Quandora skills from tokenaissance/quandora-skill on this agent,
connect Quandora, and verify the connection.
```

## Why this package

- Skills stay declarative: each capability skill's SKILL.md frontmatter
  declares the MCP server it needs; the host owns connection and OAuth.
- The agent performs the mechanics itself — no operator-side command
  knowledge required, and no credentials ever touch the chat.
- Capability packages are folder-complete (`SKILL.md` + `references/`), so
  long contracts stay loadable on demand instead of bloating the prompt.
- MCP tool lists are server-authoritative: a new server release can add,
  rename, or remove methods without breaking the skill contract.

## What it contains

```text
quandora-skill/
├── SKILL.md                        # meta: install + connect + verify
├── README.md                       # this page
├── LICENSE                         # Apache-2.0
├── manifest.json                   # package version and metadata
├── agents/interface.yaml           # interface, permissions, gates
├── evals/trigger_cases.json        # should/not/near-neighbor triggers
├── references/install-and-verify.md
└── skills/                         # five complete capability packages
    ├── factor-mining/        SKILL.md + references/
    ├── factor-analysis/      SKILL.md + references/
    ├── strategy-building/    SKILL.md + references/
    ├── strategy-analysis/    SKILL.md + references/
    └── paper-trading/        SKILL.md + references/
```

## Natural-language examples

- "把这个 agent 装上 Quandora，并连好"
- "Install Quandora's five skills here and verify the connection"
- "Quandora 连不上了，重新连接并验证"
- "Check which Quandora skills this agent has and their connection state"

Business requests route to the installed capability skills, not to this meta
skill:

- "用 factor-mining 跑一个回测" → `$factor-mining`
- "分析我这个因子为什么失败" → `$factor-analysis`
- "帮我组一个策略并回测" → `$strategy-building`
- "分析这个策略的结果" → `$strategy-analysis`
- "开一个 paper trading" → `$paper-trading`

## Install

On a FastAgent agent, in an owner session, ask the agent to install the five
skill folders from this repository (`skills/factor-mining`,
`skills/factor-analysis`, `skills/strategy-building`,
`skills/strategy-analysis`, `skills/paper-trading`). Each folder is installed
whole, keeping its `references/`.

Installed skills become visible on the **next turn** — start a new chat before
first business use.

### npx (npx-capable hosts)

Install the meta skill:

```bash
npx skills add tokenaissance/quandora-skill
```

Install one capability skill from the same repository:

```bash
npx skills add tokenaissance/quandora-skill --skill factor-mining
npx skills add tokenaissance/quandora-skill --skill factor-analysis
npx skills add tokenaissance/quandora-skill --skill strategy-building
npx skills add tokenaissance/quandora-skill --skill strategy-analysis
npx skills add tokenaissance/quandora-skill --skill paper-trading
```

Note: `npx skills add` targets `~/.agents/skills`, which the FastAgent runtime
does not scan. FastAgent installs through its own agent-scoped skill flow
described above.

## Connect and verify

1. Ask the agent (owner session) to connect Quandora.
2. Approve the Quandora authorization when it is presented.
3. Start a new chat and ask the agent to verify with a read-only Quandora call
   from the live server tool list.

Done when the five skills appear on the agent and a read-only Quandora call
succeeds.

## Prerequisites

- A tokenaissance-Cloud FastAgent agent you own.
- The capability content published on the repository default branch.
- Owner availability for the Quandora sign-in / consent step.

## Troubleshooting

| Problem | Common cause | Fix |
|---|---|---|
| Skill not visible after install | Skill loads on the next turn | Start a new chat; verify the folder was installed whole |
| No Quandora tools | Server not connected or not authorized | Re-authorize once from the agent's MCP connection flow, then new chat |
| Listed tool missing | Server changed its tool set | Follow the live tool list; method names are server-authoritative |
| Visitor cannot connect | MCP connection is owner-only | Ask the agent owner to connect / re-authorize |

## Design notes

- The meta skill mirrors the
  [fastagent-meta-skill](https://github.com/tokenaissance/fastagent-meta-skill)
  package structure and SKILL.md conventions.
- Setup logic is host-neutral: no pinned commands, no hardcoded method lists
  as contract, no credential handling.
- Capability content is the product of Quandora's quant contracts and stays
  versioned with the package (`v1.3.0`).

## License

Apache-2.0.
