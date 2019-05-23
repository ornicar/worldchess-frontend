import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {ProductActions, ProductActionTypes} from './product.actions';
import {IProduct} from './product.model';

export interface State extends EntityState<IProduct> {
  // additional entities state properties
}

export const adapter: EntityAdapter<IProduct> = createEntityAdapter<IProduct>({
  selectId: product => product.stripe_id
});

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(
  state = initialState,
  action: ProductActions
): State {
  switch (action.type) {
    case ProductActionTypes.AddProduct: {
      return adapter.addOne(action.payload.product, state);
    }

    case ProductActionTypes.AddProducts: {
      return adapter.addMany(action.payload.products, state);
    }

    case ProductActionTypes.UpdateProduct: {
      return adapter.updateOne(action.payload.product, state);
    }

    case ProductActionTypes.UpdateProducts: {
      return adapter.updateMany(action.payload.products, state);
    }

    case ProductActionTypes.DeleteProduct: {
      return adapter.removeOne(action.payload.id, state);
    }

    case ProductActionTypes.DeleteProducts: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case ProductActionTypes.LoadProducts: {
      return adapter.addAll(action.payload.products, state);
    }

    case ProductActionTypes.ClearProducts: {
      return adapter.removeAll(state);
    }

    default: {
      return state;
    }
  }
}

export const selectProductStore = createFeatureSelector<State>('product');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectProductStore);

export const selectProductById = () => createSelector(selectEntities, (entities, { id }) => entities[id]);
export const selectProductsByIds = () => createSelector(selectEntities, (entities, { ids }) => ids.map(id => entities[id]));
