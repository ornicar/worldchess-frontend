import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import * as fromRoot from '../reducers/index';
import {selectIsAuthorized} from './auth.reducer';

@Injectable()
export class IsNotAuthorizedGuard implements CanActivate {

  constructor(private store$: Store<fromRoot.State>) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.store$.pipe(
      select(selectIsAuthorized),
      map(isAuthorized => !isAuthorized)
    );
  }
}
