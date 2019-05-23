import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {mapTo, switchMap, tap} from 'rxjs/operators';
import * as fromRoot from '../../reducers/index';
import {BoardLoadService} from '../core/board/board-load.service';
import {IBoard} from '../core/board/board.model';
import {TourLoadService} from '../core/tour/tour-load.service';

@Injectable()
export class BoardResolveGuard implements Resolve<IBoard> {
  constructor(
    private store: Store<fromRoot.State>,
    private router: Router,
    private boardLoad: BoardLoadService,
    private tourLoad: TourLoadService) {
  }

  resolve(routeSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IBoard> {
    const boardId = parseInt(routeSnapshot.params['pairing'], 10);
    const tournamentId = parseInt(routeSnapshot.parent.params['tournament'], 10);

    return this.boardLoad.getWithExpandAllWhenLacking(boardId).pipe(
      switchMap(board => {
        // Check that the board relate to the tournament.
        return this.tourLoad.getWhenLacking(board.tour).pipe(
          tap(tour => {
            if (tour.tournament !== tournamentId) {
              throw new Error('invalid board');
            }
          }),
          mapTo(board)
        );
      })
    );
  }
}
