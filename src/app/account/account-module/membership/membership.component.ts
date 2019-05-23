import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as $ from 'jquery';
import { Observable, of } from 'rxjs';
import 'slick-carousel';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { CommonTournament, FounderTournament, TournamentStatus } from '../../../broadcast/core/tournament/tournament.model';
import * as fromRoot from '../../../reducers';
import { Tournament } from '../../../user-access/dto/response/user-info';
import { IAccount } from '../../account-store/account.model';
import { selectMyAccount } from '../../account-store/account.reducer';
import { IProduct } from '../../../purchases/product/product.model';
import { UserPurchasesService } from '../../../purchases/user-purchases/user-purchases.service';
import { selectMainSelling } from '../../../purchases/selling/selling.reducer';
import { IMainSelling } from '../../../purchases/selling/selling.model';
import { selectTournamentsByIds } from '../../../broadcast/core/tournament/tournament.reducer';
import { ISubscription } from '../../../purchases/subscriptions/subscriptions.model';
import {
  AddSubscriptions,
  CancelRenewSubscription,
  CloseCancelRenewDialog,
  OpenCancelRenewDialog,
} from '../../../purchases/subscriptions/subscriptions.actions';
import * as fromSubscription from '../../../purchases/subscriptions/subscriptions.reducer';
import { selectCancelRenewDialogIsOpened } from '../../../purchases/subscriptions/subscriptions.reducer';
import { SubscriptionHelper, Subscriptions } from '../../../shared/helpers/subscription.helper';
import { PlanType } from '../../../paygate/choose-plan/choose-plan.component';
import { GetUserPurchases } from '../../../purchases/user-purchases/user-purchases.actions';
import { AccountResourceService } from '../../account-store/account-resource.service';
import { AccountLoadSuccess } from '../../account-store/account.actions';
import { PaygateEmbeddedService } from '../../../paygate/paygate-embedded/paygate-embedded.service';


export enum SubscriptionCancelDialogStep {
  CANCEL,
  CONFIRM
};

@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipComponent implements OnInit, OnDestroy, AfterViewInit {
  private selectTournamentsByIds = selectTournamentsByIds();
  private subs: Subscriptions = {};
  public stripe_id: string = null;
  isShownCancelDialog = false;

  PlanType = PlanType;

  SubscriptionCancelDialogStep = SubscriptionCancelDialogStep;
  cancelDialogStep = SubscriptionCancelDialogStep.CANCEL;

  account$: Observable<IAccount> = this.store$.pipe(
    select(selectMyAccount)
  );

  subscriptions$: Observable<ISubscription[]> = this.store$.pipe(
    select(fromSubscription.selectAll)
  );

  // Нужно будет уточнить, как определять текущую подписку, но пока так
  currentSubscription$: Observable<ISubscription> = this.subscriptions$.pipe(
    map(subscriptions => subscriptions && subscriptions.length ? subscriptions[0] : null)
  );

  accountType$ = this.subscriptions$.pipe(
    map((subscriptions: ISubscription[]) => {
      const activeSubscription = subscriptions.find((s: ISubscription) => s.is_active);

      if (activeSubscription) {
        if (activeSubscription.plan.name === 'PRO') {
          return PlanType.PRO;
        } else if (activeSubscription.plan.name === 'PREMIUM') {
          return PlanType.PREMIUM;
        } else {
          return PlanType.BASIC;
        }
      } else {
        return PlanType.BASIC;
      }
    }),
  );

  productIds$: Observable<string[]> = this.userPurchasesService.productIds$;
  products$: Observable<IProduct[]> = this.userPurchasesService.products$;

  tournaments$: Observable<CommonTournament[]> = this.products$.pipe(
    switchMap((products: IProduct[]) => of(products.map((product) => (product.tournament)))),
    switchMap((ids: number[]) => this.store$.pipe(
      select(this.selectTournamentsByIds, { ids })
    ))
  );

  selling$ = this.store$.pipe(
    select(selectMainSelling)
  );

  plan$ = this.selling$.pipe(
    map((selling: IMainSelling) => {
      if (selling) {
        return selling.main_plan;
      } else {
        return null;
      }
    })
  );

  showCancelDialog$ = this.store$.pipe(
    select(selectCancelRenewDialogIsOpened)
  );

  isCancelAvailable$ = this.subscriptions$.pipe(
    map((subscriptions) => !!subscriptions.length
      && this.getClosestSub(subscriptions).cancel_at_period_end === false)
  );

  subscriptionEnd$: Observable<any> = this.subscriptions$.pipe(
    map((subscriptions) => {
      if (subscriptions.length) {
        return this.getClosestSub(subscriptions);
      } else {
        return null;
      }
    })
  );

  tournaments: Tournament[];

  readonly now = new Date().getTime();

  public TournamentStatus = TournamentStatus;

  constructor(private store$: Store<fromRoot.State>,
    private router: Router,
    private userPurchasesService: UserPurchasesService,
    private accountResourceService: AccountResourceService,
    private paygateEmbeddedService: PaygateEmbeddedService,
    private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.subs.subscriptions = this.subscriptions$.subscribe((subscriptions) => {
      if (subscriptions.length) {
        this.stripe_id = this.getClosestSub(subscriptions).stripe_id;
        this.cd.markForCheck();
      }
    });
    this.subs.paygateEmbeddedBuyComplete = this.paygateEmbeddedService.buyCompleted$.subscribe(() => {
      this.onBuyComplete();
    });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  ngAfterViewInit() {
    $('.slider-multifunctional-board').slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      dots: true,
      arrows: false,
      asNavFor: '.slider-account-membership-board',
      responsive: [
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 960,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 1080,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    });

    $('.slider-account-membership-board').slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      dots: false,
      fade: true,
      asNavFor: '.slider-multifunctional-board'
    });
  }

  getClosestSub(subscriptions: ISubscription[]) {
    // @TODO_PURCHASE Надо убедиться, что этот метод возвращает ближайшую АКТИВНУЮ подписку.
    // Добавить проверку на активность.
    // Только trialing и active подписки (это статус) могут быть отменены.

    subscriptions.sort((s1, s2) => this.getMs(s2) - this.getMs(s1));
    return subscriptions[0];
  }

  private getMs = sub => this.convertDateToMillySeconds(sub.period.upper);

  private convertDateToMillySeconds(date: string): number {
    return new Date(date).getTime();
  }

  showCancelDialog() {
    this.cancelDialogStep = SubscriptionCancelDialogStep.CANCEL;
    this.store$.dispatch(new OpenCancelRenewDialog());
  }

  closeCancelDialog(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.store$.dispatch(new CloseCancelRenewDialog());
    this.cancelDialogStep = SubscriptionCancelDialogStep.CANCEL;
  }

  cancelPremiumSubscr(notify: boolean) {
    this.store$.dispatch(new CancelRenewSubscription({ stripe_id: this.stripe_id, notify }));
  }

  confirmStep() {
    this.cancelDialogStep = SubscriptionCancelDialogStep.CONFIRM;
    this.cd.markForCheck();
  }

  showPaygate(title: string, price: number, stripeId: string, isYearSubscription = true, planType = PlanType.BASIC) {
    this.paygateEmbeddedService.showPaygate(title, price, stripeId, isYearSubscription, planType);
  }

  onBuyComplete() {
    this.accountResourceService.getProfile().pipe(
      tap(account => this.store$.dispatch(new AddSubscriptions({
        subscriptions: account.subscriptions,
        count: account.subscriptions.length
      }))),
      tap(account => this.store$.dispatch(new AccountLoadSuccess({ account })))
    ).subscribe(() => {
      this.store$.dispatch(new GetUserPurchases());
    });
  }

  onBuyBroadcast(tournament: FounderTournament) {
    this.router.navigate(['', { outlets: { p: ['paygate', 'purchase'] }}], {
      queryParams: {
        tournament: tournament.id,
      },
      state: {
        tournament: {
          price: tournament.ticket_price,
          stripeId: tournament.product,
          title: `${tournament.title} ${tournament.additional_title}`,
        },
      },
      fragment: 'tournament',
    });
  }

  changeSubscription() {
    this.accountType$.pipe(
      take(1),
    ).subscribe((planType: PlanType) => {
      const upgrade = planType === PlanType.BASIC ? 'basic' : planType === PlanType.PRO ? 'pro' : 'premium';
      this.router.navigate(['', { outlets: { p: ['paygate', 'payment'] } }], {
        fragment: planType === PlanType.BASIC ? 'pro' : 'premium',
        queryParams: { upgrade }
      });
    });
  }
}
