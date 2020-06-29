import { BoardNotificationSocketAction } from '@app/auth/auth.model';

export class SocketActionSubscribeChatMessage {
  action: BoardNotificationSocketAction.SUBSCRIBE = BoardNotificationSocketAction.SUBSCRIBE;
  chat_id: string;
  user_jwt: string;

  constructor(chatId: string, jwt: string) {
    this.chat_id = chatId;
    this.user_jwt = jwt;
  }
}

export class SocketActionUnsubscribeChatMessage {
  action: BoardNotificationSocketAction.UNSUBSCRIBE = BoardNotificationSocketAction.UNSUBSCRIBE;
  chat_id: string;
  user_jwt: string;

  constructor(chatId: string, jwt: string) {
    this.chat_id = chatId;
    this.user_jwt = jwt;
  }
}
