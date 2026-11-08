# fraud-rules

## Problem

Fraud checks often get built on a rules engine (a DSL, scoring, external
config) before anyone needs one. That adds indirection that makes rules harder
to read, test, and review.

## How to solve it

When engineers own the rules and deploying is cheap, a rule is just a name and
a predicate. The result is the list of rules that fired; an empty list, from a
non-empty rule set, means approved.

```ts
export type Rule<T> = { name: string; when: (tx: T) => boolean };
export const check = <T>(tx: T, rules: readonly Rule<T>[]) =>
  rules.filter(r => r.when(tx)).map(r => r.name);
```

Anything a rule needs, such as history, velocity or the customer profile, is
loaded into the transaction beforehand, so rules stay pure functions.

If non-engineers need to change rules at runtime, this can grow without
replacing the core. Since a `Rule<T>` is plain data, a small layer can build
rules from config, for example thresholds or country lists that an analyst
edits, while the predicate logic stays in code. A full rules engine only makes
sense once analysts need to write new logic, not just tune parameters.

Inspired by [simple-rule-based-fraud-checker](https://github.com/albertllousas/simple-rule-based-fraud-checker).

## Example

```ts
import { check, type Rule } from "./src/index";

type Tx = { amount: number; country: string; hour: number };

const rules: Rule<Tx>[] = [
  { name: "high amount", when: tx => tx.amount > 10_000 },
  { name: "foreign country", when: tx => tx.country !== "BR" },
  { name: "late night", when: tx => tx.hour < 6 },
];

check({ amount: 50_000, country: "US", hour: 3 }, rules);
// ["high amount", "foreign country", "late night"]

check({ amount: 100, country: "BR", hour: 14 }, rules);
// [] → approved
```
