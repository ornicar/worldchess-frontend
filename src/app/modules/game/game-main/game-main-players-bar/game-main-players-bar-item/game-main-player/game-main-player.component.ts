import {Component, Input, OnInit} from '@angular/core';
import {IPlayer} from "@app/modules/game/service/player-data-service";


@Component({
  selector: 'wc-game-main-player',
  templateUrl: './game-main-player.component.html',
  styleUrls: ['./game-main-player.component.scss']
})
export class GameMainPlayerComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

  @Input() value: IPlayer;


}
