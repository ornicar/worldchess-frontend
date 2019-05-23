import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { filter, first, mergeMap, distinctUntilChanged } from 'rxjs/operators';
import * as moment from 'moment';
import * as fromTournament from '../../../broadcast/core/tournament/tournament.reducer';
import * as fromAuth from '../../../auth/auth.reducer';
import { OnlineTournament, TournamentResourceType } from '../../../broadcast/core/tournament/tournament.model';
import {
  GetTournaments,
  SignupToTournament,
  ClearSignedTournament,
  SignupToTournamentErrorClear,
  UpdateOnlineTournaments,
} from '../../../broadcast/core/tournament/tournament.actions';
import { selectIsInit, selectProfile } from '../../../auth/auth.reducer';
import { IProfile } from '../../../auth/auth.model';
import { ModalWindowsService } from '../../../modal-windows/modal-windows.service';
import { SubscriptionHelper, Subscriptions } from '../../../shared/helpers/subscription.helper';
import { selectFideId } from '../../../account/account-store/account.reducer';

@Component({
  selector: 'wc-tournament-online-list',
  templateUrl: 'tournament-online-list.component.html',
  styleUrls: ['tournament-online-list.component.scss'],
})
export class TournamentOnlineListComponent implements OnInit, OnDestroy {
  tournamentsList$: Observable<OnlineTournament[]> = this.store$.select(fromTournament.selectOnlineTournaments);
  signedTournament$: Observable<OnlineTournament> = this.store$.select(fromTournament.selectOnlineSignedTournament);
  errorMsg$: Observable<string> = this.store$.select(fromTournament.selectOnlineTournamentSignupErrorMsg);
  profile$ = this.store$.pipe(select(selectProfile));
  isAuthorized$: Observable<boolean> = this.store$.select(fromAuth.selectIsAuthorized);
  fideId$ = this.store$.select(selectFideId);
  userProfile: IProfile;

  subs: Subscriptions = {};

  constructor(
    private store$: Store<fromTournament.State>,
    private router: Router,
    private modal: ModalWindowsService,
  ) { }

  ngOnInit() {
    this.subs.updateTournaments = combineLatest(this.isAuthorized$, this.fideId$).pipe(
      distinctUntilChanged(),
    ).subscribe(() =>  this.store$.dispatch(new UpdateOnlineTournaments()));

    this.subs.getOnlineTournaments = this.store$
      .pipe(
        select(selectIsInit),
        filter(isInit => Boolean(isInit)),
        first(),
      )
      .subscribe(() => this.store$.dispatch(new GetTournaments({ options: { resourcetype: TournamentResourceType.OnlineTournament } })));

    this.subs.userProfile = this.profile$.subscribe(profile => this.userProfile = profile);

    this.subs.signedTournament = this.signedTournament$.subscribe((tournament) => {
      if (tournament === null) {
        return;
      }

      const tournamentTime = moment(tournament.signup_datetime.upper).format('HH:mm MM.DD.YYYY');
      const message = `<p>The tournament will start at ${tournamentTime}</p><p>Please be ready</p>`;
      this.modal.alert('You\'ve been registered successfully!', message).subscribe(() => this.store$.dispatch(new ClearSignedTournament()));
    });

    this.subs.errorMsg = this.errorMsg$
      .pipe(
        filter(msg => msg !== null),
        mergeMap(msg => this.modal.alert('Error', msg))
      )
      .subscribe(() => this.store$.dispatch(new SignupToTournamentErrorClear()));
  }

  onClickRegister(event: Event, tournamentId: number, tournament) {
    event.stopPropagation();

    if (!this.userProfile) {
      this.router.navigate(['/sign-in']);
    } else if (this.userProfile.fide_id) {
      this.store$.dispatch(new SignupToTournament({id: tournamentId}));
    } else {
      const message = `
      <p>You should have FIDE ID to registering to this tournament.</p>
      <a href="${this.router.createUrlTree(['/account', 'profile-fide-id']).toString()}">Follow this link for getting FIDE ID.</a>
      `;
      this.modal.alert('FIDE ID needed', message).subscribe(() => {});
    }
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  onClickItem(tournament: OnlineTournament) {
    this.router.navigate(['/online-tournament', tournament.id]);
  }

}
