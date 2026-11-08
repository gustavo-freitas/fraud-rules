# check throws instead of returning a Result

`check` throws when it can't give a meaningful answer: an empty rule set, duplicate rule names, or a rule that throws. We thought about returning a Result (`{ ok: true, fired } | { ok: false, error }`) instead, but went with exceptions because of what happens when a caller gets it wrong. If someone ignores an exception, the request fails and nothing gets approved. If someone ignores the error side of a Result, say `r.ok ? r.fired : []`, a broken config quietly approves everything. For fraud, the lazy path has to be the safe one.

These cases are also bugs or broken config, not outcomes the fraud logic should branch on, which is what exceptions are for.

If `check` ever needs to report more than which rules fired (for example, every rule that failed and why), revisit this. That's a change in what it reports, not just in how errors come out.
