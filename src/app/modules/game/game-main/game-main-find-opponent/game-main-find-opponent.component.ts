import { Component, OnInit } from '@angular/core';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { PlayerResourceService } from '@app/broadcast/core/player/player-resource.service';
import { Observable, of } from 'rxjs';
import * as moment from 'moment';
import { map } from 'rxjs/operators';

@Component({
  selector: 'game-main-find-opponent',
  templateUrl: './game-main-find-opponent.component.html',
  styleUrls: ['./game-main-find-opponent.component.scss']
})
export class GameMainFindOpponentComponent implements OnInit {
  window = window;
  constructor(private gameResourceService: GameResourceService,
              private playerResourceService: PlayerResourceService
  ) {
  }

  playersCount$: Observable<string> = of('-');
  currentPlayersCount$: Observable<string> = of('-');

  endTime = moment().utcOffset(0).format('MM/DD/YYYY HH:mm:ss');
  startOfDay = moment().utcOffset(0).startOf('day').format('MM/DD/YYYY HH:mm:ss');
  monthAgo = moment().startOf('day').subtract(30, 'day').format('MM/DD/YYYY HH:mm:ss');

  ngOnInit() {
    this.playersCount$ = this.playerResourceService.getAllCount().pipe(map(v => `${v || 0}`));
    this.currentPlayersCount$ = this.playerResourceService.getOnlinePlayersCount().pipe(map(v => `${v || 0}`));
  }
}
