import {Component, OnDestroy} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {first} from 'rxjs/operators';
import {AuthNewPassword, AuthNewPasswordClear} from '../../auth/auth.actions';
import {selectNewPasswordErrors, selectNewPasswordLoading, selectNewPasswordSuccess} from '../../auth/auth.reducer';
import * as forRoot from '../../reducers';

@Component({
  selector: 'app-account-restore',
  templateUrl: './account-restore.component.html',
  styleUrls: ['./account-restore.component.scss']
})
export class AccountRestoreComponent implements OnDestroy {

  formErrors$ = this.store.pipe(
    select(selectNewPasswordErrors)
  );

  loading$ = this.store.pipe(
    select(selectNewPasswordLoading)
  );

  success$ = this.store.pipe(
    select(selectNewPasswordSuccess)
  );

  error = '';

  password = new FormControl('');
  repeatPassword = new FormControl('');

  constructor(
    private route: ActivatedRoute,
    private store: Store<forRoot.State>
  ) {
  }

  async isLoading() {
    return this.loading$
      .pipe(
        first()
      )
      .toPromise();
  }

  async restore() {
    if (this.repeatPassword.value !== this.password.value) {
      this.error = `passwords aren't equal`;
    } else {
      this.error = '';

      if (!(await this.isLoading())) {
        const { uid, token } = this.route.snapshot.params,
          new_password = this.password.value;

        this.store.dispatch(new AuthNewPassword({ credential: { uid, token, new_password } }));
      }
    }
  }

  ngOnDestroy() {
    this.store.dispatch(new AuthNewPasswordClear());
  }
}
