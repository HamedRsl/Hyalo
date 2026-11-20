/** Explicit application-owned operators; no dynamic expressions or property-path evaluation. */
export type HyFilterOperatorRegistry = Readonly<
  Record<string, (actual: unknown, expected: unknown) => boolean>
>;
export interface HyFilterConstraint {
  readonly operator: string;
  readonly value: unknown;
}
export interface HyFilterGroup {
  readonly field: string;
  readonly operator: 'and' | 'or';
  readonly constraints: readonly HyFilterConstraint[];
}
/** Empty groups are neutral. Unknown operators fail closed. Fields are combined with AND by default. */
export function evaluateFilters(
  record: Readonly<Record<string, unknown>>,
  groups: readonly HyFilterGroup[],
  registry: HyFilterOperatorRegistry,
  operator: 'and' | 'or' = 'and',
): boolean {
  const active = groups.filter((group) => group.constraints.length);
  if (!active.length) return true;
  const matches = (group: HyFilterGroup): boolean => {
    const test = (constraint: HyFilterConstraint): boolean => {
      if (!Object.hasOwn(registry, constraint.operator)) return false;
      const execute = registry[constraint.operator];
      return (
        typeof execute === 'function' &&
        execute(
          Object.hasOwn(record, group.field) ? record[group.field] : undefined,
          constraint.value,
        )
      );
    };
    return group.operator === 'or' ? group.constraints.some(test) : group.constraints.every(test);
  };
  return operator === 'or' ? active.some(matches) : active.every(matches);
}
