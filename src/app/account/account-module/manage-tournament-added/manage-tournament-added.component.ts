import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import * as fromRoot from '../../../reducers';
import { ChangeDetectionStrategy } from '@angular/core';
import { SubscriptionHelper } from '../../../shared/helpers/subscription.helper';
import * as fromCountry from '../../../broadcast/core/country/country.reducer';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FounderTournament } from '../../../broadcast/core/tournament/tournament.model';
import { TournamentLoadService } from '../../../broadcast/core/tournament/tournament-load.service';
import { ManageTournamentTab, TabValue } from '../manage-tournament/manage-tournament';

@Component({
  selector: 'wc-manage-tournament-added',
  templateUrl: './manage-tournament-added.component.html',
  styleUrls: ['./manage-tournament-added.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageTournamentAddedComponent extends ManageTournamentTab implements OnInit, OnDestroy {
  selectedTabValue: TabValue = 'added';

  countries$ = this.store$.pipe(
    select(fromCountry.selectAll),
  );

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

  public initFormByTournament(tournament: FounderTournament): FormGroup {
    return this.fb.group({
      results: [tournament.results],
      rules: [tournament.rules],
      country: [tournament.country],
      main_referee: [tournament.main_referee],
      tournament_director: [tournament.tournament_director],
      about: [tournament.about],
      press: [tournament.press],
      contacts: [tournament.contacts],
    });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  onFileLoad(fieldName: string, files: any[]) {
    const file = files[0];
    if (this.form && this.form.contains(fieldName)) {
      this.form.get(fieldName).setValue(file);
      this.cd.markForCheck();
    }
  }

  showFile(filePath: string) {
    window.open(filePath, '_blank');
  }

}
