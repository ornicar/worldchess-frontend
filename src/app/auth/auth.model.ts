import * as t from 'io-ts';
import { FounderStatus } from '../account/account-store/account.model';
import { IMove } from '../broadcast/move/move.model';
import { ISocketBaseMessage } from '../shared/socket/socket-base-message.model';


export const TokenData = t.type({
  exp: t.number,
  orig_iat: t.number,
  // @todo.
  refresh_exp: t.number
});

export interface ITokenData extends t.TypeOf<typeof TokenData> {
  exp: number;
  orig_iat: number;
  refresh_exp: number;
}

export interface IErrorsResponse {
  [field: string]: string[];
}

export interface ISignInCredential {
  email: string;
  password: string;
}

export interface ISignUpCredential {
  email: string;
  password: string;
  full_name: string;
  founder_approve_status: FounderStatus;
}

export interface IActivateCredential {
  uid: string;
  token: string;
}

export interface IPasswordResetCredential {
  email: string;
}

export interface INewPasswordCredential {
  uid: string;
  token: string;
  new_password: string;
}

export interface ITokenResponse {
  token: string;
  error?: string;
}

export interface IActivationCodeResponse {
  uid: string;
  token: string;
}

export interface IUidResponse {
  uid: string;
}

// @todo create file.

export enum GeneralSocketAction {
  CLOSE = 'CLOSE'
}

export enum BoardNotificationSocketAction {
  SUBSCRIBE = 'CHAT_SUBSCRIBE',
  UNSUBSCRIBE = 'CHAT_UNSUBSCRIBE',
  COMMENTS_ADD = 'MESSAGES_ADD',
  COMMENT_REMOVE = 'MESSAGE REMOVE',
  BOARD_CHANGE = 'BOARD_CHANGE',
  NEW_MOVE = 'NEW_MOVE',
  MOVE_ADD = 'MOVE_ADD',
  GAMING_ADD_MOVE = 'GAMING_ADD_MOVE',
  GAMING_GAME_STARTED = 'GAMING_GAME_STARTED',
  GAMING_SUBSCRIBE_VIEWER_TO_BOARD = 'GAMING_SUBSCRIBE_VIEWER_TO_BOARD',
  BOARD_UNSUBSCRIBE = 'BOARD_UNSUBSCRIBE',
  GAMING_GAME_END = 'GAMING_GAME_END',
  MOVE_ESTIMATING = 'MOVE_ESTIMATING',
  MOVE_REPLACE = 'MOVE_REPLACE',
  NEW_MESSAGE_VOTE = 'NEW MESSAGE VOTE',
  NOTIFICATION = 'NOTIFICATION',
  GAME_OVER = 'GAME_OVER',
  GAMING_GAME_ABORT = 'GAMING_GAME_ABORT',
}

export enum UserNotificationSocketAction {
  PLAYER_BOARD_CREATED = 'PLAYER_BOARD_CREATED',
  PLAYER_READY = 'PLAYER_READY',
  BOARD_STARTED = 'BOARD_STARTED',
  NEW_MOVE = 'NEW_MOVE',
}

export enum TourNotificationSocketAction {
  TOUR_STARTED = 'TOUR_STARTED',
}

export enum SocketType {
  USER_NOTIFICATION = 'USER_NOTIFICATION',
  BOARD_NOTIFICATION = 'BOARD_NOTIFICATION',
  GAMING = 'GAME_NOTIFICATION',
  TOUR_NOTIFICATION = 'TOUR_NOTIFICATION',
  TOURNAMENT_NOTIFICATION = 'TOURNAMENT_NOTIFICATION',
}

export interface ISocketMessage extends ISocketBaseMessage {
  action: GeneralSocketAction | BoardNotificationSocketAction | UserNotificationSocketAction;
  message_type: SocketType;
}

export interface ISocketSendMessage extends ISocketBaseMessage {
  action: GeneralSocketAction | BoardNotificationSocketAction | UserNotificationSocketAction;
}

export interface ISocketMessageBoardNotification extends ISocketBaseMessage {
  action: BoardNotificationSocketAction;
  message_type: SocketType.BOARD_NOTIFICATION;
}

export interface ISocketMessageUserNotification extends ISocketBaseMessage {
  action: UserNotificationSocketAction;
  message_type: SocketType.USER_NOTIFICATION;
}

export interface ISocketMessageTourNotification extends ISocketBaseMessage {
  action: TourNotificationSocketAction;
  message_type: SocketType.TOUR_NOTIFICATION;
}

// ===== Board notifications

export class ISocketBoardNewMove implements ISocketMessageBoardNotification {
  action: BoardNotificationSocketAction.NEW_MOVE;
  message_type: SocketType.BOARD_NOTIFICATION;
  board_id: number;
  move: IMove;
}

export class ISocketBoardGameOver implements ISocketMessageBoardNotification {
  action: BoardNotificationSocketAction.GAME_OVER;
  message_type: SocketType.BOARD_NOTIFICATION;
  board_id: number;
  message: number; // Result
}

// ===== User notifications

export class ISocketGamingNewMove implements ISocketMessageUserNotification {
  action: UserNotificationSocketAction.NEW_MOVE;
  message_type: SocketType.USER_NOTIFICATION;
  board_id: number;
  move: IMove;
  notification_id: number;
  user_uid: string;
}

export class ISocketGamingBoardCreatedMessage implements ISocketMessageUserNotification {
  action: UserNotificationSocketAction.PLAYER_BOARD_CREATED;
  message_type: SocketType.USER_NOTIFICATION;
  board_id: number;
  tournament_id: number;
  tour_start: string;
  notification_id: number;
  user_uid: string;
}

export class ISocketGamingPlayerReadyMessage implements ISocketMessageUserNotification {
  action: UserNotificationSocketAction.PLAYER_READY;
  message_type: SocketType.USER_NOTIFICATION;
  board_id: number;
  player_status: string;
  notification_id: number;
  user_uid: string;
  message: string;
}

export class ISocketGamingBoardStartedMessage implements ISocketMessageUserNotification {
  action: UserNotificationSocketAction.BOARD_STARTED;
  message_type: SocketType.USER_NOTIFICATION;
  board_id: number;
  notification_id: number;
  user_uid: string;
  message: string;
}

export type UserNotificationSocketMessages =
ISocketGamingNewMove
| ISocketGamingBoardCreatedMessage
| ISocketGamingPlayerReadyMessage
| ISocketGamingBoardStartedMessage;

// ===== Tour notifications

export class ISocketTourStartedMessage implements ISocketMessageTourNotification {
  action: TourNotificationSocketAction.TOUR_STARTED;
  message_type: SocketType.TOUR_NOTIFICATION;
  tour_id: number;
  user_uid: string;
}

export interface TwitterOAuthCredentials {
  redirect_state: string;
  oauth_token: string;
  oauth_verifier: string;
}

export interface ISimpleSignUpCredentials {
  email: string;
  is_paid: boolean;
}
