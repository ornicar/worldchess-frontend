import {Update} from '@ngrx/entity';
import {Action} from '@ngrx/store';
import {ICountry} from './country.model';

export enum CountryActionTypes {
  GetCountries = '[Country] Get all countries',
  LoadCountries = '[Country] Load Countries',
  AddCountry = '[Country] Add Country',
  // UpsertCountry = '[Country] Upsert Country', not used (error produced)
  AddCountries = '[Country] Add Countries',
  // UpsertCountries = '[Country] Upsert Countries', not used (error produced)
  UpdateCountry = '[Country] Update Country',
  UpdateCountries = '[Country] Update Countries',
  DeleteCountry = '[Country] Delete Country',
  DeleteCountries = '[Country] Delete Countries',
  ClearCountries = '[Country] Clear Countries'
}

export class GetCountries implements Action {
  readonly type = CountryActionTypes.GetCountries;

  constructor() {}
}

export class LoadCountries implements Action {
  readonly type = CountryActionTypes.LoadCountries;

  constructor(public payload: { countries: ICountry[] }) {}
}

export class AddCountry implements Action {
  readonly type = CountryActionTypes.AddCountry;

  constructor(public payload: { country: ICountry }) {}
}
/*
export class UpsertCountry implements Action {
  readonly type = CountryActionTypes.UpsertCountry;

  constructor(public payload: { country: Update<ICountry> }) {}
}
*/
export class AddCountries implements Action {
  readonly type = CountryActionTypes.AddCountries;

  constructor(public payload: { countries: ICountry[] }) {}
}
/*
export class UpsertCountries implements Action {
  readonly type = CountryActionTypes.UpsertCountries;

  constructor(public payload: { countries: Update<ICountry>[] }) {}
}
*/
export class UpdateCountry implements Action {
  readonly type = CountryActionTypes.UpdateCountry;

  constructor(public payload: { country: Update<ICountry> }) {}
}

export class UpdateCountries implements Action {
  readonly type = CountryActionTypes.UpdateCountries;

  constructor(public payload: { countries: Update<ICountry>[] }) {}
}

export class DeleteCountry implements Action {
  readonly type = CountryActionTypes.DeleteCountry;

  constructor(public payload: { id: number }) {}
}

export class DeleteCountries implements Action {
  readonly type = CountryActionTypes.DeleteCountries;

  constructor(public payload: { ids: number[] }) {}
}

export class ClearCountries implements Action {
  readonly type = CountryActionTypes.ClearCountries;
}

export type CountryActions =
 GetCountries
 | LoadCountries
 | AddCountry
 // | UpsertCountry
 | AddCountries
 // | UpsertCountries
 | UpdateCountry
 | UpdateCountries
 | DeleteCountry
 | DeleteCountries
 | ClearCountries;
