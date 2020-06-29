import {
  EUpdateMeStatus,
  IOnlineTournamentBoard,
  IOnlineTournamentState,
  IUpdateMeResponse,
} from '../models/tournament.model';
import { catchError, delay, filter, first, map, mergeMap, switchMap, take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  IOnlineTournament,
  IOnlineTournamentBoards,
  IOnlineTournamentStandings,
  IReadyResponse,
} from '@app/modules/game/tournaments/models/tournament.model';
import { environment } from '../../../../../environments/environment';
import { IChatID } from '@app/modules/game/state/online-request-response.model';
import { SocketConnectionService } from '@app/auth/socket-connection.service';
import { BoardNotificationSocketAction, SocketType } from '@app/auth/auth.model';
import { TTournamentMessage } from '@app/modules/game/tournaments/tournament-socket-message.models';
import { Store } from '@ngxs/store';
import { EMPTY, Observable, of } from 'rxjs';
import { GameSocketActions } from '@app/modules/game/state/game-socket-actions.enum';
import { IBoardStarted, IGameMessage, ITourBoardCreated } from '@app/modules/game/state/game-socket-message.models';
import {
  InitTournamentIds,
  SetCurrentActiveBoardId,
  SetHasNoTour,
  SetLastTourFlag,
  SetTourBoardId,
  SetTourEnd,
  SetTournamentOver,
  SetTourStarted,
} from '@app/modules/game/tournaments/states/tournament.actions';
import { GameBoardCreated, SetOpponentMode, UpdateTourJWT } from '@app/modules/game/state/game.actions';
import { OpponentMode } from '@app/modules/game/state/game.state';
import { Router } from '@angular/router';
import { TournamentSocketActions } from '@app/modules/game/tournaments/tournament-socket-actions.enum';
import { SocketService } from '@app/shared/socket/socket.service';

@Injectable({
  providedIn: 'root',
})
export class OnlineTournamentResourceService {
  constructor(
    private http: HttpClient,

    // private socket: SocketService<TTournamentMessage | IGameMessage>,
    private socket: SocketConnectionService<TTournamentMessage | IGameMessage, TTournamentMessage | IGameMessage>,
    private store: Store,
    private router: Router
  ) {
    // this.updateTournamentStatus();

    this.socket.messages$
      .pipe(filter((message) => !!message && message.action !== GameSocketActions.GAMING_PONG))
      .subscribe((message) => {
        const tournamentData = this.store.snapshot()['TournamentGameState'];

        switch (message.action) {
          case GameSocketActions.TOUR_BOARD_CREATED:
            if (window['asayer']) {
              window['asayer'].event('SOCKET_MESSAGE', {
                type: GameSocketActions.TOUR_BOARD_CREATED,
                message: message,
              });
            }

            if (message.can_play) {
              if (this.router.url.indexOf(message.board_id) === -1) {
                if (!message.is_first_tour) {
                  of(true)
                    .pipe(delay(10000), take(1))
                    .subscribe(() => {
                      this.initTourData(message);
                    });
                } else {
                  this.initTourData(message);
                }
              }
            } else {
              this.getTourReadyInfo(message.board_id)
                .pipe(take(1))
                .subscribe(() => {});
              this.store
                .dispatch(new SetHasNoTour(true))
                .pipe(take(1))
                .subscribe(() => {
                  if (message.action === GameSocketActions.TOUR_BOARD_CREATED) {
                    console.log('set last tour flag');
                    this.store.dispatch(new SetLastTourFlag(message.is_last_tour));
                  }
                });
            }
            break;
          case GameSocketActions.BOARD_STARTED:
            if (window['asayer']) {
              window['asayer'].event('SOCKET_MESSAGE', {
                type: GameSocketActions.BOARD_STARTED,
                message: message,
              });
            }

            this.boardStartedHandle(message);
            break;
          case TournamentSocketActions.TOURNAMENT_OVER:
            if (window['asayer']) {
              window['asayer'].event('SOCKET_MESSAGE', {
                type: TournamentSocketActions.TOURNAMENT_OVER,
                message: message,
              });
            }

            if (message.tournament_id === tournamentData.tournamentId) {
              this.store
                .dispatch(new SetTournamentOver(true))
                .pipe(take(1))
                .subscribe(() => {
                  this.store.dispatch(new SetLastTourFlag(true));
                });
            }
        }
      });
  }

  initTourData(message: ITourBoardCreated) {
    this.store
      .dispatch(new InitTournamentIds(message.tour_id, message.tournament_id))
      .pipe(
        first(),
        switchMap(() =>
          this.store.dispatch([
            new SetHasNoTour(false),
            new SetLastTourFlag(message.is_last_tour),
            new GameBoardCreated(message.board_id, message.jwt, message.white_player ? message.white_player.uid : ''),
            new SetCurrentActiveBoardId(message.board_id),
            new SetOpponentMode(OpponentMode.HUMAN),
          ])
        ),
        first(),
        switchMap(() => this.getTourReadyInfo(message.board_id)),
        delay(50)
      )
      .subscribe(() => {
        if (this.router.url.indexOf(message.board_id) === -1) {
          this.router.navigate([`/tournament/pairing/${message.board_id}/`]).then();
        }
      });
  }

  boardStartedHandle(message: IBoardStarted) {
    this.store
      .dispatch(new UpdateTourJWT(message.jwt))
      .pipe(take(1))
      .subscribe(() => {
        this.store.dispatch(new SetTourBoardId(message.board_id));
        this.store.dispatch(new SetCurrentActiveBoardId(message.board_id));
        if (this.router.url.indexOf(message.board_id) === -1) {
          this.router.navigate([`/tournament/pairing/${message.board_id}/`]).then(() => {});
        } else {
          this.store.dispatch(new SetTourStarted());
        }
      });
  }

  updateTournamentStatus() {
    this.updateMe()
      .pipe(take(1))
      .subscribe((response) => {
        const tournamentData = this.store.snapshot()['TournamentGameState'];
        switch (response.status) {
          case EUpdateMeStatus.WAITING_FOR_NEXT_TOUR:
          case EUpdateMeStatus.GAME_IN_PROGRESS:
            if (
              tournamentData.currentTour !== response.tour_id ||
              tournamentData.tournamentId !== response.tournament_id
            ) {
              this.initTourData({
                action: GameSocketActions.TOUR_BOARD_CREATED,
                message_type: SocketType.GAMING,
                board_id: response.board_uid,
                jwt: response.jwt,
                chat_id: response.chat_id,
                user_uid: response.uid,
                tour_id: response.tour_id,
                tournament_id: response.tournament_id,
                is_first_tour: response.is_first_tour,
                is_last_tour: response.is_last_tour,
                can_play: true,
              });
            } else if (response.status === EUpdateMeStatus.GAME_IN_PROGRESS) {
              this.boardStartedHandle({
                action: GameSocketActions.BOARD_STARTED,
                message_type: SocketType.GAMING,
                board_id: response.board_uid,
                user_uid: response.uid,
                jwt: response.jwt,
              });
            }
            break;

          case EUpdateMeStatus.GAMEOVER:
            this.store.dispatch(new SetTourEnd());
            break;

          case EUpdateMeStatus.TOURNAMENT_OVER:
            this.store.dispatch(new SetTourEnd());
            this.store.dispatch(new SetTournamentOver(true));
            break;
        }
      });
  }

  getBoards(id: number): Observable<IOnlineTournamentBoard[]> {
    const params = new HttpParams().set('exclude_odd_boards', 'true').set('tournament_id', id.toString());
    return this.http
      .get<IOnlineTournamentBoards>(`${environment.endpoint}/online/tournament/gaming/`, { params })
      .pipe(
        mergeMap((results) => {
          if (results.next) {
            return this.getPaginationBoard(results.next, results.results);
          } else {
            return of([...results.results]);
          }
        }),
        catchError((err, caught) => {
          if ([404, 502, 500].includes(err.status)) {
            return of([]);
          }
          console.error('Error->', err);
          return null;
        })
      );
  }

  getPaginationBoard(url: string, boards: IOnlineTournamentBoard[]): Observable<IOnlineTournamentBoard[]> {
    return this.http.get<IOnlineTournamentBoards>(`${url}`).pipe(
      mergeMap((result) => {
        if (result.next && typeof result.next === 'string') {
          return this.getPaginationBoard(result.next, [...boards, ...result.results]);
        } else {
          return of([...boards, ...result.results]);
        }
      }),
      catchError((err, caught) => {
        if ([404, 502, 500].includes(err.status)) {
          return EMPTY;
        }
        console.error('Error->', err);
        return null;
      })
    );
  }

  getByChatID(id: number): Observable<string> {
    return this.http.get<IChatID>(`${environment.endpoint}/online/tournaments/${id}/chat`).pipe(
      map((i) => i.chat_id),
      catchError((err, caught) => {
        if ([404, 502, 500].includes(err.status)) {
          return EMPTY;
        }
        return of(true).pipe(
          delay(500),
          mergeMap((_) => this.getByChatID(id))
        );
      })
    );
  }

  getOnlineTournament(id: number) {
    return this.http.get<IOnlineTournament>(`${environment.endpoint}/online/tournaments/${id}/`).pipe(
      filter((i) => !!i),
      catchError((err, caught) => {
        if ([404, 502, 500].includes(err.status)) {
          this.router.navigate([`/tournaments`]).then();
        }
        return null;
      })
    );
  }

  /**
   *
   * @param {string} id
   * @returns {Observable<IOnlineTournamentStandings[]>}
   * @memberof OnlineTournamentResourceService
   */
  getOnlineTournamentStandings(id: number): Observable<IOnlineTournamentStandings[]> {
    return this.http
      .get<IOnlineTournamentStandings[]>(`${environment.endpoint}/online/tournaments/${id}/results/`)
      .pipe(
        catchError((err, caught) => {
          if ([404, 502, 500].includes(err.status)) {
            this.router.navigate([`/tournaments`]).then();
            return of([]);
          }
          return of(true).pipe(
            delay(1000),
            mergeMap((_) => this.getOnlineTournamentStandings(id))
          );
        })
      );
  }

  getOnlineTournamentState(id: number): Observable<IOnlineTournamentState> {
    return this.http.get<IOnlineTournamentState>(`${environment.endpoint}/online/tournaments/${id}/state/`).pipe(
      catchError((err) => {
        if ([404, 502, 500].includes(err.status)) {
          this.router.navigate([`/tournaments`]).then();
          return of(null);
        }
      })
    );
  }

  getStandignResult(id: number): Observable<IOnlineTournamentStandings[]> {
    return this.getOnlineTournamentStandings(id).pipe(
      filter((standings) => !!standings),
      mergeMap((standings) => {
        if (standings.length !== 0) {
          return of(standings);
        } else {
          return of(true).pipe(
            delay(500),
            mergeMap((_) => this.getStandignResult(id))
          );
        }
      }),
      catchError((err, caught) => {
        if ([404, 502, 500].includes(err.status)) {
          return of([]);
        } else {
          return of(true).pipe(
            delay(1000),
            mergeMap((_) => this.getStandignResult(id))
          );
        }
      })
    );
  }

  signupToTournament(id: number): Observable<IOnlineTournament> {
    return this.http.post<IOnlineTournament>(`${environment.endpoint}/online/tournaments/${id}/signup/`, null);
  }

  signoutInTournament(id: number): Observable<IOnlineTournament> {
    return this.http.post<IOnlineTournament>(`${environment.endpoint}/online/tournaments/${id}/signout/`, null).pipe(
      catchError((err) => {
        return EMPTY;
      })
    );
  }

  getPGN(boardID: string): Observable<Blob> {
    return this.http.get(`${environment.endpoint}/online/gaming/${boardID}/pgn/`, { responseType: 'blob' });
  }

  getPDF(tournamentID: number, playerID: number, lang: string = 'en'): Observable<Blob> {
    let params = new HttpParams();
    if (lang !== 'en') {
      params = params.set('lang', lang);
    }
    return this.http.get(`${environment.endpoint}/online/tournament-certificate/${tournamentID}/${playerID}/`, {
      params,
      responseType: 'blob',
    });
  }

  sendSocketMessage(message: TTournamentMessage) {
    this.socket.sendMessage(message);
  }

  updateMe(): Observable<IUpdateMeResponse> {
    return this.http.get<IUpdateMeResponse>(`${environment.endpoint}/online/tournaments/update-me`);
  }

  public subscribeViewerBoardID(boardID: string): void {
    this.sendSocketMessage({
      message_type: SocketType.BOARD_NOTIFICATION,
      action: BoardNotificationSocketAction.GAMING_SUBSCRIBE_VIEWER_TO_BOARD,
      board_id: boardID,
    });
  }

  public unsubscribeViewBoardID(boardID: string): void {
    this.sendSocketMessage({
      message_type: SocketType.BOARD_NOTIFICATION,
      action: BoardNotificationSocketAction.BOARD_UNSUBSCRIBE,
      board_id: boardID,
    });
  }

  public getTourReadyInfo(boardId: string): Observable<IReadyResponse> {
    return this.http.post<IReadyResponse>(`${environment.endpoint}/online/gaming/${boardId}/ready/`, {});
  }
}
