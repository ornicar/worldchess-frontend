import { Component, EventEmitter, Output, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Plan } from '../../../../paygate/dto/plan';
import { PaygateCharge } from '../../../../paygate/paygate-charge';
import { SubscriptionHelper, Subscriptions } from '../../../../shared/helpers/subscription.helper';
import { ScreenStateService } from '../../../../shared/screen/screen-state.service';
import * as fromBoard from '../../../core/board/board.reducer';
import { GameClosePremiumModal } from '../game/game.actions';
import { map, first, switchMap } from 'rxjs/operators';
import { Observable, Subscription, BehaviorSubject, of } from 'rxjs';
import { selectMainSelling } from '../../../../purchases/selling/selling.reducer';
import { Tournament } from '../../../../broadcast/core/tournament/tournament.model';
import { OnChangesInputObservable, OnChangesObservable } from '../../../../shared/decorators/observable-input';
import { IProduct } from '../../../../purchases/product/product.model';
import { selectProductById } from '../../../../purchases/product/product.reducer';

@Component({
  selector: 'wc-go-premium-modal',
  templateUrl: './go-premium-modal.component.html',
  styleUrls: ['./go-premium-modal.component.scss']
})
export class GoPremiumModalComponent implements OnInit, OnChanges, OnDestroy {
  private subs: Subscriptions = {};

  @Input() tournament: Tournament;
  @OnChangesInputObservable() tournament$ = new BehaviorSubject<Tournament>(this.tournament);

  plansFn = PaygateCharge.plans;
  plans = [];

  private selectProductById = selectProductById();

  productFromTournament$: Observable<{product?: IProduct, tournament: Tournament}> = this.tournament$.pipe(
    first(),
    switchMap((tournament) => 'product' in tournament && tournament.product
      ? this.store$.pipe(
        select(this.selectProductById, { id: tournament.product }),
        map((product) => ({ product, tournament }))
      )
      : of({tournament})
    )
  );

  selling$ = this.store$.pipe(
    select(selectMainSelling)
  );

  plans$: Observable<Plan[]> = this.selling$.pipe(
    first(),
    switchMap(sellings => {
      if (sellings) {
        return this.productFromTournament$.pipe(
          map(({product, tournament}) => {
            const { main_plan, main_product } = sellings;
            return this.plansFn(main_plan, { ...(product ? product : main_product), tournament});
          })
        );
        // @todo fix it.
      } else {
        return of([]);
      }
    })
  );

  @Output() checkout = new EventEmitter<Plan>();

  constructor(
    private store$: Store<fromBoard.State>,
    private screenService: ScreenStateService
  ) {
  }

  public ngOnInit() {
    this.subs.plan = this.plans$.subscribe((plans) => this.plans = plans);
    this.screenService.lock();
  }

  @OnChangesObservable()
  public ngOnChanges() {}

  public ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);

    this.screenService.unlock();
  }

  public closeModal() {
    this.store$.dispatch(new GameClosePremiumModal());
  }

  public openCheckout(plan: Plan) {
    this.store$.dispatch(new GameClosePremiumModal());
    this.checkout.emit(plan);
  }
}
