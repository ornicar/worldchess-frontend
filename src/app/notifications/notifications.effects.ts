import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action, select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {fromArray} from 'rxjs/internal/observable/fromArray';
import {filter, map, mergeMap, switchMap, take, tap} from 'rxjs/operators';
import {AuthActionTypes, AuthLogout} from '../auth/auth.actions';
import {UserNotificationSocketAction, ISocketMessage, ISocketSendMessage} from '../auth/auth.model';
import {selectIsAuthorized} from '../auth/auth.reducer';
import {SocketConnectionService} from '../auth/socket-connection.service';
import * as fromRoot from '../reducers';
import {SocketStatus} from '../shared/socket/socket-connection';
import {NotificationsResourceService} from './notifications-resource.service';
import {
  AddNotification,
  ClearNotifications,
  MarkReadNotification,
  MarkReadNotificationSuccess,
  NotificationsActionTypes, ResponseMissedNotifications
} from './notifications.actions';

@Injectable()
export class NotificationsEffects {

  notificationsPlayerReadyFromResponse$ = this.actions$.pipe(
    ofType<ResponseMissedNotifications>(NotificationsActionTypes.ResponseMissedNotifications),
    map(({payload: {notifications}}) => notifications),
    mergeMap(notifications => fromArray(notifications)),
    filter(notifications => !notifications.read),
  );

  constructor(
    private actions$: Actions,
    private store$: Store<fromRoot.State>,
    private notificationsResource: NotificationsResourceService,
    private socketConnectionService: SocketConnectionService<ISocketMessage, ISocketSendMessage>,
  ) {
  }

  @Effect()
  loadNotificationsAfterSocketConnect$ = this.socketConnectionService.socket.status$.pipe(
    filter(status => status === SocketStatus.CONNECTED),
    mergeMap(() => this.store$
      .pipe(
        select(selectIsAuthorized),
        take(1)
      )
    ),
    filter(isAuthorized => isAuthorized), // Get all missing notification when connect/reconnect authorized user.
    switchMap(() => this.notificationsResource.getAll()
      .pipe(map(notifications => new ResponseMissedNotifications({notifications})))
    )
  );

  @Effect()
  removeNotifications$ = this.actions$.pipe(
    ofType<AuthLogout>(AuthActionTypes.Logout),
    map(() => new ClearNotifications())
  );

  @Effect()
  getBoardCreatedNotificationsFromSocket$ = this.socketConnectionService.messages$.pipe(
    filter(message => message.action === UserNotificationSocketAction.PLAYER_BOARD_CREATED),
    map((socketMessage: any) => {
      const {action, board_id, tournament_id, tour_start} = socketMessage;
      const data = {
        action,
        board_id,
        tournament_id,
        tour_start
      };

      return {
        id: socketMessage.notification_id,
        created: new Date().toISOString(),
        data,
        read: false
      } as any;
    }),
    map(notification => new AddNotification({notification}))
  );

  @Effect()
  getBoardCreatedNotificationsFromResponse$ = this.notificationsPlayerReadyFromResponse$.pipe(
    filter(({data: {action}}) => action === UserNotificationSocketAction.PLAYER_BOARD_CREATED),
    map(notification => new AddNotification({notification})),
  );

  @Effect()
  markReadNotification$: Observable<Action> = this.actions$.pipe(
    ofType<MarkReadNotification>(NotificationsActionTypes.MarkReadNotification),
    switchMap(({payload: {id}}) => this.notificationsResource.markRead(id).pipe(
      map(() => new MarkReadNotificationSuccess({id}))
    ))
  );
}
