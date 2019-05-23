import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import * as fromRoot from '../../../reducers';
import * as fromAccount from '../../account-store/account.reducer';
import * as fromTournament from '../../../broadcast/core/tournament/tournament.reducer';
import { FounderTournament, ApprovalStatus } from '../../../broadcast/core/tournament/tournament.model';
import { DeleteMyTournament } from '../../../broadcast/core/tournament/tournament.actions';
import { IAccount } from '../../account-store/account.model';

const approveStatuses = ['Approved', 'Not Approved', 'Approve Requested' ];

const tournamentStatuses = { 1: 'Expected', 2: 'Goes', 3: 'Completed'};
@Component({
  selector: 'wc-my-tournaments-list',
  templateUrl: './my-tournaments-list.component.html',
  styleUrls: ['./my-tournaments-list.component.scss']
})
export class MyTournamentsListComponent implements OnInit {
  approveStatuses = approveStatuses;
  tournamentStatuses = tournamentStatuses;

  constructor(private router: Router, private store$: Store<fromRoot.State>) { }

  myAccount$: Observable<IAccount> = this.store$.pipe(
    select(fromAccount.selectMyAccount)
  );

  selectTournamentsByFounder = fromTournament.selectFounderTournamentsByFounder();

  myTournaments$: Observable<FounderTournament[]> = this.myAccount$.pipe(
    switchMap(account => this.store$.pipe(
      select(this.selectTournamentsByFounder, { accountId: account.id })
    ))
  );

  ngOnInit() {
  }

  onCreate() {
    // route to create
    this.router.navigate(['/account/events/create/0']);
  }

  isEditAvailable(tournament: FounderTournament) {
    return tournament.approve_status === ApprovalStatus.NOT_APPROVED;
  }
  onEdit(tournamentId: number) {
    this.router.navigate([`/account/events/edit/${tournamentId}`]);
    // route to edit
  }

  onDelete(id: number) {
    // open delete modal
    if (confirm('Ara you sure you want to delete this tournament?')) {
      this.store$.dispatch(new DeleteMyTournament({id}));
    }
    // on yes => delete request => on success get new list
  }

  onView() {
    // route to view
  }

}
