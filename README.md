# Quandora · FastAgent

FastAgent meta skill for installing and connecting Quandora's five capability
skills (Factor Mining, Factor Analysis, Strategy Building, Strategy Analysis,
Paper Trading) through Quandora's OAuth-protected MCP server.

## Layout

```text
SKILL.md        # meta: install + connect + verify
skills/         # five capability skill packages (SKILL.md + references/)
agents/         # interface metadata
evals/          # trigger cases
references/     # install-and-verify detail
```

## Install

Point the agent (owner session) at this repository
(`tokenaissance/quandora-plugins`) and ask it to install the five folders
under `skills/`. The agent installs each into its own private skills directory
and connects Quandora; approve the authorization when presented.

## Verify

Start a new chat and ask the agent to verify the Quandora connection with a
read-only call from the live server tool list.

## License

Apache-2.0.
