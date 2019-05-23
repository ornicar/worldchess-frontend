import {Component, OnDestroy} from '@angular/core';
import {FormControl} from '@angular/forms';
import {select, Store} from '@ngrx/store';
import {AuthSignIn, AuthSignInClearError} from '../../auth/auth.actions';
import {selectSignInErrors, selectSignInLoading, selectSignInPasswordBeenReset} from '../../auth/auth.reducer';
import * as forRoot from '../../reducers';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnDestroy {

  formErrors$ = this.store$.pipe(
    select(selectSignInErrors)
  );

  loading$ = this.store$.pipe(
    select(selectSignInLoading)
  );

  isPasswordBeenReset$ = this.store$.pipe(
    select(selectSignInPasswordBeenReset)
  );

  email = new FormControl('');
  password = new FormControl('');

  constructor(private store$: Store<forRoot.State>) {
  }

  signIn() {
    // @todo Refactoring forms when apply a new design.
    const credential = {
      email: this.email.value,
      password: this.password.value
    };

    this.store$.dispatch(new AuthSignIn({ credential }));
  }

  ngOnDestroy() {
    this.store$.dispatch(new AuthSignInClearError());
  }
}
