# Install and authenticate Quandora in FastAgent (tokenaissance Cloud)

Read this document completely, then perform the setup for the operator. This guide mounts Quandora's OAuth-protected MCP server onto one FastAgent agent and places the five Quandora skills where that agent's runtime loads them. FastAgent connects Quandora through its native MCP client and OAuth flow, not through this repository's plugin marketplace.

Exactly one moment belongs to the end user: completing sign-in, MFA, or consent on the Quandora authorization page in Step 3.

Never request, read, print, copy, store, or relay an API key, OAuth token, authorization code, access token, refresh token, PKCE verifier, service token, cookie, or authorization URL. FastAgent and Quandora handle all credentials; do not ask the user to paste them.

The canonical copy of this guide is `https://raw.githubusercontent.com/varsity-tech-product/quandora-plugins/main/agent-install-guide/fastagent.md`.

## Environment and identities

This procedure assumes a tokenaissance-Cloud-hosted FastAgent deployment where the operator also has shell access to the machine that runs FastAgent (for skill placement and CLI checks), and an agent the operator owns. If the current surface does not match, stop and direct the user instead of adapting these steps to another product.

Fixed production identities:

- FastAgent home directory: `~/.fastagent` (overridden by `$FASTAGENT_HOME`)
- MCP server name (agent config): `quandora`
- MCP server type and URL: `http` · `https://mcp.quandora.ai/quant`
- OAuth resource: `https://mcp.quandora.ai/quant` (must be declared so FastAgent treats the server as OAuth-protected)
- OAuth authorization server: `https://mcp.quandora.ai`
- Agent settings entry point: the agent's settings, **MCP OAuth** panel
- Skills to place: `factor-mining`, `factor-analysis`, `strategy-building`, `strategy-analysis`, and `paper-trading`
- Protected read-only probe: `fm_status`

Do not create a second Quandora MCP entry or a static-header server at the same URL. Only servers declared with `oauthResource` are OAuth-protected and appear in the Cloud panel.

## 1. Confirm the FastAgent agent and owner scope

Pick the FastAgent agent that should receive Quandora. OAuth-backed MCP tools are gated to the agent owner's own sessions, so choose an agent you own and will use as that owner.

## 2. Declare the Quandora MCP server on the agent

The Cloud console authorizes a server but does not add it to the agent. First declare an OAuth-protected `quandora` server in the agent's MCP configuration (the agent record that carries `mcpServers`):

```json
{
  "mcpServers": {
    "quandora": {
      "type": "http",
      "url": "https://mcp.quandora.ai/quant",
      "oauthResource": "https://mcp.quandora.ai/quant"
    }
  }
}
```

Verify the declaration was applied before continuing to Step 3.

## 3. Authorize Quandora in the Cloud console

Open the agent's settings and go to the **MCP OAuth** panel. The `quandora` row must show server name `quandora`, URL `https://mcp.quandora.ai/quant`, and status **未授权** (Not authorized). If the panel is empty or the row is missing, the declaration in Step 2 was not applied; re-check it and do not proceed.

Click **授权** (Authorize). FastAgent redirects to Quandora's page. Tell the user that Quandora is ready for authorization, then wait while they complete any required sign-in or MFA and approve access. Do not operate the consent page and do not start a second authorization flow. When Cloud returns to the agent settings, the row shows **已授权** (Authorized).

## 4. Place the five Quandora skills where FastAgent loads them

FastAgent keys a skill by its directory name and scans the user-installed layer at `~/.fastagent/skills/<name>/`. On the machine that runs FastAgent, place the five skill directories from this repository under that layer, one directory per skill:

```sh
git clone --depth 1 https://github.com/varsity-tech-product/quandora-plugins.git /tmp/quandora-plugins
mkdir -p ~/.fastagent/skills
cp -R /tmp/quandora-plugins/plugins/quandora/skills/factor-mining ~/.fastagent/skills/
cp -R /tmp/quandora-plugins/plugins/quandora/skills/factor-analysis ~/.fastagent/skills/
cp -R /tmp/quandora-plugins/plugins/quandora/skills/strategy-building ~/.fastagent/skills/
cp -R /tmp/quandora-plugins/plugins/quandora/skills/strategy-analysis ~/.fastagent/skills/
cp -R /tmp/quandora-plugins/plugins/quandora/skills/paper-trading ~/.fastagent/skills/
rm -rf /tmp/quandora-plugins
```

Confirm the loader sees them:

```sh
fastagent skill list
```

The five names should appear as user-layer skills. Skills load on the next agent turn, so start a new chat (restarting the FastAgent process first if the runtime is already running) before expecting the skill set.

**Managed-host note.** In a Cloud deployment without shell on the FastAgent host, use the console Skills panel to install each skill once they are published to the registry that panel searches; the loader keys and behavior are the same. This guide's copy step is the direct path when host access exists.

## 5. Verify completion

- `fastagent mcp status quandora` on the host reports `authorized`.
- `fastagent skill list` lists `factor-mining`, `factor-analysis`, `strategy-building`, `strategy-analysis`, and `paper-trading`.
- In a new chat with the agent as its owner, the Quandora MCP tools are visible and the read-only probe `fm_status` succeeds.

Report success only when all three hold. If the MCP server is authorized but the tools are not visible, start a new chat so the skills reload; do not add a second MCP entry and never paste credentials.

## 6. Keeping the connection alive

Quandora access tokens are valid for 7 days; FastAgent's MCP client refreshes automatically with its stored rotating refresh token. If a refresh fails, re-authorize: click **授权** in the agent's **MCP OAuth** panel again, or on the host run `fastagent mcp login quandora`. On headless/SSH hosts use `fastagent mcp login quandora --no-browser` and paste back the redirected URL. Fresh consent is also required when Quandora grants newly added scopes, because a refreshed old token does not carry them.

Give the user this exact copyable prompt for a future refresh:

```text
Refresh the Quandora MCP connection. If automatic refresh fails, re-authenticate it with the CLI.
```
