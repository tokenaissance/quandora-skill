## Strategy Portfolio and Portfolio Paper

A Strategy Portfolio contains at least two exact StrategyVersion sleeves. Every weight is a
positive canonical Decimal string and the exact decimal sum must equal `1`. A version is a static
composition: no capital transfer, periodic rebalance, shared margin, signal fusion, order netting,
or execution-level netting exists.

Use `pt_sp_create` for the first exact composition and
`pt_sp_revise` only when the user explicitly changes the version. Display and
confirm every StrategyVersion handle and weight before either mutation. Read exact parent/version
state with `pt_sp_get` and `pt_sp_version`.

Before `pt_sp_bt_submit`, confirm the exact PortfolioVersion, total initial cash, dates,
and optional fee strings. The total cash is allocated exactly across sleeves; child StrategyRuns
are ordinary independent runs. Observe with `pt_sp_bt_get` and read the completed
aggregate backtest result with `pt_sp_bt_result`.

Portfolio Paper can start only from one completed PortfolioRun. Before
`pt_sp_run_submit`, display and confirm the source PortfolioRun, its exact total/source
capital, start date, leverage, and that every child is an independent static sleeve. Do not offer a
Paper-time capital override. To change total Paper capital, first complete a new PortfolioRun at
that capital.

Use `pt_sp_run_get` for the parent lifecycle and ordered child handles/status. Present child
status in component order and label every child `independent sleeve`. Do not claim parent aggregate
positions exist. Do not claim parent net positions, shared margin, or a parent real-time/equity
curve exists.

Before `pt_sp_run_stop`, show the exact parent handle, explain that stop fans out to its
children and is terminal, and obtain explicit confirmation. Call stop once, then reconcile with
`pt_sp_run_get`; never retry automatically or offer resume.


