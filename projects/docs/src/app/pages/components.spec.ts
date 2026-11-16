import { NAV } from '../nav';
import { COMPONENT_CATALOG } from './components';

describe('Component catalog', () => {
  it('includes every component destination in alphabetical navigation order', () => {
    const destinations = (NAV.find((group) => group.title === 'Components')?.items ?? []).filter(
      (item) => item.path !== '/components',
    );
    expect(COMPONENT_CATALOG.map((item) => item.path)).toEqual(
      destinations.map((item) => item.path),
    );
    const labels = COMPONENT_CATALOG.map((item) => item.label);
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b, 'en')));
    expect(COMPONENT_CATALOG.every((item) => Boolean(item.summary))).toBe(true);
  });
});
