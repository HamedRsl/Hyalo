import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { HydrationFixture, hydrationProviders } from './fixture';
export default function bootstrap(
  context: import('@angular/platform-browser').BootstrapContext,
): ReturnType<typeof bootstrapApplication> {
  return bootstrapApplication(
    HydrationFixture,
    {
      providers: [provideServerRendering(), ...hydrationProviders],
    },
    context,
  );
}
