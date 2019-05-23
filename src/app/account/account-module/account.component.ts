import { Component, isDevMode } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { selectProfile } from '../../auth/auth.reducer';
import * as forRoot from '../../reducers';
import { selectCanUserCreateEvent } from '../account-store/account.reducer';


@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent {

  profile$ = this.store.pipe(
    select(selectProfile)
  );

  ableToCreateEvent$ = this.store.pipe(
    select(selectCanUserCreateEvent)
  );

  constructor(private store: Store<forRoot.State>) {
  }

  get isDevMode(): boolean {
    return isDevMode();
  }
}
