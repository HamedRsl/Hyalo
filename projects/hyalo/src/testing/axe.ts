import axe from 'axe-core';

/**
 * Runs axe on a rendered fixture and fails with a readable list of
 * violations. Colour contrast is skipped because jsdom does not compute
 * styles. Contrast is checked in the browser instead.
 */
export async function expectNoAxeViolations(root: Element): Promise<void> {
  const result = await axe.run(root, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  const messages = result.violations.map(
    (v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.html).join('\n  ')}`,
  );
  expect(messages).toEqual([]);
}
