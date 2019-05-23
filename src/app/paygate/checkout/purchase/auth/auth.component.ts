import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {select, Store} from '@ngrx/store';
import {AuthSignInClearError, AuthSignUpClearError} from '../../../../auth/auth.actions';
import {selectSignInErrors, selectSignInPasswordBeenReset, selectSignUpErrors} from '../../../../auth/auth.reducer';
import * as forRoot from '../../../../reducers';
import {SubscriptionHelper, Subscriptions} from '../../../../shared/helpers/subscription.helper';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {

  @Input() isSingIn;

  @Output() isSingInChange = new EventEmitter();

  @Output() signInCredentialChange = new EventEmitter();

  @Output() signUpCredentialChange = new EventEmitter();

  signInFormErrors$ = this.store$.pipe(
    select(selectSignInErrors)
  );

  signInIsPasswordBeenReset$ = this.store$.pipe(
    select(selectSignInPasswordBeenReset)
  );

  signInEmail = new FormControl('');
  signInPassword = new FormControl('');


  signUpFormErrors$ = this.store$.pipe(
    select(selectSignUpErrors)
  );

  signUpEmail = new FormControl('');
  signUpPassword = new FormControl('');
  signUpFullName = new FormControl('');

  private subs: Subscriptions = {};

  constructor(private store$: Store<forRoot.State>) {
  }

  ngOnInit() {
    this.subs.signInFormErrors = this.signInFormErrors$.subscribe(errors => {
      if (errors.email) {
        this.signInEmail.markAsTouched();
      }

      if (errors.password) {
        this.signInPassword.markAsTouched();
      }
    });

    this.subs.signUpFormErrors = this.signUpFormErrors$.subscribe(errors => {
      if (errors.email) {
        this.signUpEmail.markAsTouched();
      }

      if (errors.password) {
        this.signUpPassword.markAsTouched();
      }

      if (errors.full_name) {
        this.signUpFullName.markAsTouched();
      }
    });

    this.subs.signInEmail = this.signInEmail.valueChanges.subscribe(this.onSignInChange.bind(this));
    this.subs.signInPassword = this.signInPassword.valueChanges.subscribe(this.onSignInChange.bind(this));

    this.subs.signUpEmail = this.signUpEmail.valueChanges.subscribe(this.onSignUpChange.bind(this));
    this.subs.signUpPassword = this.signUpPassword.valueChanges.subscribe(this.onSignUpChange.bind(this));
    this.subs.signUpFullName = this.signUpFullName.valueChanges.subscribe(this.onSignUpChange.bind(this));
  }

  onSignInChange() {
    // @todo Refactoring forms when apply a new design.
    const credential = {
      email: this.signInEmail.value,
      password: this.signInPassword.value
    };

    this.signInCredentialChange.next(credential);
  }

  onSignUpChange() {
    // @todo Refactoring forms when apply a new design.
    const credential = {
      email: this.signUpEmail.value,
      password: this.signUpPassword.value,
      full_name: this.signUpFullName.value
    };

    this.signUpCredentialChange.next(credential);
  }

  switchToSignUpForm() {
    this.signInEmail.reset('');
    this.signInPassword.reset('');

    this.store$.dispatch(new AuthSignInClearError());
    this.isSingInChange.next(false);
  }

  switchToSignInForm() {
    this.signUpEmail.reset('');
    this.signUpPassword.reset('');
    this.signUpFullName.reset('');

    this.store$.dispatch(new AuthSignUpClearError());
    this.isSingInChange.next(true);
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
    this.store$.dispatch(new AuthSignInClearError());
    this.store$.dispatch(new AuthSignUpClearError());
  }
}
