import {Component, OnInit} from '@angular/core';
import {map, toArray} from "rxjs/operators";
import {Observable} from "rxjs";
import {IBarItem, PlayerDataService} from "@app/modules/game/service/player-data-service";

@Component({
  selector: 'wc-game-main-players-bar',
  templateUrl: './game-main-players-bar.component.html',
  styleUrls: ['./game-main-players-bar.component.scss']
})
export class GameMainPlayersBarComponent implements OnInit {

  private playerRatingsDataService: PlayerDataService;

  data$: Observable<IBarItem[]>;

  constructor(playerRatingsDataService: PlayerDataService) {
    this.playerRatingsDataService = playerRatingsDataService;
  }


  ngOnInit() {
    this.data$ = this.playerRatingsDataService.getAll().pipe(map(arr => {
      const arrRes = (arr || []).filter(item=>item.result && item.result>=1 && item.result<=3);
      if (arrRes.length <= 0) {
        return []
      }
      const koef = Math.ceil(30 / arrRes.length);
      let res: IBarItem[] = [];
      for (let i = 0; i < koef; i++) {
        res.push(...arrRes);
      }
      return res;
    }));
  }

}
