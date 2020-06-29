import { IPointsPerBoard, IOnlineTournamentStandings } from '../../models/tournament.model';
import { TournamentState } from '@app/modules/game/tournaments/states/tournament.state';
import { first, distinctUntilChanged, withLatestFrom, find, take, mergeMap } from 'rxjs/operators';
import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { ChessBoardViewMode } from '@app/broadcast/chess/chess-page/chess-board/chess-board.component';
import { BoardStatus } from '@app/broadcast/core/board/board.model';
import { Color } from 'chessground/types';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { BehaviorSubject, combineLatest, Observable, of, Subject, zip } from 'rxjs';
import { defaultIfEmpty, filter, map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { select, Store as NGRXStore } from '@ngrx/store';
import { IMove, IMovePosition, MoveReaction } from '@app/broadcast/move/move.model';
import * as fromRoot from '@app/reducers';
import { ITourMoves } from '@app/broadcast/core/tour/tour.model';
import {
  IOnlineTournamentBoard,
  IOnlineTournmanetWidgetTimeBoard
} from '@app/modules/game/tournaments/models/tournament.model';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { selectToken } from '@app/auth/auth.reducer';
import { TourResourceService } from '@app/broadcast/core/tour/tour-resource.service';
import { SocketConnectionService } from '@app/auth/socket-connection.service';
import { BoardNotificationSocketAction, ISocketMessage, ISocketSendMessage, SocketType } from '@app/auth/auth.model';
import { Router } from '@angular/router';
import { IAccount } from '@app/account/account-store/account.model';
import { selectMyAccount } from '@app/account/account-store/account.reducer';
import moment = require('moment');
import { OnlineTournamentService } from '@app/modules/game/tournaments/services/tournament.service';
import { Select } from '@ngxs/store';
import { SocketService } from '@app/shared/socket/socket.service';
import { IGameMessage } from '@app/modules/game/state/game-socket-message.models';

@Component({
  selector: 'wc-online-tournament-widget',
  templateUrl: './online-tournament-widget.component.html',
  styleUrls: ['./online-tournament-widget.component.scss']
})
export class OnlineTournamentWidgetComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  viewMode = ChessBoardViewMode.GamingNormal;

  @Input()
  board: IOnlineTournamentBoard;
  @OnChangesInputObservable('board')
  boardInput$ = new BehaviorSubject<IOnlineTournamentBoard>(this.board);

  @Input()
  showCountdown: boolean;
  @OnChangesInputObservable('showCountdown')
  showCountdown$ = new BehaviorSubject<boolean>(this.showCountdown);

  @Input()
  needResubscribe: boolean;
  @OnChangesInputObservable('needResubscribe')
  needResubscribe$ = new BehaviorSubject<boolean>(this.needResubscribe);

  hideCounter = true;

  @Input()
  bottomPlayerColor: Color = 'white';

  @Output()
  wsmouseover = new EventEmitter<boolean>();

  @Select(TournamentState.getStandings) getStandings$: Observable<IOnlineTournamentStandings[]>;

  countries$ = this.paygatePopupService.countries$;
  countries: any[] = [];

  board$: Observable<IOnlineTournamentBoard> = this.boardInput$.pipe(
    filter(board => Boolean(board)),
    shareReplay(1)
  );

  countdownTimer$ = this.board$.pipe(
    map(i => i.tour_id),
    switchMap(id => {
      return this.tourService.getWithDefaults(id).pipe(
        map(m => moment(m.tour.datetime_of_round).diff(moment(), 'seconds')),
        takeUntil(this.destroy$)
      );
    })
  );

  blackPlayer: IPlayer;
  blackCountry: string;

  whitePlayer: IPlayer;
  whiteCountry: string;

  // @todo How to detect when board or moves is loading? Create props into store (board, moves).
  isLoading$: Observable<boolean> = this.board$.pipe(
    map(board => !board),
    shareReplay(1)
  );

  isNotExpected$: Observable<boolean> = this.board$.pipe(
    map(board => board.status !== BoardStatus.EXPECTED),
    shareReplay(1)
  );

  private move$: Observable<ITourMoves[]> = this.board$.pipe(
    map(board => board.moves),
    filter(moves => moves.length > 0),
    defaultIfEmpty(null),
    shareReplay(1)
  );

  public position$ = new BehaviorSubject<IMovePosition>(null);

  public widgetTimeBoard: IOnlineTournmanetWidgetTimeBoard = {
    blackTime: '00:00',
    whiteTime: '00:00',
  };

  public moveScore$: Observable<number> = zip(this.isLoading$, this.isNotExpected$).pipe(
    // When all moves is loaded.
    switchMap(([isLoading, isNotExpected]) => !isLoading && isNotExpected
      ? this.position$
      : of(null)
    ),
    map((move: IMove) => move ? move.stockfish_score : 0),
    shareReplay(1)
  );

  public moveReaction$: Observable<number> = zip(this.isLoading$, this.isNotExpected$).pipe(
    // When all moves is loaded.
    switchMap(([isLoading, isNotExpected]) => !isLoading && isNotExpected
      ? this.position$
      : of(null)
    ),
    map((move: IMove) => move ? move.reaction : null),
    filter(reaction => [
      MoveReaction.MATE_IN_LS_10,
      MoveReaction.MAJOR_CHANGE_OF_SITUATION,
      MoveReaction.BLUNDER].includes(reaction)
    ),
    shareReplay(1)
  );

  token$ = this.store$.pipe(
    select(selectToken)
  );

  destroy$ = new Subject();

  account$: Observable<IAccount> = this.store$.pipe(
    select(selectMyAccount),
    shareReplay(1)
  );

  private localBoard = {
    boardId: '',
    moves: []
  };

  /**
   * Display the countdown or not
   * @type {Observable<boolean>}
   * @memberof OnlineTournamentWidgetComponent
   */
  isShowCountdown$: Observable<boolean> = combineLatest([
    this.board$,
    this.showCountdown$,
    this.account$.pipe(
      filter(account => !!account)
    )
  ]).pipe(
    map(([ board, showCoutdown, account ]) => {
      return !board.result && showCoutdown && (
        (board.black_id === account.player.player_id) ||
        (board.white_id === account.player.player_id)
      ) && this.hideCounter;
    }),
    takeUntil(this.destroy$)
  );
  /**
   * Returns an array with the players points to display on the board.
   * @type {Observable<string[]>}
   * @memberOf OnlineTournamentWidgetComponent
   */
  getPoints$: Observable<string[]> = this.board$.pipe(
    filter(board => !!board),
    withLatestFrom(
      this.getStandings$.pipe(
        filter(standings => !!standings),
      )
    ),
    map(([board, standing]) => {
      const getPointByBoard = function (board_id: string, points: IPointsPerBoard[]): string | null {
        let result = null;
        if (points.length !== 0) {
          const point = points.find(points => points.board_uid === board_id) || null;
          if (point && point.hasOwnProperty('points')) {
            result = String(point.points || null);
          }
        }
        return result;
      };

      const points = Array<string>();
      const whiteStanding = standing.find(standing => standing.player_id === board.white_id) || null;
      const blackStanding = standing.find(standing => standing.player_id === board.black_id) || null;
      if (whiteStanding && whiteStanding.hasOwnProperty('points_per_board')) {
        points.push(getPointByBoard(board.board_id, whiteStanding.points_per_board));
      } else {
        points.push(null);
      }

      if (blackStanding && blackStanding.hasOwnProperty('points_per_board')) {
        points.push(getPointByBoard(board.board_id, blackStanding.points_per_board));
      } else {
        points.push(null);
      }
      return points;
    }),
    takeUntil(this.destroy$)
  );

  /**
   *Creates an instance of OnlineTournamentWidgetComponent.
   * @param {NGRXStore<fromRoot.State>} store$
   * @param {PaygatePopupService} paygatePopupService
   * @param {TourResourceService} tourService
   * @param {SocketConnectionService<ISocketMessage, ISocketSendMessage>} socketService
   * @param {Router} router
   * @param {OnlineTournamentService} tournamentService
   * @memberof OnlineTournamentWidgetComponent
   */
  constructor(
    private store$: NGRXStore<fromRoot.State>,
    private paygatePopupService: PaygatePopupService,
    private tourService: TourResourceService,
    private socketService: SocketConnectionService<ISocketMessage, ISocketSendMessage>,
    // private socketService: SocketService<ISocketMessage>,
    private router: Router,
    private tournamentService: OnlineTournamentService,
  ) {
  }

  private getHHss(seconds: number): string {
    return moment().startOf('day').seconds(seconds).format('mm:ss');
  }

  private addMoves(moves: ITourMoves[]) {
    moves.forEach(m => {
      this.position$.next(m);
      if (m.is_white_move) {
        this.widgetTimeBoard.whiteTime = m.time_left.substr(3, m.time_left.length - 3);
      } else {
        this.widgetTimeBoard.blackTime = m.time_left.substr(3, m.time_left.length - 3);
      }
    });
  }

  ngOnInit() {
    this.needResubscribe$.pipe(
      distinctUntilChanged(),
      withLatestFrom(this.board$),
      takeUntil(this.destroy$)
    ).subscribe(([needResubscribe, board]) => {
      if (needResubscribe && board && board.board_id && !board.result) {
        this.tournamentService.subscribeViewerByBoardID(board.board_id);
      }
    });


    this.board$.pipe(
      filter(board => !!board),
      first(),
    ).subscribe( (board) => {
      if (!board.result) {
        this.tournamentService.subscribeViewerByBoardID(board.board_id);
      } else {
        this.tournamentService.unsubscribeViewerByBoardID(board.board_id);
        this.localBoard.boardId = board.board_id;
        this.move$.subscribe(moves => {
          if (moves) {
            if (this.localBoard.boardId === board.board_id && this.localBoard.moves.length !== moves.length) {
              this.addMoves(moves);
            }
            if (this.localBoard.moves.length !== moves.length) {
              this.addMoves(moves);
            }
          }
        });
        if (board.black_seconds_left) {
          this.widgetTimeBoard.blackTime = this.getHHss(board.black_seconds_left);
        }
        if (board.white_seconds_left) {
          this.widgetTimeBoard.whiteTime = this.getHHss(board.white_seconds_left);
        }
      }
    });

    this.listenSocketByMoves();
    this.setCountryByPlayers();
  }

  setCountryByPlayers(): void {
    combineLatest([
      this.token$,
      this.board$,
      this.countries$,
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([ token, {black_player, white_player}, countries
      ]) => {
      this.blackPlayer = black_player;
      this.whitePlayer = white_player;
      if ( black_player.nationality_id) {
        this.blackCountry = countries.find(c => c.id === black_player.nationality_id).long_code;
      }
      if (white_player.nationality_id) {
        this.whiteCountry = countries.find(c => c.id === white_player.nationality_id).long_code;
      }
    });
  }

  listenSocketByMoves() {
    const isGameMessage = message => [
      BoardNotificationSocketAction.GAMING_SUBSCRIBE_VIEWER_TO_BOARD,
      BoardNotificationSocketAction.GAMING_ADD_MOVE,
      BoardNotificationSocketAction.GAMING_GAME_END,
      BoardNotificationSocketAction.GAMING_GAME_ABORT,
    ].includes(message.action);

    combineLatest([
      this.socketService.messages$
        .pipe(
          filter(isGameMessage),
        ),
      this.board$
    ]).pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(([message, board]) => {
        switch (message.action) {
          case BoardNotificationSocketAction.GAMING_SUBSCRIBE_VIEWER_TO_BOARD: {
            this.localBoard.boardId = board.board_id;
            if (message.moves.length > 0  && board.board_id === message.board_id && message.moves.length !== board.moves.length) {
              this.hideCounter = false;
              message.moves.forEach(move => {
                if (move.is_white_move) {
                  this.widgetTimeBoard.whiteTime = move.time_left.substr(3, move.time_left.length - 3);
                } else {
                  this.widgetTimeBoard.blackTime = move.time_left.substr(3, move.time_left.length - 3);
                }
                this.position$.next(move);
                this.localBoard.moves.push(move);
              });
            }
          }
            break;
          case BoardNotificationSocketAction.GAMING_ADD_MOVE: {
            if ( board.board_id === message.board_id && message['message_type'] === SocketType.BOARD_NOTIFICATION ) {
              if (message.move.is_white_move) {
                this.widgetTimeBoard.whiteTime = message.move.time_left.substr(3, message.move.time_left.length - 3);
              } else {
                this.widgetTimeBoard.blackTime = message.move.time_left.substr(3, message.move.time_left.length - 3);
              }
              this.position$.next(message.move);
              this.localBoard.moves.push(message.move);
            }
          }
            break;
          case BoardNotificationSocketAction.GAMING_GAME_END: {
            this.widgetTimeBoard.blackTime = this.getHHss(message['black_seconds_left']);
            this.widgetTimeBoard.whiteTime = this.getHHss(message['white_seconds_left']);
          } break;
          case BoardNotificationSocketAction.GAMING_GAME_ABORT: {
            this.widgetTimeBoard.blackTime = this.getHHss(message['black_seconds_left']);
            this.widgetTimeBoard.whiteTime = this.getHHss(message['white_seconds_left']);
          } break;
        }
      });
  }

  goToBoard() {
    this.board$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(board => {
      this.router.navigate([`/tournament/pairing/${board.board_id}/`]).then(() => {});
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  @OnChangesObservable()
  ngOnChanges() {
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.wsmouseover.emit(true);
  }
}
