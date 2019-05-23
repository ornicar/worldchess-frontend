import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import {environment} from '../../environments/environment';

export interface State {
  // @todo Remove after insert a reducer.
  [key: string]: any;
}

export const reducers: ActionReducerMap<State> = {
};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
