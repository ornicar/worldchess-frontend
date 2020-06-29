import { SocketService } from '@app/shared/socket/socket.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BoardNotificationSocketAction, ISocketSendMessage, ISocketMessage } from '../../../../auth/auth.model';
import { ISocketCommentRemove, ISocketCommentsAdd } from '../../../../board/board-socket/board-socket.model';
import { SocketActionSubscribeChatMessage, SocketActionUnsubscribeChatMessage } from '@app/broadcast/chess/chat/services/chat-socket.model';
import { SocketConnectionService} from '../../../../auth/socket-connection.service';

@Injectable()
export class ChatSocketService {
  messages$ = this.socketService.messages$.pipe(
    filter<ISocketCommentsAdd>(message => message.action === BoardNotificationSocketAction.COMMENTS_ADD),
  );

  messagesRemove$: Observable<ISocketCommentRemove> = this.socketService.messages$.pipe(
    filter<ISocketCommentRemove>(msg => msg.action === BoardNotificationSocketAction.COMMENT_REMOVE),
  );

  likes$ = this.socketService.messages$.pipe(
    filter(msg => msg.action === BoardNotificationSocketAction.NEW_MESSAGE_VOTE),
  );

  subscribeChat(chatId: string, jwt: string) {
    this.socketService.sendMessage(new SocketActionSubscribeChatMessage(chatId, jwt));
  }

  unsubscribeChat(chatId: string, jwt: string) {
    this.socketService.sendMessage(new SocketActionUnsubscribeChatMessage(chatId, jwt));
  }

  constructor(private socketService: SocketConnectionService<ISocketMessage, ISocketSendMessage>) {}
  // constructor(private socketService: SocketService<ISocketMessage>) {}
}
