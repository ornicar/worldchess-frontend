import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import * as fromRoot from '../../reducers';

@Injectable()
export class CanUserCreateEventGuard implements CanActivate {

  constructor(private store$: Store<fromRoot.State>) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return of(true); // @TODO_MY_EVENTS temporary, need to add resolver ?
    // we should wait for account loading then check.
    // return this.store$.pipe(
    //   select(selectCanUserCreateEvent)
    // );
  }
}
