import { SocketType } from '@app/auth/auth.model';
import { GameSocketActions } from './game-socket-actions.enum';
import { ISocketBaseMessage } from '@app/shared/socket/socket-base-message.model';
import { IGameMove } from './game-move.model';
import { IGameBoard } from './game-board.model';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { Result } from '@app/broadcast/core/result/result.model';
import { EndReason } from './game-result-enum';
import { IMove } from '@app/broadcast/move/move.model';

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
  chat_id: number;
  user_uid: string;
  black_player: IPlayer;
  white_player: IPlayer;
}

export interface ITourBoardCreated extends IBaseGameMessage {
  action: GameSocketActions.TOUR_BOARD_CREATED;
  board_id: string;
  jwt: string;
  chat_id: string;
  user_uid: string;
  black_player?: IPlayer;
  white_player?: IPlayer;
  tour_id: number;
  tournament_id: number;
  is_first_tour: boolean;
  is_last_tour: boolean;
  can_play: boolean;
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
  result?: Result;
}

export interface IGameCancelInvite extends  IBaseGameMessage {
  action: GameSocketActions.CANCEL_INVITE;
  invite_code: string;
  user_uid: string;
}

export interface IGameRematchOffered extends IBaseGameMessage {
  action: GameSocketActions.REMATCH_OFFERED;
  invite_code: string;
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

export interface IGameCancelDraw extends IBaseGameMessage {
  action: GameSocketActions.GAMING_CANCEL_DRAW_OFFER;
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
  pgn_download_name: string;
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

export interface IGameError {
  action: GameSocketActions.GAMING_ERROR;
  text: string;
}

export interface IGameMoves extends IBaseGameMessage {
  action: GameSocketActions.GAMING_MOVES;
  moves: IGameMove[];
  white_seconds_left: number;
  black_seconds_left: number;
}

export interface IGameEnded extends IBaseGameMessage {
  action: GameSocketActions.GAMING_ERROR_GAME_ENDED;
  board_id: string;
}

export interface IGameWarning extends IBaseGameMessage {
  action: GameSocketActions.GAME_WARNING;
  thinking_user: string;
  second_left: number;
  user_uid: string;
}

export interface IGameEndWarning extends IBaseGameMessage {
  action: GameSocketActions.GAME_END_WARNING;
  recipient: string;
}

export interface IGameEndCancelWarning extends IBaseGameMessage {
  action: GameSocketActions.GAME_END_CANCEL_WARNING;
  recipient: string;
}

export interface IPlayerBoardCreated extends IBaseGameMessage {
  action: GameSocketActions.PLAYER_BOARD_CREATED;
  board_id: string;
  tournament_id: string;
  tour_start: string;
  user_uid: string;
  notification_id: number;
}

export interface IBoardStarted extends IBaseGameMessage {
  action: GameSocketActions.BOARD_STARTED;
  board_id: string;
  user_uid: string;
  notification_id?: number;
  jwt: string;
}

export interface IPlayerReady extends IBaseGameMessage {
  action: GameSocketActions.PLAYER_READY;
  board_id?: string;
  tournament_id?: string;
  tour_start?: string;
  user_uid?: string;
}

export interface INewMove extends IBaseGameMessage {
  action: GameSocketActions.NEW_MOVE;
  board_id: number;
  move: IMove;
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
  IGameCancelDraw |
  IGameTimeoutEnd |
  IGameRatingChange |
  IGameGameAbort |
  IGamePgnCreated |
  IGamePing |
  IGamePong |
  IGameOpponentDisconnect |
  IGameMoves |
  IGameEnded |
  IGameError |
  IGameWarning |
  IGameEndWarning |
  IGameEndCancelWarning |
  IGameCancelInvite |
  IGameRematchOffered |
  IPlayerBoardCreated |
  IPlayerReady |
  ITourBoardCreated |
  IBoardStarted;
