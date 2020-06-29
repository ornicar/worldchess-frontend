import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { createSelector, select, Store } from '@ngrx/store';
import * as fromRoot from '@app/reducers';
import { selectIsAuthorized, selectRefreshLoading, selectToken } from '@app/auth/auth.reducer';

@Component({
  selector: 'game-main-legalize-skils',
  templateUrl: './game-main-legalize-skils.component.html',
  styleUrls: ['./game-main-legalize-skils.component.scss']
})
export class GameMainLegalizeSkilsComponent implements OnInit {
  window = window;
  constructor(
    private store$: Store<fromRoot.State>,
    private router: Router) {
  }

  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized),
  );

  ngOnInit() {
  }

  singlegames(e: MouseEvent) {
    e.preventDefault();
    this.router.navigate(['/singlegames']);
    window['dataLayerPush']('wchEvent', 'Main', 'Button', 'Play a game', '', '');
  }

  mygames(e: MouseEvent) {
    e.preventDefault();
    this.isAuthorized$.subscribe((isAuthorized) => {
      if (isAuthorized) {
        this.router.navigate(['/mygames']);
      } else {
        this.router.navigate(['', {outlets: {p: ['paygate', 'login']}}]);
      }
    });
    window['dataLayerPush']('wchEvent', 'Main', 'Button', 'Become a Pro player', '', '');
  }
}
