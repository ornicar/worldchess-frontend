import {Injectable} from '@angular/core';
import {Actions, ofType, Effect} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable, defer, of} from 'rxjs';
import {fromArray} from 'rxjs/internal/observable/fromArray';
import {switchMap} from 'rxjs/operators';
import {AddTournaments} from '../../broadcast/core/tournament/tournament.actions';

import { ProductResourceService } from './product-resource.service';
import { ProductActionTypes, LoadProducts, GetProducts } from './product.actions';

@Injectable()
export class ProductEffects {

  constructor(
    private actions$: Actions,
    private productResource: ProductResourceService,
  ) {}

  @Effect()
  products$: Observable<Action> = this.actions$.pipe(
    ofType<GetProducts>(ProductActionTypes.GetProducts),
    switchMap(() =>  this.productResource.getAll().pipe(
        switchMap(({products, tournaments}) => fromArray([
          new LoadProducts({ products }),
          new AddTournaments({ tournaments })
        ]))
      )
    )
  );

  @Effect()
  init$: Observable<Action> = defer((): Observable<Action> => {
    return of(new GetProducts()); // @todo fix it.
  });

}
