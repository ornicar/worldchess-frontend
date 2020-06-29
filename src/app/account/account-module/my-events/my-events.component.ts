import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromRoot from '../../../reducers';
import { GetMyTournaments } from '../../../broadcast/core/tournament/tournament.actions';
import { GetCountries } from '../../../broadcast/core/country/country.actions';
import { selectMyAccount } from '@app/account/account-store/account.reducer';
import { Subscription } from 'rxjs';
import { IAccount, FounderStatus } from '@app/account/account-store/account.model';


export enum TournamentManagerMode {
  CREATE = 'create',
  EDIT = 'edit',
  VIEW = 'view'
}

@Component({
  selector: 'wc-my-events',
  templateUrl: './my-events.component.html',
  styleUrls: ['./my-events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyEventsComponent implements OnInit, OnDestroy {
  account$ = this.store$.pipe(
    select(selectMyAccount),
  );

  accountSub: Subscription = null;

  constructor(private store$: Store<fromRoot.State>) { }

  ngOnInit() {
    this.accountSub = this.account$.subscribe((account: IAccount) => {
      if (account && account.founder_approve_status === FounderStatus.APPROVE) {
        this.store$.dispatch((new GetMyTournaments()));
        this.store$.dispatch(new GetCountries());
      }
    });
  }

  ngOnDestroy() {
    if (this.accountSub) {
      this.accountSub.unsubscribe();
    }
  }
}
