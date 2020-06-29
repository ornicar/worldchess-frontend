import {Component, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {IPlayerCompetitors} from "@app/modules/app-common/services/player-rating.model";
import {PlayerRatingResourceService} from "@app/modules/app-common/services/player-rating-resource.service";

@Component({
  selector: 'main-page-online-champions',
  templateUrl: './main-page-online-champions.component.html',
  styleUrls: ['./main-page-online-champions.component.scss']
})
export class MainPageOnlineChampionsComponent implements OnInit
{
  constructor() {
  }

  @Input()
  data: IPlayerCompetitors[] = [];

  ngOnInit() {
  }
}
