import { Inject, Injectable, Optional } from '@angular/core';
import { interval, Observable, of, race, Subject, } from 'rxjs';
import { Store as NGRXStore } from '@ngrx/store';
import * as fromAuth from '@app/auth/auth.reducer';
import {
  delay,
  distinctUntilChanged,
  filter,
  first,
  map,
  mapTo,
  mergeMap,
  repeatWhen,
  retryWhen,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { webSocket, WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';
import { SocketType } from '@app/auth/auth.model';
import { GameSocketActions } from '@app/modules/game/state/game-socket-actions.enum';
import { IGameMessage } from '@app/modules/game/state/game-socket-message.models';
import { truthy } from '@app/shared/helpers/rxjs-operators.helper';

@Injectable()
export class SocketService<T = IGameMessage> {

  private _messages$ = new Subject<T>();
  private onOpen$ = new Subject();

  private uid$ = this.authStore.select(fromAuth.selectUID).pipe(
    filter(uid => !!uid),
    distinctUntilChanged(),
  );
  private url$ = this.uid$.pipe(
    map(uid => `${environment.socket}?tag=new&uid=${uid}`),
  );

  private config$: Observable<WebSocketSubjectConfig<T>> = this.url$.pipe(
    map((url) => {
      return {
        url,
        deserializer: (e: MessageEvent) => JSON.parse(e.data),
        serializer: (value: any) => JSON.stringify(value),
        openObserver: this.onOpen$,
      };
    }),
  );

  private pong$ = this._messages$.pipe(
    // TODO считаем понгом любое сообщение, а то бэк лагает
    // filter((message: T & {action: GameSocketActions}) => message.action === GameSocketActions.GAMING_PONG),
  );

  public ping$: Observable<boolean> = this.onOpen$.pipe(
    switchMap(() => interval(this.pingInterval)),
    mergeMap(() => {

      this.sendMessage({
        message_type: SocketType.GAMING,
        action: GameSocketActions.GAMING_PING,
      }, false);

      return race(
        this.pong$.pipe(
          first(),
          mapTo(true),
        ),
        of(false).pipe(
          delay(this.pingInterval * this.pingTimeoutCoefficient),
        ),
      );
    }),
    shareReplay(),
    distinctUntilChanged(),
    repeatWhen(() => this.onOpen$),
  );

  private socket$: Observable<WebSocketSubject<T>> = this.config$.pipe(
    switchMap((config) => {
      return new Observable<WebSocketSubject<T>>((observer) => {
        const close$ = new Subject();
        const closing$ = new Subject<void>();
        const ws: WebSocketSubject<T> = webSocket({
          ... config,
          closeObserver: close$,
          closingObserver: closing$,
        });
        const subs: {unsubscribe: () => void}[] = [ws];
        const completes: {complete: () => void}[] = [
          close$, closing$, ws, observer,
        ];

        subs.push(race(close$, closing$).pipe(
          first(),
        ).subscribe(() => {
          observer.error('close err');
        }));

        subs.push(ws.subscribe(
          msg => this._messages$.next(msg),
        ));
        subs.push(this.onOpen$.pipe(
          first(),
        ).subscribe(() => {
          observer.next(ws);
        }));

        return () => {
          subs.forEach(s => s.unsubscribe());
          completes.forEach(s => s.complete());
        };

      }).pipe(
        retryWhen(err$ => {
          return err$.pipe(
            delay(this.pingInterval),
          );
        }),
      );
    }),
    shareReplay(),
  );

  public messages$ = this.ping$.pipe(
    withLatestFrom(this.socket$),
    tap((args: [boolean, WebSocketSubject<T>]) => {
      const [pong, socket] = args;
      if (!pong) {
        socket.complete();
      }
    }),
    mergeMap(() => this._messages$.asObservable()),
  );

  constructor(
    private authStore: NGRXStore<fromAuth.State>,
    @Optional() @Inject('PingInterval') private readonly pingInterval: number,
    @Optional() @Inject('PingTimeoutCoefficient') private readonly pingTimeoutCoefficient: number,
  ) {
    if (!this.pingInterval) {
      this.pingInterval = 1000;
    }

    if (!this.pingTimeoutCoefficient) {
      this.pingTimeoutCoefficient = 1;
    }
  }

  public sendMessage(message, bufferize = true) {
    const observe: Observable<any> = bufferize
      ? this.ping$.pipe(
          truthy(),
          first(),
          withLatestFrom(this.socket$)
        )
      : of(null).pipe(
          withLatestFrom(this.socket$),
        );

    observe.subscribe((args: [null, WebSocketSubject<T>]) => {
      const [_, socket] = args;
      socket.next(message);
    });
  }
}
