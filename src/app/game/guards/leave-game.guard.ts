import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { GamePageComponent } from '../game-page/game-page.component';
import { Select, Store } from '@ngxs/store';
import { GameState } from '../state/game.state';
import { map, tap } from 'rxjs/operators';
import { RejectOpponentRequest, Resign } from '../state/game.actions';

@Injectable()
export class LeaveGameGuard implements CanDeactivate<GamePageComponent> {

  @Select(GameState.gameInProgress) gameInProgress$: Observable<boolean>;
  @Select(GameState.waitingOpponent) waitingOpponent$: Observable<boolean>;

  constructor(
    private store: Store,
  ) { }

  canDeactivate(
    component: GamePageComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot,
  ): Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree {

    return combineLatest(
      this.gameInProgress$,
      this.waitingOpponent$,
    ).pipe(
      map(([inProgress, waitingOpponent]) => {

        if (waitingOpponent) {
          if (confirm('Sure you want to stop the game search?')) {
            this.store.dispatch(new RejectOpponentRequest());
            return true;
          } else {
            return false;
          }
        } else if (inProgress) {
          if (confirm('If you leave the game you will resign. Sure?')) {
            this.store.dispatch(new Resign());
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }

      }),
    );
  }
}
