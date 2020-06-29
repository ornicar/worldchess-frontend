import { Component, OnInit } from '@angular/core';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import * as moment from 'moment';
import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlayerResourceService } from '@app/broadcast/core/player/player-resource.service';

@Component({
  selector: 'game-main-tournament',
  templateUrl: './game-main-tournament.component.html',
  styleUrls: ['./game-main-tournament.component.scss']
})
export class GameMainTournamentComponent implements OnInit {
  window = window;
  constructor(gameResourceService: GameResourceService,
              playerResourceService: PlayerResourceService) {
    this.gameResourceService = gameResourceService;
    this.playerResourceService = playerResourceService;
  }

  private gameResourceService: GameResourceService;
  private playerResourceService: PlayerResourceService;

  endTime = moment().utcOffset(0).format('MM/DD/YYYY HH:mm:ss');
  startOfDay = moment().utcOffset(0).startOf('day').format('MM/DD/YYYY HH:mm:ss');
  monthAgo = moment().startOf('day').subtract(30, 'day').format('MM/DD/YYYY HH:mm:ss');

  tournamentCount$: Observable<string> = of('-');
  tournamentCount$Today$: Observable<string> = of('-');

  playersCount$: Observable<string> = of('-');
  onlinePlayersCount$: Observable<string> = of('-');

  ngOnInit() {
    this.tournamentCount$ = this.gameResourceService.getOnlineTournamentsCount(
      this.monthAgo, this.endTime
    ).pipe(map(v => `${v || 0}`));
    this.tournamentCount$Today$ = this.gameResourceService.getOnlineTournamentsCount(
      this.startOfDay, this.endTime
    ).pipe(map(v => `${v || 0}`));
    this.playersCount$ = this.playerResourceService.getAllCount().pipe(map(v => `${v || 0}`));
    this.onlinePlayersCount$ = this.playerResourceService.getOnlinePlayersCount().pipe(map(v => `${v || 0}`));
  }

}
