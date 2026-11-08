# fraud-rules

Checking a transaction against fraud rules written in code, without a rules engine.

## Language

**Transaction**:
The thing being checked, with everything the rules need already loaded into it (history, velocity, customer profile).
_Avoid_: Payment, event, request

**Rule**:
A name and a yes/no question about a transaction. The name is how a rule is identified, so it's unique within a rule set.
_Avoid_: Check, policy, condition

**Rule set**:
The rules a transaction is checked against. An empty rule set is a broken config, not a permissive one.
_Avoid_: Config, policy

**Fired**:
A rule fired when its answer for the transaction was yes.
_Avoid_: Matched, triggered, hit

**Approved**:
A transaction is approved when it was checked against a non-empty rule set, no rule failed, and no rule fired. Anything else is a decline or a manual review.
_Avoid_: Passed, clean, OK
