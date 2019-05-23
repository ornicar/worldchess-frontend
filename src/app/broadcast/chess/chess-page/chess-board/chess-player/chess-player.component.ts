import {ChangeDetectionStrategy, Component, HostBinding, Input, OnChanges, ViewEncapsulation} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Color} from 'chessground/types';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {filter, map, switchMap} from 'rxjs/operators';
import * as fromRoot from '../../../../../reducers';
import {OnChangesInputObservable, OnChangesObservable} from '../../../../../shared/decorators/observable-input';
import {IBoard} from '../../../../core/board/board.model';
import {IPlayer} from '../../../../core/player/player.model';
import {selectPlayerById} from '../../../../core/player/player.reducer';

@Component({
  selector: 'wc-chess-player',
  templateUrl: './chess-player.component.html',
  styleUrls: ['./chess-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessPlayerComponent implements OnChanges {

  @Input()
  isMinimalViewMode = false;

  @Input()
  playerColor: Color;

  @OnChangesInputObservable()
  playerColor$ = new BehaviorSubject<Color>(this.playerColor);

  @Input()
  board: IBoard;

  @OnChangesInputObservable()
  board$ = new BehaviorSubject<IBoard>(this.board);

  private selectPlayerById = selectPlayerById();

  player$: Observable<IPlayer> = combineLatest(this.board$, this.playerColor$).pipe(
    filter(([board, playerColor]) => Boolean(board && playerColor)),
    map(([board, playerColor]) => playerColor === 'white' ? board.white_player : board.black_player),
    switchMap(playerId =>
      this.store$.pipe(
        select(this.selectPlayerById, { playerId })
      )
    )
  );

  playerName$: Observable<string> = combineLatest(this.board$, this.playerColor$).pipe(
    filter(([board, playerColor]) => Boolean(board && playerColor)),
    map(([board, playerColor]) => playerColor === 'white' ? board.white_player_name : board.black_player_name),
  );

  @HostBinding('class.white-player')
  get isWhitePlayer() {
    return this.playerColor === 'white';
  }

  constructor(private store$: Store<fromRoot.State>) { }

  @OnChangesObservable()
  ngOnChanges() {}
}
