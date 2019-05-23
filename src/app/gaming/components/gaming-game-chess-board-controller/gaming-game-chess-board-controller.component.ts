import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Color} from 'chessground/types';
import {BehaviorSubject, combineLatest, Observable, of, zip} from 'rxjs';
import {distinctUntilChanged, filter, map, shareReplay, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {IProfile} from '../../../auth/auth.model';
import {selectProfile} from '../../../auth/auth.reducer';
import {ChessBoardViewMode} from '../../../broadcast/chess/chess-page/chess-board/chess-board.component';
import {BoardPlayerStatus, BoardStatus, IBoard} from '../../../broadcast/core/board/board.model';
import {selectBoard} from '../../../broadcast/core/board/board.reducer';
import {AddMove} from '../../../broadcast/move/move.actions';
import {IMove, IMovePosition} from '../../../broadcast/move/move.model';
import {selectBoardLastMove} from '../../../broadcast/move/move.reducer';
import * as fromRoot from '../../../reducers';
import {OnChangesInputObservable, OnChangesObservable} from '../../../shared/decorators/observable-input';
import {GamingResourceService} from '../../gaming-resource.service';

@Component({
  selector: 'wc-gaming-game-chess-board-controller',
  templateUrl: './gaming-game-chess-board-controller.component.html',
  styleUrls: ['./gaming-game-chess-board-controller.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GamingGameChessBoardControllerComponent implements OnInit, OnChanges {

  viewMode: ChessBoardViewMode = ChessBoardViewMode.Normal;

  @Input()
  boardId?: IBoard['id'] = null;

  private selectBoard = selectBoard();
  private selectBoardLastMove = selectBoardLastMove();

  @OnChangesInputObservable()
  boardId$ = new BehaviorSubject<IBoard['id']>(this.boardId);

  board$: Observable<IBoard> = this.boardId$.pipe(
    switchMap(boardId => boardId
      ? this.store$.pipe(select(this.selectBoard, {boardId}))
      : of(null)
    ),
    shareReplay(1)
  );

  profile$: Observable<IProfile> = this.store$.pipe(
    select(selectProfile),
    filter(profile => Boolean(profile && profile.fide_id))
  );

  private playerColor$: Observable<Color> = this.board$.pipe(
    withLatestFrom(this.profile$),
    map(([board, {fide_id}]) => {
      if (board.white_player === fide_id) {
        return 'white' as Color;
      } else if (board.black_player === fide_id) {
        return 'black' as Color;
      } else {
        return null;
      }
    }),
  );

  bottomPlayerColor$: Observable<Color> = this.playerColor$.pipe(
    map(playerColor => playerColor ? playerColor : 'white'),
    distinctUntilChanged()
  );

  // @todo How to detect when board or moves is loading? Create props into store (board, moves).
  isLoading$: Observable<boolean> = this.board$.pipe(
    map(board => !board),
    shareReplay(1)
  );

  isNotExpected$: Observable<boolean> = this.board$.pipe(
    map(board => board && board.status !== BoardStatus.EXPECTED),
    shareReplay(1)
  );

  private lastMove$: Observable<IMove> = this.boardId$.pipe(
    switchMap(boardId => boardId
      ? this.store$.pipe(select(this.selectBoardLastMove, {boardId}))
      : of(null)
    ),
    shareReplay(1)
  );

  private lastMoveColor$: Observable<Color> = this.isLoading$.pipe(
    switchMap(isLoading => isLoading
      ? of(null)
      : this.lastMove$.pipe(map(move => move
        ? move.is_white_move ? 'white' : 'black'
        : 'black'
      ))
    )
  );

  private gameIsReady$: Observable<boolean> = this.board$.pipe(
    map(board => board && board.player_status === BoardPlayerStatus.READY),
    shareReplay(1)
  );

  private gameIsGoes$: Observable<boolean> = this.board$.pipe(
    map(board => board && board.status === BoardStatus.GOES),
    shareReplay(1)
  );

  public canMove$: Observable<boolean> = combineLatest(this.gameIsReady$, this.gameIsGoes$, this.lastMoveColor$, this.playerColor$).pipe(
    map(([gameIsReady, gameIsGoes, lastMoveColor, playerColor]) => gameIsReady && gameIsGoes && lastMoveColor !== playerColor),
    shareReplay(1)
  );

  public canCompleteMove$ = this.canMove$;

  public position$: Observable<IMovePosition> = zip(this.isLoading$, this.isNotExpected$).pipe(
    // When all moves is loaded.
    switchMap(([isLoading, isNotExpected]) => !isLoading && isNotExpected
      ? this.lastMove$
      : of(null)
    ),
    shareReplay(1)
  );

  constructor(
    private store$: Store<fromRoot.State>,
    private gamingResource: GamingResourceService
  ) { }

  ngOnInit() {
  }

  @OnChangesObservable()
  ngOnChanges() { }

  onMoveCompleted(movePosition: IMovePosition) {
    // @todo create effect.
    this.gamingResource.nextMove(this.boardId, movePosition.san).subscribe(move => {
      this.store$.dispatch(new AddMove({move}));
    });
  }

  onMoveCancelled() {
  }

}
