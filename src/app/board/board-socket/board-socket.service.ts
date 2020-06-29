import {Injectable, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {ISocketMessage, BoardNotificationSocketAction, ISocketMessageBoardNotification, ISocketSendMessage} from '../../auth/auth.model';
import {SocketConnectionService} from '../../auth/socket-connection.service';
import {
  ISocketSubscribeBoardsMessage,
  ISocketUnsubscribeBoardsMessage,
  SocketActionSubscribeBoardMessage,
  SocketActionUnsubscribeBoardMessage,
} from './board-socket.model';

export enum BoardSubscribeStatus {
  SUBSCRIBED = 'SUBSCRIBED',
  SUBSCRIBING = 'SUBSCRIBING',
  UNSUBSCRIBING = 'UNSUBSCRIBING',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
}

@Injectable()
export class BoardSocketService implements OnDestroy {
  private boardsStatuses = new Map<number,BoardSubscribeStatus>();

  private reconnectSub: Subscription;
  private messagesSub: Subscription;

  constructor(private socketService: SocketConnectionService<ISocketMessage, ISocketSendMessage>) {

    this.reconnectSub = socketService.whenReconnect()
      .subscribe(() => {
        this.boardsStatuses.forEach((status, boardId) => {
          if (status === BoardSubscribeStatus.SUBSCRIBED
            || status === BoardSubscribeStatus.SUBSCRIBING) {
            this.socketSubscribeToBoards([boardId]);
          }
        });
      });

    this.messagesSub = socketService.messages$
      .pipe(filter((message: ISocketMessageBoardNotification) =>
        [BoardNotificationSocketAction.SUBSCRIBE, BoardNotificationSocketAction.UNSUBSCRIBE].includes(message.action))
      )
      .subscribe((message: ISocketSubscribeBoardsMessage | ISocketUnsubscribeBoardsMessage) => {
        switch (message.action) {
          case BoardNotificationSocketAction.SUBSCRIBE:
            this.boardsStatuses.set(parseInt(message.board_id, 10), BoardSubscribeStatus.SUBSCRIBED);
            break;

          case BoardNotificationSocketAction.UNSUBSCRIBE:
            this.boardsStatuses.set(parseInt(message.board_id, 10), BoardSubscribeStatus.UNSUBSCRIBED);
        }
      });
  }

  boardIsSubscribe(boardId) {
    if (!this.boardsStatuses.has(boardId)) {
      this.boardsStatuses.set(boardId, BoardSubscribeStatus.UNSUBSCRIBED);
    }

    const status = this.boardsStatuses.get(boardId);

    return status === BoardSubscribeStatus.SUBSCRIBED
      || status === BoardSubscribeStatus.SUBSCRIBING;
  }

  boardIsUnsubscribe(boardId) {
    if (!this.boardsStatuses.has(boardId)) {
      this.boardsStatuses.set(boardId, BoardSubscribeStatus.UNSUBSCRIBED);
    }

    const status = this.boardsStatuses.get(boardId);

    return status === BoardSubscribeStatus.UNSUBSCRIBED
      || status === BoardSubscribeStatus.UNSUBSCRIBING;
  }

  private socketSubscribeToBoards(boardsIds: number[]) {
    boardsIds.forEach(boardId =>
      this.boardsStatuses.set(boardId, BoardSubscribeStatus.SUBSCRIBING)
    );

    this.socketService.subscribe(new SocketActionSubscribeBoardMessage(boardsIds));
  }

  private socketUnsubscribeFromBoards(boardsIds: number[]) {
    boardsIds.forEach(boardId =>
      this.boardsStatuses.set(boardId, BoardSubscribeStatus.UNSUBSCRIBING)
    );

    this.socketService.unsubscribe(new SocketActionUnsubscribeBoardMessage(boardsIds));
  }

  public subscribeToBoard(boardId: number) {
    if (this.boardIsUnsubscribe(boardId)) {
      this.socketSubscribeToBoards([boardId]);
    }
  }

  public subscribeToBoards(boardsIds: number[]) {
    const ids = boardsIds.filter(boardId => this.boardIsUnsubscribe(boardId));

    if (ids.length) {
      this.socketSubscribeToBoards(ids);
    }
  }

  public unsubscribeFromBoard(boardId: number) {
    if (this.boardIsSubscribe(boardId)) {
      this.socketUnsubscribeFromBoards([boardId]);
    }
  }

  public unsubscribeFromBoards(boardsIds: number[]) {
    const ids = boardsIds.filter(boardId => this.boardIsSubscribe(boardId));

    if (ids.length) {
      this.socketUnsubscribeFromBoards(ids);
    }
  }

  ngOnDestroy() {
    this.reconnectSub.unsubscribe();
  }
}
