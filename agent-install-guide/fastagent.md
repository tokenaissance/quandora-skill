---
name: fastagent-quandora-install
description: |
  Install and authenticate Quandora's OAuth-protected MCP server and its five skills on one tokenaissance-Cloud FastAgent agent. Use when an agent owner wants Factor Mining, Factor Analysis, Strategy Building, Strategy Analysis, or Paper Trading through Quandora's native MCP + OAuth flow. Never handles credentials.
metadata:
  author: Tokenaissance
  version: "1.0.0"
---

# FastAgent · Quandora

Connect Quandora to one FastAgent agent. The five skills declare the server they
need (`mcpServers` in each SKILL.md frontmatter); FastAgent reads the declaration
and runs its native MCP connection flow. Only the agent owner's session may
connect; authorization stays a human action.

## Install

1. Pick an agent you own.
2. Install the five skills on that agent (GitHub source, repo `tokenaissance/quandora-plugins` on `main`): `factor-mining`, `factor-analysis`, `strategy-building`, `strategy-analysis`, `paper-trading`.
3. Start a new chat as the owner and ask the agent to connect Quandora — or open the agent's **MCP OAuth** panel and authorize `quandora`.
4. Complete sign-in / consent when the Quandora page opens.

Server identity: name `quandora`, url `https://mcp.quandora.ai/quant`,
oauthResource `https://mcp.quandora.ai/quant`.

## Verify

- A new chat exposes the Quandora tools; at least one read-only Quandora tool
  from the live server tool list succeeds. Do not depend on a hardcoded method
  name — the MCP server may add, rename, or remove methods.
- Host CLI `fastagent mcp status quandora` reports `authorized`.
- Skill list shows the five names.

## Refresh

Access tokens last 7 days and refresh automatically. On refresh failure,
re-authorize `quandora` from the **MCP OAuth** panel or run
`fastagent mcp login quandora`.

## Rules

- Never request, read, store, or paste API keys, tokens, PKCE verifiers,
  cookies, or authorization URLs.
- Keep one `quandora` entry; only servers declared with `oauthResource` are
  OAuth-protected.
