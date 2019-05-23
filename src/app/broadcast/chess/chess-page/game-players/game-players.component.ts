import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import * as fromRoot from '../../../../reducers';
import {OnChangesInputObservable, OnChangesObservable} from '../../../../shared/decorators/observable-input';
import {IBoard} from '../../../core/board/board.model';
import {IPlayer} from '../../../core/player/player.model';
import {selectPlayerById} from '../../../core/player/player.reducer';

@Component({
  selector: 'wc-game-players',
  templateUrl: './game-players.component.html',
  styleUrls: ['./game-players.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GamePlayersComponent implements OnChanges {

  @Input()
  private board: IBoard;

  @OnChangesInputObservable()
  private board$ = new BehaviorSubject<IBoard>(this.board);

  private selectPlayerById = selectPlayerById();

  whitePlayer$: Observable<IPlayer> = this.board$.pipe(
    switchMap((board) => board && board.white_player
      ? this.store$.pipe(
        select(this.selectPlayerById, { playerId: board.white_player })
      )
      : of(null)
    )
  );

  whitePlayerName$: Observable<string> = this.board$.pipe(
    map(board => board ? board.white_player_name : '')
  );

  blackPlayer$: Observable<IPlayer> = this.board$.pipe(
    switchMap((board) => board && board.black_player
      ? this.store$.pipe(
        select(this.selectPlayerById, { playerId: board.black_player })
      )
      : of(null)
    )
  );

  blackPlayerName$: Observable<string> = this.board$.pipe(
    map(board => board ? board.black_player_name : '')
  );

  constructor(
    private store$: Store<fromRoot.State>
  ) {
  }

  @OnChangesObservable()
  ngOnChanges(): void {
  }

}
