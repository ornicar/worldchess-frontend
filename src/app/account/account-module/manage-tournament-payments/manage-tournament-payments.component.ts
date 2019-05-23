import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ManageTournamentTab, TabValue } from '../manage-tournament/manage-tournament';
import { SubscriptionHelper } from '../../../shared/helpers/subscription.helper';
import * as fromRoot from '../../../reducers';
import { TournamentLoadService } from '../../../broadcast/core/tournament/tournament-load.service';
import { FounderTournament, BroadcastType } from '../../../broadcast/core/tournament/tournament.model';


@Component({
  selector: 'wc-manage-tournament-payments',
  templateUrl: './manage-tournament-payments.component.html',
  styleUrls: ['./manage-tournament-payments.component.scss']
})
export class ManageTournamentPaymentsComponent extends ManageTournamentTab implements OnInit, OnDestroy {
  selectedTabValue: TabValue = 'payments';

  broadcastTypes = [
    { value: BroadcastType.FREE, title: 'Free'},
    { value: BroadcastType.PAY, title: 'Pay'},
    { value: BroadcastType.ONLY_TICKET, title: 'Tickets Only'},
  ];

  constructor(protected route: ActivatedRoute,
    protected router: Router,
    protected cd: ChangeDetectorRef,
    protected store$: Store<fromRoot.State>,
    protected fb: FormBuilder,
    protected tournamentLoad: TournamentLoadService) {
    super(route, router, cd, store$, fb, tournamentLoad);
  }

  ngOnInit() {
    this.initParams();
    this.initFormAndChanges();
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  public initFormByTournament(tournament: FounderTournament): FormGroup {
    return this.fb.group({
      broadcast_type: [tournament.broadcast_type],
      ticket_price: [tournament.ticket_price]
    });
  }
}
