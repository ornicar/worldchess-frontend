import { Component, OnInit } from '@angular/core';
import {ITournament, TournamentResourceType} from "@app/modules/main/model/tournament";
import {OfflineTournamentService} from "@app/modules/app-common/services/offline-tournament.service";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'wc-watch-page',
  templateUrl: './watch-page.component.html',
  styleUrls: ['./watch-page.component.scss']
})
export class WatchPageComponent implements OnInit {

  constructor(private offlineTournamentService: OfflineTournamentService) { }

  tournaments$:BehaviorSubject<ITournament[]> = new BehaviorSubject<ITournament[]>([]);

  ngOnInit() {
    this.offlineTournamentService.findTournaments({resourcetype: TournamentResourceType.Tournament}).subscribe(
      val => {
        this.tournaments$.next(val.results || []);
      }
    );
  }



}
