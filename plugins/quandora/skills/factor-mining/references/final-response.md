## Final Response

Summarize status, factor name, safe diagnostics if the run failed, bundle state, and the exact
verified `{user_home}/Quandora result/factor/{factor_slug}.zip` path when saved. Inspect `ok`, `status`,
`terminal_status`, `failures`, sanitized job statuses, and bundle metadata. Do not mention internal
implementation details or treat an optional bundle item omission recorded by FM as a failed run.
For a selected partial snapshot, state that it is partial and report the exact omissions and pending
reasons from the runtime manifest without claiming completeness.

Never show job IDs, snapshot revisions, bearer tokens, raw credentials, or full `plugin.py` source in user-facing summaries. Do not repeat a consumed or expired download URL in the final summary; this does not prohibit its safe transient appearance in the ticket response or download-tool invocation. It is safe to show the local result folder and verified ZIP path created by the current host.

At the end of every completed, failed, or interrupted run, show the `{user_home}/Quandora result/factor/` folder and
the verified Result Bundle ZIP when saved. For a pending run, mention a redacted pending summary
only if the normal authoring workflow saved one. For a completed run, the FM-owned ZIP is the only
canonical completed-result archive. If the ZIP could not be saved, say so accurately. Never show
job IDs, snapshot revisions, download URLs, tickets, credentials, or bundle base64.

For GUI/Desktop hosts, replace `{user_home}` with the resolved absolute home path and use Markdown
links with angle-bracket link targets so paths with spaces work:

Result folder: [Open result folder](<{user_home}/Quandora result/factor/>)
Result Bundle ZIP: [verified ZIP](<{user_home}/Quandora result/factor/{factor_slug}.zip>)

For CLI/TUI hosts, replace `{user_home}` with the resolved absolute home path and use plain
absolute paths, not Markdown links:

Result folder: {user_home}/Quandora\ result/factor/
Result Bundle ZIP: {user_home}/Quandora\ result/factor/{factor_slug}.zip

If the host could not write files, print:

Result folder: not available in this host
Result Bundle ZIP: not available in this host


