import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {BoardNotificationSocketAction, ISocketSendMessage, ISocketMessage} from '../../../../auth/auth.model';
import {SocketConnectionService} from '../../../../auth/socket-connection.service';
import {ISocketCommentRemove, ISocketCommentsAdd} from '../../../../board/board-socket/board-socket.model';

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

  constructor(private socketService: SocketConnectionService<ISocketMessage, ISocketSendMessage>) {}
}
