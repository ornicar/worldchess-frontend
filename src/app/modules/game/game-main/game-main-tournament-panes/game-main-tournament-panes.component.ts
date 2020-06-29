import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {GameResourceService} from '@app/modules/game/state/game.resouce.service';
import * as moment from 'moment';
import {IOnlineTournament} from '@app/modules/game/tournaments/models/tournament.model';

@Component({
  selector: 'wc-game-main-tournament-panes',
  templateUrl: './game-main-tournament-panes.component.html',
  styleUrls: ['./game-main-tournament-panes.component.scss']
})
export class GameMainTournamentPanesComponent implements OnInit {

  private static COUNT: number = 5;

  constructor(gameResourceService: GameResourceService) {
    this.gameResourceService = gameResourceService;
  }

  private gameResourceService: GameResourceService;
  now = moment().utcOffset(0);
  nowDate = moment().utcOffset(0).format('MM/DD/YYYY HH:mm:ss');
  fromDate = moment().utcOffset(0).subtract(48, 'hour').format('MM/DD/YYYY HH:mm:ss');
  toDate = moment().utcOffset(0).add(36, 'hour').format('MM/DD/YYYY HH:mm:ss');

  topFiveTournaments$ = new BehaviorSubject<IOnlineTournament[]>([]);


  ngOnInit() {
    this.gameResourceService.getOnlineTournaments(
      this.nowDate,
      this.toDate,
      undefined,
      undefined,
      GameMainTournamentPanesComponent.COUNT,
    ).subscribe(arr => {
      const temp = (arr || []);
      const countLeft = GameMainTournamentPanesComponent.COUNT - temp.length;

      if (countLeft > 0) {
        this.addPrevisousTournaments(countLeft, temp);
      } else {
        this.topFiveTournaments$.next(temp);
      }
    });
  }

  private addPrevisousTournaments(countLeft, temp) {
    this.gameResourceService.getOnlineTournaments(
      this.fromDate,
      this.nowDate,
      undefined,
      undefined,
      countLeft,
      "desc"
    ).subscribe(arr2 => {
      temp.push(...(arr2 || []))
      for (let i = 0; i < GameMainTournamentPanesComponent.COUNT - temp.length; i++) {
        temp.push({})
      }
      this.topFiveTournaments$.next(temp);
    })
  }
}
