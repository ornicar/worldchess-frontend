import {EntityState, EntityAdapter, createEntityAdapter} from '@ngrx/entity';
import {INotificationModel} from './board-notification.model';
import {BoardNotificationActions, BoardNotificationActionTypes} from './board-notification.actions';
import {createFeatureSelector, createSelector} from '@ngrx/store';

export interface State extends EntityState<INotificationModel> {
}

export const adapter: EntityAdapter<INotificationModel> = createEntityAdapter<INotificationModel>({
  selectId: model => model && model.board_id
});

export const initialState: State = adapter.getInitialState({
});

export function reducer(
  state = initialState,
  action: BoardNotificationActions
): State {
  switch (action.type) {
    case BoardNotificationActionTypes.AddNotification: {
      return adapter.upsertOne(action.payload.notification, state);
    }

    case BoardNotificationActionTypes.ClearNotifications: {
      return adapter.removeAll(state);
    }

    default: {
      return state;
    }
  }
}

export const selectBoardNotificationStore = createFeatureSelector<State>('board-notification');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectBoardNotificationStore);


export const selectBoardNotification = () => {
  return createSelector(
    selectEntities,
    (notifications, { boardId }) => notifications[boardId] || null
  );
};
