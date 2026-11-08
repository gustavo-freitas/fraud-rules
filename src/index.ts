export type Rule<T> = { name: string; when: (tx: T) => boolean };
export const check = <T>(tx: T, rules: readonly Rule<T>[]) => {
  if (rules.length === 0) throw new Error("check: empty rule set, refusing to approve");
  return rules.filter(r => r.when(tx)).map(r => r.name);
};
