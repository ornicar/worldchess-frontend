import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { SetQuickstartFlag } from '@app/modules/game/state/game.actions';
import { take } from 'rxjs/operators';
import { StartType } from '@app/modules/game/state/game.state';
import { AccountService } from '@app/account/account-store/account.service';

@Component({
  selector: 'wc-game-main-button-block',
  templateUrl: './game-main-button-block.component.html',
  styleUrls: ['./game-main-button-block.component.scss']
})
export class GameMainButtonBlockComponent implements OnInit {
  window = window;
  constructor(private store: Store,
              private router: Router,
              public accountService: AccountService) {
  }

  ngOnInit() {
  }

  quickStart(e: MouseEvent) {
    this.store.dispatch(new SetQuickstartFlag(StartType.Quickstart)).pipe(take(1)).subscribe(_ => {
      this.router.navigate(['/singlegames']);
    });
    window['dataLayerPush']('wchEvent', 'Main', 'Button', 'Quick game', '', '');
  }

  lobby(e: MouseEvent) {
    this.router.navigate(['/singlegames']);
    window['dataLayerPush']('wchEvent', 'Main', 'Button', 'Lobby', '', '');
  }

  playComputer(e: MouseEvent) {
    this.store.dispatch(new SetQuickstartFlag(StartType.Computer)).pipe(take(1)).subscribe(_ => {
      this.router.navigate(['/singlegames']);
    });
    window['dataLayerPush']('wchEvent', 'Main', 'Button', 'Computer', '', '');
  }
}
