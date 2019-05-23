import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import { ActionsSubject, select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, of } from 'rxjs';
import * as fromRoot from '../reducers/index';
import { selectIsAuthorized, selectIsInit } from './auth.reducer';
import { filter, mergeMap, take, tap } from 'rxjs/operators';
import { AuthInit } from './auth.actions';

@Injectable()
export class IsAuthorizedGuard implements CanActivate {

  private _authIsInit = new BehaviorSubject(false);
  private authInit$ = this.action$.pipe(
    filter(action => action instanceof AuthInit),
  );

  constructor(
    private store$: Store<fromRoot.State>,
    private action$: ActionsSubject,
  ) {

    this.store$.pipe(
      select(selectIsInit),
      mergeMap((isInit) => isInit ? of(undefined) : this.authInit$),
      tap(() => {
        this._authIsInit.next(true);
      }),
      take(1),
    ).subscribe();
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

    return this._authIsInit.asObservable().pipe(
      filter(isInit => !!isInit),
      mergeMap(() => this.store$.pipe(select(selectIsAuthorized))),
    );
  }
}
