import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { Observable, of } from 'rxjs';
import * as moment from 'moment';
import { PlayerResourceService } from '@app/broadcast/core/player/player-resource.service';

@Component({
  selector: 'game-main-join-tournament',
  templateUrl: './game-main-join-tournament.component.html',
  styleUrls: ['./game-main-join-tournament.component.scss']
})
export class GameMainJoinTournamentComponent implements OnInit {

  constructor(private gameResourceService: GameResourceService,
              private playerResourceService: PlayerResourceService
  ) {
  }

  tournamentCount$: Observable<string> = of('-');
  playersCount$: Observable<string> = of('-');

  endTime = moment().utcOffset(0).format('MM/DD/YYYY HH:mm:ss');
  startOfDay = moment().utcOffset(0).startOf('day').format('MM/DD/YYYY HH:mm:ss');
  monthAgo = moment().startOf('day').subtract(30, 'day').format('MM/DD/YYYY HH:mm:ss');


  ngOnInit() {
    this.tournamentCount$ = this.gameResourceService.getOnlineTournamentsCount(
      this.monthAgo, this.endTime
    ).pipe(map(v => `${v || 0}`));
    this.playersCount$ = this.playerResourceService.getAllCount().pipe(map(v => `${v || 0}`));
  }

}
