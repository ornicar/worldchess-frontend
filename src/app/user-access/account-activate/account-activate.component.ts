import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {first} from 'rxjs/operators';
import {AuthActivate, AuthActivateClear} from '../../auth/auth.actions';
import {selectActivateErrors, selectActivateLoading, selectActivateSuccess, selectProfile} from '../../auth/auth.reducer';
import * as forRoot from '../../reducers';

@Component({
  selector: 'app-account-activate',
  templateUrl: './account-activate.component.html',
  styleUrls: ['./account-activate.component.scss']
})
export class AccountActivateComponent implements OnInit, OnDestroy {

  loading$ = this.store.pipe(
    select(selectActivateLoading)
  );

  success$ = this.store.pipe(
    select(selectActivateSuccess)
  );

  errors$ = this.store.pipe(
    select(selectActivateErrors)
  );

  profile$ = this.store.pipe(
    select(selectProfile)
  );

  constructor(
    private route: ActivatedRoute,
    private store: Store<forRoot.State>
  ) {
  }

  ngOnInit() {
    this.activate();
  }

  async isLoading() {
    return this.loading$
      .pipe(
        first()
      )
      .toPromise();
  }

  async activate() {
    if (!(await this.isLoading())) {
      const { uid, token } = this.route.snapshot.params;

      this.store.dispatch(new AuthActivate({ credential: { uid, token } }));
    }
  }

  ngOnDestroy() {
    this.store.dispatch(new AuthActivateClear());
  }
}
