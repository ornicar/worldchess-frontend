import {Injectable} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {pluck, switchMap, take, tap} from 'rxjs/operators';
import * as PlayerActions from '../player/player.actions';
import {BoardResourceService} from './board-resource.service';
import * as BoardActions from './board.actions';
import {IBoard} from './board.model';
import * as fromBoard from './board.reducer';

@Injectable()
export class BoardLoadService {

  constructor(
    private store$: Store<fromBoard.State>,
    private boardResource: BoardResourceService) { }

  /**
   * Load from store or server.
   */
  getWhenLacking(id: number): Observable<IBoard> {
    // removed updateBoardState$ load actual data
    // @todo should add invalidate.
    /*return this.store$.pipe(
      select(fromBoard.selectEntities),
      take(1),
      switchMap(entities => entities[id]
        //? of(entities[id])
        :*/ return this.boardResource.get(id).pipe(
          tap((board: IBoard) => this.store$.dispatch(new BoardActions.AddBoard({ board }))),
        )/*
      )
    )*/;
  }

  getWithExpandAllWhenLacking(id: number): Observable<IBoard> {
    return this.boardResource.getWithExpandAll(id).pipe(
      tap(({ players }) => this.store$.dispatch(new PlayerActions.AddPlayers({ players }))),
      // On BE some data is invalid.
      tap(({ board }) => board && this.store$.dispatch(new BoardActions.AddBoard({ board }))),
      pluck('board'),
    );
  }
}
