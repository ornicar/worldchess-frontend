import {Injectable} from '@angular/core';
import {Actions, ofType, Effect} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable, defer, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import { PlanResourceService } from './plan-resource.service';
import { PlanActionTypes, LoadPlans, GetPlans } from './plan.actions';

@Injectable()
export class PlanEffects {

  constructor(
    private actions$: Actions,
    private planResource: PlanResourceService,
  ) {}

  @Effect()
  plans$: Observable<Action> = this.actions$.pipe(
    ofType<GetPlans>(PlanActionTypes.GetPlans),
    switchMap(() => this.planResource.getAll().pipe(
        map(plans => new LoadPlans({ plans }))
      )
    )
  );

  @Effect()
  init$: Observable<Action> = defer((): Observable<Action> => {
    return of(new GetPlans()); // @todo fix it.
  });

}
