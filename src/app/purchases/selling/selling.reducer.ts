import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SellingActions, SellingActionTypes } from './selling.actions';
import { ISelling, IPersonalSelling, IPaygateSelling, IMainSelling } from './selling.model';

export interface State {
  selling: ISelling;
}


export const initialState: State = {
  selling: null
};

export function reducer(
  state = initialState,
  action: SellingActions
): State {
  switch (action.type) {
    case SellingActionTypes.LoadSellings: {
      const { sellings } = action.payload;
      const selling = sellings ? sellings[0] || null : null;
      return { ...state, selling };
    }

    default: {
      return state;
    }
  }
}

export const selectSellingStore = createFeatureSelector<State>('selling');

export const selectSelling = createSelector(selectSellingStore, ({ selling }) => selling);

export const selectMainSelling = createSelector(selectSellingStore, ({ selling }: { selling: ISelling }) => {
  if (selling) {
    const { main_plan, main_product }: IMainSelling = selling;
    return { main_plan, main_product };
  } else {
    return null;
  }
});
