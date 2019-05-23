import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../reducers';
import { SubscriptionHelper } from '../../../shared/helpers/subscription.helper';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  FounderTournament,
  TournamentType,
  TournamentStatus,
  TTournamentPrizeCurrency,
} from '../../../broadcast/core/tournament/tournament.model';
import { TournamentLoadService } from '../../../broadcast/core/tournament/tournament-load.service';
import { ManageTournamentTab, TabValue, tournamentManagerTabs } from '../manage-tournament/manage-tournament';

@Component({
  selector: 'wc-manage-tournament-main',
  templateUrl: './manage-tournament-main.component.html',
  styleUrls: ['./manage-tournament-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageTournamentMainComponent extends ManageTournamentTab implements OnInit, OnDestroy {
  selectedTabValue: TabValue = tournamentManagerTabs[0].value;
  // not needed if we use it in all components separately

  tournamentTypes = [
    { value: TournamentType.MATCH, title: 'Match' },
    { value: TournamentType.CIRCULAR, title: 'Circular' },
    { value: TournamentType.PLAYOFF, title: 'PlayOff' },
    { value: TournamentType.SWISS, title: 'Swiss' },
  ];

  tournamentStatuses = [
    { value: TournamentStatus.EXPECTED, title: 'Expected' },
    { value: TournamentStatus.GOES, title: 'Goes' },
    { value: TournamentStatus.COMPLETED, title: 'Completed' },
  ];

  tournamentPrizeCurrency: { value:  TTournamentPrizeCurrency, title: TTournamentPrizeCurrency}[] = [
    { value: 'EUR', title: 'EUR', },
    { value: 'USD', title: 'USD' },
  ];

  changes = null;

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
    if (tournament) {
      return this.fb.group({
        tournament_type: [tournament.tournament_type, Validators.required],
        title: [tournament.title, Validators.required],
        additional_title: [tournament.additional_title, Validators.required],
        datetime_of_tournament: [tournament.datetime_of_tournament, Validators.required],
        datetime_of_finish: [tournament.datetime_of_finish], // parse date & time and mix for save
        status: [tournament.status, Validators.required],
        image: [tournament.image],
        prize_fund: [tournament.prize_fund],
        prize_fund_currency: [tournament.prize_fund_currency],
        location: [tournament.location, Validators.required]
      });

    } else {
      return this.fb.group({
        tournament_type: [null, Validators.required],
        title: [null, Validators.required],
        additional_title: [null, Validators.required],
        datetime_of_tournament: [null],
        datetime_of_finish: [null], // parse date & time and mix for save
        status: [null, Validators.required],
        image: [null],
        prize_fund: [null],
        prize_fund_currency: [this.tournamentPrizeCurrency[1]],
        location: [null, Validators.required]
      });
    }
  }

  onFileLoad(files) {
    const file = files[0];
    if (this.form) {
      this.form.get('image').setValue(file);
    }
    this.cd.markForCheck();
  }

  getImage() {
    const file = this.form.get('image').value;
    return typeof file === 'string' ? file : null;
  }

  getErrorMessage(mes) {
    if (typeof mes === 'string') {
      return mes;
    } else {
      return '';
    }
  }

  getDate(controlName) {
    const value = this.form.get(controlName).value;
    return value ? value.slice(0, 16) : null;
  }

}
