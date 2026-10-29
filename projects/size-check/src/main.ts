import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { App } from './app';

// eslint-disable-next-line no-console -- nothing else can report a failed bootstrap
bootstrapApplication(App, {
  providers: [provideRouter([{ path: 'more', loadComponent: () => import('./lazy') }])],
}).catch((err) => console.error(err));
