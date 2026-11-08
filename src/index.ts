export type Rule<T> = { name: string; when: (tx: T) => boolean };

export const check = <T>(tx: T, rules: readonly Rule<T>[]) => {
  rejectEmpty(rules);
  rejectDuplicateNames(rules);
  return rules.filter(rule => fires(rule, tx)).map(rule => rule.name);
};

const rejectEmpty = (rules: readonly unknown[]) => {
  if (rules.length === 0) throw new Error("check: empty rule set, refusing to approve");
};

const rejectDuplicateNames = (rules: readonly { name: string }[]) => {
  const names = rules.map(rule => rule.name);
  const duplicate = names.find((name, i) => names.indexOf(name) !== i);
  if (duplicate !== undefined) throw new Error(`check: duplicate rule name "${duplicate}"`);
};

const fires = <T>(rule: Rule<T>, tx: T) => {
  try {
    return rule.when(tx);
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    throw new Error(`check: rule "${rule.name}" failed: ${reason}`, { cause });
  }
};
