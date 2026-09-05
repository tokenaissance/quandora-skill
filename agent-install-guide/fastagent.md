---
name: fastagent-quandora-install
description: |
  Install and connect Quandora on one tokenaissance-Cloud FastAgent agent. Use when an agent owner asks to install the five Quandora skills and verify the OAuth-protected MCP connection.
metadata:
  author: Tokenaissance
  version: "1.0.0"
---

# FastAgent · Quandora

## What the agent needs

Five skills on the target agent, from the `tokenaissance/quandora-plugins`
repository:

- factor-mining
- factor-analysis
- strategy-building
- strategy-analysis
- paper-trading

The skills declare the Quandora MCP server they need. FastAgent installs them,
connects the server, and completes authorization with the owner.

## Steps for the operator

1. Pick an agent you own.
2. In that agent's chat (as owner), ask it to install the five skills above
   from the repository and connect Quandora.
3. Approve the authorization when it is presented.
4. Start a new chat and ask the agent to verify the Quandora connection.

## Done when

- The five skills appear on the agent.
- A new chat exposes Quandora tools and a read-only Quandora call succeeds.
