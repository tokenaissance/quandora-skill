# README

<div align="center"><img src=".gitbook/assets/banner.png" alt="Quandora" width="100%"></div>

## Quandora: AI Enabler for Finance Agents

<p align="center"><a href="https://quandora.ai"><img src="https://img.shields.io/badge/Built%20by-Quandora-F28C00?style=flat" alt="Built by Quandora"></a> <a href="https://discord.com/invite/9WshZMnjGE"><img src="https://img.shields.io/badge/Join-Discord-5865F2?style=flat&#x26;logo=discord&#x26;logoColor=white" alt="Join Discord"></a> <a href="https://x.com/quandora_labs"><img src="https://img.shields.io/badge/Follow-%40quandora__labs-000000?style=flat&#x26;logo=x&#x26;logoColor=white" alt="Follow on X"></a></p>

#### Quandora is building an agentic finance infrastructure that turns generic AI agents into professional quant finance agents. Quandora gives AI agents the infrastructure to research markets, generate alphas and strategies, run backtests, and produce structured reports.

| AI-Native Research Workflow                 | Run the full quant research loop from Codex, Claude, Cursor, CodeBuddy, the WorkBuddy China edition, or Kimi Code: autonomous research, backtesting, strategy creation, and deployment-ready workflow.              |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Institutional Quant Infrastructure          | Quandora provides end-to-end infrastructure for your agent: task cards, supported data, evaluation rails, and backtesting, while your agent focuses on writing Python factor logic. |
| Real Performance Evidence with Explanations | Get structured Factor and Strategy Reports with verdicts, metrics, risks, assumptions, and plain-English explanations.                                                              |
| Closed-Loop Learning                        | Agent-curated memory tracks iterations, failures, accepted factors, duplicates, and improvements to build a reusable factor library over time.                                      |
| AI Mentor                                   | Learn while you build through educational links, step-by-step workflow explanations, and clear reasoning behind each action.                                                        |

<br>

### How It Works

```
        +----------------------+
        | factor mining        |<----------------+
        +----------------------+                 |
                  |                              |
                  v                              |
        +----------------------+                 |
        | factor evaluation    |                 |
        +----------------------+                 |
                  |                              |
                  v                              |
        +----------------------+                 |
        | factor / strategy    |                 |
        | card                 |                 |
        +----------------------+                 |
                  |                              |
                  |                              |
                  |                              | performance decay
                  |                              | restarts mining
                  |                              |
                  v                              |
        +----------------------+                 |
        | strategy             |                 |
        | construction         |                 |
        +----------------------+                 |
                  |                              |
                  v                              |
        +----------------------+                 |
        | strategy evaluation  |                 |
        +----------------------+                 |
                  |                              |
                  v                              |
        +----------------------+                 |
        | paper trading /      |-----------------+
        | monitoring           |
        +----------------------+
                  |
                  | stable
                  |
                  v
        +----------------------+
        | supervised           |
        | deployment           |
        +----------------------+
                  |
                  v
        +----------------------+
        | optional live        |
        | trading              |
        +----------------------+
```

<br>

### Agents

Each agent is named for the workflow stage it runs.

| Agent                            | What it does                                                                                                               |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Factor Mining Agent**          | Turns an alpha-mining task into Python factor logic, checks memory for duplicates, and prepares candidates for evaluation. |
| **Factor Evaluation Agent**      | Submits factors to Quandora, tracks server-side validation and backtests, and summarizes pass/fail results.                |
| **Factor / Strategy Card Agent** | Produces structured cards with formulas, metrics, risks, assumptions, verdicts, and plain-English explanations.            |
| **Strategy Construction Agent**  | Combines accepted factors into strategy candidates with portfolio logic, sizing rules, and risk constraints.               |
| **Strategy Evaluation Agent**    | Evaluates strategy performance, drawdown, turnover, cost viability, and robustness before monitoring.                      |
| **Paper Trading Monitor Agent**  | Monitors paper performance and restarts factor mining when performance decay is detected.                                  |
| **Deployment Supervisor Agent**  | Keeps users in the loop for approvals, guardrails, deployment checks, and supervised rollout.                              |

<br>

Quandora Plugins is the public marketplace for Quandora agent integrations. The current package is:

```
quandora@quandora
```

The Quandora plugin includes Factor Mining and Strategy Building skills. Local agents can research and backtest factors, inspect reusable factor history, compose cross-sectional strategies from eligible factors, retrieve verified artifacts, and save result archives in the local workspace.

### Install

#### Codex

Codex Desktop:

```
Source: varsity-tech-product/quandora-plugins
Git ref: leave blank
Plugin: quandora@quandora
```

You can also ask Codex Desktop to install and connect Quandora for you:

```
Read https://github.com/varsity-tech-product/quandora-plugins/blob/main/agent-install-guide/chatgpt.md completely, then install and authenticate Quandora exactly as instructed. I will complete the required browser sign-in, MFA, or consent action when it opens.
```

Codex may ask before running the Codex CLI setup commands. These commands install the Quandora plugin into Codex, write Codex plugin/MCP configuration, and open Quandora OAuth. They do not grant Quandora access to your local files.

Codex CLI:

```bash
codex plugin marketplace add varsity-tech-product/quandora-plugins
codex plugin add quandora@quandora
```

Authorize when prompted. If Codex does not open the authorization flow automatically, use:

```bash
codex mcp login quandora
```

After installation or authorization, open a new chat. If Codex Desktop still does not expose Quandora tools, fully quit and reopen Codex Desktop.

When a Quandora connection is unavailable, update or reinstall the production plugin, reconnect the `quandora` Remote MCP server, and complete the host-native browser authorization flow again. OAuth and credentials remain host-managed: agents must never request API keys, bearer tokens, authorization codes, access tokens, refresh tokens, PKCE verifiers, or pasted credentials.

#### Claude

Claude Desktop Code supports an Agent-readable one-sentence installation flow:

```text
Read https://github.com/varsity-tech-product/quandora-plugins/blob/main/agent-install-guide/claude.md completely, then install and authenticate Quandora exactly as instructed. I will complete the required browser sign-in, MFA, or consent action when it opens.
```

The linked guide requires a new local session in the Code tab, uses the official Claude Code plugin and MCP commands, and invokes the platform-native interactive OAuth path. The normal Chat tab uses the separate Connector workflow described below.

Claude Code in an interactive terminal:

```bash
claude plugin marketplace add varsity-tech-product/quandora-plugins
claude plugin install quandora@quandora
claude mcp login plugin:quandora:quandora
```

The plugin ships fixed-purpose OAuth launchers for Claude Desktop Code under `plugins/quandora/scripts/`. The macOS launcher uses the operating system's `/usr/bin/script` PTY, and the Windows launcher uses Windows PowerShell 5.1 to open a native console. Both invoke only the official `claude mcp login plugin:quandora:quandora` flow, suppress OAuth output logging, and leave browser sign-in, MFA, and consent to the user.

Claude Desktop's normal Chat tab uses its Connector workflow rather than the local Claude Code plugin. Add and connect:

```text
Name: quandora
URL: https://mcp.quandora.ai/quant
```

Use Settings -> Connectors, click Connect, complete Quandora authorization in the browser, then start a new chat. Local result-folder archiving is guaranteed only in hosts that expose local file writes; Claude Desktop may instead provide downloadable files in its sandbox.

#### Cursor Desktop

In a new Cursor Desktop Agent chat, enter:

```text
/add-plugin quandora@https://github.com/varsity-tech-product/quandora-plugins
```

After installation, authenticate the plugin-provided `quandora` Remote MCP server in the browser, then start a new Agent chat before invoking Factor Mining or Strategy Building.

#### CodeBuddy CLI

CodeBuddy CLI installs the plugin through its official plugin manager. If the standalone CLI is not installed, use the official installer for the host platform.

macOS and Linux:

```bash
curl -fsSL https://www.codebuddy.cn/cli/install.sh | bash
export PATH="$HOME/.local/bin:$PATH"
```

Windows PowerShell:

```powershell
irm https://www.codebuddy.cn/cli/install.ps1 | iex
$env:Path = "$env:USERPROFILE\AppData\Local\codebuddy\bin;$env:Path"
```

Install or update the production plugin:

```bash
codebuddy plugin marketplace add varsity-tech-product/quandora-plugins --name quandora
codebuddy plugin install quandora@quandora --scope user
codebuddy plugin list --json
```

CodeBuddy uses the plugin-managed remote HTTP MCP server and opens its native browser authorization flow when the server connects. No Python, Node.js, local MCP server, or Quandora API key is required.

#### WorkBuddy China edition

The WorkBuddy China edition consumes the CodeBuddy-compatible marketplace and plugin manifests together with the plugin-managed `quandora` remote HTTP MCP declaration. Install or update the production plugin through its plugin or custom-MCP interface, reconnect it, complete the host-native browser authorization flow, and start a new chat. Do not create a local MCP server or paste credentials.

#### Kimi Code CLI

Install the production plugin directly from GitHub:

```text
/plugins install https://github.com/varsity-tech-product/quandora-plugins
```

Confirm the source, inspect the installation, and reload plugins:

```text
/plugins info quandora
/plugins reload
```

Start a new session, authorize the plugin-provided MCP server, and verify the connection:

```text
/mcp-config login plugin-quandora:quandora
/mcp
```

Complete authorization in the browser, then start a new session before invoking Factor Mining or Strategy Building.

### Use Factor Mining

Use the skill command when available:

```
/quandora:factor-mining show public tasks
```

You can also ask naturally:

```
Use Quandora Factor Mining to show public tasks.
Use Quandora Factor Mining with my custom factor idea.
Use Quandora Factor Mining to resume a run and summarize results.
```

When the host supports local files, each run is saved under a stable folder named after the factor slug:

```
Quandora result/factor-mining/aggressive_flow_exhaustion_reversal/
```

The run folder contains the submitted `plugin.py`, a redacted `run_summary.json`, `factor_card_is.json` when available, `artifact_manifest.json`, PNG charts under `artifacts/is/`, and `signal_raw.parquet` when available. The agent prints the result, artifact, and chart folder paths at the end of each run.

### Use Strategy Building

Use the skill command when available:

```text
/quandora:strategy-building list available factors
/quandora:strategy-building help me build a strategy
```

You can also ask naturally:

```text
Use Quandora Strategy Building to list eligible factors.
Use Quandora Strategy Building to compare selected factors before submission.
Use Quandora Strategy Building to combine eligible factors and show the effective configuration before submitting.
Use Quandora Strategy Building to resume a run and archive its results.
```

When the host supports local files, strategy runs are saved under:

```text
Quandora result/strategy/<strategy_slug>/
```

The run folder contains `run_summary.json`, verified JSON/text artifacts, PNG files under `artifacts/image/`, and `artifact_manifest.json`. The agent reports absolute paths for every saved result.

### License

This repository is licensed under the Apache License 2.0. See [LICENSE](LICENSE).
