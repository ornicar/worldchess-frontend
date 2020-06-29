import { Component, ElementRef, AfterViewInit, ViewChild, Input, EventEmitter, Output, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, interval, Subject } from 'rxjs';
import { take, map, finalize, withLatestFrom, takeWhile, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { PaygatePopupService } from '../../services/paygate-popup.service';
import { AuthResourceService } from '@app/auth/auth-resource.service';
import { Subscriptions, SubscriptionHelper } from '@app/shared/helpers/subscription.helper';
import * as fromRoot from '../../../../reducers';
import { AuthRefreshToken, AuthSetTokenDirty } from '@app/auth/auth.actions';
import { AccountResourceService } from '@app/account/account-store/account-resource.service';
import { BasePopupComponent } from '@app/modules/paygate/components/base-popup/base-popup.component';
import { PaygateFormControl } from '@app/modules/paygate/_shared/paygate-form-control.class';
import { PaygateForm } from '@app/modules/paygate/_shared/paygate-form.class';
import { PaygateService } from '@app/modules/paygate/services/paygate.service';

const TIMER_MILLISECONDS = 5 * 60 * 1 * 1000;

enum TimerState {
  STOP,
  COUNT,
  COMPLETE,
}

@Component({
  selector: 'wc-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit, AfterViewInit, OnDestroy {
  history = window.history;
  @ViewChild('code', { static: true }) codeFieldEl: ElementRef;
  @ViewChild('basePopup', { static: true }) basePopup: BasePopupComponent;

  @Input() embedded = false;
  @Output() success = new EventEmitter();
  @Output() back = new EventEmitter();

  loading$ = new BehaviorSubject(false);
  subs: Subscriptions = {};

  countdown$ = new BehaviorSubject<string>(moment(TIMER_MILLISECONDS).format('mm:ss'));
  timerState$ = new BehaviorSubject<TimerState>(TimerState.COUNT);
  TimerState = TimerState;

  maxSteps$ = this.paygatePopupService.maxSteps$;

  form = new PaygateForm({
    code: new PaygateFormControl(this.paygatePopupService.confirm$.value, [
      Validators.required,
    ]),
  });

  email = '';
  email$ = this.paygatePopupService.email$.pipe(
    withLatestFrom(this.paygatePopupService.state$),
    take(1),
    map(([email, state]) => {
      if (email) {
        return email;
      }

      if (state.token) {
        this.store$.dispatch(new AuthSetTokenDirty({ token: state.token }));
      }

      return state.email;
    }));

  emailToChange: string;

  isEmailChangeMode = false;
  popupTitle = 'New account';
  destroy$ = new Subject();

  constructor(
    private paygatePopupService: PaygatePopupService,
    private paygateService: PaygateService,
    private authResourceService: AuthResourceService,
    private accountService: AccountResourceService,
    private router: Router,
    private store$: Store<fromRoot.State>,
    private route: ActivatedRoute
  ) {

    this.paygatePopupService.setState({ currentStep: 'confirm' });

    this.form.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((formValue) => {
      this.paygatePopupService.confirm$.next(formValue.code);
    });

    this.subs.emailToChange = route.params
      .pipe(map(params => params.emailToChange))
      .subscribe(
      (emailToChange) => {
        if (emailToChange) {
          this.emailToChange = emailToChange;
          this.isEmailChangeMode = true;
          this.popupTitle = 'Email change';
        }
      }
    );

    this.subs.submit = this.form.submit$.pipe(
    ).subscribe(() => {
      this.submit();
    });

    this.form.controls['code'].error$.subscribe(console.log);
  }

  ngOnInit(): void {
    this.subs.email = this.email$.subscribe((email) => {
      this.email = email;
    });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    this.codeFieldEl.nativeElement.focus();
    this.resetCountdown();
  }

  resetCountdown() {
    this.timerState$.next(TimerState.COUNT);
    this.countdown$.next(moment(TIMER_MILLISECONDS).format('mm:ss'));
    interval(1000).pipe(
      take(TIMER_MILLISECONDS / 1000 + 1),
      takeWhile(() => this.timerState$.value === TimerState.COUNT),
      map(t => moment(TIMER_MILLISECONDS - t * 1000).format('mm:ss')),
      finalize(() => {
        if (this.timerState$.value === TimerState.COUNT) {
          this.timerState$.next(TimerState.COMPLETE);
        }
      }),
    ).subscribe(this.countdown$.next.bind(this.countdown$));
  }

  onResend() {
    if (this.timerState$.value !== TimerState.COMPLETE) {
      return;
    }
    this.authResourceService.resendActivationCode(this.email)
        .pipe(finalize(() => this.resetCountdown()))
        .subscribe();
  }

  submit() {
    const { code } = this.form.value;

    if (!this.isEmailChangeMode) { // колхозим обработку случая смены email
      this.loading$.next(true);
      this.authResourceService.activateCode(code, this.embedded && this.email).pipe(
        take(1),
        finalize(() => this.loading$.next(false)),
      ).subscribe((response) => {
        this.timerState$.next(TimerState.STOP);
        this.paygatePopupService.activation$.next(response);

        if (this.embedded) {
          this.success.emit(true);
        } else {
          window['dataLayerPush']('wchReg', 'Become a member', 'Code confirm', this.paygateService.calcTotalForGtag(), '2', null);
          this.paygatePopupService.navigateNextStep ('confirm');
        }
      }, ({ error }) => {
        console.warn({error});
        this.form.controls['code'].setErrors({invalid: true});
      });
    } else {
      this.loading$.next(true);
      this.accountService.confirmEmailChange(code, this.emailToChange).pipe(
        take(1),
        finalize(() => this.loading$.next(false)),
      ).subscribe((response) => {
        window['dataLayerPush']('wchReg', 'Become a member', 'Code confirm', this.paygateService.calcTotalForGtag(), '2', null);

        this.timerState$.next(TimerState.STOP);
        this.store$.dispatch(new AuthRefreshToken({ token: response.new_token, isInit: false }));
        this.basePopup.closePopup();
      }, ({ error }) => {
        this.form.controls['code'].setErrors({invalid: true});
      });
    }
  }
}
