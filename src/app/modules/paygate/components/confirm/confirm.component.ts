import { Component, ElementRef, AfterViewInit, ViewChild, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, interval } from 'rxjs';
import { takeUntil, take, map, finalize, withLatestFrom } from 'rxjs/operators';
import * as moment from 'moment';
import { PaygatePopupService } from '../../services/paygate-popup.service';
import { AuthResourceService } from '../../../../auth/auth-resource.service';
import { Subscriptions, SubscriptionHelper } from '../../../../shared/helpers/subscription.helper';
import * as fromRoot from '../../../../reducers';
import { AuthLogout, AuthSignUpSuccess } from '../../../../auth/auth.actions';
import { selectToken } from '@app/auth/auth.reducer';

const TIMER_MILLISECONDS = 5 * 60 * 1000;

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
export class ConfirmComponent implements AfterViewInit, OnDestroy {

  @ViewChild('field1') field1El: ElementRef;

  @Input() embedded = false;
  @Output() success = new EventEmitter();
  @Output() back = new EventEmitter();

  private _loading = new BehaviorSubject(false);
  subs: Subscriptions = {};

  confirmError$ = new BehaviorSubject<{ [key: string]: string[] }>(null);

  countdown$: Observable<string> = null;
  timerState$ = new Subject<TimerState>();
  _timerState = TimerState.COUNT;
  TimerState = TimerState;

  form = new FormGroup({
    field1: new FormControl('', [ Validators.required ]),
    field2: new FormControl('', [ Validators.required ]),
    field3: new FormControl('', [ Validators.required ]),
    field4: new FormControl('', [ Validators.required ]),
    field5: new FormControl('', [ Validators.required ]),
    field6: new FormControl('', [ Validators.required ]),
  });

  email$ = this.paygatePopupService.email$;
  token$ = this.store$.select(selectToken);

  constructor(private paygatePopupService: PaygatePopupService,
              private authResourceService: AuthResourceService,
              private router: Router,
              private store$: Store<fromRoot.State>) {
    this.subs.timerState = this.timerState$.subscribe((state) => {
      this._timerState = state;
    });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  ngAfterViewInit() {
    this.field1El.nativeElement.focus();
    this.timerState$.next(TimerState.COUNT);
    this.resetCountdown();
  }

  focusField(src, target) {
    if (src.value) {
      target.value = '';
      target.focus();
    }
  }

  resetCountdown() {
    this.countdown$ = interval(1000).pipe(
      take(60 * 5 + 1), // 5 minutes
      takeUntil(this.timerState$),
      map(t => moment(TIMER_MILLISECONDS - t * 1000).format('mm:ss')),
      finalize(() => {
        if (this._timerState === TimerState.COUNT) {
          this.timerState$.next(TimerState.COMPLETE);
        }
      }),
    );
  }

  onResend() {
    const email = this.paygatePopupService.email$.getValue();
    this.authResourceService.resendActivationCode(email).subscribe(() => {
      this.timerState$.next(TimerState.COUNT);
      this.resetCountdown();
    });
  }

  submit() {
    if (this.form.valid) {
      const code = [1, 2, 3, 4, 5, 6].map(i => this.form.value[`field${i}`]).join('');

      this._loading.next(true);
      const email = this.paygatePopupService.email$.getValue();
      this.authResourceService.activateCode(code, this.embedded && email).pipe(
        take(1),
        finalize(() => this._loading.next(false)),
        withLatestFrom(this.token$),
      ).subscribe(([response, token]) => {
        this.confirmError$.next(null);
        this.timerState$.next(TimerState.STOP);
        this.paygatePopupService.activation$.next(response);
        this.store$.dispatch(new AuthSignUpSuccess({ token, redirect: false }));
        if (this.embedded) {
          this.success.emit(true);
        } else {
          this.paygatePopupService.navigateNextStep('confirm');
        }
      }, ({ error }) => {
        this.confirmError$.next(error);
      });
    }
  }

  goBack() {
    if (this.embedded) {
      this.back.emit(true);
    } else {
      this.store$.dispatch(new AuthLogout());
      this.paygatePopupService.reset();
      this.router.navigate(['', { outlets: { p: ['paygate', 'register'] } }]);
    }
  }

  closePopup() {
    this.paygatePopupService.closePopup();
  }
}
