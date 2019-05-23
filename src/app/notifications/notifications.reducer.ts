import {createEntityAdapter, EntityAdapter, EntityState, Update} from '@ngrx/entity';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {UserNotificationSocketAction} from '../auth/auth.model';
import {NotificationsActions, NotificationsActionTypes} from './notifications.actions';
import {IUserNotificationMessage} from './notifications.model';

export interface State extends EntityState<IUserNotificationMessage> {
}

export const adapter: EntityAdapter<IUserNotificationMessage> = createEntityAdapter<IUserNotificationMessage>({
  selectId: (model: IUserNotificationMessage): number => model.id
});

export const initialState: State = adapter.getInitialState({
});

export function reducer(state = initialState, action: NotificationsActions): State {
  switch (action.type) {

    case NotificationsActionTypes.AddNotification: {
      return adapter.addOne(action.payload.notification, state);
    }

    case NotificationsActionTypes.AddNotifications: {
      return adapter.addMany(action.payload.notifications, state);
    }

    case NotificationsActionTypes.ClearNotifications: {
      return adapter.removeAll(state);
    }

    case NotificationsActionTypes.MarkReadNotificationSuccess: {
      const updateEntity: Update<IUserNotificationMessage> = {
        id: action.payload.id,
        changes: {
          read: true
        }
      };

      return adapter.updateOne(updateEntity, state);
    }

    default:
      return state;
  }
}

export const selectNotifications = createFeatureSelector<State>('notifications');

export const {
  selectIds: selectNotificationsIds,
  selectEntities: selectNotificationsEntities,
  selectAll: selectNotificationsAll,
  selectTotal: selectNotificationsTotal,
} = adapter.getSelectors(selectNotifications);

export const selectAllUnreadBoardCreatedNotifications = createSelector(
  selectNotificationsAll,
  entities => entities
    .filter(entity => !entity.read && entity.data.action === UserNotificationSocketAction.PLAYER_BOARD_CREATED)
);
