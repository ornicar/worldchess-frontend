import { BehaviorSubject, fromEvent, interval, Observable, Subject } from 'rxjs';
import {
  delay,
  distinctUntilChanged,
  filter,
  first,
  map,
  mergeMap,
  pairwise,
  shareReplay,
  startWith,
  switchMap,
  takeWhile, tap,
} from 'rxjs/operators';
import { ISocketBaseMessage } from './socket-base-message.model';

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

export enum SocketState {
  CONNECTING = 'CONNECTING',
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  CLOSING = 'CLOSING',
}

export const SocketStateMap = {
  [WebSocket.CONNECTING]: SocketState.CONNECTING,
  [WebSocket.CLOSED]: SocketState.CLOSED,
  [WebSocket.OPEN]: SocketState.OPEN,
  [WebSocket.CLOSING]: SocketState.CLOSING,
};

export class SocketConnection<SocketMessage extends ISocketBaseMessage> {
  private numberOfReconnections: number;
  private autoReconnectInterval: number;

  visibilitychange$ = fromEvent(document, 'visibilitychange').pipe(
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  // @todo complete it.
  public status$ = new BehaviorSubject<SocketStatus>(SocketStatus.DISCONNECTED);
  public state$ = new BehaviorSubject<SocketState>(SocketState.CLOSED);
  public online$ = interval(1000).pipe(
    map(() => navigator.onLine),
    distinctUntilChanged(),
  );
  public messages$: Subject<SocketMessage> = new Subject();

  private currentUrl: string;
  private socket: WebSocket;

  constructor(
    private reconnectFirstInterval = 1000,
    private MAX_NUMBER_OF_RECONNECTIONS: number = null
  ) {
    this.numberOfReconnections = 0;
    this.autoReconnectInterval = Number(this.reconnectFirstInterval);

    this.visibilitychange$.pipe(
      filter(() => document.visibilityState === 'visible')
    ).subscribe(() => {
      const userAgent = window.navigator.userAgent;

      if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i)) {
        this.reconnect();
      }
    });

    interval(100).pipe(
      filter(() => !!this.socket),
      map(() => this.socket.readyState),
      distinctUntilChanged(),
      map(state => SocketStateMap[state]),
    ).subscribe(this.state$);

    this.status$.pipe(
      switchMap(() => this.state$),
      map(state => {
        switch (state) {
          case SocketState.CONNECTING:
            return SocketStatus.CONNECTING;
          case SocketState.CLOSED:
            return SocketStatus.DISCONNECTED;
          case SocketState.OPEN:
            return SocketStatus.CONNECTED;
          case SocketState.CLOSING:
            return SocketStatus.DISCONNECTING;
        }
      }),
      filter(status => status && this.status$.value !== status),
    ).subscribe(this.status$);

    this.state$.pipe(
      tap(state => console.log('state', state)),
      filter(state => state === SocketState.CLOSING),
      mergeMap(() => {
        return this.getAutoReconnectInterval().pipe(
          tap(() => console.log('try reconnect')),
          takeWhile(() => this.socket.readyState !== WebSocket.OPEN)
        );
      }),
    ).subscribe(() => this.reconnect());

    this.online$.pipe(
      filter(online => online === false),
      mergeMap(() => this.online$.pipe(filter(online => online === true))),
    ).subscribe(() => {
      this.reconnect();
      setTimeout(() => this.reconnect(), 5000);
    });
  }

  getAutoReconnectInterval(): Observable<any> {
    this.numberOfReconnections = 1;
    return interval(this.autoReconnectInterval).pipe(
      takeWhile(() => {
        if (this.MAX_NUMBER_OF_RECONNECTIONS === null) {
          return true;
        } else {
          return this.MAX_NUMBER_OF_RECONNECTIONS >= this.numberOfReconnections;
        }
      }),
      map(n => n + 1),
      filter(num => num * this.autoReconnectInterval === Math.pow(2, this.numberOfReconnections) * this.autoReconnectInterval),
      tap(() => this.numberOfReconnections++),
    );
  }

  private setDisconnected() {
    // this.removeSocketEventListeners();
    if (this.socket) {
      this.socket.close();
    }
    this.autoReconnectInterval = this.reconnectFirstInterval;
    // this.status$.next(SocketStatus.DISCONNECTED);
  }

  // Callbacks

  private onOpen() {
    this.autoReconnectInterval = this.reconnectFirstInterval;
    // this.status$.next(SocketStatus.CONNECTED);
  }

  private onMessage(response) {
    const data = JSON.parse(response.data) as SocketMessage;

    this.messages$.next(data);
  }

  private onClose(e) {
    this.reconnect();
  }

  private onError(e) {
    this.reconnect();
  }

  _socket = null;

  public connect(url: string): Observable<SocketStatus> {
    if (!url) {
      throw new Error('Empty url for socket');
    }

    // this.state$.subscribe(state => console.log('state', state));


    if (this.socket) {
      this.setDisconnected();
    }

    this.currentUrl = url;
    if (this._socket && this._socket.readyState === WebSocket.CONNECTING) {
      return this.whenConnectCompleted();
    }
    const socket = new WebSocket(url);
    this._socket = socket;
    socket.onopen = () => {
      socket.addEventListener(WebSocketEvents.MESSAGE, this.onMessage.bind(this));
      socket.addEventListener(WebSocketEvents.CLOSE, this.onClose.bind(this));
      socket.addEventListener(WebSocketEvents.ERROR, this.onError.bind(this));
      this.socket = socket;
    }
    socket.onclose = () => {
      socket.removeEventListener(WebSocketEvents.OPEN, this.onOpen.bind(this));
      socket.removeEventListener(WebSocketEvents.MESSAGE, this.onMessage.bind(this));
      socket.removeEventListener(WebSocketEvents.CLOSE, this.onClose.bind(this));
      socket.removeEventListener(WebSocketEvents.ERROR, this.onError.bind(this));
    }
    return this.whenConnectCompleted();
  }

  public hardReconnect(url: string = this.currentUrl) {
    this.numberOfReconnections = 0;
    this.autoReconnectInterval = this.reconnectFirstInterval;
    this.setDisconnected();
    setTimeout(() => {
      this.reconnect(url);
    }, 10);
  }

  public reconnect(url: string = this.currentUrl) {
    if (this.state$.value === SocketState.OPEN) {
      if (url === this.currentUrl) {
        return;
      }

      setTimeout(() => {
        this.connect(url);
      }, 0);
    }

    if (this.state$.value !== SocketState.CONNECTING && this.socket) {
      this.socket.close();
    }

    if (this.state$.value !== SocketState.CLOSED) {
      return;
    }

    setTimeout(() => {
      if (url) {
        this.connect(url);
      }
    }, 0);
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
    return this.state$.pipe(
      filter(state => state === SocketState.CLOSED),
      mergeMap(() => this.state$.pipe(filter(state => state === SocketState.OPEN))),
      first(),
    );
  }

  public sendMessage(message: SocketMessage | ISocketBaseMessage): void {
    this.status$.pipe(
      startWith(this.status$.value),
      filter(status => status === SocketStatus.CONNECTED),
      first(),
    ).subscribe(() => {
      try {
        this.socket.send(JSON.stringify(message));
      } catch (e) {
        console.warn('Cannot send message', e);
      }
    });
  }

  public disconnect() {
    if (this.status$.value === SocketStatus.CONNECTED) {
      this.sendMessage({action: 'CLOSE'});
    }
  }

  private removeSocketEventListeners(): void {
    this.socket.removeEventListener(WebSocketEvents.OPEN, this.onOpen.bind(this));
    this.socket.removeEventListener(WebSocketEvents.MESSAGE, this.onMessage.bind(this));
    this.socket.removeEventListener(WebSocketEvents.CLOSE, this.onClose.bind(this));
    this.socket.removeEventListener(WebSocketEvents.ERROR, this.onError.bind(this));
  }
}
