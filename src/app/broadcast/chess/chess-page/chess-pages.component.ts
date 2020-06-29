import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { UserPurchasesService } from '@app/purchases/user-purchases/user-purchases.service';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { SubscriptionHelper, Subscriptions } from '@app/shared/helpers/subscription.helper';
import { ScreenStateService } from '@app/shared/screen/screen-state.service';
import { IBoard } from '../../core/board/board.model';
import * as fromBoard from '../../core/board/board.reducer';
import { ITour } from '../../core/tour/tour.model';
import { Tournament } from '../../core/tournament/tournament.model';
import { GetMovesByBoard } from '../../move/move.actions';
import { IGameState } from './game/game.model';
import { selectGameState } from './game/game.selectors';

@Component({
  selector: 'wc-chess-pages',
  templateUrl: './chess-pages.component.html',
  styleUrls: ['./chess-pages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessPagesComponent implements OnInit, OnChanges, OnDestroy {

  @Input() tournament?: Tournament = null;

  @OnChangesInputObservable() tournament$ = new BehaviorSubject<Tournament>(this.tournament);

  @Input() tour?: ITour;

  private subs: Subscriptions = {};

  isPremium$ = this.tournament$.pipe(
    switchMap((tournament) =>
      !!tournament ? this.userPurchases.hasUserTournament(tournament) : of(false)
    )
  );
  // @TODO_PURCHASES rework ALL 'isPremium' uses in whole application
  // @TODO_PURCHASES change product and plan in modal, use from 'sellings, main'

  private selectGameState = selectGameState();

  selectedBoardId$ = new BehaviorSubject<IBoard['id']>(null);

  selectedGameState$: Observable<IGameState> = this.selectedBoardId$.pipe(
    switchMap(boardId => boardId
      ? this.store$.pipe(
          select(this.selectGameState, { boardId })
        )
      : of(null)
    ),
    shareReplay(1)
  );

  constructor(
    private store$: Store<fromBoard.State>,
    private screenService: ScreenStateService,
    private cd: ChangeDetectorRef,
    private screenState: ScreenStateService,
    private userPurchases: UserPurchasesService
  ) {
  }

  ngOnInit() {
    this.subs.updateBoard = this.selectedGameState$
      .pipe(
        map((gameState) => gameState ? gameState.board.id : null),
        filter(boardId => Boolean(boardId)),
        distinctUntilChanged(),
      )
      .subscribe(boardId => {

        // Load moves of selected move.
        this.store$.dispatch(new GetMovesByBoard({board_id: boardId}));
      });
  }

  choseGame(boardId?: IBoard['id']) {
    this.selectedBoardId$.next(boardId);
  }

  @OnChangesObservable()
  ngOnChanges() {
  }

  ngOnDestroy(): void {
    SubscriptionHelper.unsubscribe(this.subs);
    this.screenService.unlock();
  }
}
