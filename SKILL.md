---
name: fastagent-quandora
description: |
  Install, connect, and verify Quandora on one FastAgent agent. Use when the agent owner asks to set up Quandora capabilities, to install the five Quandora skills (factor-mining, factor-analysis, strategy-building, strategy-analysis, paper-trading), or to check the Quandora OAuth-protected MCP connection. Business work after setup routes to the corresponding installed skill.
metadata:
  author: Tokenaissance
  version: "3.0-preview"
  upstream_inspiration: fastagent-meta-skill
---

# FastAgent · Quandora (Meta)

Manage the Quandora capability set on one FastAgent agent: install the five
skills, connect the Quandora MCP server, and verify the connection. Business
operations (factor mining, analysis, strategies, paper trading) belong to the
installed capability skills, not to this meta skill.

## Scope

- In: installing the five Quandora skills, connecting the Quandora MCP server,
  verifying the connection, and explaining the owner-only authorization step.
- Out: factor/strategy/paper workflows (use the installed skills), other-host
  plugin flows, and platform-level changes outside the current agent.

## Install

Give the agent (in the owner's session) these facts and ask it to install each
skill into this agent:

- Repository: `tokenaissance/quandora-plugins`
- Skill folders (one install per folder): `skills/factor-mining`,
  `skills/factor-analysis`, `skills/strategy-building`,
  `skills/strategy-analysis`, `skills/paper-trading`

Each folder is a complete skill package: `SKILL.md` plus its `references/`.
Installing the folder keeps them together. Details live in
`references/install-and-verify.md`.

## Connect and verify

After the skills are installed, start a new chat as the owner and ask the agent
to connect Quandora, then approve the authorization when it is presented.
Finally ask the agent to verify the connection with a read-only Quandora call
from the live server tool list. Do not depend on a hardcoded method name.

## Done when

- The five skills appear on the agent.
- A new chat exposes Quandora tools and a read-only Quandora call succeeds.
