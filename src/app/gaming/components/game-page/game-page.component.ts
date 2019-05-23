import { Component, HostBinding, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Color } from 'chessground/types';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, pairwise, pluck, shareReplay, startWith, withLatestFrom, mergeMap } from 'rxjs/operators';
import {
  BoardNotificationSocketAction,
  IProfile,
  ISocketBoardGameOver,
  ISocketMessage,
  ISocketSendMessage,
} from '../../../auth/auth.model';
import { selectProfile } from '../../../auth/auth.reducer';
import { SocketConnectionService } from '../../../auth/socket-connection.service';
import { BoardSocketService } from '../../../board/board-socket/board-socket.service';
import { UpdateBoard } from '../../../broadcast/core/board/board.actions';
import { BoardPlayerStatus, BoardStatus, IBoard, BoardResult } from '../../../broadcast/core/board/board.model';
import { GetCountries } from '../../../broadcast/core/country/country.actions';
import { IEvent } from '../../../broadcast/core/event/event.model';
import { IMatch } from '../../../broadcast/core/match/match.model';
import { GetTeamsByTournamentId } from '../../../broadcast/core/team/team.actions';
import { ITour } from '../../../broadcast/core/tour/tour.model';
import { ClearSelectedTournament, SetSelectedTournament } from '../../../broadcast/core/tournament/tournament.actions';
import { OnlineTournament } from '../../../broadcast/core/tournament/tournament.model';
import { GetMovesByBoard } from '../../../broadcast/move/move.actions';
import * as fromRoot from '../../../reducers/index';
import { OnChangesInputObservable, OnChangesObservable } from '../../../shared/decorators/observable-input';
import { SubscriptionHelper, Subscriptions } from '../../../shared/helpers/subscription.helper';
import { GamingReadyPlay } from '../../gaming.actions';
import { selectBoardLastMove } from '../../../broadcast/move/move.reducer';


@Component({
  selector: 'wc-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss']
})
export class GamePageComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  event: IEvent;

  @Input()
  tournament: OnlineTournament;

  @Input()
  tour?: ITour;

  @Input()
  match?: IMatch;

  @Input()
  board?: IBoard;

  @OnChangesInputObservable()
  board$ = new BehaviorSubject<IBoard>(this.board);

  @OnChangesInputObservable()
  tournament$ = new BehaviorSubject<OnlineTournament>(this.tournament);

  @Input()
  isMultiboard = false;

  @Input()
  withoutBoard: boolean;

  BoardStatus = BoardStatus;
  BoardResult = BoardResult;

  private subs: Subscriptions = {};

  @HostBinding('class') componentClass = 'wc-tournament wrapper';

  get isNotExpected() {
    return this.board && this.board.status !== BoardStatus.EXPECTED;
  }

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

  public playerIsReady$: Observable<boolean> = combineLatest(this.board$, this.playerColor$).pipe(
    map(([board, playerColor]) => {
      let isReady = board.player_status === BoardPlayerStatus.READY;

      if (!isReady && playerColor) {
        isReady = board.player_status === (playerColor === 'white' ? BoardPlayerStatus.WHITE : BoardPlayerStatus.BLACK);
      }

      return isReady;
    }),
    shareReplay(1)
  );

  public playerTurn$: Observable<boolean> = this.board$.pipe(
    mergeMap(({ id }) => {
        return this.store$.pipe(
          select(selectBoardLastMove(), { boardId: id  }),
          mergeMap((move) => {
            return this.playerColor$.pipe(
              map((color: Color) => {
                return !!move && move.is_white_move ? color !== 'white' : color !== 'black';
              })
            );
          })
        );
    })
  );


  constructor(
    private router: Router,
    private store$: Store<fromRoot.State>,
    private boardSocketService: BoardSocketService,
    private socketService: SocketConnectionService<ISocketMessage, ISocketSendMessage>,
  ) {
  }

  ngOnInit() {
    // Load all countries.
    this.store$.dispatch(new GetCountries());

    // Load all teams of current tournament.
    this.subs.getTeamsWhenSelectedTournament = this.tournament$.pipe(pluck<OnlineTournament, number>('id'))
      .subscribe(tournamentId => {
        this.store$.dispatch(new SetSelectedTournament({ id: tournamentId }));
        this.store$.dispatch(new GetTeamsByTournamentId({ id: tournamentId }));
      });

    this.subs.updateBoard = this.board$
      .pipe(
        map(board => board && board.id),
        filter(boardId => Boolean(boardId)),
        distinctUntilChanged()
      )
      .subscribe(boardId => {
        this.store$.dispatch(new GetMovesByBoard({ board_id: boardId }));
      });

    this.subs.subscribeToBoard = this.board$
      .pipe(
        startWith(null),
        pairwise()
      )
      .subscribe(([prev, next]) => {
        const prevId = prev ? prev.id : null;
        const nextId = next ? next.id : null;

        if (prevId === nextId) {
          // @todo move to distinctUntilChanged.
          return;
        }

        if (next) {
          this.boardSocketService.subscribeToBoard(next.id);
        }

        if (prev) {
          this.boardSocketService.unsubscribeFromBoard(prev.id);
        }
      });

    this.subs.gameOver = this.socketService.messages$
      .pipe(filter(message => message.action === BoardNotificationSocketAction.GAME_OVER))
      .subscribe(({board_id: id, message: result}: ISocketBoardGameOver) => {
        this.store$.dispatch(new UpdateBoard({
          board: {
            id,
            changes: {
              status: BoardStatus.COMPLETED,
              result
            }
          }
        }));
      });
  }

  @OnChangesObservable()
  ngOnChanges() {}

  onPlayerReadyPlay() {
    this.store$.dispatch(new GamingReadyPlay({board_id: this.board.id}));
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);

    this.store$.dispatch(new ClearSelectedTournament());

    if (this.board) {
      this.boardSocketService.unsubscribeFromBoard(this.board.id);
    }
  }
}
