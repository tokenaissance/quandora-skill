## Plugin Construction Contract

Before writing `plugin.py`, call `fm_get_contract` and use the returned `plugin_contract` as the source of truth for Python inputs, C# runtime expressions, runtime globals, and horizon defaults.

- Use `plugin_contract.allowed_data` to decide which input columns the factor may use.
- Use `plugin_contract.fwd_period` after the contract is returned. For custom ideas, pass `fwd_period: 7` to `fm_custom_sess` unless the user explicitly asks for another supported horizon.
- Use `plugin_contract.data_columns[].python_kwarg` for `build_signal` parameters.
- Whenever C# reads a market-data column from `bar`, including every extra-buffer enqueue, use the matching `plugin_contract.data_columns[].csharp_double_expression`. Do not use `bar` expressions inside `__FACTOR_COMPUTE_BODY__`; that section can use only the variables listed by its contract, normally `prices`, canonical extra-buffer arrays, `rawSignal`, and factor-owned fields.
- Follow `plugin_contract.runtime_rules` for required globals, `FACTOR_SECTIONS`, runtime variant, leak rules, extra-buffer rules, and reserved identifiers.
- When an additional runtime column is needed, use its matching `plugin_contract.runtime_rules.extra_buffer.column_patterns` entry. Copy that entry's field, enqueue, dequeue, and to-array snippets exactly into the corresponding `FACTOR_SECTIONS` values; do not reconstruct or normalize the snippets.

C# naming rules have this strict precedence:

1. Copy every contract-generated field, enqueue, dequeue, and to-array snippet byte-for-byte. A general naming rule never rewrites an identifier inside a returned canonical snippet.
2. Name factor-owned class fields with the contract's current `_factor...` prefix/style.
3. Name compute-body locals created by the factor with a descriptive `factor...` prefix. Avoid broad names such as `n` or `past`, and avoid every returned reserved local or extra-array reserved identifier.

When `plugin_contract.runtime_rules.factor_sections.all_values_must_be_string_literals` is true, every `FACTOR_SECTIONS` value must be a static string literal. In particular, write `"__FACTOR_TYPE__": "my_factor_type"`, not `"__FACTOR_TYPE__": FACTOR_TYPE`. Keep the top-level `FACTOR_TYPE` literal and the duplicated `__FACTOR_TYPE__` literal byte-for-byte identical. Name factor-owned C# identifiers with `plugin_contract.runtime_rules.csharp_runtime_rules.factor_owned_identifier_prefix` when that rule is returned.

Do not send multiple selectors in one plugin-contract call. Do not retry an identical non-retryable request. Do not silently change the user's research mechanism after a non-retryable validation error.

Never infer C# bar fields, field types, decimal/double casts, runtime buffer expressions, or supported data columns from memory. The returned plugin construction contract wins.


