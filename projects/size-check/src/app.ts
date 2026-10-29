import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HyButton } from '@hyalo/angular/button';
import { HY_CARD } from '@hyalo/angular/card';
import { HY_NAVBAR } from '@hyalo/angular/navbar';

/**
 * A typical shell: a navbar, a card and a button up front, everything else
 * behind a lazy route. Nothing the lazy route uses should count as initial.
 */
@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, HY_NAVBAR, HY_CARD, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App {}
