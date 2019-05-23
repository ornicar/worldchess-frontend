import {Injectable} from '@angular/core';
import {Actions, ofType, Effect} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable, defer, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import { SellingResourceService } from './selling-resource.service';
import { SellingActionTypes, LoadSellings, GetSellings } from './selling.actions';

@Injectable()
export class SellingEffects {

  constructor(
    private actions$: Actions,
    private sellingResource: SellingResourceService,
  ) {}

  @Effect()
  sellings$: Observable<Action> = this.actions$.pipe(
    ofType<GetSellings>(SellingActionTypes.GetSellings),
    switchMap(() => this.sellingResource.getAll().pipe(
        map(sellings => new LoadSellings({ sellings }))
      )
    )
  );

  @Effect()
  init$: Observable<Action> = defer((): Observable<Action> => {
    return of(new GetSellings());
  });

}
