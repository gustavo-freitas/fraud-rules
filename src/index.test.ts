import { describe, expect, it } from "vitest";
import { check, type Rule } from "./index";

type Tx = { amount: number; country: string; hour: number };

const rules: Rule<Tx>[] = [
  { name: "high amount", when: tx => tx.amount > 10_000 },
  { name: "foreign country", when: tx => tx.country !== "BR" },
  { name: "late night", when: tx => tx.hour < 6 },
];

describe("check(tx, rules) returns the names of the rules that fired", () => {
  it("returns an empty list when no rule fires (approved)", () => {
    expect(check({ amount: 100, country: "BR", hour: 14 }, rules)).toEqual([]);
  });

  it("returns the name of the rule that fired", () => {
    expect(check({ amount: 50_000, country: "BR", hour: 14 }, rules)).toEqual(["high amount"]);
  });

  it("returns every rule that fired, in declaration order", () => {
    expect(check({ amount: 50_000, country: "US", hour: 3 }, rules)).toEqual([
      "high amount",
      "foreign country",
      "late night",
    ]);
  });

  it("throws when there are no rules (an empty rule set is never approval)", () => {
    expect(() => check({ amount: 50_000, country: "US", hour: 3 }, [])).toThrow("empty rule set");
  });

  it("throws when a rule throws (the caller must not treat this as approved)", () => {
    const broken: Rule<Tx> = {
      name: "broken",
      when: () => {
        throw new Error("lookup failed");
      },
    };
    expect(() => check({ amount: 100, country: "BR", hour: 14 }, [broken])).toThrow("lookup failed");
  });

  it("names the rule that threw and keeps the original error as the cause", () => {
    const original = new Error("lookup failed");
    const broken: Rule<Tx> = {
      name: "velocity",
      when: () => {
        throw original;
      },
    };
    let thrown: unknown;
    try {
      check({ amount: 100, country: "BR", hour: 14 }, [...rules, broken]);
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toBe('check: rule "velocity" failed: lookup failed');
    expect((thrown as Error).cause).toBe(original);
  });

  it("throws when two rules share a name (the fired list would be ambiguous)", () => {
    const duplicate: Rule<Tx> = { name: "high amount", when: tx => tx.amount > 1_000 };
    expect(() => check({ amount: 100, country: "BR", hour: 14 }, [...rules, duplicate])).toThrow(
      'duplicate rule name "high amount"',
    );
  });
});
