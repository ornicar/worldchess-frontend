import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {PlanActions, PlanActionTypes} from './plan.actions';
import {IPlan} from './plan.model';

export interface State extends EntityState<IPlan> {
  // additional entities state properties
}

export const adapter: EntityAdapter<IPlan> = createEntityAdapter<IPlan>({
  selectId: plan => plan.stripe_id
});

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(
  state = initialState,
  action: PlanActions
): State {
  switch (action.type) {
    case PlanActionTypes.AddPlan: {
      return adapter.addOne(action.payload.plan, state);
    }

    case PlanActionTypes.AddPlans: {
      return adapter.addMany(action.payload.plans, state);
    }

    case PlanActionTypes.UpdatePlan: {
      return adapter.updateOne(action.payload.plan, state);
    }

    case PlanActionTypes.UpdatePlans: {
      return adapter.updateMany(action.payload.plans, state);
    }

    case PlanActionTypes.DeletePlan: {
      return adapter.removeOne(action.payload.id, state);
    }

    case PlanActionTypes.DeletePlans: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case PlanActionTypes.LoadPlans: {
      return adapter.addAll(action.payload.plans, state);
    }

    case PlanActionTypes.ClearPlans: {
      return adapter.removeAll(state);
    }

    default: {
      return state;
    }
  }
}

export const selectPlanStore = createFeatureSelector<State>('plan');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectPlanStore);

export const selectPlanById = () => createSelector(selectEntities, (entities, { planId }) => entities[planId]);
