import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { WidgetActions, WidgetActionTypes } from './widget.actions';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import { IWidget } from './widget.service';

export interface State extends EntityState<IWidget> {
  selectedWidgetId: string;
}

export const adapter: EntityAdapter<IWidget> = createEntityAdapter<IWidget>();

export const initialState: State = adapter.getInitialState({
  selectedWidgetId: null,
});

export function reducer(
  state = initialState,
  action: WidgetActions
): State {
  switch (action.type) {
    case WidgetActionTypes.LoadWidgets: {
      return adapter.addAll(action.payload.widgets, state);
    }

    case WidgetActionTypes.AddWidget: {
      return adapter.addOne(action.payload.widget, state);
    }

    case WidgetActionTypes.AddWidgets: {
      return adapter.addMany(action.payload.widgets, state);
    }

    case WidgetActionTypes.UpdateWidget: {
      return adapter.updateOne(action.payload.widget, state);
    }

    case WidgetActionTypes.UpdateWidgets: {
      return adapter.updateMany(action.payload.widgets, state);
    }

    default: {
      return state;
    }
  }
}

export const selectWidgetStore = createFeatureSelector<State>('widget');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectWidgetStore);

export const selectWidgetsAll = selectAll;

export const selectWidget = () => createSelector(
  selectEntities,
  (widgets, { widgetId }) => widgetId ? widgets[widgetId] : null
);
