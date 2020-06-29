  import {BoardNotificationSocketAction, ISocketMessageBoardNotification, SocketType} from '../../auth/auth.model';
import {CommentVote, IComment} from '../../broadcast/chess/chat/comments-resource.service';

// @todo Move to auth module and add "extends ISocketMessageBoardNotification"

export interface ISocketCommentRemove extends ISocketMessageBoardNotification {
  action: BoardNotificationSocketAction;
  message_type: SocketType.BOARD_NOTIFICATION;
  board_id: number;
  comment: IComment['id'];
}

export interface INotification extends ISocketMessageBoardNotification {
  action: BoardNotificationSocketAction.NOTIFICATION;
  message_type: SocketType.BOARD_NOTIFICATION;
  message: string;
  board_id: number;
}

export interface ISocketCommentsAdd extends ISocketMessageBoardNotification {
  action: BoardNotificationSocketAction.COMMENTS_ADD;
  message_type: SocketType.BOARD_NOTIFICATION;
  board_id: number;
  comments: IComment[];
}

export interface IChatMessageLike extends ISocketMessageBoardNotification {
  action: BoardNotificationSocketAction.NEW_MESSAGE_VOTE;
  message_type: SocketType.BOARD_NOTIFICATION;
  board_id: number;
  comment: number;
  user: number;
  dislikes: number;
  likes: number;
  vote: CommentVote;
}

export interface ISocketSubscribeMessage extends ISocketMessageBoardNotification {
  action: BoardNotificationSocketAction.SUBSCRIBE;
  message_type: SocketType.BOARD_NOTIFICATION;
}

export interface ISocketSubscribeBoardsMessage extends ISocketMessageBoardNotification {
  board_id?: string;
  chat_id?: number;
  token?: string;
  message_type: SocketType.BOARD_NOTIFICATION;
}

export interface ISocketUnsubscribeMessage extends ISocketMessageBoardNotification {
  action: BoardNotificationSocketAction.UNSUBSCRIBE;
  message_type: SocketType.BOARD_NOTIFICATION;
}

export interface ISocketUnsubscribeBoardsMessage extends ISocketMessageBoardNotification {
  board_id: string;
  message_type: SocketType.BOARD_NOTIFICATION;
}

export class SocketActionSubscribeBoardMessage {
  action: BoardNotificationSocketAction.SUBSCRIBE = BoardNotificationSocketAction.SUBSCRIBE;

  board_id: string;

  constructor(boardsIds: number[] | string[]) {
    this.board_id = boardsIds.join(',');
  }
}


export class SocketActionUnsubscribeBoardMessage {
  action: BoardNotificationSocketAction.UNSUBSCRIBE = BoardNotificationSocketAction.UNSUBSCRIBE;

  board_id: string;

  constructor(boardsIds: number[]) {
    this.board_id = boardsIds.join(',');
  }
}
