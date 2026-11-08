export type Rule<T> = { name: string; when: (tx: T) => boolean };
export const check = <T>(tx: T, rules: readonly Rule<T>[]) =>
  rules.filter(r => r.when(tx)).map(r => r.name);
