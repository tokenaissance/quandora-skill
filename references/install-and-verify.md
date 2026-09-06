# Install and verify (detail)

Owner-only setup for one FastAgent agent. The agent performs the mechanics
through its host skill-install and MCP connection flow; this reference exists
so the meta skill and its operator share one checklist.

## Facts to provide

- Repository: `tokenaissance/quandora-skills`
- Skill folders to install: `skills/factor-mining`,
  `skills/factor-analysis`, `skills/strategy-building`,
  `skills/strategy-analysis`, `skills/paper-trading`

Each folder is one complete skill package: its `SKILL.md` declares the
`quandora` MCP server (`mcpServers` with `url` and `oauthResource`), its
`references/` directory holds the workflow and contract detail, and
`agents/openai.yaml` carries host adapter metadata (icons and the MCP
dependency).

## Checklist

1. Confirm the caller owns the target agent; the connection step is
   owner-only.
2. Install the five skill folders folder-intact (`SKILL.md` + `references/` +
   `agents/openai.yaml`) into the agent's private skills directory.
3. After the host's reload/build, connect Quandora in the current session; the
   owner approves the authorization when it is presented.
4. Verify catalog discovery and the connection in the same session with a
   read-only Quandora call from the live server tool list; do not depend on a
   hardcoded method name. Only start a new chat if the host requires a
   restart.

## Never

- Ask for, read, store, or paste API keys, tokens, PKCE verifiers, cookies, or
  authorization URLs.
- Start a second connection or re-authorize merely because a token refreshed.
