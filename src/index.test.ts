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

  it("returns an empty list when there are no rules (the caller must treat this as misconfiguration)", () => {
    expect(check({ amount: 50_000, country: "US", hour: 3 }, [])).toEqual([]);
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
});
