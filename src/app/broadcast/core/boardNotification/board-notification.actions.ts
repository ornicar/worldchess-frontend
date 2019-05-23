import {Action} from '@ngrx/store';
import {INotificationModel} from './board-notification.model';

export enum BoardNotificationActionTypes {
  AddNotification = '[Notification] Add Notification',
  ClearNotifications = '[Notification] Clear Notification',
}

export class AddNotification implements Action {
  readonly type = BoardNotificationActionTypes.AddNotification;

  constructor(public payload: { notification: INotificationModel }) {}
}

export class ClearNotifications implements Action {
  readonly type = BoardNotificationActionTypes.ClearNotifications;
}

export type BoardNotificationActions =
  AddNotification
 | ClearNotifications;
