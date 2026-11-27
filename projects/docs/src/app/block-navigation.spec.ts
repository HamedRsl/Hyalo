import { routes } from './app.routes';
import { NAV } from './nav';

const blockDestinations = ['/blocks/notifications', '/blocks/marketplace-chat', '/blocks/transfer'];

describe('copyable application block navigation', () => {
  it('makes each application composition directly routable', () => {
    for (const path of blockDestinations) {
      const route = routes.find((candidate) => candidate.path === path.slice(1));
      expect(route?.loadComponent).toBeTypeOf('function');
    }
  });

  it('lists compositions separately from reusable component families', () => {
    const blocks = NAV.find((group) => group.title === 'Application blocks');
    expect(blocks?.items.map((item) => item.path)).toEqual(blockDestinations);
    const components = NAV.find((group) => group.title === 'Components');
    expect(NAV.map((group) => group.title)).toEqual(['Start', 'Application blocks', 'Components']);
    for (const path of [
      '/components/chat',
      '/components/notification-center',
      '/components/keypad',
    ]) {
      expect(components?.items.some((item) => item.path === path)).toBe(false);
    }
  });
});
