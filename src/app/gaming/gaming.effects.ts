import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {EMPTY, Observable} from 'rxjs';
import {fromArray} from 'rxjs/internal/observable/fromArray';
import {catchError, filter, map, mergeMap} from 'rxjs/operators';
import {
  ISocketGamingBoardStartedMessage,
  ISocketGamingNewMove, SocketType,
  UserNotificationSocketAction,
  ISocketMessage,
  ISocketSendMessage
} from '../auth/auth.model';
import {SocketConnectionService} from '../auth/socket-connection.service';
import {GetBoard, UpdateBoard, UpsertBoard} from '../broadcast/core/board/board.actions';
import {BoardStatus} from '../broadcast/core/board/board.model';
import {AddPlayers} from '../broadcast/core/player/player.actions';
import {UpsertMove} from '../broadcast/move/move.actions';
import {
  AddNotification,
  MarkReadNotification,
  NotificationsActionTypes,
  ResponseMissedNotifications
} from '../notifications/notifications.actions';
import {GamingResourceService} from './gaming-resource.service';
import {GamingActionTypes, GamingReadyPlay} from './gaming.actions';

@Injectable()
export class GamingEffects {

  notificationsPlayerReadyFromResponse$ = this.actions$.pipe(
    ofType<ResponseMissedNotifications>(NotificationsActionTypes.ResponseMissedNotifications),
    map(({payload: {notifications}}) => notifications),
    mergeMap(notifications => fromArray(notifications)),
    filter(notifications => !notifications.read),
  );

  constructor(
    private actions$: Actions,
    private gamingResource: GamingResourceService,
    private socketConnectionService: SocketConnectionService<ISocketMessage, ISocketSendMessage>,
  ) {}

  @Effect()
  readyPlay$: Observable<Action> = this.actions$.pipe(
    ofType<GamingReadyPlay>(GamingActionTypes.ReadyPlay),
    mergeMap(({payload: {board_id}}) =>
      this.gamingResource.readyPlay(board_id).pipe(
        mergeMap(({players, board}) => [
          new UpsertBoard({ board }),
          new AddPlayers({ players })
        ]),
        catchError(e => {
          console.error(e);

          return EMPTY;
        })
      )
    )
  );

  @Effect()
  getNotificationPlayerReadyFromResponse$ = this.notificationsPlayerReadyFromResponse$.pipe(
    filter(({data: {action}}) => action === UserNotificationSocketAction.PLAYER_READY),
    mergeMap((notification: any) => [
      new AddNotification({notification}),
      new MarkReadNotification({id: notification.id}),
      new UpdateBoard({
        board: {
          id: notification.data.board_id,
          changes: {
            player_status: notification.data.player_status
          }
        }
      })
    ])
  );

  @Effect()
  getNotificationPlayerReadyFromSocket$ = this.socketConnectionService.messages$.pipe(
    filter(message => message.action === UserNotificationSocketAction.PLAYER_READY),
    map((socketMessage: any /* @todo. */) => {
      const {action, board_id, player_status} = socketMessage;
      const data = {
        action,
        board_id,
        player_status
      };

      return {
        id: socketMessage.notification_id,
        created: new Date().toISOString(),
        data,
        read: false
      } as any; // @todo.
    }),
    mergeMap(notification => [
      new AddNotification({notification}),
      new MarkReadNotification({id: notification.id}),
      new UpdateBoard({
        board: {
          id: notification.data.board_id,
          changes: {
            player_status: notification.data.player_status
          }
        }
      })
    ])
  );

  @Effect()
  getNotificationBoardStartedFromResponse$ = this.notificationsPlayerReadyFromResponse$.pipe(
    filter(({data: {action}}) => action === UserNotificationSocketAction.BOARD_STARTED),
    mergeMap(notification => [
      new AddNotification({notification}),
      new MarkReadNotification({id: notification.id}),
      new UpdateBoard({board: {id: notification.data.board_id, changes: {status: BoardStatus.GOES}}})
    ])
  );

  @Effect()
  getNotificationBoardStartedFromSocket$ = this.socketConnectionService.messages$.pipe(
    filter(message => message.action === UserNotificationSocketAction.BOARD_STARTED),
    map((socketMessage: ISocketGamingBoardStartedMessage) => {
      const {action, board_id} = socketMessage;
      const data = {
        action,
        board_id
      };

      return {
        id: socketMessage.notification_id,
        created: new Date().toISOString(),
        data,
        read: false
      } as any; // @todo.
    }),
    mergeMap(notification => [
      new AddNotification({notification}),
      new MarkReadNotification({id: notification.id}),
      new UpdateBoard({board: {id: notification.data.board_id, changes: {status: BoardStatus.GOES}}})
    ])
  );

  @Effect()
  getNotificationNewMoveFromResponse$ = this.notificationsPlayerReadyFromResponse$.pipe(
    filter(({data: {action, message_type}}) =>
      action === UserNotificationSocketAction.NEW_MOVE
      && message_type === SocketType.USER_NOTIFICATION
    ),
    mergeMap((notification: any) => [ // @todo.
      new AddNotification({notification}),
      new MarkReadNotification({id: notification.id}),
      new UpsertMove({move: notification.data.move})
    ])
  );

  @Effect()
  getNotificationNewMoveFromSocket$ = this.socketConnectionService.messages$.pipe(
    filter(message =>
      message.action === UserNotificationSocketAction.NEW_MOVE
      && message.message_type === SocketType.USER_NOTIFICATION
    ),
    map((socketMessage: ISocketGamingNewMove) => {
      const {action, board_id, move} = socketMessage;
      const data = {
        action,
        board_id,
        move
      };

      return {
        id: socketMessage.notification_id,
        created: new Date().toISOString(),
        data,
        read: false
      } as any; // @todo.
    }),
    mergeMap(notification => [
      new AddNotification({notification}),
      new MarkReadNotification({id: notification.id}),
      new UpsertMove({move: notification.data.move})
    ])
  );
}
