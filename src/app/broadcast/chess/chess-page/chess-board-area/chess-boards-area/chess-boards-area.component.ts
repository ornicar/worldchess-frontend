import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Injectable,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, distinctUntilKeyChanged, filter, map, scan, shareReplay, switchMap, take } from 'rxjs/operators';
import { SocketConnectionService } from '../../../../../auth/socket-connection.service';
import {
  BoardNotificationSocketAction, ISocketBoardNewMove,
  SocketType,
  ISocketSendMessage,
  ISocketMessage,
} from '../../../../../auth/auth.model';
import { BoardSocketService } from '../../../../../board/board-socket/board-socket.service';
import * as fromRoot from '../../../../../reducers';
import { OnChangesInputObservable, OnChangesObservable } from '../../../../../shared/decorators/observable-input';
import { SubscriptionHelper, Subscriptions } from '../../../../../shared/helpers/subscription.helper';
import { ScreenStateService } from '../../../../../shared/screen/screen-state.service';
import { DragScrollStatus } from '../../../../../shared/widgets/drag-scroll/drag-scroll.component';
import { UpdateBoard } from '../../../../core/board/board.actions';
import { IBoard } from '../../../../core/board/board.model';
import { selectBoardsFromTour } from '../../../../core/board/board.reducer';
import { ITour } from '../../../../core/tour/tour.model';
import { Tournament } from '../../../../core/tournament/tournament.model';
import { InitFavoriteBoards } from '../../../../favorite-boards/favorite-boards.actions';
import { selectCanUseFavorites, selectFavoriteBoardsIds } from '../../../../favorite-boards/favorite-boards.reducer';
import { AddMoves, DeleteMoves, GetLastMovesByBoards, SetSelectedLastMove, UpdateMoves, UpsertMove } from '../../../../move/move.actions';
import { ChessBoardGridItemViewMode } from './chess-board-grid-item/chess-board-grid-item.component';

@Injectable()
export class MultiboardFilters {

  public filtersStatus$ = new BehaviorSubject({
    // @todo also use filters for all filters in the future.
    onlyFavorites: false
  });

  public filters$: Observable<Array<(entities: IBoard[]) => Observable<IBoard[]>>> = this.filtersStatus$.pipe(
    map((filtersStatus) => {
      const filtersList = [];

      if (filtersStatus.onlyFavorites) {
        filtersList.push(this.favoritesFilter.bind(this));
      }

      return filtersList;
    })
  );

  constructor(
    private store$: Store<fromRoot.State>
  ) {
  }

  private favoritesFilter(boards: IBoard[]): Observable<IBoard[]> {

    return this.store$.pipe(
      select(selectFavoriteBoardsIds),
      map(ids => boards.filter(board => ids.includes(board.id)))
    );
  }

  public changeFilterStatus(filterName: string, value: boolean | string | number) {
    const filtersStatus = this.filtersStatus$.value;

    this.filtersStatus$.next({
      ...filtersStatus,
      [filterName]: value
    });
  }
}

@Component({
  selector: 'wc-chess-boards-area',
  templateUrl: './chess-boards-area.component.html',
  styleUrls: ['./chess-boards-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    MultiboardFilters
  ]
})
export class ChessBoardsAreaComponent implements OnChanges, OnInit, OnDestroy {

  @ViewChild(VirtualScrollerComponent)
  private virtualScroller: VirtualScrollerComponent;

  @Input() tournament: Tournament;

  @Input() tour: ITour;

  @OnChangesInputObservable()
  tour$ = new BehaviorSubject<ITour>(this.tour);

  private selectBoardsFromTour = selectBoardsFromTour();

  boards$: Observable<IBoard[]> = this.tour$.pipe(
    switchMap(tour => tour
      ? this.store$.pipe(
          select(this.selectBoardsFromTour, { tourId: tour.id })
        )
      : of([])
    ),
    shareReplay(1)
  );

  filtersStatus$ = this.multiboardFilters.filtersStatus$.pipe(
    shareReplay(1)
  );

  filteredBoards$: Observable<IBoard[]> = this.multiboardFilters.filters$.pipe(
    switchMap(filters => {

      return filters.reduce(
        (boards$, filterFn) => boards$.pipe(switchMap(boards => filterFn(boards))),
        this.boards$
      );
    }),
    distinctUntilKeyChanged('length'),
    shareReplay(1)
  );

  boardsIds$: Observable<number[]> = this.boards$.pipe(
    map(boards => boards.map(board => board.id)),
    distinctUntilChanged((prev: number[], next: number[]) => {

      return prev.join(',') === next.join(',');
    })
  );

  boardsList: IBoard[] = []; // Boards inside view window.

  choseGameId = null;

  @Output()
  choseGame = new EventEmitter<IBoard['id']>();

  canUseFavorites$ = this.store$.pipe(
    select(selectCanUseFavorites),
    shareReplay(1)
  );

  private subs: Subscriptions = {};

  @HostBinding('class.is-dragging')
  private isPressed = false;

  private isDragged = false;

  @HostBinding('class.drag-scroll')
  public enableDragScroll = false;

  public viewModes = [
    ChessBoardGridItemViewMode.Normal,
    ChessBoardGridItemViewMode.Medium
  ];

  public activeViewModeIndex = 0;

  public isMobile: boolean;
  public boardsCount: number;
  public currentBoardIdx = 0;
  public isSlideLeft = true;

  get isPrevViewModeDisables() {
    return this.activeViewModeIndex === 0;
  }

  get isNextViewModeDisables() {
    return this.activeViewModeIndex === (this.viewModes.length - 1);
  }

  @HostBinding('class.grid-size--normal')
  get viewModeIsOnlyBoard() {
    return this.viewModes[this.activeViewModeIndex] === ChessBoardGridItemViewMode.Normal;
  }

  @HostBinding('class.grid-size--medium')
  get viewModeIsWidgetVertical() {
    return this.viewModes[this.activeViewModeIndex] === ChessBoardGridItemViewMode.Medium;
  }

  constructor(
    private store$: Store<fromRoot.State>,
    private cd: ChangeDetectorRef,
    private boardSocketService: BoardSocketService,
    private socketService: SocketConnectionService<ISocketMessage, ISocketSendMessage>,
    private screenState: ScreenStateService,
    public multiboardFilters: MultiboardFilters
  ) {
    this.filteredBoards$.subscribe(boards => this.boardsCount = boards.length);
  }

  ngOnInit() {
    // Load favorites list when has access.
    this.subs.initFavorites = this.canUseFavorites$
      .pipe(
        filter(canUseFavorites => canUseFavorites)
      )
      .subscribe(() => this.store$.dispatch(new InitFavoriteBoards()));

    // Disable favorites filter when it hidden.
    this.subs.onRestrictUseFavorites = combineLatest(
      this.canUseFavorites$,
      this.filtersStatus$.pipe(map(({onlyFavorites}) => onlyFavorites))
    )
      .subscribe(([canUseFavorites, onlyFavorites]) => {
        if (!canUseFavorites && onlyFavorites) {
          this.changeFilterFavorites(false);
        }
      });

    this.subs.onMatchMobile = this.screenState.matchMediaMobile$
      .subscribe(matches => {
        this.enableDragScroll = !matches;
        this.isMobile = matches;
        // Reset size for mobile.
        this.activeViewModeIndex = 0;
        if (this.virtualScroller) {
          this.virtualScroller.refresh();
        }
        this.cd.markForCheck();
      });

    this.subs.moves = this.boardsIds$
      .pipe(
        filter(boardsIds => boardsIds.length > 0)
      )
      .subscribe(boardsIds => {
        this.store$.dispatch(new GetLastMovesByBoards({ boardsIds }));
      });

    this.subs.resetCurrentGame = this.filteredBoards$.subscribe(boards => {
      // Reset current game.
      if (this.choseGameId && !boards.some(board => board.id === this.choseGameId)) {
        this.chooseGame();
      }
    });

    this.subs.subscribeToBoards = this.boardsIds$
      .pipe(
        // pairwise function.
        scan(
          <T>(acc: T[], nextIds: T): T[] => ([acc[1], nextIds]),
          [[], []]
        )
      )
      .subscribe(([prevIds, nextIds]) => {
        this.boardSocketService.subscribeToBoards(nextIds);
        this.boardSocketService.unsubscribeFromBoards(prevIds);
      });

    const isMoveMessage = message => [
      BoardNotificationSocketAction.MOVE_ESTIMATING,
      BoardNotificationSocketAction.MOVE_ADD,
      BoardNotificationSocketAction.MOVE_REPLACE
    ]
      .includes(message.action);

    this.subs.socketMoves = this.socketService.messages$
      .pipe(filter(isMoveMessage))
      .subscribe(message => {

        switch (message.action) {
          case BoardNotificationSocketAction.MOVE_ADD: {
            this.store$.dispatch(new AddMoves({ moves: message.moves }));
            break;
          }

          case BoardNotificationSocketAction.MOVE_ESTIMATING: {
            const moves = message.moves
              .map(changes => ({
                id: changes.id,
                changes
              }));

            this.store$.dispatch(new UpdateMoves({ moves }));
            break;
          }

          case BoardNotificationSocketAction.MOVE_REPLACE: {
            this.store$.dispatch(new DeleteMoves({ ids: message.remove_moves_ids }));

            this.store$.dispatch(new AddMoves({ moves: message.moves }));
            break;
          }
        }
      });

    this.subs.newMove = this.socketService.messages$
      .pipe(filter(message =>
        message.action === BoardNotificationSocketAction.NEW_MOVE
        && message.message_type === SocketType.BOARD_NOTIFICATION
      ))
      .subscribe(({move}: ISocketBoardNewMove) => {
        this.store$.dispatch(new UpsertMove({move}));
      });

    this.subs.updateBoardSockets = this.socketService.messages$
      .pipe(filter(message => message.action === BoardNotificationSocketAction.BOARD_CHANGE))
      .subscribe( (message: any) => {
        const board = {
          id: message.board_id,
          changes: { ...message.board }
        };

        this.store$.dispatch(new UpdateBoard({board}));
      });
  }

  onDragScrollStatusChange(status: DragScrollStatus) {
    this.isPressed = status !== DragScrollStatus.Off;

    // Skip the end of the move.
    if (status !== DragScrollStatus.Off) {
      this.isDragged = status === DragScrollStatus.Dragging;
    }

    this.cd.detectChanges();
  }

  onChildGameClick($event, board) {
    $event.stopPropagation();

    if (!this.isDragged) {
      this.chooseGame(board);
    }

    this.isDragged = false;
  }

  changeFilterFavorites(value: boolean) {
    this.multiboardFilters.changeFilterStatus('onlyFavorites', value);
    this.cd.markForCheck();
  }

  chooseGame(board?: IBoard) {
    const choseGameId = board ? board.id : null;

    if (this.choseGameId !== choseGameId) {
      this.choseGameId = choseGameId;
      this.choseGame.emit(choseGameId);
      this.cd.markForCheck();

      if (choseGameId) {
        this.store$.dispatch(new SetSelectedLastMove({ boardId: choseGameId}));
      }
    }
  }

  onPrevViewMode() {
    if (!this.isPrevViewModeDisables) {
      this.activeViewModeIndex--;
      this.virtualScroller.refresh();
      this.chooseGame();
      this.cd.markForCheck();
    }
  }

  onNextViewMode() {
    if (!this.isNextViewModeDisables) {
      this.activeViewModeIndex++;
      this.virtualScroller.refresh();
      this.chooseGame();
      this.cd.markForCheck();
    }
  }

  trackByBoard(index, item) {
    return item;
  }

  @OnChangesObservable()
  ngOnChanges() {
  }

  ngOnDestroy() {
    this.boardsIds$
      .pipe(
        take(1)
      )
      .subscribe(ids => this.boardSocketService.unsubscribeFromBoards(ids));

    this.chooseGame();
    SubscriptionHelper.unsubscribe(this.subs);
  }

  public onSwipeRight(): void {
    if (this.currentBoardIdx === 0) {
      return;
    }

    this.isSlideLeft = false;
    this.currentBoardIdx--;
    setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
  }

  public onSwipeLeft(): void {
    if (this.isLastBoard) {
      return;
    }

    this.isSlideLeft = true;
    this.currentBoardIdx++;
    setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
  }

  public get isLastBoard(): boolean {
    return this.currentBoardIdx === (this.boardsCount - 1);
  }
}
