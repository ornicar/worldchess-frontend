import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, NEVER, Observable } from 'rxjs';
import { debounceTime, filter, map, switchMap, take } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../../../reducers';
import * as fromAccount from '../../account-store/account.reducer';
import * as fromTournament from '../../../broadcast/core/tournament/tournament.reducer';
import { ApprovalStatus, FounderTournament, TournamentStatus } from '@app/broadcast/core/tournament/tournament.model';
import { DeleteMyTournament } from '@app/broadcast/core/tournament/tournament.actions';
import { FounderStatus, IAccount } from '../../account-store/account.model';
import { CancelFounderStatus, RequestFounderStatus } from '@app/account/account-store/account.actions';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';

const approveStatuses: {
  [key in  ApprovalStatus]: string
} = {
  [ApprovalStatus.NOT_APPROVED]: 'Not Approved',
  [ApprovalStatus.REQUESTED]: 'Approve Requested',
  [ApprovalStatus.APPROVED]: 'Approved',
};

const tournamentStatuses = { 1: 'Expected', 2: 'Goes', 3: 'Completed'};
@Component({
  selector: 'wc-my-tournaments-list',
  templateUrl: './my-tournaments-list.component.html',
  styleUrls: ['./my-tournaments-list.component.scss']
})
export class MyTournamentsListComponent {
  approveStatuses = approveStatuses;
  tournamentStatuses = tournamentStatuses;

  constructor(private router: Router,
    private store$: Store<fromRoot.State>,
    private modal: ModalWindowsService) { }

  myAccount$: Observable<IAccount> = this.store$.pipe(
    select(fromAccount.selectMyAccount)
  );

  selectTournamentsByFounder = fromTournament.selectFounderTournamentsByFounder();

  myTournaments$: Observable<FounderTournament[]> = this.myAccount$.pipe(
    filter(Boolean),
    switchMap(account => this.store$.pipe(
      select(this.selectTournamentsByFounder, { accountId: account.id })
    )),
    debounceTime(10),
  );

  hasTournamentsOnApprove$ = this.myTournaments$.pipe(
    map((tournaments: FounderTournament[]) => {
      return tournaments.some((t: FounderTournament) => t.approve_status === ApprovalStatus.REQUESTED);
    }),
  );

  hasGoesTournament$ = this.myTournaments$.pipe(
    map((tournaments: FounderTournament[]) => {
      return tournaments.some((t: FounderTournament) => t.status === TournamentStatus.GOES);
    }),
  );

  founderStatus$ = this.myAccount$.pipe(
    map((account: IAccount) => account ? account.founder_approve_status : FounderStatus.NONE),
  );

  FounderStatus = FounderStatus;

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

  onDelete(tournament: FounderTournament) {
    // open delete modal
    if (tournament.status === TournamentStatus.GOES) {
      this.modal.alert('', `You cannot remove your 'Organizer' status until your events finish.
        Please repeat the request once the events are finished. Thank you!`);
    } else {
      if (confirm('Ara you sure you want to delete this tournament?')) {
        this.store$.dispatch(new DeleteMyTournament({ id: tournament.id }));
      }
    }
    // on yes => delete request => on success get new list
  }

  requestFounderStatus() {
    this.store$.dispatch(new RequestFounderStatus());
  }

  cancelFounderStatus() {
    combineLatest(
      this.hasTournamentsOnApprove$,
      this.hasGoesTournament$,
    ).pipe(
      take(1),
      switchMap(([ hasTournamentsOnApprove, hasGoesTournaments ]) => {
        if (hasGoesTournaments) {
          return this.modal.alert(
            'discard',
            '<p>You cannot remove your \'Organizer\' status until your events finish.</p><p>Please repeat the request once the events are finished.</p><p>Thank you!</p>').pipe(
            switchMap(() => NEVER),
          );
        } else if (hasTournamentsOnApprove) {
          return this.modal.confirm(
            'discard',
            'You have Tournament approval tickets pending. If you remove your \'Organizer\' status, all of your approval tickets will be cancelled.',
            550,
            'Remove Organizer Status',
            'Never mind').pipe(
            filter(confirm => confirm),
          );
        } else {
          return this.modal.confirm('discard', 'Are you sure you want to discard it?').pipe(
            filter(confirm => confirm),
          );
        }

      })
    ).subscribe(() => this.store$.dispatch(new CancelFounderStatus()));
  }
}
