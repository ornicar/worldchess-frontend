import { SocketType } from '../../../app/auth/auth.model';
import { GameSocketActions } from './game-socket-actions.enum';
import { ISocketBaseMessage } from '../../../app/shared/socket/socket-base-message.model';
import { IGameMove } from './game-move.model';
import { IGameBoard } from './game-board.model';
import { IPlayer } from '../../../app/broadcast/core/player/player.model';
import { Result } from '../../../app/broadcast/core/result/result.model';
import { EndReason } from './game-result-enum';

export interface IBaseGameMessage extends ISocketBaseMessage {
  message_type: SocketType.GAMING;
  action: GameSocketActions;
}

export interface IGameOpponentFound extends IBaseGameMessage {
  action: GameSocketActions.GAMING_OPPONENT_FOUND;
  board_id: IGameBoard['id'];
}

export interface IGameBoardSubscribe extends IBaseGameMessage {
  action: GameSocketActions.GAMING_SUBSCRIBE_TO_BOARD;
  board_id: IGameBoard['id'];
  token?: string;
  text?: string;
}

export interface IGameStarted extends IBaseGameMessage {
  action: GameSocketActions.GAMING_GAME_STARTED;
  board_id: IGameBoard['id'];
  text: string;
  user_uid: string;
}

export interface IGameAddMove extends IBaseGameMessage {
  action: GameSocketActions.GAMING_ADD_MOVE;
  move: IGameMove;
  board_id: IGameBoard['id'];
}

export interface IGameNotification extends IBaseGameMessage {
  action: GameSocketActions.GAMING_NOTIFICATION;
  message: string;
}

export interface IGameBoardCreated extends IBaseGameMessage {
  action: GameSocketActions.GAMING_BOARD_CREATED;
  board_id: string;
  jwt: string;
  user_uid: string;
  black_player: IPlayer;
  white_player: IPlayer;
}

export interface IGameTimeControlEnd extends IBaseGameMessage {
  action: GameSocketActions.GAMING_GAME_TIME_CONTROL_END;
  board_id: string;
  user_uid: string;
  result: Result;
}

export interface IGameTimeoutEnd extends IBaseGameMessage {
  action: GameSocketActions.GAMING_GAME_TIMEOUT_END;
  board_id: string;
  user_uid: string;
  result: Result;
}

export interface IGameGameEnd extends IBaseGameMessage {
  action: GameSocketActions.GAMING_GAME_END;
  board_id: string;
  user_uid: string;
  result: Result;
  reason: EndReason;
}

export interface IGameGameAbort extends IBaseGameMessage {
  action: GameSocketActions.GAMING_GAME_ABORT;
  board_id: string;
  user_uid: string;
}

export interface IGameResign extends IBaseGameMessage {
  action: GameSocketActions.GAMING_GAMING_RESIGN;
  board_id: string;
  user_uid?: string;
  result?: Result;
}

export interface IGameDraw extends IBaseGameMessage {
  action: GameSocketActions.GAMING_DRAW_OFFER;
  board_id: string;
  user_uid?: string;
  result?: Result;
}

export interface IGameRatingChange extends IBaseGameMessage {
  action: GameSocketActions.GAMING_RATING_CHANGE;
  board_id: string;
  user_uid: string;
  rating_change: number;
}

export interface IGamePgnCreated extends IBaseGameMessage {
  action: GameSocketActions.GAMING_PGN_CREATED;
  board_id: string;
  url: string;
  user_uid: string;
}
export interface IGamePing extends IBaseGameMessage {
  action: GameSocketActions.GAMING_PING;
}

export interface IGamePong extends IBaseGameMessage {
  action: GameSocketActions.GAMING_PONG;
}

export interface IGameOpponentDisconnect extends IBaseGameMessage {
  action: GameSocketActions.GAME_DISCONNECT;
}

export type IGameMessage =
  IGameOpponentFound |
  IGameBoardSubscribe |
  IGameStarted |
  IGameAddMove |
  IGameNotification |
  IGameBoardCreated |
  IGameTimeControlEnd |
  IGameGameEnd |
  IGameResign |
  IGameDraw |
  IGameTimeoutEnd |
  IGameRatingChange |
  IGameGameAbort |
  IGamePgnCreated |
  IGamePing |
  IGamePong |
  IGameOpponentDisconnect;
