import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Color } from 'chessground/types';
import { BehaviorSubject, combineLatest, Observable, of, zip } from 'rxjs';
import { map, shareReplay, switchMap, take } from 'rxjs/operators';
import { IProfile } from '../../../../auth/auth.model';
import { selectProfile } from '../../../../auth/auth.reducer';
import * as fromRoot from '../../../../reducers';
import { OnChangesInputObservable, OnChangesObservable } from '../../../../shared/decorators/observable-input';
import { BoardStatus, IBoard } from '../../../core/board/board.model';
import { selectBoard } from '../../../core/board/board.reducer';
import { IMove, IMovePosition, IPredictPosition } from '../../../move/move.model';
import { selectedPredictPosition, selectSelectedMove } from '../../../move/move.reducer';
import { ActivateVariationMoves, CreateVariationMove } from '../../../variation-move/variation-move.actions';
import { IVariationMove } from '../../../variation-move/variation-move.model';
import { selectSelectedVariationMoveOfBoard, selectVariationMovesIsActive } from '../../../variation-move/variation-move.reducer';
import { ChessBoardViewMode } from '../chess-board/chess-board.component';
import { PaygatePopupManagerService } from '@app/shared/services/paygate-popup-manager.service';
import { BroadcastType, Tournament } from '@app/broadcast/core/tournament/tournament.model';
import { selectUserPurchase } from '@app/purchases/user-purchases/user-purchases.reducer';
import { IUserPurchase } from '@app/purchases/user-purchases/user-purchases.model';

@Component({
  selector: 'wc-broadcast-single-chess-board-controller',
  templateUrl: './broadcast-single-chess-board-controller.component.html',
  styleUrls: ['./broadcast-single-chess-board-controller.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BroadcastSingleChessBoardControllerComponent implements OnInit, OnChanges {

  @Input()
  viewMode: ChessBoardViewMode = ChessBoardViewMode.Normal;

  @Input()
  boardId?: IBoard['id'] = null;

  @Input()
  bottomPlayerColor: Color = 'white';

  @OnChangesInputObservable()
  boardId$ = new BehaviorSubject<IBoard['id']>(this.boardId);

  @Input()
  tournament: Tournament;

  @OnChangesInputObservable()
  tournament$ = new BehaviorSubject<Tournament>(this.tournament);

  private selectBoard = selectBoard();
  private selectSelectedMove = selectSelectedMove();
  private selectSelectedVariationMoveOfBoard = selectSelectedVariationMoveOfBoard();

  board$: Observable<IBoard> = this.boardId$.pipe(
    switchMap(boardId => boardId
      ? this.store$.pipe(select(this.selectBoard, {boardId}))
      : of(null)
    ),
    shareReplay(1)
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

  private profile$: Observable<IProfile> = this.store$.pipe(
    select(selectProfile)
  );

  private isPremium$: Observable<boolean> = this.profile$.pipe(
    map((profile) => profile && profile.premium),
    shareReplay(1)
  );

  private selectedMove$: Observable<IMove> = this.boardId$.pipe(
    switchMap(boardId => boardId
      ? this.store$.pipe(select(this.selectSelectedMove, {boardId}))
      : of(null)
    ),
    shareReplay(1)
  );

  private selectedPredictMove$: Observable<IPredictPosition> = this.boardId$.pipe(
    switchMap(boardId => boardId
      ? this.store$.pipe(select(selectedPredictPosition))
      : of(null)
    ),
    shareReplay(1)
  );

  private selectedVariationMove$: Observable<IVariationMove> = this.boardId$.pipe(
    switchMap(boardId => boardId
      ? this.store$.pipe(select(this.selectSelectedVariationMoveOfBoard, {boardId}))
      : of(null)
    ),
    shareReplay(1)
  );

  private myGameIsActive$: Observable<boolean> = this.store$.pipe(
    select(selectVariationMovesIsActive),
    shareReplay(1)
  );

  public canMove$: Observable<boolean> = zip(this.isLoading$, this.isNotExpected$).pipe(
    // When all moves is loaded.
    map(([isLoading, isNotExpected]) => !isLoading && isNotExpected),
    // When the my game mode is active or has selected move.
    switchMap(canMove => canMove
      ? this.myGameIsActive$.pipe(
        switchMap(myGameIsActive => myGameIsActive
          ? of(canMove)
          : combineLatest(this.selectedMove$, this.selectedPredictMove$).pipe(
            map(([selectedMove, selectedPredictMove]) => Boolean(!selectedPredictMove && selectedMove))
          )
        )
      )
      : of(canMove)
    ),
    shareReplay(1)
  );

  public userPurchase$: Observable<IUserPurchase> = this.store$.pipe(
    select(selectUserPurchase),
  );

  public canCompleteMove$ = this.canMove$.pipe(
    switchMap(canMove => canMove
      ? this.isPremium$
      : of(canMove)
    ),
    shareReplay(1)
  );

  public position$: Observable<IMovePosition> = zip(this.isLoading$, this.isNotExpected$).pipe(
    // When all moves is loaded.
    switchMap(([isLoading, isNotExpected]) => !isLoading && isNotExpected
      ? this.myGameIsActive$.pipe(
        // Load variation move
        switchMap(myGameIsActive => myGameIsActive
          ? this.selectedVariationMove$
          : of(null)
        ),
        switchMap(variationMove => variationMove
          ? of(variationMove)
          : combineLatest(this.selectedMove$, this.selectedPredictMove$).pipe(
            map(([selectedMove, selectedPredictMove]) => selectedPredictMove || selectedMove)
          )
        )
      )
      : of(null)
    ),
    shareReplay(1)
  );

  public moveScore$: Observable<number> = zip(this.isLoading$, this.isNotExpected$).pipe(
    // When all moves is loaded.
    switchMap(([isLoading, isNotExpected]) => !isLoading && isNotExpected
      ? this.myGameIsActive$.pipe(
        // Load variation move
        switchMap(myGameIsActive => myGameIsActive
          ? this.selectedVariationMove$
          : of(null)
        ),
        switchMap(variationMove => variationMove
          ? of(variationMove)
          : this.selectedMove$
        )
      )
      : of(null)
    ),
    map((move: IMove | IVariationMove) => move ? move.stockfish_score : 0),
    shareReplay(1)
  );

  constructor(private store$: Store<fromRoot.State>,
              private paygatePopupManagerService: PaygatePopupManagerService) { }

  ngOnInit() {
  }

  @OnChangesObservable()
  ngOnChanges() { }

  onMoveCompleted(movePosition: IMovePosition) {

    this.selectedMove$
      .pipe(take(1))
      .subscribe((move: IMove) => {
        if (move) {
          this.store$.dispatch(new ActivateVariationMoves());
          this.store$.dispatch(new CreateVariationMove({ moveId: move.id, movePosition }));
        }
      });
  }

  onMoveCancelled() {

    this.isPremium$
      .pipe(take(1))
      .subscribe(isPremium => {
        if (!isPremium) {
          this.paygatePopupManagerService.openPaygatePopupWithPlanPayment('pro');
        }
      });
  }

}
