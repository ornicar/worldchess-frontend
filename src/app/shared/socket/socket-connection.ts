import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {filter, first, map, pairwise} from 'rxjs/operators';
import {ISocketBaseMessage} from './socket-base-message.model';

// @todo should private.
export enum SocketStatus {
  DISCONNECTED = 'DISCONNECTED',
  DISCONNECTING = 'DISCONNECTING',
  CONNECTING = 'CONNECTING',
  RECONNECTING = 'RECONNECTING',
  CONNECTED = 'CONNECTED'
}

export enum WebSocketEvents {
  OPEN = 'open',
  MESSAGE = 'message',
  CLOSE = 'close',
  ERROR = 'error',
}

export class SocketConnection<SocketMessage extends ISocketBaseMessage> {
  private numberOfReconnections: number;
  private autoReconnectInterval: number;

  // @todo complete it.
  public status$ = new BehaviorSubject<SocketStatus>(SocketStatus.DISCONNECTED);
  public messages$: Subject<SocketMessage> = new Subject();

  private currentUrl: string;
  private socket: WebSocket;

  constructor(
    private reconnectFirstInterval = 1000,
    private MAX_NUMBER_OF_RECONNECTIONS: number = null
  ) {
    this.numberOfReconnections = 0;
    this.autoReconnectInterval = reconnectFirstInterval;
  }

  private setDisconnected() {
    this.removeSocketEventListeners();
    this.socket.close();

    this.currentUrl = null;

    this.autoReconnectInterval = this.reconnectFirstInterval;

    this.status$.next(SocketStatus.DISCONNECTED);
  }

  // Callbacks

  private onOpen() {
    this.autoReconnectInterval = this.reconnectFirstInterval;
    this.status$.next(SocketStatus.CONNECTED);
  }

  private onMessage(response) {
    const data = JSON.parse(response.data) as SocketMessage;

    this.messages$.next(data);
  }

  private onClose(e) {
    switch (e.code) {
      case 1000: // close normal
        this.setDisconnected();
        break;

      default:
        this.reconnect();
    }
  }

  private onError(e) {
    switch (e['code']) {
      case 'ECONNREFUCED':
        this.reconnect();
        break;

      default:
        this.reconnect();
        console.error(e);
    }
  }

  public connect(url: string): Observable<SocketStatus> {
    this.status$.next(SocketStatus.CONNECTING);

    this.currentUrl = url;
    this.socket = new WebSocket(url);
    this.socket.addEventListener(WebSocketEvents.OPEN, this.onOpen.bind(this));
    this.socket.addEventListener(WebSocketEvents.MESSAGE, this.onMessage.bind(this));
    this.socket.addEventListener(WebSocketEvents.CLOSE, this.onClose.bind(this));
    this.socket.addEventListener(WebSocketEvents.ERROR, this.onError.bind(this));

    return this.whenConnectCompleted();
  }

  public reconnect(url: string = this.currentUrl) {
    this.numberOfReconnections++;
    this.autoReconnectInterval *= 2;
    if (this.MAX_NUMBER_OF_RECONNECTIONS === null || this.numberOfReconnections <= this.MAX_NUMBER_OF_RECONNECTIONS) {
      this.removeSocketEventListeners();
      this.socket.close();

      this.status$.next(SocketStatus.RECONNECTING);
      setTimeout(() => this.connect(url), this.autoReconnectInterval);
    } else {
      this.setDisconnected();
    }
  }

  public whenConnectCompleted() {
    return this.status$.pipe(
      filter(status => SocketStatus.CONNECTED === status),
      first()
    );
  }

  public whenConnectOrDisconnectCompleted() {
    return this.status$.pipe(
      filter(status => [SocketStatus.CONNECTED, SocketStatus.DISCONNECTED].includes(status)),
      first()
    );
  }

  public whenReconnect() {
    return this.status$.pipe(
      filter(status => [
        SocketStatus.CONNECTED,
        SocketStatus.DISCONNECTED,
        SocketStatus.RECONNECTING
      ].includes(status)),
      pairwise(),
      filter(([prev, next]) => prev === SocketStatus.RECONNECTING && next === SocketStatus.CONNECTED),
      map(([prev, next]) => next)
    );
  }

  public sendMessage(message: SocketMessage | ISocketBaseMessage): void {
    this.socket.send(JSON.stringify(message));
  }

  public disconnect() {
    if (this.status$.value === SocketStatus.CONNECTED) {
      this.sendMessage({ action: 'CLOSE' });
      this.status$.next(SocketStatus.DISCONNECTING);
    }
  }

  private removeSocketEventListeners(): void {
    this.socket.removeEventListener(WebSocketEvents.OPEN, this.onOpen.bind(this));
    this.socket.removeEventListener(WebSocketEvents.MESSAGE, this.onMessage.bind(this));
    this.socket.removeEventListener(WebSocketEvents.CLOSE, this.onClose.bind(this));
    this.socket.removeEventListener(WebSocketEvents.ERROR, this.onError.bind(this));
  }
}
