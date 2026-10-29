import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideHyalo } from '@hyalo/angular';
import { provideHyaloIcons } from '@hyalo/angular/icon';
import { routes } from './app.routes';
import { DOCS_ICONS } from './icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      withViewTransitions({ skipInitialTransition: true }),
    ),
    provideClientHydration(withEventReplay()),
    provideHyalo({ gsap: () => import('gsap').then((m) => m.gsap) }),
    provideHyaloIcons(DOCS_ICONS),
  ],
};
