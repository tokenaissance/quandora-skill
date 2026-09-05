## Local Result Destination

Do not assemble a separate local archive or extracted directory for the strategy. Build
`{strategy_slug}` only from the current user-facing submitted Strategy name, whether user-supplied
or generated: lowercase it, replace each run of non-`[a-z0-9]` characters with one underscore,
trim outer underscores, truncate it to at most 48 characters, and use `strategy` if the result is
empty. The slug must not contain a backend UUID, factor id, internal selector, snapshot revision,
remote filename prefix, fingerprint, or path separator.

The only canonical completed local path is:

```text
{user_home}/Quandora result/strategy/{strategy_slug}.zip
```

Resolve `{user_home}` to the current user's absolute home directory before any file operation or
user-facing link; never keep the placeholder or hard-code an account name.

Create `{user_home}/Quandora result/strategy/` if it does not exist. Never save a
completed Strategy ZIP in the parent result directory, the current workspace, or the Factor
directory.

The slug is a local presentation label only and must not be sent in an action request. For a
non-terminal or archive-pending run, preserve the existing redacted run-summary behavior in the
normal authoring workspace when local writes are available. For a completed run, the FM-owned ZIP
is authoritative and no second canonical `run_summary.json` is written beside it. Never place a
ticket, URL, internal host, storage reference, credential, or bundle bytes in local metadata or
user-facing output.


