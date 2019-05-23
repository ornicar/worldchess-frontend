import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TournamentManagerMode } from '../my-events/my-events.component';
import * as fromRoot from '../../../reducers';
import { SubscriptionHelper, Subscriptions } from '../../../shared/helpers/subscription.helper';
import { tournamentManagerTabs, selectMode } from './manage-tournament';
import { IAccount} from '../../account-store/account.model';
import * as fromAccount from '../../account-store/account.reducer';


@Component({
  selector: 'wc-manage-tournament',
  templateUrl: './manage-tournament.component.html',
  styleUrls: ['./manage-tournament.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ManageTournamentComponent implements OnInit, OnDestroy {
  private subs: Subscriptions = {};

  constructor(private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
    private store$: Store<fromRoot.State>) { }

  mode: TournamentManagerMode = TournamentManagerMode.CREATE;

  title = {
    [TournamentManagerMode.CREATE]: 'Create Tournament',
    [TournamentManagerMode.EDIT]: 'Edit Tournament',
    [TournamentManagerMode.VIEW]: 'My Tournament'
  };

  tournamentManagerTabs = tournamentManagerTabs;
  selectedTabValue = 'main';
  selectedTournamentId = null;
  tabs = tournamentManagerTabs;

  myAccount$: Observable<IAccount> = this.store$.pipe(
    select(fromAccount.selectMyAccount)
  );

  ngOnInit() {
    this.subs.route = this.route.url.subscribe((params) => {
      this.mode = selectMode(params[0].path);
      this.selectedTournamentId = +params[1].path;

      this.selectedTabValue = this.route.snapshot.firstChild.url[0].path;

      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  onSelectTab(tabValue) {
    // SHOW POP-UP IF FORM IS NOT SAVED
    if (this.ableToSelectTab()) {
      this.router.navigate([`/account/events/${this.mode}/${this.selectedTournamentId}/${tabValue}`]);
    }
  }

  ableToSelectTab() {
    return this.mode !== TournamentManagerMode.CREATE;
  }
}
