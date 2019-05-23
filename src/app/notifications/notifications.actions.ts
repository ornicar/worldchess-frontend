import {Action} from '@ngrx/store';
import {IUserNotificationMessage} from './notifications.model';

export enum NotificationsActionTypes {
  ResponseMissedNotifications = '[Notifications] Response success with missed notifications',
  AddNotification = '[Notifications] Add notification to store',
  AddNotifications = '[Notifications] Add notifications to store',
  ClearNotifications = '[Notifications] Clear all notifications',
  MarkReadNotification = '[Notifications] Mark read notification',
  MarkReadNotificationSuccess = '[Notifications] Mark read notification success',
  MarkReadAllNotifications = '[Notifications] Mark read all notifications',
  MarkReadAllNotificationsSuccess = '[Notifications] Mark read all notifications success',
}

export class ResponseMissedNotifications implements Action {
  readonly type = NotificationsActionTypes.ResponseMissedNotifications;

  constructor(public payload: {notifications: IUserNotificationMessage[]}) {}
}

export class AddNotification implements Action {
  readonly type = NotificationsActionTypes.AddNotification;

  constructor(public payload: {notification: IUserNotificationMessage}) {}
}

export class AddNotifications implements Action {
  readonly type = NotificationsActionTypes.AddNotifications;

  constructor(public payload: {notifications: IUserNotificationMessage[]}) {}
}

export class ClearNotifications implements Action {
  readonly type = NotificationsActionTypes.ClearNotifications;

  constructor() {}
}

export class MarkReadNotification implements Action {
  readonly type = NotificationsActionTypes.MarkReadNotification;

  constructor(public payload: {id: IUserNotificationMessage['id']}) {}
}

export class MarkReadNotificationSuccess implements Action {
  readonly type = NotificationsActionTypes.MarkReadNotificationSuccess;

  constructor(public payload: {id: IUserNotificationMessage['id']}) {}
}

export class MarkReadAllNotifications implements Action {
  readonly type = NotificationsActionTypes.MarkReadAllNotifications;

  constructor() {}
}

export class MarkReadAllNotificationsSuccess implements Action {
  readonly type = NotificationsActionTypes.MarkReadAllNotificationsSuccess;

  constructor() {}
}

export type NotificationsActions =
  ResponseMissedNotifications
  | AddNotification
  | AddNotifications
  | ClearNotifications
  | MarkReadNotification
  | MarkReadNotificationSuccess
  | MarkReadAllNotifications
  | MarkReadAllNotificationsSuccess;
