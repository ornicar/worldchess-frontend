import {Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {IOnlineTournament} from "@app/modules/game/tournaments/models/tournament.model";
import {TournamentService} from "@app/modules/app-common/services/tournament.service";
import * as moment from "moment";

@Component({
  selector: 'main-page-tournaments-today',
  templateUrl: './main-page-tournaments-today.component.html',
  styleUrls: ['./main-page-tournaments-today.component.scss']
})
export class MainPageTournamentsTodayComponent implements OnInit {

  constructor() { }

  @Input()
  data:IOnlineTournament[] = [];

  tournamentsRowOne$ = new BehaviorSubject<IOnlineTournament[]>([]);
  tournamentsRowTwo$ = new BehaviorSubject<IOnlineTournament[]>([]);


  extendArray = (array:IOnlineTournament[], minSize: number = 10)=>{
    if (array.length===0){
      return array;
    }
    let res = [...array] as  IOnlineTournament[];
    while (res.length<minSize){
      res.push(...array);
    }
    return res;
  }

  ngOnInit() {
      const resp = this.data || [];
      if (resp.length>0){
        if (resp.length<5){
          this.tournamentsRowOne$.next(this.extendArray(resp));
        } else {
          this.tournamentsRowOne$.next(this.extendArray(resp.slice(0, Math.round(resp.length/2))));
          this.tournamentsRowTwo$.next(this.extendArray(resp.slice(Math.round(resp.length/2))));
        }
      }
  }
}
