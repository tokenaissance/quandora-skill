## Security

- Use only Quandora actions for formal product workflows, except for consuming a short-lived opaque Result Bundle URL returned by `fm_bundle_ticket` exactly once.
- Never ask for API keys, auth files, user credentials, local execution keys, `vt_` keys, bearer tokens, or service tokens.
- Never print, persist in logs, or summarize full credential values.
- Do not call hosted generation endpoints; the active agent generates factor source in its current host session.
- Do not call internal service URLs or generic URL/API surfaces, and never construct a download URL. The returned Remote MCP Result Bundle URL is the sole direct-download exception.
- Do not import, exec, eval, or otherwise execute generated `plugin.py`.
- Do not submit filesystem paths instead of inline `plugin_source`.
- Do not print generated `plugin.py` source in summaries.
- Treat downstream IDs and service metadata as private. Treat the returned one-time Result Bundle URL as an approved immediate download capability under the URL-first rules above, not as a credential that must be removed before use.
- Bundle states and safe reason codes are authoritative. Authentication, authorization, network, malformed response, and server errors must fail clearly with redacted messages.

