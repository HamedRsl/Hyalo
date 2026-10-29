import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HY_CARD, HY_NAVBAR, HyButton } from '@hyalo/angular';

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
