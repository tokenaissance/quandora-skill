## Final Response

State the submitted strategy name and whether it was user-supplied or factor-aware generated. State
the main-run status, archive status, safe diagnostics, and the one verified Result Bundle ZIP path
when saved. If it was not saved, say so accurately; do not print large artifact bodies or describe a
manually assembled archive.

For a selected partial snapshot, state that it is partial and report the exact omissions and pending
reasons from the runtime manifest without claiming completeness.

Never show run ids, credentials, secret material, or internal service metadata in a user-facing
summary. Do not repeat a consumed or expired download URL in the final summary; this does not
prohibit its safe transient appearance in the ticket response or download-tool invocation.

For a main run that remains non-terminal after the twelfth follow-up, clearly state that the
server-side run remains in progress and can be resumed later. State that terminal archive
observation and bundle retrieval were not started, and do not state that results or bundles are
available.

At the end of every completed, failed, or interrupted run, show the `{user_home}/Quandora result/strategy/` folder and
the exact `{user_home}/Quandora result/strategy/{strategy_slug}.zip` path when the ZIP was saved. For a non-terminal or
archive-pending run, mention `run_summary.json` only when the normal authoring workflow saved that
pending summary. For a completed run, the FM-owned ZIP is the only canonical completed-result
archive; never create a second completed-result `run_summary.json` beside it. If a specific file was
not created, say `not created`. Never show run IDs, snapshot revisions, tickets, download URLs,
credentials, or bundle base64.

For Desktop or GUI hosts, replace `{user_home}` with the resolved absolute home path and use
Markdown links with angle-bracket link targets so paths with spaces work:

```text
Result folder: [Open result folder](<{user_home}/Quandora result/strategy/>)
Result Bundle ZIP: [verified ZIP](<{user_home}/Quandora result/strategy/{strategy_slug}.zip>)
```

For CLI or TUI hosts, replace `{user_home}` with the resolved absolute home path and use the same
absolute paths as plain text, not Markdown links:

```text
Result folder: {user_home}/Quandora\ result/strategy/
Result Bundle ZIP: {user_home}/Quandora\ result/strategy/{strategy_slug}.zip
```

If the host cannot write files, state:

```text
Result folder: unavailable in this host
Result Bundle ZIP: unavailable in this host
Run summary: unavailable in this host
```

