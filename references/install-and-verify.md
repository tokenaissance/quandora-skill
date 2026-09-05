# Install and verify (detail)

Owner-only setup for one FastAgent agent. The agent performs the mechanics
through its host skill-install and MCP connection flow; this reference exists
so the meta skill and its operator share one checklist.

## Facts to provide

- Repository: `tokenaissance/quandora-plugins`
- Skill folders to install: `skills/factor-mining`,
  `skills/factor-analysis`, `skills/strategy-building`,
  `skills/strategy-analysis`, `skills/paper-trading`

Each folder is one complete skill package: its `SKILL.md` declares the
`quandora` MCP server (`mcpServers` with `url` and `oauthResource`), and its
`references/` directory holds the workflow and contract detail.

## Checklist

1. Confirm the caller owns the target agent; the connection step is
   owner-only.
2. Install the five skill folders into the agent's private skills directory.
3. Start a new chat and connect Quandora; the owner approves the authorization
   when it is presented.
4. Verify with a read-only Quandora call from the live server tool list; do
   not depend on a hardcoded method name.

## Never

- Ask for, read, store, or paste API keys, tokens, PKCE verifiers, cookies, or
  authorization URLs.
- Start a second connection or re-authorize merely because a token refreshed.
