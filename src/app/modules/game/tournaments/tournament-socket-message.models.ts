import { ISocketBaseMessage } from '@app/shared/socket/socket-base-message.model';
import { BoardNotificationSocketAction, SocketType } from '@app/auth/auth.model';
import { IGameMove } from '@app/modules/game/state/game-move.model';
import { Result } from '@app/broadcast/core/result/result.model';
import { EndReason } from '@app/modules/game/state/game-result-enum';
import { TournamentSocketActions } from '@app/modules/game/tournaments/tournament-socket-actions.enum';

export interface IBaseTournamentMessage extends ISocketBaseMessage {
  message_type: SocketType.BOARD_NOTIFICATION;
  action: BoardNotificationSocketAction;
}

export interface ITournamentBoardByViewerSubscribe extends IBaseTournamentMessage {
  action: BoardNotificationSocketAction.GAMING_SUBSCRIBE_VIEWER_TO_BOARD;
  board_id: string;
}

export interface ITournamentBoardByViewerUnsubscirbe extends IBaseTournamentMessage {
  action: BoardNotificationSocketAction.BOARD_UNSUBSCRIBE;
  board_id: string;
}

export interface ITournamentViewerAddMove extends IBaseTournamentMessage {
  action: BoardNotificationSocketAction.GAMING_ADD_MOVE;
  move: IGameMove;
  board_id: string;
}

export interface ITournamentViewGameStarted extends IBaseTournamentMessage {
  action: BoardNotificationSocketAction.GAMING_GAME_STARTED;
  board_id: string;
  text: string;
  user_uid: string;
}

export interface ITournamentViewGameEnd extends IBaseTournamentMessage {
  action: BoardNotificationSocketAction.GAMING_GAME_END;
  board_id: string;
  user_uid: string;
  result: Result;
  reason: EndReason;
}

export interface ITournamentOver {
  message_type: SocketType.TOURNAMENT_NOTIFICATION;
  action: TournamentSocketActions.TOURNAMENT_OVER;
  tournament_id: number;
  user_uid: string;
}


export type TTournamentMessage = ITournamentBoardByViewerSubscribe |
  ITournamentBoardByViewerUnsubscirbe |
  ITournamentViewerAddMove |
  ITournamentViewGameStarted |
  ITournamentViewGameEnd |
  ITournamentOver;
