import * as t from 'io-ts';
import { FounderStatus } from '../account/account-store/account.model';
import { IMove } from '../broadcast/move/move.model';
import { ISocketBaseMessage } from '../shared/socket/socket-base-message.model';


export const Profile = t.type({
  id: t.number,
  email: t.string,
  full_name: t.string,
  premium: t.boolean
});

export interface IProfile extends t.TypeOf<typeof Profile> {
  id: number;
  email: string;
  full_name: string;
  premium: boolean;
  fide_id?: number;
  is_admin?: boolean;
  // orders_count: number;
  // subscriptions_count: number;
}

const TokenDataWithoutProfile = t.type({
  exp: t.number,
  orig_iat: t.number,
  // @todo.
  refresh_exp: t.number
});

const TokenDataProfile = t.partial({
  profile: Profile
});

export const TokenData = t.intersection([TokenDataWithoutProfile, TokenDataProfile]);

export interface ITokenData extends t.TypeOf<typeof TokenData> {
  exp: number;
  orig_iat: number;
  refresh_exp: number;
  profile?: IProfile;
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
  MOVE_ESTIMATING = 'MOVE_ESTIMATING',
  MOVE_REPLACE = 'MOVE_REPLACE',
  NEW_MESSAGE_VOTE = 'NEW MESSAGE VOTE',
  NOTIFICATION = 'NOTIFICATION',
  GAME_OVER = 'GAME_OVER',
}

export enum UserNotificationSocketAction {
  PLAYER_BOARD_CREATED = 'PLAYER_BOARD_CREATED',
  PLAYER_READY = 'PLAYER_READY',
  BOARD_STARTED = 'BOARD_STARTED',
  NEW_MOVE = 'NEW_MOVE',
}

export enum SocketType {
  USER_NOTIFICATION = 'USER_NOTIFICATION',
  BOARD_NOTIFICATION = 'BOARD_NOTIFICATION',
  GAMING = 'GAME_NOTIFICATION',
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

export class ISocketGamingPLayerReadyMessage implements ISocketMessageUserNotification {
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
  | ISocketGamingPLayerReadyMessage
  | ISocketGamingBoardStartedMessage;
