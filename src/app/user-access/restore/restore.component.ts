import {Component, OnDestroy} from '@angular/core';
import {FormControl} from '@angular/forms';
import {select, Store} from '@ngrx/store';
import {AuthPasswordReset, AuthPasswordResetClear} from '../../auth/auth.actions';
import {selectPasswordResetErrors, selectPasswordResetLoading, selectPasswordResetSuccess} from '../../auth/auth.reducer';
import * as forRoot from '../../reducers';

@Component({
  selector: 'app-restore',
  templateUrl: './restore.component.html',
  styleUrls: ['./restore.component.scss']
})
export class RestoreComponent implements OnDestroy {

  formErrors$ = this.store.pipe(
    select(selectPasswordResetErrors)
  );

  loading$ = this.store.pipe(
    select(selectPasswordResetLoading)
  );

  success$ = this.store.pipe(
    select(selectPasswordResetSuccess)
  );

  email = new FormControl('');

  constructor(private store: Store<forRoot.State>) {}

  restore() {
    // @todo Refactoring forms when apply a new design.
    const credential = {
      email: this.email.value
    };

    this.store.dispatch(new AuthPasswordReset({ credential }));
  }

  ngOnDestroy() {
    this.store.dispatch(new AuthPasswordResetClear());
  }
}
