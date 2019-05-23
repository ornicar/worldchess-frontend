import {Injectable} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {distinctUntilChanged, switchMap} from 'rxjs/operators';
import * as fromRoot from '../../../app/reducers';
import {BroadcastType, Tournament} from '../../broadcast/core/tournament/tournament.model';
import {IProduct} from '../product/product.model';
import * as fromProduct from '../product/product.reducer';
import * as fromUserPurchases from '../user-purchases/user-purchases.reducer';
import {IUserPurchase} from './user-purchases.model';

@Injectable()
export class UserPurchasesService {

  constructor(private store$: Store<fromRoot.State>) { }

  private selectProductsByIds = fromProduct.selectProductsByIds();

  userPurchase$ = this.store$.pipe(
    select(fromUserPurchases.selectUserPurchase),
  );

  productIds$ = this.userPurchase$.pipe(
    switchMap((purchases: IUserPurchase) => {
      if (purchases && purchases.products) {
        return of(purchases.products);
      } else {
        return of([]);
      }
    })
  );

  products$: Observable<IProduct[]> = this.productIds$.pipe(
    switchMap((ids) => {
      if (ids) {
        return this.store$.pipe(
          select(this.selectProductsByIds, { ids })
        );
      } else {
        return of([]);
      }
    }),
  );

  hasUserPlan(id: string) {
    return this.userPurchase$.pipe(
      switchMap((userPurchase: IUserPurchase) =>
        of(!!(userPurchase && !!userPurchase.plans[id])))
    );
  }

  hasUserProduct(id: string) {
    return this.userPurchase$.pipe(
      switchMap((userPurchase: IUserPurchase) =>
        of(!!(userPurchase && !!userPurchase.products.some(product => product === id))))
    );
  }

  hasUserTournament(tournament: Tournament): Observable<boolean> {
    if (tournament.isFree) {
      return of(true);
    } else {
      return this.hasUserActivePlanNow().pipe(
        switchMap(hasActivePlan => hasActivePlan
          ? of(true)
          : 'product' in tournament
            ? this.hasUserProduct(tournament.product)
            : of(false)
        )
      );
    }
  }

  hasUserActivePlanNow(): Observable<boolean> {
    return this.userPurchase$.pipe(
      distinctUntilChanged(),
      switchMap((userPurchase: IUserPurchase) => {
        return of(userPurchase && userPurchase.has_active_plan);
      })
    );
  }
}
