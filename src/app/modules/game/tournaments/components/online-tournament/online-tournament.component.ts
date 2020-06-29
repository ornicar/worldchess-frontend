import { TournamentGameState } from './../../states/tournament.game.state';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameTranslateService } from './../../../service/game-translate.service';
import { UpdateUserSigned } from '../../states/tournament.actions';
import { TournamentStatus, TournamentType } from '@app/broadcast/core/tournament/tournament.model';
import {
  defaultIfEmpty,
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  mergeMap,
  shareReplay,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
  takeWhile,
  debounceTime,
  delay,
} from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, EMPTY, interval, Observable, of, ReplaySubject, Subject, timer } from 'rxjs';
import { GetTournament, SignupToTournament } from '@app/broadcast/core/tournament/tournament.actions';
import { select, Store as NGRXStore } from '@ngrx/store';
import * as fromRoot from '@app/reducers';
import { selectIsAuthorized, selectToken } from '@app/auth/auth.reducer';
import { selectFideIdPlan } from '@app/purchases/subscriptions/subscriptions.reducer';
import { BoardType, GameRatingMode, ITimeControl, ITour } from '@app/broadcast/core/tour/tour.model';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import * as moment from 'moment';
import { ICountry } from '@app/broadcast/core/country/country.model';
import { AccountVerification, IAccount } from '@app/account/account-store/account.model';
import { selectAccount, selectMyAccount } from '@app/account/account-store/account.reducer';
import { BoardResult, BoardStatus } from '@app/broadcast/core/board/board.model';
import { Select, Store } from '@ngxs/store';
import { GameService } from '@app/modules/game/state/game.service';
import { ChatSocketService } from '@app/broadcast/chess/chat/services/chat-socket.service';
import { GetBoardsByTour } from '@app/broadcast/core/board/board.actions';
import { SubscriptionHelper, Subscriptions } from '@app/shared/helpers/subscription.helper';
import * as TourActions from '@app/broadcast/core/tour/tour.actions';
import { GetMatchesByTour } from '@app/broadcast/core/match/match.actions';
import {
  IRoundInterval,
  RoundIntervalType,
} from '@app/modules/game/tournaments/components/rounds-time-line/rounds-time-line.component';
import { IOnlineTournament, IOnlineTournamentBoard, IOnlineTournamentStandings } from './../../models/tournament.model';
import { OnlineTournamentResourceService } from '@app/modules/game/tournaments/providers/tournament.resource.service';
import { TournamentState } from '@app/modules/game/tournaments/states/tournament.state';
import { OnlineTournamentService } from '@app/modules/game/tournaments/services/tournament.service';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import {
  SetHasNoTourNotification,
  SetOnlineTournament,
  SetOpponentHasLeft,
  SetPlayerHasLeft,
  UpdateOnlineTournament,
} from '@app/modules/game/tournaments/states/tournament.actions';
import { GameState } from '@app/modules/game/state/game.state';

enum ActionButtonMode {
  HIDE,
  CREATE_ACCOUNT,
  UPGRADE_NOW,
  NEED_FIDE_ID_REGISTER,
  NEED_FIDE_ID_APPROVE,
  REGISTER,
  LEAVE,
  DISABLE,
  END,
}

@Component({
  selector: 'wc-online-tournament',
  templateUrl: './online-tournament.component.html',
  styleUrls: ['./online-tournament.component.scss'],
})
export class OnlineTournamentComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();

  @Select(TournamentState.getTournament) getTournament$: Observable<IOnlineTournament>;
  @Select(TournamentState.getBoards) getBoards$: Observable<IOnlineTournamentBoard[]>;
  @Select(TournamentState.getTours) getTours$: Observable<ITour[]>;
  @Select(TournamentGameState.getCurrentTourId) getCurrentTourId$: Observable<number>;
  @Select(TournamentGameState.opponentHasLeft) opponentHasLeft$: Observable<boolean>;
  @Select(TournamentGameState.playerHasLeft) playerHasLeft$: Observable<boolean>;
  @Select(TournamentGameState.hasNoTourNotification) hasNoTourNotification$: Observable<boolean>;
  @Select(TournamentGameState.getCurrentActiveBoardId) currentActiveBoardId: Observable<string>;
  /**
   *
   * @type {Observable<boolean>}
   * @memberof OnlineTournamentComponent
   */
  @Select(GameState.connectionActive) connectionActive$: Observable<boolean>;

  /**
   *
   * @type {Observable<boolean>}
   * @memberof OnlineTournamentComponent
   */
  @Select(GameState.getLastConnectionActive) lastConnectionActive$: Observable<boolean>;

  /**
   *
   * @type {Observable<string>}
   * @memberof OnlineTournamentComponent
   */
  @Select(GameState.getUID) getUID$: Observable<string>;

  /**
   * Getting a result of the game.
   * @type {Observable<IOnlineTournamentStandings[]>}
   * @memberof OnlineTournamentComponent
   */
  @Select(TournamentState.getStandings) getStandings$: Observable<IOnlineTournamentStandings[]>;

  moment = moment;

  turnamentStatisticsArray = [];

  // Chat
  toggleChat = true;
  toggleChatMobile = false;

  durationFormat: moment.DurationFormatSettings = {
    trim: 'both',
    trunc: true,
    usePlural: false,
    useSignificantDigits: true,
  };

  currentTour: number | null;
  selectedTour: number | null;

  GameRatingMode = GameRatingMode;

  // Interval
  interval$ = interval(1000);
  intervalBoards$ = interval(4000);
  intervalTours$ = interval(7000);

  public tournamentSubject$ = new BehaviorSubject<IOnlineTournament>(null);
  public enableChat$ = new BehaviorSubject<string>(null);

  routeID$: Observable<number> = this.route.params.pipe(map((p) => p['tournament']));

  public tours$ = this.getTours$.pipe(
    filter((i) => !!i),
    takeUntil(this.destroy$)
  );

  selectedTourIdSubject: ReplaySubject<number> = new ReplaySubject<number>(1);

  selectedTour$: Observable<ITour> = combineLatest([this.tours$, this.selectedTourIdSubject]).pipe(
    map(([tours, selectedTourId]) => tours.find((t) => t.id === selectedTourId)),
    // @todo use only store.
    tap((tour: ITour) => (tour ? this.store$.dispatch(new TourActions.AddTour({ tour })) : ''))
  );

  canPrevTourSelect$ = combineLatest([this.tours$, this.selectedTourIdSubject]).pipe(
    map(([tours, selectedTourId]) => tours.length && tours.findIndex((t) => t.id === selectedTourId) > 0)
  );

  canNextTourSelect$ = combineLatest([this.tours$, this.selectedTourIdSubject]).pipe(
    map(([tours, selectedTourId]) => tours.length && tours.findIndex((t) => t.id === selectedTourId) < tours.length - 1)
  );

  public boardsWithMoves$ = this.getBoards$.pipe(
    filter((i) => !!i),
    map((boards) =>
      boards.map((board) => ({
        ...board,
        ratingBoard: board.black_player.rating + board.white_player.rating,
        last_move: board.moves.slice(-1).pop(),
        expand: false,
      }))
    )
  );

  public boardSelectTour$ = this.selectedTour$.pipe(
    switchMap((i) => {
      if (i) {
        return this.boardsWithMoves$.pipe(map((boards) => boards.filter((b) => b.tour_id === i.id)));
      }
      return this.boardsWithMoves$;
    }),
    map((boards) =>
      boards
        .sort((a, b) => {
          let comparison = 0;
          if (a.ratingBoard > b.ratingBoard) {
            comparison = 1;
          } else if (a.ratingBoard < b.ratingBoard) {
            comparison = -1;
          }
          return comparison;
        })
        .reverse()
    ),
    map((boards) =>
      boards.map((board, index) => ({
        ...board,
        desk_number: index + 1,
      }))
    ),
    distinctUntilChanged(),
    takeUntil(this.destroy$)
  );

  isAuthorized$ = this.store$.pipe(select(selectIsAuthorized));

  account$: Observable<IAccount> = this.store$.pipe(select(selectMyAccount), shareReplay(1));

  account?: IAccount = null;

  token$ = this.store$.pipe(select(selectToken), defaultIfEmpty(''));

  fidePurchased$: Observable<boolean> = this.store$.pipe(
    select(selectFideIdPlan),
    map((fidePlan) => {
      return fidePlan && fidePlan.is_active;
    })
  );

  fideIdStatus$: Observable<AccountVerification> = this.store$.pipe(
    select(selectAccount),
    map((account) => {
      if (account && account.account) {
        return account.account.fide_verified_status;
      }

      return AccountVerification.NOT_VERIFIED;
    })
  );

  public getFavoriteBoard = [];
  public _boardSelectTour$ = combineLatest([this.getCurrentTourId$, this.token$]).pipe(
    switchMap(([currentTourID, token]) => {
      if (token) {
        return combineLatest([this.boardSelectTour$, this.account$.pipe(filter((account) => !!account))]).pipe(
          distinctUntilChanged(),
          switchMap(([boards, account]) => {
            if (boards.length > 0) {
              if (boards.length === 1) {
                return this.boardSelectTour$;
              } else {
                const findBoards = boards.filter(
                  (i) => i.black_id === account.player.player_id || i.white_id === account.player.player_id
                );
                if (findBoards.length > 0) {
                  const blacks = boards.filter((i) => i.black_id === account.player.player_id);
                  const whites = boards.filter((i) => i.white_id === account.player.player_id);

                  if (blacks.length > 0) {
                    if (boards[0].board_id === blacks[0].board_id) {
                      return of([blacks[0], boards[1]]);
                    } else {
                      return of([boards[0], blacks[0]]);
                    }
                  }

                  if (whites.length > 0) {
                    if (boards[0].board_id === whites[0].board_id) {
                      return of([whites[0], boards[1]]);
                    } else {
                      return of([boards[0], whites[0]]);
                    }
                  }
                  return this.boardSelectTour$;
                } else {
                  return this.boardSelectTour$;
                }
              }
            } else {
              return this.boardSelectTour$;
            }
          })
        );
      } else {
        return this.boardSelectTour$;
      }
    }),
    takeUntil(this.destroy$)
  );

  countCountries$: Observable<string | null> = this.getStandings$.pipe(
    filter((standings) => !!standings && standings.length !== 0),
    map((standigns) => new Set(standigns.map((p) => p.nationality_id)).size),
    switchMap((countCountries) => {
      if (countCountries !== undefined && countCountries !== null && ![0, 1].includes(countCountries)) {
        return this.gameTranslate.getTranslateObject(`TEXT.COUNTRIES`, { country: countCountries });
      } else {
        return of(null);
      }
    })
  );

  getTitlePlayers$: Observable<string | null> = this.getStandings$.pipe(
    filter((standings) => !!standings && standings.length !== 0),
    map((standings) => standings.length),
    switchMap((countPlayers) => {
      if (countPlayers === 1) {
        return this.gameTranslate.getTranslateObject(`TEXT.PLAYER`, { player: countPlayers });
      } else {
        return this.gameTranslate.getTranslateObject(`TEXT.PLAYERS`, { player: countPlayers });
      }
    }),
    take(1)
  );

  countries$ = this.paygatePopupService.countries$;
  countries: any[] = [];

  public actionButtonMode: ActionButtonMode = ActionButtonMode.HIDE;
  public ActionButtonMode = ActionButtonMode;

  public TournamentStatus = TournamentStatus;

  public BoardResult = BoardResult;
  public BoardStatus = BoardStatus;

  // @todo fix.
  public openContent = false;

  timeLineIntervalsReal$: Observable<IRoundInterval[]> = this.tours$.pipe(
    withLatestFrom(this.getTournament$.pipe(filter((i) => !!i))),
    mergeMap(([toursBase, { number_of_tours, status, datetime_of_tournament }]) => {
      const intervals = [];

      if (toursBase && toursBase.length) {
        const tours = toursBase
          .slice()
          .sort((a, b) => moment(a.datetime_of_round).unix() - moment(b.datetime_of_round).unix());

        for (const [index, tour] of tours.entries()) {
          if (index < tours.length - 1) {
            intervals.push({
              type: RoundIntervalType.ROUND,
              tour_number: tour.tour_number,
              hide_time: false,
              datetime: {
                lower: tour.datetime_of_round,
                upper: tour.datetime_of_round_finish
                  ? tour.datetime_of_round_finish
                  : moment(tour.datetime_of_round)
                      .add(moment.duration(tour.time_control.start_time).asSeconds() * 2, 's')
                      .toISOString(),
              },
            });

            intervals.push({
              type: RoundIntervalType.BREAK,
              hide_time: false,
              datetime: {
                lower: tour.datetime_of_round_finish,
                upper: tours[index + 1].datetime_of_round,
              },
            });
          } else {
            // last
            intervals.push({
              type: RoundIntervalType.ROUND,
              hide_time: false,
              tour_number: tour.tour_number,
              datetime: {
                lower: tour.datetime_of_round,
                upper: tour.datetime_of_round_finish
                  ? tour.datetime_of_round_finish
                  : moment(tour.datetime_of_round)
                      .add(moment.duration(tour.time_control.start_time).asSeconds() * 2, 's')
                      .toISOString(),
              },
            });
          }
        }

        intervals.push({
          type: RoundIntervalType.BREAK,
          hide_time: false,
          datetime: {
            lower: tours[tours.length - 1].datetime_of_round_finish,
            upper: moment(tours[tours.length - 1].datetime_of_round_finish)
              .add(15, 'minute')
              .toISOString(),
          },
        });

        intervals.unshift({
          type: RoundIntervalType.BREAK,
          hide_time: false,
          datetime: {
            lower: moment().toISOString(),
            upper: tours[0].datetime_of_round,
          },
        });
      }
      if (toursBase && [TournamentStatus.EXPECTED, TournamentStatus.GOES].includes(status)) {
        if (toursBase.length < number_of_tours && toursBase.length !== 0) {
          const lackCountTour = number_of_tours - toursBase.length;
          const lastTour = toursBase[toursBase.length - 1];
          const lastTourDate = lastTour.datetime_of_round_finish
            ? lastTour.datetime_of_round_finish
            : moment(lastTour.datetime_of_round)
                .add(moment.duration(lastTour.time_control.start_time).asSeconds() * 2, 's')
                .toISOString();

          for (let i = 1; i <= lackCountTour; i++) {
            intervals.push({
              type: RoundIntervalType.BREAK,
              hide_time: true,
              datetime: {
                lower: lastTourDate,
              },
            });

            intervals.push({
              type: RoundIntervalType.ROUND,
              hide_time: true,
              tour_number: lastTour.tour_number + i,
              datetime: {},
            });
          }
        } else {
          if (toursBase.length === 0 && [TournamentStatus.EXPECTED, TournamentStatus.GOES].includes(status)) {
            for (let i = 1; i <= number_of_tours; i++) {
              intervals.push({
                type: RoundIntervalType.BREAK,
                hide_time: true,
                datetime: {},
              });

              intervals.push({
                type: RoundIntervalType.ROUND,
                hide_time: true,
                tour_number: i,
                datetime: {
                  lower: datetime_of_tournament,
                },
              });
            }
          }
        }
      }
      return of(intervals);
    })
  );

  public getChatID$ = combineLatest([this.getUID$.pipe(filter((uid) => !!uid)), this.routeID$]).pipe(
    distinctUntilChanged(),
    switchMap(([uid, tournamentID]) => {
      if (tournamentID) {
        return this.gameService.getChatIDByTournament(tournamentID);
      } else {
        return of(null);
      }
    }),
    takeUntil(this.destroy$)
  );

  private subs: Subscriptions = {};

  signout$ = new BehaviorSubject(false);
  signoutProgress$ = this.signout$.pipe(
    mergeMap((signout) => {
      if (signout) {
        return interval(25).pipe(
          take(101),
          takeWhile(() => this.signout$.value),
          tap((t) => {
            if (t === 100) {
              this.signoutHoldInTournament();
            }
          })
        );
      } else {
        return of(0);
      }
    })
  );

  /**
   * Get current board for which there is no result for a player
   * @type {Observable<IOnlineTournamentBoard>}
   * @memberof OnlineTournamentComponent
   */
  currentBoard$: Observable<IOnlineTournamentBoard> = this.getBoards$.pipe(
    filter((i) => !!i),
    withLatestFrom(
      this.account$.pipe(
        filter((i) => !!i),
        map((i) => i.player)
      )
    ),
    mergeMap(([boards, player]) =>
      of(
        boards.find(
          (board) =>
            board.result === null && (board.white_id === player.player_id || board.black_id === player.player_id)
        )
      )
    ),
    takeUntil(this.destroy$)
  );

  needResubscribe$ = this.connectionActive$.pipe(distinctUntilChanged(), takeUntil(this.destroy$));

  getPlayers$ = combineLatest([
    this.getTournament$.pipe(filter((tournamnet) => !!tournamnet)),
    this.getStandings$.pipe(filter((standings) => !!standings)),
  ]).pipe(
    map(([tournament, standings]) => {
      const { status } = tournament;
      if ([TournamentStatus.GOES, TournamentStatus.COMPLETED].includes(status)) {
        return standings
          .slice()
          .sort((a, b) => {
            let compar = 0;
            if (a.rank > b.rank) {
              compar = 1;
            } else if (a.rank < b.rank) {
              compar = -1;
            }
            return compar;
          })
          .reverse();
      }
      if (status === TournamentStatus.EXPECTED) {
        return standings;
      }
      return standings;
    })
  );

  getPlayersLimited$ = this.getPlayers$.pipe(map((players) => players.slice(0, 20)));

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store$: NGRXStore<fromRoot.State>,
    private store: Store,
    private paygatePopupService: PaygatePopupService,
    private gameSharedService: GameSharedService,
    private onlineTournamentResourceSerivce: OnlineTournamentResourceService,
    private onlineTournamentSerivce: OnlineTournamentService,
    private gameService: GameService,
    private chatService: ChatSocketService,
    private modalService: ModalWindowsService,
    private gameTranslate: GameTranslateService
  ) {
    this.modalService.closeAll();

    this.routeID$
      .pipe(
        mergeMap((id) => {
          return this.onlineTournamentResourceSerivce.getOnlineTournament(id);
        }),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((data: IOnlineTournament) => {
        window['dataLayerPush'](
          'whcTournament',
          'Tournament',
          'Open',
          `${data.title}`,
          `${this.getBoardType(data.time_control.board_type)}
         ${this.convertTime(data.time_control)}`,
          'banner | calendar',
          '',
          `${data.id}`
        );
        this.tournamentSubject$.next(data);
        this.store.dispatch(new SetOnlineTournament(data));
      });

    this.setFVBoardsTours();

    this._boardSelectTour$.pipe(distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((boards) => {
      let flagUpdate = false;

      if (boards.length === 0) {
        this.getFavoriteBoard = [];
      }
      if (this.getFavoriteBoard.length === 0 && boards.length !== 0) {
        this.getFavoriteBoard = boards;
      } else {
        const masterBoardsID = boards.map((board) => board.board_id);
        const favoriteBoardsID = this.getFavoriteBoard.map((board) => board.board_id);
        const otherBoards = masterBoardsID.filter((board) => !favoriteBoardsID.includes(board));
        const differntBoards = masterBoardsID.filter((board) => favoriteBoardsID.includes(board));

        differntBoards.forEach((boardID) => {
          const favorite = this.getFavoriteBoard.find((board) => board.board_id === boardID);
          const master = boards.find((board) => board.board_id === boardID);
          if (favorite.result !== master.result) {
            flagUpdate = true;
          }
        });

        if (otherBoards.length !== 0) {
          flagUpdate = true;
        }

        if (flagUpdate) {
          this.getFavoriteBoard = boards;
        }
      }
    });
  }

  ngOnInit() {
    /**
     * @todo Разнести код при рефакторинге на мелкий функкций, так удобно тестировать, сейчас данный код, плохо подлежить тестам.
     */
    this.interval$
      .pipe(
        withLatestFrom(
          combineLatest([
            this.timeLineIntervalsReal$.pipe(
              mergeMap((source) => {
                return of(
                  source.find(
                    (l) =>
                      l.type === 0 &&
                      moment().isAfter(moment(l.datetime.lower)) &&
                      moment().isBefore(moment(l.datetime.upper))
                  )
                );
              })
            ),
            this.selectedTourIdSubject,
            this.tours$,
          ])
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(([_, timeLines]) => {
        const tours = timeLines[2];
        const _tour = timeLines[0];
        if (_tour) {
          this.currentTour = tours.find((l) => l.tour_number === <number>_tour['tour_number']).id || 0;
        } else {
          this.currentTour = null;
        }
        this.selectedTour = timeLines[1];
      });

    this.updateTournament();
    this.updateBoards();
    this.updateTours();
    this.checkConnectionActive();

    this.getTournament$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.tournamentSubject$.next(data);
    });

    this.account$
      .pipe(
        filter((account) => !!account),
        takeUntil(this.destroy$)
      )
      .subscribe((account) => (this.account = account));

    this.countries$.pipe(takeUntil(this.destroy$)).subscribe((countries) => (this.countries = countries));

    combineLatest([
      this.timeLineIntervalsReal$.pipe(
        map((i) =>
          i.find(
            (l) =>
              l.type === 0 && moment().isAfter(moment(l.datetime.lower)) && moment().isBefore(moment(l.datetime.upper))
          )
        ),
        defaultIfEmpty(null)
      ),
      this.tours$,
      this.timeLineIntervalsReal$.pipe(
        map((i) => i.filter((l) => l.type === 0 && moment().isAfter(moment(l.datetime.lower)))),
        defaultIfEmpty(null)
      ),
      this.getCurrentTourId$,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([toursNumber, tours, beforeTimeLine, getCurrentTourID]) => {
        const beforeToursNumber = beforeTimeLine[beforeTimeLine.length - 1];
        const checkObjectID = function (value): boolean {
          if (typeof value === 'object' && value !== null) {
            if (value.hasOwnProperty('id')) {
              return true;
            } else {
              return false;
            }
          }
          return false;
        };
        if (toursNumber && tours) {
          this.selectedTourIdSubject.next(
            tours && tours.length ? tours.find((i) => i.tour_number === toursNumber['tour_number']).id : null
          );
        } else {
          if (tours && beforeToursNumber) {
            const findTour = tours.find((i) => i.tour_number === beforeToursNumber['tour_number']);
            let tourID = tours && tours.length ? (findTour ? findTour.id : null) : null;
            if (tourID) {
              this.selectedTourIdSubject.next(tourID);
            } else {
              let lastTour = tours.find((tour) => tour.datetime_of_round_finish === null);
              if (checkObjectID(lastTour)) {
                tourID = lastTour.id;
              } else {
                lastTour = tours[tours.length - 1];
                if (checkObjectID(lastTour)) {
                  tourID = lastTour.id;
                } else {
                  tourID = null;
                }
              }
              if (tourID) {
                this.selectedTourIdSubject.next(tourID);
              } else {
                this.selectedTourIdSubject.next(getCurrentTourID);
              }
              this.currentTour = tourID || getCurrentTourID;
            }
          } else {
            this.selectedTourIdSubject.next(tours && tours.length ? tours[0].id : null);
            this.currentTour = tours && tours.length ? tours[0].id : null;
          }
        }
      });

    // @todo check it.
    this.getTournament$
      .pipe(
        filter((i) => !!i),
        takeUntil(this.destroy$),
        switchMap((tournament) => {
          const lower = tournament.signup_start_datetime;
          const upper = tournament.signup_end_datetime;

          let duration = moment(lower).diff(moment());

          if (duration <= 0) {
            duration = moment(upper).diff(moment());
          }

          return duration > 0 ? timer(duration).pipe(mapTo(tournament)) : EMPTY;
        })
      )
      .subscribe(({ id }) => this.store$.dispatch(new GetTournament({ id })));

    /**
     * @todo Перенести его в функцию и подвергунть декомпозиции
     */
    combineLatest([
      this.getTournament$.pipe(filter((i) => !!i)),
      this.isAuthorized$,
      this.fidePurchased$,
      this.getCurrentTourId$,
      this.fideIdStatus$,
      this.getPlayers$,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        ([
          {
            status,
            available,
            user_signed,
            rating_type,
            in_overlapped_tournament,
            signup_start_datetime,
            players_amount,
            tournament_online_players,
            signup_end_datetime,
            datetime_of_tournament,
            datetime_of_finish,
            signup_opened,
          },
          isAuthorized,
          fidePurchased,
          getCurrentTourID,
          fideIdStatus,
          players,
        ]) => {
          const lowerDuration = moment(signup_start_datetime).diff(moment());
          const upperDuration = moment(signup_end_datetime ? signup_end_datetime : datetime_of_tournament).diff(
            moment()
          );

          if (lowerDuration < 0) {
            // After open registration.
            if (upperDuration > 0) {
              // Before close registration.
              this.enableChat$.next(null);
              if (user_signed) {
                this.actionButtonMode = ActionButtonMode.LEAVE;
              } else if (signup_opened) {
                if (rating_type === GameRatingMode.RATED) {
                  if (!isAuthorized) {
                    this.actionButtonMode = ActionButtonMode.CREATE_ACCOUNT;
                  } else {
                    if (players.length !== players_amount) {
                      this.actionButtonMode = ActionButtonMode.REGISTER;
                    } else {
                      this.actionButtonMode = ActionButtonMode.DISABLE;
                    }

                    if (in_overlapped_tournament) {
                      this.actionButtonMode = ActionButtonMode.DISABLE;
                    }
                  }
                } else if (rating_type === GameRatingMode.FIDERATED) {
                  if (!isAuthorized) {
                    this.actionButtonMode = ActionButtonMode.CREATE_ACCOUNT;
                  } else if (!fidePurchased) {
                    this.actionButtonMode = ActionButtonMode.UPGRADE_NOW;
                  } else {
                    if (players.length !== players_amount) {
                      this.actionButtonMode = ActionButtonMode.REGISTER;
                      if (!fideIdStatus) {
                        this.actionButtonMode = ActionButtonMode.NEED_FIDE_ID_REGISTER;
                      } else if (fideIdStatus === AccountVerification.ON_CHECK) {
                        this.actionButtonMode = ActionButtonMode.NEED_FIDE_ID_APPROVE;
                      }

                      if (in_overlapped_tournament) {
                        this.actionButtonMode = ActionButtonMode.DISABLE;
                      }
                    } else {
                      this.actionButtonMode = ActionButtonMode.DISABLE;
                    }
                  }
                } else {
                  this.actionButtonMode = ActionButtonMode.HIDE;
                  this.gameTranslate
                    .getTranslate('CHAT.TOURNAMENT_HASNT_YET')
                    .subscribe((msg) => this.enableChat$.next(msg));
                }
              } else {
                this.actionButtonMode = ActionButtonMode.HIDE;
                this.gameTranslate
                  .getTranslate('CHAT.TOURNAMENT_HASNT_YET')
                  .subscribe((msg) => this.enableChat$.next(msg));
              }
            } else {
              // After close registration.
              if (status === TournamentStatus.GOES) {
                if (!isAuthorized) {
                  this.actionButtonMode = ActionButtonMode.CREATE_ACCOUNT;
                } else {
                  this.actionButtonMode = ActionButtonMode.DISABLE;
                }
              } else if (status === TournamentStatus.COMPLETED) {
                this.actionButtonMode = ActionButtonMode.END;
              }
            }
          } else {
            if (user_signed && isAuthorized) {
              this.enableChat$.next(null);
            } else {
              this.gameTranslate
                .getTranslate('CHAT.TOURNAMENT_HASNT_YET')
                .subscribe((msg) => this.enableChat$.next(msg));
            }
            this.actionButtonMode = ActionButtonMode.HIDE;
          }
          switch (status) {
            case TournamentStatus.EXPECTED:
              {
                if (this.actionButtonMode === ActionButtonMode.REGISTER) {
                  if (!isAuthorized && user_signed) {
                    this.enableChat$.next(null);
                    this.subscribeChat();
                  } else {
                    this.gameTranslate
                      .getTranslate('CHAT.TOURNAMENT_OPEN_REGISTATION')
                      .subscribe((msg) => this.enableChat$.next(msg));
                  }
                } else {
                  if (this.actionButtonMode === ActionButtonMode.DISABLE) {
                    if (isAuthorized && user_signed) {
                      this.enableChat$.next(null);
                    } else {
                      this.gameTranslate
                        .getTranslate('CHAT.YOU_NOT_REGISTERED')
                        .subscribe((msg) => this.enableChat$.next(msg));
                    }
                  }
                }
              }
              break;
            case TournamentStatus.GOES:
              if (user_signed === true) {
                this.enableChat$.next(null);
              } else {
                this.gameTranslate
                  .getTranslate('CHAT.YOU_NOT_REGISTERED')
                  .subscribe((msg) => this.enableChat$.next(msg));
              }
              break;
            case TournamentStatus.COMPLETED:
              this.actionButtonMode = ActionButtonMode.END;
              this.gameTranslate.getTranslate('CHAT.TOURNAMENT_END').subscribe((msg) => this.enableChat$.next(msg));
              break;
          }
          if (moment().isAfter(moment(datetime_of_finish))) {
            this.gameTranslate.getTranslate('CHAT.TOURNAMENT_END').subscribe((msg) => this.enableChat$.next(msg));
          }
        }
      );

    this.subs.getMatches = this.selectedTourIdSubject
      .pipe(filter((id) => Boolean(id)))
      .subscribe((tourId) => this.store$.dispatch(new GetMatchesByTour({ id: tourId })));

    this.subs.getBoards = this.selectedTourIdSubject
      .pipe(filter((id) => Boolean(id)))
      .subscribe((tourId) => this.store$.dispatch(new GetBoardsByTour({ id: tourId })));

    this.subs.subscribeToBoards = null;
    /**
     * Closed all message
     */
    this.modalService.closeAll();

    this.hasNoTourNotification$
      .pipe(
        distinctUntilChanged(),
        filter((hasNoTour) => !!hasNoTour),
        delay(100),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.gameTranslate
          .getTranslate('TEXT.OOPS_HAVE_OPPONENT')
          .pipe(takeUntil(this.destroy$))
          .subscribe((msg) => this.modalService.alert('', msg));

        this.store.dispatch(new SetHasNoTourNotification(false));
        this.patchRemoveCl();
      });

    this.opponentHasLeft$
      .pipe(distinctUntilChanged(), delay(100), takeUntil(this.destroy$))
      .subscribe((opponentHasLeft) => {
        if (opponentHasLeft) {
          this.gameTranslate
            .getTranslate('TEXT.OOPS_LEFT')
            .pipe(takeUntil(this.destroy$))
            .subscribe((msg) => this.modalService.alert('', msg));

          this.patchRemoveCl();
          this.store.dispatch(new SetOpponentHasLeft(false));
        }
      });

    this.playerHasLeft$
      .pipe(distinctUntilChanged(), delay(100), takeUntil(this.destroy$))
      .subscribe((playerHasLeft) => {
        if (playerHasLeft) {
          this.gameTranslate
            .getTranslate('TEXT.OOPS_YOU_LOST')
            .pipe(takeUntil(this.destroy$))
            .subscribe((msg) => this.modalService.alert('', msg));

          this.patchRemoveCl();
          this.store.dispatch(new SetPlayerHasLeft(false));
        }
      });

    this.subscribeChat();
  }

  getTournamentType(tournament: IOnlineTournament): Observable<string> {
    let tournamnetType = null;
    switch (tournament.tournament_type) {
      case TournamentType.CIRCULAR:
        tournamnetType = 'CIRCULAR';
      case TournamentType.MATCH:
        tournamnetType = 'MATCH';
      case TournamentType.PLAYOFF:
        tournamnetType = 'PLAYOFF';
      case TournamentType.SWISS:
        tournamnetType = 'SWISS';
    }
    return this.gameTranslate.getTranslate(`TYPE_TOURNAMENT.${tournamnetType}`);
  }

  clickSignout(flag) {
    this.signout$.next(flag);
  }

  /**
   * This is a temporary solution for a bug when scroll
   * goes up when displaying a message.
   * @see https://github.com/angular/components/issues/7390 this isn`t working!
   * @memberof OnlineTournamentComponent
   */
  patchRemoveCl() {
    /**
     * head element HTML document
     * @type {HTMLElement}
     */
    const documentHead = document.getElementsByTagName('html')[0];

    documentHead.classList.remove('cdk-global-scrollblock');
    documentHead.removeAttribute('class');
    documentHead.removeAttribute('style');
  }

  getFederationTitle(id: number | null): string {
    if (id) {
      const result: ICountry = (this.countries || []).find((country: ICountry) => country.id === id);
      return result && result.long_code;
    } else {
      return 'Worldwide';
    }
  }

  convertGameMode(gameRatingMode: GameRatingMode): Observable<string> {
    return this.gameTranslate.getTranslate(
      `OTHER.${this.gameSharedService.convertGameMode(gameRatingMode).toUpperCase()}`
    );
  }

  getBoardType(boardType: BoardType): Observable<string> {
    return this.gameTranslate.getTranslate(`GAME.${this.gameSharedService.boardTypeTitle(boardType).toUpperCase()}`);
  }

  convertTime(timeControl: ITimeControl) {
    return this.gameSharedService.convertTime(timeControl);
  }

  prevTour(event: Event, tournament: IOnlineTournament) {
    event.preventDefault();
    event.stopPropagation();

    combineLatest([this.tours$, this.selectedTourIdSubject])
      .pipe(take(1))
      .subscribe(([tours, selectedTourId]) => {
        const index = tours.findIndex((t) => t.id === selectedTourId);

        if (tours.length && index > 0) {
          this.selectedTourIdSubject.next(tours[index - 1].id);
          window['dataLayerPush'](
            'whcTournament',
            'Tournament',
            'Round',
            'Previous',
            `${tournament.title}`,
            '',
            `${tournament.id}`
          );
        }
        this.modalService.closeAll();
      });
  }

  nextTour(event: Event, tournament: IOnlineTournament) {
    event.preventDefault();
    event.stopPropagation();

    combineLatest([this.tours$, this.selectedTourIdSubject])
      .pipe(take(1))
      .subscribe(([tours, selectedTourId]) => {
        const index = tours.findIndex((t) => t.id === selectedTourId);

        if (tours.length && index < tours.length - 1) {
          this.selectedTourIdSubject.next(tours[index + 1].id);
          window['dataLayerPush'](
            'whcTournament',
            'Tournament',
            'Round',
            'Next',
            `${tournament.title}`,
            '',
            `${tournament.id}`
          );
        }
        this.modalService.closeAll();
      });
  }

  createAccount(event: Event, { id, time_control, rating_type }: IOnlineTournament) {
    event.preventDefault();
    event.stopPropagation();

    window['dataLayerPush'](
      'wchOnlineTournament',
      'Play',
      'Create account',
      id,
      this.gameSharedService.convertTime(time_control),
      this.gameSharedService.convertGameMode(rating_type)
    );
    this.router.navigate(['', { outlets: { p: ['paygate', 'register'] } }]);
  }

  updateAccount(event: Event, { id, time_control, rating_type }: IOnlineTournament) {
    event.preventDefault();
    event.stopPropagation();

    window['dataLayerPush'](
      'wchOnlineTournament',
      'Play',
      'Upgrade now',
      id,
      this.gameSharedService.convertTime(time_control),
      this.gameSharedService.convertGameMode(rating_type)
    );

    this.paygatePopupService.setState({ fideSelected: true });
    this.paygatePopupService.stepLoaded$.next('payment');
    this.router.navigate(['', { outlets: { p: ['paygate', 'payment'] } }]);
  }

  join(event: Event, { id, title }: IOnlineTournament) {
    event.preventDefault();
    event.stopPropagation();
    window['dataLayerPush']('whcTournament', 'Tournament', 'Button', 'Join', title, '', id);

    this.onlineTournamentSerivce.signupTournament(id);
    this.actionButtonMode = ActionButtonMode.LEAVE;
  }

  signoutHoldInTournament() {
    this.getTournament$.pipe(take(1), debounceTime(100)).subscribe((t) => {
      this.signoutInTournament(null, t);
    });
  }

  signoutInTournament(event: Event | null, tournament: IOnlineTournament) {
    const { id, title } = tournament;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      window['dataLayerPush']('whcTournament', 'Tournament', 'Button', 'Leave', title, '', id);
    }
    this.onlineTournamentSerivce.signout(id).subscribe((data) => {
      this.store.dispatch(new UpdateOnlineTournament(data));
      this.store.dispatch(new UpdateUserSigned(false));
      this.tournamentSubject$.next(data);
    });
  }

  leave(event: Event, tournament: IOnlineTournament) {
    this.signoutInTournament(event, tournament);
    this.actionButtonMode = ActionButtonMode.REGISTER;
  }

  expandContent($event) {
    $event.preventDefault();
    this.openContent = !this.openContent;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    SubscriptionHelper.unsubscribe(this.subs);
  }

  showChatMobile() {
    this.toggleChatMobile = !this.toggleChatMobile;
    if (this.toggleChatMobile) {
      const body = document.getElementsByTagName('body')[0];
      body.classList.add('fix-mobile');
    }

    this.getTournament$
      .pipe(
        filter((tournament) => !!tournament),
        take(1)
      )
      .subscribe((data) => {
        window['dataLayerPush'](
          'whcTournament',
          'Tournament',
          'Chat',
          `${this.toggleChatMobile ? 'Open' : 'Close'}`,
          `${data.title}`,
          '',
          `${data.id}`
        );
      });
  }

  onFocus(event, b) {
    if (!b.expand) {
      b.expand = true;
    }
  }

  onOverWidget(e, b) {
    b.expand = true;
  }

  onOutWidget(e, b) {
    b.expand = false;
  }

  mouseOver(flag: boolean, board) {
    if (flag) {
      board.expand = false;
    }
  }

  showChat(tournament: IOnlineTournament) {
    this.toggleChat = !this.toggleChat;
    window['dataLayerPush'](
      'whcTournament',
      'Tournament',
      'Chat',
      `${this.toggleChat ? 'Open' : 'Close'}`,
      `${tournament.title}`,
      '',
      `${tournament.id}`
    );
  }

  disableTournament(tournament: IOnlineTournament): boolean {
    return (
      tournament.status === TournamentStatus.EXPECTED &&
      tournament.user_signed === false &&
      tournament.tournament_online_players.length === tournament.players_amount
    );
  }

  disableWidget(tournament: IOnlineTournament): boolean {
    if (tournament.status === TournamentStatus.COMPLETED) {
      return true;
    }
    if (tournament.status === TournamentStatus.GOES) {
      if (!this.currentTour) {
        return true;
      } else {
        return !(this.currentTour === this.selectedTour);
      }
    }
    return false;
  }

  disableDuplication(tournament: IOnlineTournament): boolean {
    return tournament.status === TournamentStatus.EXPECTED && tournament.in_overlapped_tournament === true;
  }

  getFormat(tournament: IOnlineTournament): string {
    const day = moment().diff(
      tournament.signup_end_datetime ? tournament.signup_end_datetime : tournament.datetime_of_tournament,
      'day'
    );
    if (day < 0) {
      return 'd';
    } else {
      return 'HH:mm:ss';
    }
  }

  displayCounter(count) {
    if (count === 0) {
      this.actionButtonMode = ActionButtonMode.DISABLE;
    }
  }

  downloadPDF(id: number) {
    this.account$
      .pipe(
        filter((i) => !!i),
        map((i) => i.player.player_id),
        take(1)
      )
      .subscribe((player_id) => {
        this.onlineTournamentSerivce.downloadPDF(id, player_id);
      });
  }

  /**
   * Show a widget `wc-return-game` for a current user
   * @param  {IOnlineTournament} tournament the current tournament
   * @return {Boolean} This return flag for visible widget wc-return-game
   */
  isShowReturnGame(tournament: IOnlineTournament): Observable<boolean> {
    return combineLatest([
      this.currentActiveBoardId,
      this.currentBoard$.pipe(filter((currentBoard) => !!currentBoard)),
    ]).pipe(
      map(([currentActiveBoardId, currentBoard]) => {
        if (currentBoard) {
          return (
            tournament.user_signed && [TournamentStatus.GOES, TournamentStatus.EXPECTED].includes(tournament.status)
          );
        } else {
          return false;
        }
      }),
      takeUntil(this.destroy$)
    );
  }

  /**
   * Show a certificate a user
   * @param {IOnlineTournament} tournament
   * @returns {boolean}
   * @memberof OnlineTournamentComponent
   */
  isShowCertificate(tournament: IOnlineTournament): boolean {
    return (
      tournament.status === TournamentStatus.COMPLETED &&
      tournament.user_signed === true &&
      tournament.signed_up_amount > 1
    );
  }

  public registerFideId(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.paygatePopupService.setState({ fideSelected: true });
    this.router.navigate(['', { outlets: { p: ['paygate', 'fide'] } }]);
  }

  /**
   * Checking that the board is active
   * @param {IOnlineTournamentBoard} board
   * @returns {Observable<boolean>}
   * @memberof OnlineTournamentComponent
   */
  public isActiveBoard(board: IOnlineTournamentBoard): Observable<boolean> {
    return this.account$.pipe(
      filter((account) => !!account),
      map((account) => {
        if (account['player']) {
          return account.player['player_id'] === board.black_id || account.player['player_id'] === board.white_id;
        } else {
          return false;
        }
      }),
      takeUntil(this.destroy$)
    );
  }
  /**
   * Check is ther a socket
   * @memberof OnlineTournamentComponent
   */
  checkConnectionActive(): void {
    combineLatest([this.connectionActive$, this.lastConnectionActive$, this.getTournament$])
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(([connect, lastConnection, tournament]) => {
        if (
          !connect &&
          tournament &&
          (tournament.status === TournamentStatus.GOES || tournament.status === TournamentStatus.EXPECTED)
        ) {
          this.modalService.alertConnect();
        } else if (connect !== lastConnection) {
          this.onlineTournamentResourceSerivce.updateTournamentStatus();
        }
        if (connect) {
          this.modalService.closeAll();
        }
      });
  }

  /**
   * Get rank for certificate
   * @memberof OnlineTournamentComponent
   */
  getCertificate(): Observable<number> {
    return combineLatest([
      this.getStandings$.pipe(filter((standings) => !!standings)),
      this.account$.pipe(filter((account) => !!account)),
    ]).pipe(
      map(([standings, account]) => {
        const { player } = account;
        return standings.find((standing) => standing.player_id === player.player_id).rank || 0;
      })
    );
  }

  updateBoards(): void {
    this.intervalBoards$
      .pipe(
        withLatestFrom(this.routeID$, this.getTournament$),
        takeWhile(([_, __, tournament]) => tournament.status !== TournamentStatus.COMPLETED),
        takeUntil(this.destroy$)
      )
      .subscribe(([_, routeID]) => {
        this.onlineTournamentSerivce.updateOnlineBoards(routeID);
      });
  }

  updateTours(): void {
    this.intervalTours$
      .pipe(
        withLatestFrom(this.routeID$, this.getTournament$),
        takeWhile(([_, __, tournament]) => tournament.status !== TournamentStatus.COMPLETED),
        takeUntil(this.destroy$)
      )
      .subscribe(([_, routeID]) => {
        this.onlineTournamentSerivce.updateTours(routeID);
      });
  }

  /**
   *
   * @memberof OnlineTournamentComponent
   */
  updateTournament(): void {
    this.interval$
      .pipe(
        withLatestFrom(this.routeID$, this.getTournament$.pipe(filter((tournament) => !!tournament))),
        takeWhile(([_, __, tournament]) => tournament.status !== TournamentStatus.COMPLETED),
        takeUntil(this.destroy$)
      )
      .subscribe(([_, routeID]) => {
        this.onlineTournamentSerivce.updateState(routeID);
        this.onlineTournamentSerivce.updateStandings(routeID);
      });
  }

  /**
   * Setting the initial values when initializing the component for boards, tours, standings
   * @memberof OnlineTournamentComponent
   */
  setFVBoardsTours() {
    this.routeID$.pipe(distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((id) => {
      this.onlineTournamentSerivce.setOnlineBoards(id);
      this.onlineTournamentSerivce.setTours(id);
      this.onlineTournamentSerivce.setStandings(id);
    });
  }

  /**
   *
   * @memberof OnlineTournamentComponent
   */
  subscribeChat(): void {
    combineLatest([this.getUID$.pipe(filter((uid) => !!uid)), this.getChatID$, this.token$])
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(([uid, chatID, jwt]) => {
        if (uid) {
          this.chatService.subscribeChat(chatID, jwt);
        }
      });
  }

  returnLobbyStatistics(tournament: IOnlineTournament) {
    window['dataLayerPush'](
      'whcTournament',
      'Tournament',
      'Button',
      'Go to game',
      `${tournament.title}`,
      '',
      `${tournament.id}`
    );
  }
}
