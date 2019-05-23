import {Injectable, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subject, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import * as fromBoard from '../broadcast/core/board/board.reducer';
import {SubscriptionHelper, Subscriptions} from '../shared/helpers/subscription.helper';
import {SocketConnection, SocketStatus} from '../shared/socket/socket-connection';

import {
  ISocketSubscribeMessage,
  ISocketUnsubscribeMessage,
  } from '../board/board-socket/board-socket.model';
import {ISocketMessage, BoardNotificationSocketAction, ISocketSendMessage} from './auth.model';
import { ISocketBaseMessage } from '../shared/socket/socket-base-message.model';

@Injectable()
export class SocketConnectionService<
  TSocketMessage extends ISocketBaseMessage,
  TSocketSendMessage extends ISocketBaseMessage
  > implements OnDestroy {

  public socket: SocketConnection<TSocketMessage>;

  private subscribers = 0;
  private waitSubscribe = 0;
  private waitUnsubscribe = 0;

  messages$ = new Subject<TSocketMessage>();
  status$: Observable<SocketStatus>;

  subs: Subscriptions = {};
  private subscribeMessages: TSocketSendMessage[] = [];

  constructor(
    private store$: Store<fromBoard.State>
  ) {
    this.socket = new SocketConnection<TSocketMessage>(
      1000
    );

    this.subs.onDisconnected = this.socket.status$
      .pipe(
        filter(status => status === SocketStatus.DISCONNECTED)
      )
      .subscribe(() => this.onDisconnected());

    this.subs.onDisconnected = this.socket.status$
      .pipe(
        filter(status => status === SocketStatus.RECONNECTING)
      )
      .subscribe(() => this.onBeforeReconnect());

    this.status$ = this.socket.status$;
  }

  private onDisconnected() {
    this.subscribers = 0;
    this.waitSubscribe = 0;
    this.waitUnsubscribe = 0;

    if (this.subs.onUidClear) {
      this.subs.onUidClear.unsubscribe();
      delete this.subs.onUidClear;
    }
  }

  private onBeforeReconnect() {
    this.subscribers = 0;
    this.waitSubscribe = 0;
    this.waitUnsubscribe = 0;

    if (this.subscribeMessages.length > 0) {
      this.subscribeMessages.forEach(message => this.sendMessage(message));
    }
  }

  private onMessage(message) {
    // const data = JSON.parse(response.data) as SocketMessage;

    switch (message.action) {
      case BoardNotificationSocketAction.SUBSCRIBE:
        this.waitSubscribe--;
        this.subscribers++;
        break;

      case BoardNotificationSocketAction.UNSUBSCRIBE:
        this.waitUnsubscribe--;
        this.subscribers--;
    }

    this.messages$.next(message);
  }

  private connect(uid: string) {
    return this.socket.connect(`${environment.socket}?uid=${uid}`).subscribe(() => {
      this.subs.messages = this.socket.messages$.subscribe(message => this.onMessage(message));
    });
  }

  private reconnect(uid: string) {
    this.socket.reconnect(`${environment.socket}?uid=${uid}`);
  }

  public initConnection(uid) {
    return this.socket.whenConnectOrDisconnectCompleted().subscribe(status => {
      switch (status) {
        case SocketStatus.CONNECTED:
          this.reconnect(uid);
          break;

        case SocketStatus.DISCONNECTED:
          this.connect(uid);
          break;
      }
    });
  }

  public whenReconnect() {
    return this.socket.whenReconnect();
  }

  private closeConnection() {
    this.socket.disconnect();
  }

  public subscribe(message: any /* @todo fix */, itemsCount: number = 1) {
    this.waitSubscribe += itemsCount;
    this.sendMessage(message);
    this.subscribeMessages.push(message);
  }

  public unsubscribe(message: any /* @todo fix */, itemsCount: number = 1) {
    this.waitUnsubscribe += itemsCount;
    this.sendMessage(message);
  }

  public sendMessage(message: TSocketSendMessage): void {
    this.socket.whenConnectCompleted().subscribe(status => {
      if (status === SocketStatus.CONNECTED) {
        this.socket.sendMessage(message);
      } else {
        throw new Error('Can not connect');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subs.messages) {
      this.subs.messages.unsubscribe();
      delete this.subs.messages;
    }

    this.messages$.complete();
    this.closeConnection();
    SubscriptionHelper.unsubscribe(this.subs);
  }
}
