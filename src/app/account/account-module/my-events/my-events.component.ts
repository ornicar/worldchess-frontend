import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../reducers';
import { GetMyTournaments } from '../../../broadcast/core/tournament/tournament.actions';
import { GetCountries } from '../../../broadcast/core/country/country.actions';


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
export class MyEventsComponent implements OnInit {
  constructor(private store$: Store<fromRoot.State>) { }
  ngOnInit() {
    this.store$.dispatch((new GetMyTournaments()));
    this.store$.dispatch(new GetCountries());
  }

}
