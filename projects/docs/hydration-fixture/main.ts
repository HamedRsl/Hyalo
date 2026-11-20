import { HydrationFixture, hydrationProviders } from './fixture';
import { bootstrapApplication } from '@angular/platform-browser';
void bootstrapApplication(HydrationFixture, { providers: hydrationProviders });
