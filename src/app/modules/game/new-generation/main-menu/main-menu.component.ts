import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { createSelector, select, Store } from '@ngrx/store';
import { Store as NgxsStore } from '@ngxs/store';
import { selectIsAuthorized, selectRefreshLoading, selectToken } from '@app/auth/auth.reducer';
import * as fromRoot from '@app/reducers';
import { selectMyAccount } from '@app/account/account-store/account.reducer';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { filter, first, map, mergeMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { AccountResourceService } from '@app/account/account-store/account-resource.service';
import { AddSubscriptions } from '@app/purchases/subscriptions/subscriptions.actions';
import { AccountLoadSuccess } from '@app/account/account-store/account.actions';
import { AuthLogout } from '@app/auth/auth.actions';
import { environment } from '../../../../../environments/environment';
import { IsMainApp } from '@app/is-main-app.token';
import { Router } from '@angular/router';
import { environmentMenu } from '../../../../../environments/environment.menu';
import { PaygatePopupManagerService } from '@app/shared/services/paygate-popup-manager.service';
import { TranslateService } from '@ngx-translate/core';
import { RejectOpponentRequest } from '@app/modules/game/state/game.actions';

@Component({
  selector: 'game-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class GameMainMenuComponent implements OnInit, OnDestroy {

  destroy$ = new Subject();

  window = window;

  environment = environment;

  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized),
  );

  account$ = this.store$.pipe(
    select(selectMyAccount),
  );

  token$ = this.store$.pipe(
    select(createSelector(
      selectToken,
      selectRefreshLoading,
      (token, refreshing) => ({ token, refreshing })
    )),
    // wait all request when token refreshed.
    filter(({ token, refreshing }) => !refreshing),
    map(({ token }) => token),
    first(),
    map(t => t ? '?t=' + t : ''),
  );

  menu = this.isMainApp ? environmentMenu['gamingMenu'] : environmentMenu['gamingMenu'].map((item: any) => {
    if (item.blank && item.link === environment.gameUrl) {
      item.blank = false;
      item.link = '';
    } else if (!item.blank && item.link.startsWith('/')) {
      item.auth = true;
    }
    return item;
  });

  constructor(
    private store$: Store<fromRoot.State>,
    private store: NgxsStore,
    private accountResourceService: AccountResourceService,
    private router: Router,
    public paygateService: PaygatePopupManagerService,
    private translateService: TranslateService,
    @Inject(IsMainApp) private isMainApp: boolean,
  ) {

    combineLatest(
      this.isAuthorized$,
      this.account$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe(([isAuthorized, account]) => {
      if (isAuthorized && !account) {
        this.accountResourceService.getProfile().pipe(
          takeUntil(this.destroy$),
          tap(a => this.store$.dispatch(new AddSubscriptions({
            subscriptions: a.subscriptions,
            count: a.subscriptions.length
          }))),
          tap(a => this.store$.dispatch(new AccountLoadSuccess({ account: a })))
        ).subscribe((a) => {
        });
      }
    });

    this.isAuthorized$.pipe(
      takeUntil(this.destroy$),
      withLatestFrom(this.account$),
      filter(([isAuth, acc]) => isAuth && !acc),
      mergeMap(() => this.accountResourceService.getProfile()),
    ).subscribe((account) => {
      this.store$.dispatch(new AddSubscriptions({
        subscriptions: account.subscriptions,
        count: account.subscriptions.length
      }));
      this.store$.dispatch(new AccountLoadSuccess({ account }));
    });
  }

  logout() {
    this.store.dispatch(new RejectOpponentRequest()).pipe(first()).subscribe(() => {
      this.store$.dispatch(new AuthLogout());
    });
  }

  ngOnInit() {
  }
  getItem(item: string): Observable<string> {
    let translateItem = '';
    if (item === 'single game') {
      translateItem = 'GAME.SINGLE_GAME';
    }
    if (item === 'ratings') {
      translateItem = 'MENU.RATINGS';
    }
    if (item === 'tournaments') {
      translateItem = 'TOURNAMENTS.TOURNAMENTS';
    }
    if (item === 'shop') {
      translateItem = 'MENU.SHOP';
    }
    if (item === 'FIDE') {
      translateItem = 'MENU.FIDE';
    }
    if (item === 'Old Interface') {
      translateItem = 'MENU.OLD_INTERFACE';
    }
    if (item === 'World Chess') {
      translateItem = 'PROFILE.WS';
    }
    return this.translateService.get(translateItem);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sendStatistics(gtagParams) {
    window['dataLayerPush'](`${gtagParams[0]}`, `${gtagParams[1]}`, `${gtagParams[2]}`, `${gtagParams[3]}`, null, null);
  }

}
