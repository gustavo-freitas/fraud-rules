# fraud-rules

Checking a transaction against fraud rules written in code, without a rules engine.

| Term        | Meaning                                                                                                        | Don't call it            |
| ----------- | -------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Transaction | The thing being checked, with everything the rules need (history, velocity, customer profile) already loaded. | payment, event, request  |
| Rule        | A name and a yes/no question about a transaction. The name is unique within a rule set.                       | check, policy, condition |
| Rule set    | The rules a transaction is checked against. An empty one is a broken config, not a permissive one.            | config, policy           |
| Fired       | A rule fired when its answer for the transaction was yes.                                                      | matched, triggered, hit  |
| Approved    | Checked against a non-empty rule set, no rule failed, none fired. Anything else is a decline or manual review. | passed, clean, OK        |

Each idea gets one word, so the code, tests and docs always say the same thing.
Some words in the "Don't call it" column already mean something else here:
`check` is the function, not a rule.
