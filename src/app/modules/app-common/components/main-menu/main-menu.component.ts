import {Component, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import { createSelector, select, Store } from '@ngrx/store';
import { selectIsAuthorized, selectRefreshLoading, selectToken } from '@app/auth/auth.reducer';
import * as fromRoot from '@app/reducers';
import { selectMyAccount } from '@app/account/account-store/account.reducer';
import { combineLatest, Subject } from 'rxjs';
import { filter, first, map, mergeMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { AccountResourceService } from '@app/account/account-store/account-resource.service';
import { AddSubscriptions } from '@app/purchases/subscriptions/subscriptions.actions';
import { AccountLoadSuccess } from '@app/account/account-store/account.actions';
import { AuthLogout } from '@app/auth/auth.actions';
import { IsMainApp } from '@app/is-main-app.token';
import { Router, NavigationStart } from '@angular/router';
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit, OnDestroy {

  destroy$ = new Subject();

  window = window;

  @Input("menu-section")
  private menuSection: string = 'mainMenu';

  @Input("base-url")
  private baseUrl: string = '';

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

  menu =  environment[this.menuSection].map((item: any) => {
    if (!this.baseUrl){
      return item;
    }
    if (item.blank && item.link === this.baseUrl) {
      item.blank = false;
      item.link = '';
    } else if (!item.blank && item.link.startsWith('/')) {
      item.auth = true;
    }
    return item;
  });

  constructor(
    private store$: Store<fromRoot.State>,
    private accountResourceService: AccountResourceService,
    private router: Router,
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
    this.store$.dispatch(new AuthLogout());
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
