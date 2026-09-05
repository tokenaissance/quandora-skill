## plugin.py Contract

Use this minimum shape when the user has not supplied an existing plugin. The metadata values must be static top-level literals so Quandora can parse them without executing module-level code. The current cross-sectional runtime requires `__FACTOR_LOG__` to exist but does not inject it; keep it only as compatible metadata and do not depend on it for runtime diagnostics.

```python
from typing import Any, Dict

import numpy as np
import pandas as pd

FACTOR_TYPE = "snake_case_unique_factor_type"
FACTOR_NAME = "human_readable_factor_name"
FACTOR_DEFAULT_PARAMS = {"window": 7}

FACTOR_SECTIONS = {
    "__FACTOR_DESCRIPTION__": "Trailing close-to-close momentum.",
    "__FACTOR_FORMULA__": "close / close[window bars ago] - 1",
    "__FACTOR_TYPE__": "snake_case_unique_factor_type",
    "__FACTOR_PARAM_FIELDS__": "        private int _factorWindow;\n",
    "__FACTOR_INIT__": '            _factorWindow = GetIntParameter("window", 7);\n',
    "__FACTOR_LOG__": '            Log($"[INIT] window={_factorWindow}");\n',
    "__PRICE_WINDOW_EXPR__": "_factorWindow + 1",
    "__EXTRA_BUF_FIELDS__": "",
    "__EXTRA_BUF_ENQUEUE__": "",
    "__EXTRA_BUF_DEQUEUE__": "",
    "__EXTRA_BUF_TOARRAY__": "",
    "__FACTOR_COMPUTE_BODY__": """
            var factorPriceCount = prices.Length;
            if (_factorWindow < 1 || factorPriceCount < _factorWindow + 1) return false;
            var factorPastPrice = prices[factorPriceCount - _factorWindow - 1];
            if (Math.Abs(factorPastPrice) < 1e-12) return false;
            rawSignal = prices[factorPriceCount - 1] / factorPastPrice - 1.0;
            if (double.IsNaN(rawSignal) || double.IsInfinity(rawSignal)) return false;
            return true;
""",
}


def build_signal(close: pd.DataFrame, params: Dict[str, Any], **data: Any) -> pd.DataFrame:
    window = int(params.get("window", FACTOR_DEFAULT_PARAMS["window"]))
    values = close.apply(pd.to_numeric, errors="coerce").astype(float)
    if window < 1:
        return (values * np.nan).reindex_like(close)
    signal = values.pct_change(window)
    signal = signal.replace([np.inf, -np.inf], np.nan).astype(float)
    return signal.reindex_like(close)
```

Keep `build_signal` and `FACTOR_SECTIONS` compute logic aligned:

1. Defaults: each `GetIntParameter("k", N)` literal in `__FACTOR_INIT__` must equal the matching `FACTOR_DEFAULT_PARAMS` value. The composer inlines those literals, so a mismatch silently produces two different factors.
2. Window: consume the same number of bars as the matching Python rolling window, slicing the required trailing bars from the end of the C# array. Never assume `prices.Length` equals the factor's own window.
3. Missing data: Python must produce `NaN` under the same conditions in which C# returns `false`.

Return a float `pd.DataFrame` aligned with `close`, use only current and historical data, and keep all data columns within `plugin_contract.allowed_data`. The duplicated `FACTOR_TYPE` and `__FACTOR_TYPE__` strings must match exactly; never replace the section value with a reference to the top-level variable.


