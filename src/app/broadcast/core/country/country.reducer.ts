import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ICountry } from './country.model';
import { CountryActions, CountryActionTypes } from './country.actions';
import {createFeatureSelector, createSelector} from '@ngrx/store';

export interface State extends EntityState<ICountry> {
  // additional entities state properties
}

export const adapter: EntityAdapter<ICountry> = createEntityAdapter<ICountry>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(
  state = initialState,
  action: CountryActions
): State {
  switch (action.type) {
    case CountryActionTypes.AddCountry: {
      return adapter.addOne(action.payload.country, state);
    }

    /*case CountryActionTypes.UpsertCountry: {
      return adapter.upsertOne(action.payload.country, state);
    }*/

    case CountryActionTypes.AddCountries: {
      return adapter.addMany(action.payload.countries, state);
    }

    /*case CountryActionTypes.UpsertCountries: {
      return adapter.upsertMany(action.payload.countries, state);
    }*/

    case CountryActionTypes.UpdateCountry: {
      return adapter.updateOne(action.payload.country, state);
    }

    case CountryActionTypes.UpdateCountries: {
      return adapter.updateMany(action.payload.countries, state);
    }

    case CountryActionTypes.DeleteCountry: {
      return adapter.removeOne(action.payload.id, state);
    }

    case CountryActionTypes.DeleteCountries: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case CountryActionTypes.LoadCountries: {
      return adapter.addAll(action.payload.countries, state);
    }

    case CountryActionTypes.ClearCountries: {
      return adapter.removeAll(state);
    }

    default: {
      return state;
    }
  }
}

export const selectCountriestore = createFeatureSelector<State>('country');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectCountriestore);

export const selectCountryById = () => createSelector(selectEntities, (entities, { countryId }) => entities[countryId]);

export const selectCountriesByIds = () => createSelector(selectEntities, (entities, { countriesIds }) =>
  countriesIds
    .map(id => entities[id])
    .filter(entity => Boolean(entity))
);
