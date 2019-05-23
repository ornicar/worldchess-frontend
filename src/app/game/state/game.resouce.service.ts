import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SocketConnectionService } from '../../../app/auth/socket-connection.service';
import { Store } from '@ngxs/store';
import { Store as NGRXStore } from '@ngrx/store';
import * as fromAuth from '../../../app/auth/auth.reducer';
import * as fromAccount from '../../../app/account/account-store/account.reducer';
import { SocketType } from '../../../app/auth/auth.model';
import {
  AddGameBoard,
  AddNewMove,
  GameReady,
  OpponentOfferADraw,
  RestartGame,
  SetAccount,
  SetGameResult,
  SetNotification,
  SetOpponent,
  SetPlayer,
  SetPlayerColor,
  SetRatingChange,
  ShowGameResult,
  SocketMessage,
  SubscribeToBoard,
  SetPgnUrl,
  SetTimeControls,
  SetSelectedTimeControl,
} from './game.actions';
import { ActionSource } from './action-source.enum';
import { IGameBoard } from './game-board.model';
import { IGameMove } from './game-move.model';
import { filter, map } from 'rxjs/operators';
import { GameSocketActions } from './game-socket-actions.enum';
import { IGameAddMove, IGameDraw, IGameMessage, IGameResign } from './game-socket-message.models';
import { ChessColors } from '../chess-board/chess-board.component';
import { environment } from '../../../environments/environment';
import { IOnlineRequestResponse } from './onlline-request-response.model';
import { Observable } from 'rxjs';
import { EndReason } from './game-result-enum';
import { Result } from '../../broadcast/core/result/result.model';
import { GameSocketMessagesHistoryDirections } from './game-socket-messages-history.model';
import { ITimeControl } from '@app/broadcast/core/tour/tour.model';

@Injectable()
export class GameResourceService {
  static readonly pingInterval = 1000;
  private userUID: string;
  private pingIntervalId: number;

  constructor(
    private httpClient: HttpClient,
    private socket: SocketConnectionService<IGameMessage, IGameMessage>,
    private store: Store,
    private authStore: NGRXStore<fromAuth.State>,
    private accStore: NGRXStore<fromAccount.State>,
  ) {
    this.socket.status$.subscribe(status => this.store.dispatch(new SocketMessage(GameSocketMessagesHistoryDirections.STATUS, status)));

    this.authStore.select(fromAuth.selectUID).subscribe(uid => this.userUID = uid);
    this.accStore.select(fromAccount.selectMyAccount)
        .subscribe((acc) => {
          this.store.dispatch(new SetAccount(acc));
          this.store.dispatch(new RestartGame());
        });

    this.socket.messages$
    .pipe(
      filter(message => message.action !== GameSocketActions.GAMING_PONG),
      map((message: IGameMessage) => {
        this.store.dispatch(new SocketMessage(
          GameSocketMessagesHistoryDirections.INCOMING,
          message,
        ));

        const board = this.store.snapshot()['GameState'].board;
        if (message['message_type'] === SocketType.GAMING) {
          if (board) {
            if (board.id === message['board_id']) {
              return message;
            } else {
              console.warn('no my board message', message);
              return null;
            }
          } else {
            if (message.action === GameSocketActions.GAMING_BOARD_CREATED) {
              return message;
            } else {
              console.warn('no board, but message', message);
              return null;
            }
          }
        } else {
          return null;
        }
      }),
      filter(v => !!v),
    ).subscribe((message: IGameMessage) => {
      console.log(message);

      let notifies = {};

      switch (message.action) {
        case GameSocketActions.GAMING_ADD_MOVE:
          this.store.dispatch(new AddNewMove(message.move, ActionSource.WEBSOCKET));
        break;

        case GameSocketActions.GAMING_BOARD_CREATED:
          if (message.white_player.uid === this.userUID) {
            this.store.dispatch(new SetPlayerColor(ChessColors.White));
            this.store.dispatch(new SetPlayer(message.white_player));
            this.store.dispatch(new SetOpponent(message.black_player));
          }

          if (message.black_player.uid === this.userUID) {
            this.store.dispatch(new SetPlayerColor(ChessColors.Black));
            this.store.dispatch(new SetPlayer(message.black_player));
            this.store.dispatch(new SetOpponent(message.white_player));
          }

          this.store.dispatch(new AddGameBoard({
            id: message.board_id,
            jwt: message.jwt,
            white_player: message.white_player,
            black_player: message.black_player,
            moves: [],
          }));

          this.store.dispatch(new SubscribeToBoard());
        break;

        case GameSocketActions.GAMING_GAME_STARTED:
          this.store.dispatch(new GameReady());
          this.store.dispatch(new SetNotification(message.text));
        break;

        case GameSocketActions.GAMING_GAME_END:
          this.store.dispatch(new SetGameResult(message.result, message.reason || EndReason.CLASSIC));
          this.store.dispatch(new ShowGameResult());
          // TODO костыль
          notifies = {
            [Result.BLACK_WIN]: 'Black wins!',
            [Result.WHITE_WIN]: 'White wins!',
            [Result.DRAW]: 'It\'s a draw!',
          };

          if (message.reason === EndReason.RESIGN) {
            notifies = {
              [Result.BLACK_WIN]: 'White resigned. Black is victorious!',
              [Result.WHITE_WIN]: 'Black resigned. White is victorious!',
            };
          }
          this.store.dispatch(new SetNotification(notifies[message.result] || null));
        break;

        case GameSocketActions.GAMING_GAME_ABORT:
          this.store.dispatch(new RestartGame());
          this.store.dispatch(new SetGameResult(Result.NOT_PLAYED, EndReason.ABORT));
          this.store.dispatch(new ShowGameResult());
          this.store.dispatch(new SetNotification('Game aborted! Opponent left the game'));
        break;

        case GameSocketActions.GAMING_RATING_CHANGE:
          this.store.dispatch(new SetRatingChange(message.rating_change));
          this.store.dispatch(new ShowGameResult());
        break;

        case GameSocketActions.GAMING_DRAW_OFFER:
          this.store.dispatch(new OpponentOfferADraw(true));
        break;

        case GameSocketActions.GAMING_PGN_CREATED:
          this.store.dispatch(new SetPgnUrl(`${environment.backendUrl}${message.url}`, message.board_id));
        break;

        case GameSocketActions.GAME_DISCONNECT:
          this.store.dispatch(new SetNotification(`
            Your opponent has left the board and has 15 seconds to reconnect. Otherwise he will get a lose.
          `));
          break;
      }
    });
   }

  public addNewMove(boardId: IGameBoard['id'], move: IGameMove): void {
    const message: IGameAddMove = {
      action: GameSocketActions.GAMING_ADD_MOVE,
      message_type: SocketType.GAMING,
      board_id: boardId,
      move,
    };

    this.sendSocketMessage(message);
  }

  public requestOpponent(time_control: number): Observable<IOnlineRequestResponse> {
    return this.httpClient.post<IOnlineRequestResponse>(`${environment.endpoint}/online/request/`, {
      player_uid: this.userUID,
      time_control,
    });
  }

  public rejectOpponentRequest(uid: string): Observable<void> {
    return this.httpClient.delete<void>(`${environment.endpoint}/online/request/${uid}/`);
  }

  public callToResign(boardId: IGameBoard['id']): void {
    this.sendSocketMessage({
      action: GameSocketActions.GAMING_GAMING_RESIGN,
      board_id: boardId,
    } as IGameResign);
  }

  public callToDraw(boardId: IGameBoard['id']): void {
    this.sendSocketMessage({
      action: GameSocketActions.GAMING_DRAW_OFFER,
      board_id: boardId,
    } as IGameDraw);
  }

  public subscribeToBoard(id: string, token: string): void {
    this.sendSocketMessage({
      action: GameSocketActions.GAMING_SUBSCRIBE_TO_BOARD,
      message_type: SocketType.GAMING,
      board_id: id,
      token
    });
  }

  sendSocketMessage(message: IGameMessage) {
    this.store.dispatch(new SocketMessage(
      GameSocketMessagesHistoryDirections.OUTGOUING,
      message,
    ));
    this.socket.sendMessage(message);
  }

  public sendBugReport(userUid: string, report: string, board: string, log: string): Observable<void> {
    const user_uid = userUid || this.userUID;

    return this.httpClient.post<void>(`${environment.endpoint}/online/bugs/`, {
      user_uid,
      board,
      report,
      log,
     });
  }

  public getTimerControls() {
    this.httpClient.get<ITimeControl[]>(`${environment.endpoint}/timecontrols/`)
      .subscribe((timeControls) => {
        this.store.dispatch(new SetTimeControls(timeControls));
        if (timeControls.length >= 3) {
          this.store.dispatch(new SetSelectedTimeControl(timeControls[2]));
        }
      });
  }

  public callAnArbiter(boardUID: string, playerUID: string): Observable<void> {
    return this.httpClient.post<void>(`${environment.endpoint}/online/gaming/${boardUID}/report/`, {
      abused_player_uid: playerUID
    });
  }

  public startPing(): void {
    this.pingIntervalId = window.setInterval(() => {
      this.sendSocketMessage({
        message_type: SocketType.GAMING,
        action: GameSocketActions.GAMING_PING,
      });
    }, GameResourceService.pingInterval);
  }

  public stopPing(): void {
    window.clearInterval(this.pingIntervalId);
  }

  public abortGame(board_id: string, user_uid: string): void {
    this.sendSocketMessage({
      message_type: SocketType.GAMING,
      action: GameSocketActions.GAMING_GAME_ABORT,
      board_id,
      user_uid,
    });
  }

}
