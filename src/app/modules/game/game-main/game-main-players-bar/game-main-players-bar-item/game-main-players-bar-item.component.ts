import {Component, Input, OnInit} from '@angular/core';
import {IBarItem} from "@app/modules/game/service/player-data-service";

@Component({
  selector: 'wc-game-main-players-bar-item',
  templateUrl: './game-main-players-bar-item.component.html',
  styleUrls: ['./game-main-players-bar-item.component.scss']
})
export class GameMainPlayersBarItemComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Input() value: IBarItem
}
