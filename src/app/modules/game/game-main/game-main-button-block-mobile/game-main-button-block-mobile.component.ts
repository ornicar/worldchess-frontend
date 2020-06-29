import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { SetQuickstartFlag } from '@app/modules/game/state/game.actions';
import { take } from 'rxjs/operators';
import { StartType } from '@app/modules/game/state/game.state';
import { AccountService } from '@app/account/account-store/account.service';

@Component({
  selector: 'wc-game-main-button-block-mobile',
  templateUrl: './game-main-button-block-mobile.component.html',
  styleUrls: ['./game-main-button-block-mobile.component.scss']
})
export class GameMainButtonBlockMobileComponent implements OnInit {
  window = window;
  constructor(private store: Store,
              private router: Router, private accountService: AccountService) {
  }

  ngOnInit() {
  }

  quickStart(e: MouseEvent) {
    this.store.dispatch(new SetQuickstartFlag(StartType.Quickstart)).pipe(take(1)).subscribe(v => {
      this.router.navigate(['/singlegames']);
    });
  }

  lobby(e: MouseEvent) {
    e.preventDefault();
    this.router.navigate(['/singlegames']);
  }

  tournaments(e: MouseEvent) {
    e.preventDefault();
    this.router.navigate(['/tournaments']);
  }
}
