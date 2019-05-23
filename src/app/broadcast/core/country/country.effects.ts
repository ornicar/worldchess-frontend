import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {CountryResourceService} from './country-resource.service';
import {CountryActionTypes, GetCountries, LoadCountries} from './country.actions';


@Injectable()
export class CountryEffects {

  constructor(
    private actions$: Actions,
    private countryResource: CountryResourceService) {}

  @Effect()
  countries$: Observable<Action> = this.actions$.pipe(
    ofType<GetCountries>(CountryActionTypes.GetCountries),
    switchMap(() =>
      this.countryResource.getAll().pipe(
        map(countries => new LoadCountries({ countries }))
      )
    )
  );
}
