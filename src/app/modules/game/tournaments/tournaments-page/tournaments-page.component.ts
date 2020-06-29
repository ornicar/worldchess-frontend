import { Component, OnDestroy, OnInit } from '@angular/core';
import { GamingSelectorMode } from '../../gaming-selector/gaming-selector.component';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { Observable, Subject } from 'rxjs';
import { IOnlineTournament } from '@app/modules/game/tournaments/models/tournament.model';
import * as moment from 'moment';
import { select, Store } from '@ngrx/store';
import { selectIsAuthorized } from '@app/auth/auth.reducer';
import * as fromRoot from '@app/reducers';

@Component({
  selector: 'wc-tournaments',
  templateUrl: './tournaments-page.component.html',
  styleUrls: ['./tournaments-page.component.scss']
})
export class TournamentsPageComponent implements OnInit, OnDestroy {
  GamingSelectorMode = GamingSelectorMode;

  destroy$ = new Subject();
  onlineTournaments$: Observable<IOnlineTournament[]>;
  myUpcomingTournaments$: Observable<IOnlineTournament[]>;

  startTime = moment().subtract({ hours: 12 });
  endTime = moment().add({ hours: 24 });
  isAuthorized$ = this.store.pipe(
    select(selectIsAuthorized),
  );

  constructor(
    private gameResourceService: GameResourceService,
    private store: Store<fromRoot.State>
  ) {
    this.onlineTournaments$ = this.gameResourceService.getOnlineTournaments(
      this.startTime.utcOffset(0).format('MM/DD/YYYY HH:mm:ss'),
      this.endTime.utcOffset(0).format('MM/DD/YYYY HH:mm:ss'),
      false,
    );
    this.myUpcomingTournaments$ = this.gameResourceService.getOnlineTournaments(
      moment().utcOffset(0).format('MM/DD/YYYY HH:mm:ss'),
      this.endTime.utcOffset(0).format('MM/DD/YYYY HH:mm:ss'),
      true,
    );
  }

  ngOnInit() {
  }

  createTournament() {
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
