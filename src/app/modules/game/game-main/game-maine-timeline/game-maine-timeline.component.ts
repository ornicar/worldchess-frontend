import { Component, OnInit } from '@angular/core';
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {IOnlineTournament} from "@app/modules/game/tournaments/models/tournament.model";
import {GameResourceService} from "@app/modules/game/state/game.resouce.service";
import * as moment from "moment";

@Component({
  selector: 'game-maine-timeline',
  templateUrl: './game-maine-timeline.component.html',
  styleUrls: ['./game-maine-timeline.component.scss']
})
export class GameMaineTimelineComponent implements OnInit {

  startTime = moment().subtract({ hours: 12 });
  endTime = moment().add({ hours: 24 });

  constructor(private gameResourceService: GameResourceService,) {

  }

  onlineTournaments$: Subject<IOnlineTournament[]> = new Subject<IOnlineTournament[]>();

  ngOnInit() {
    this.gameResourceService.getOnlineTournaments(
      this.startTime.utcOffset(0).format('MM/DD/YYYY HH:mm:ss'),
      this.endTime.utcOffset(0).format('MM/DD/YYYY HH:mm:ss'),
      false,
    ).subscribe(t => {
        this.onlineTournaments$.next(t);
      }
    );
  }

}
