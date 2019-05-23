import {HttpErrorResponse} from '@angular/common/http';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {EMPTY} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {isUndefined} from 'util';
import {PaygateService} from '../../../../client/paygate.service';
import {PromoCodeStatus} from '../../../../form-helper/card/card-promo-input/promo-code-status';
import {SubscriptionHelper, Subscriptions} from '../../../../shared/helpers/subscription.helper';
import {BuyObserver} from '../../../buy-observer';
import {IChargePlanRequest, IChargeProductRequest} from '../../../dto/buy-request';
import {Card} from '../../../dto/card';

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.scss'],
  providers: [PaygateService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyComponent implements OnInit, OnDestroy {

  @Input() productId: string;
  @Input() productPrice: number;
  @Input() type: string;
  @Input() buyStatus: string;
  @Input() isAuthorized: boolean;
  @Input() loading: boolean;

  @Output() buyEnd = new EventEmitter;
  @Output() buyStart = new EventEmitter;
  @Output() couponStart = new EventEmitter;
  @Output() couponEnd = new EventEmitter;

  cardForm: FormGroup;

  isCommonError = false;
  serverError = '';
  promoCodeStatus = PromoCodeStatus.NOT_USED;

  discountPrice: number;

  private subs: Subscriptions = {};

  constructor(
    public paygateService: PaygateService,
    private formBuilder: FormBuilder,
    public buyObserver: BuyObserver,
    private cd: ChangeDetectorRef
  ) {
  }

  onBuyClick() {
    this.buyStart.emit();
  }

  ngOnInit() {
    this.cardForm = this.formBuilder.group({
      number: new FormControl(''),
      name: new FormControl(''),
      date: new FormControl(''),
      cvc: new FormControl(''),
      promoCode: new FormControl('')
    });
    this.cd.markForCheck();

    this.cardForm.statusChanges.subscribe(status => {
      this.isCommonError = status === 'INVALID';
      this.cd.markForCheck();
    });

    this.subs.buy = this.buyObserver.buyObs.subscribe(() => {
      this.serverError = '';
      this.buy();
      this.cd.markForCheck();
    });

    this.subs.coupon = this.buyObserver.couponObs.subscribe(() => {
      this.serverError = '';
      this.checkPromoCode();
      this.cd.markForCheck();
    });
  }

  checkPromoCode() {
    this.paygateService.checkPromoCode(this.cardForm.get('promoCode').value.toUpperCase(), this.productId)
      .subscribe(coupon => {
          this.discountPrice = (1 - coupon.percentOff / 100) * this.productPrice;
          this.promoCodeStatus = PromoCodeStatus.SUCCESS;
          this.couponEnd.emit();
          this.cd.markForCheck();
        },
        () => {
          this.discountPrice = undefined;
          this.promoCodeStatus = PromoCodeStatus.FAIL;
          this.couponEnd.emit();
          this.cd.markForCheck();
        });
  }

  onCheckPromoCode() {
    this.couponStart.emit();
  }

  getPrice(): number {
    return isUndefined(this.discountPrice) ? this.productPrice : this.discountPrice;
  }

  buy() {
    if (this.isCommonError) {
      this.buyEnd.emit(false);
      return;
    }
    const dates = this.cardForm.get('date').value.split(' / ');
    const card: Card = <Card> this.cardForm.value;
    card.expMonth = dates[0];
    card.expYear = dates[1];
    if (this.type === 'product') {
      this.buyProduct(card);
    } else if (this.type === 'plan') {
      this.buyPlan(card);
    }
    this.cd.markForCheck();
  }

  private getPayToken(card: Card) {
    return this.paygateService.getPayToken(card).pipe(
      catchError((response: HttpErrorResponse) => {
        this.serverError = response.error.error['message'];
        this.buyEnd.emit(false);
        this.cd.markForCheck();

        return EMPTY;
      })
    );
  }

  private resetForm() {
    this.cardForm.reset({
      number: '',
      name: '',
      date: '',
      cvc: '',
      promoCode: ''
    });
  }

  buyProduct(card: Card) {
    this.getPayToken(card)
      .pipe(
        switchMap(payToken => {
          const coupon = this.cardForm.get('promoCode').value
            .trim()
            .toUpperCase();

          const productRequest: IChargeProductRequest = {
            sku: this.productId,
            stripeToken: payToken
          };

          if (coupon) {
            productRequest.coupon = coupon;
          }

          return this.paygateService.buyProduct(productRequest);
        }),
        catchError((response: HttpErrorResponse) => {
          if (response.error) {
            if (response.error.coupon) {
              const message = response.error.coupon.non_field_errors
                ? response.error.coupon.non_field_errors[0]
                : response.error.coupon[0];

              this.serverError = `Promo code. ${message}`;
            } else {
              this.serverError = `Error, please contact support.`;
            }
          }

          this.buyEnd.emit(false);
          this.cd.markForCheck();
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.buyEnd.emit(true);
        this.resetForm();
      });
  }

  buyPlan(card: Card) {
    this.getPayToken(card)
      .pipe(
        switchMap(payToken => {
          const coupon = this.cardForm.get('promoCode').value
            .trim()
            .toUpperCase();

          const planRequest: IChargePlanRequest = {
            plan: this.productId,
            stripeToken: payToken
          };

          if (coupon) {
            planRequest.coupon = coupon;
          }

          return this.paygateService.buyPlan(planRequest);
        }),
        catchError((response: HttpErrorResponse) => {
          if (response.error) {
            if (response.error.coupon) {
              const message = response.error.coupon.non_field_errors
                ? response.error.coupon.non_field_errors[0]
                : response.error.coupon[0];

              this.serverError = `Promo code. ${message}`;
            } else {
              this.serverError = `Error, please contact support.`;
            }
          }

          this.buyEnd.emit(false);
          this.cd.markForCheck();
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.buyEnd.emit(true);
        this.resetForm();
      });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }
}
