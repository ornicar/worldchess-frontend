import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {ITournament} from "@app/modules/main/model/tournament";

@Component({
  selector: 'offline-tournament-block',
  templateUrl: './offline-tournament-block.component.html',
  styleUrls: ['./offline-tournament-block.component.scss']
})
export class OfflineTournamentBlockComponent implements OnInit {
  count = 0;
  constructor() { }

  @Input()
  data: ITournament[];

  @Input()
  hideButton:  boolean = false;

  tournaments$: BehaviorSubject<ITournament[]> = new BehaviorSubject<ITournament[]>([]);

  ngOnInit() {
     this.tournaments$.next(this.data || [])
     this.count = this.tournaments$.value.length;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'].currentValue!==this.tournaments$.value){
      this.tournaments$.next(changes['data'].currentValue || [])
    }
  }
}
