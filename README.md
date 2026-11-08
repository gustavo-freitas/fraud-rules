# fraud-rules

## Problem

Fraud checks often get built on a rules engine (a DSL, scoring, external
config) before anyone needs one. That adds indirection that makes rules harder
to read, test, and review.

## Who it's for

Most fraud teams end up with analysts owning the rules and changing them
without a deploy. That's what rules engines are for. This is for the stage
before that, while engineers own the rules and deploying is cheap.

## How it works

A rule is just a name and a predicate. `check` returns the names of the rules
that fired; an empty list means approved. At its core:

```ts
export type Rule<T> = { name: string; when: (tx: T) => boolean };
export const check = <T>(tx: T, rules: readonly Rule<T>[]) =>
  rules.filter(r => r.when(tx)).map(r => r.name);
```

`check` throws instead of answering when the answer can't be trusted:

- an empty rule set, which almost always means a config failed to load
- two rules with the same name, since the result would be ambiguous
- a rule that throws, rethrown with the rule's name and the original error as
  `cause`

An exception is never approval.

## What it doesn't do

Anything a rule needs, such as history, velocity or the customer profile, is
loaded into the transaction beforehand, so rules stay pure functions. Building
that data, tuning thresholds and measuring how good a rule is all happen
outside this library, and they're the hard part.

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

## See also

- [GLOSSARY.md](GLOSSARY.md): what words like rule, fired and approved mean
  here.
- [ADR 0001](docs/adr/0001-check-throws-instead-of-returning-a-result.md): why
  `check` throws instead of returning a result.
- [simple-rule-based-fraud-checker](https://github.com/albertllousas/simple-rule-based-fraud-checker):
  the project that inspired this one.
