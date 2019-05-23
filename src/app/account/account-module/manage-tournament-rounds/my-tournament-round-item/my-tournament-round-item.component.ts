import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'wc-my-tournament-round-item',
  templateUrl: './my-tournament-round-item.component.html',
  styleUrls: ['./my-tournament-round-item.component.scss']
})
export class MyTournamentRoundItemComponent implements OnInit {
  @Input() form: FormGroup;
  constructor() { }

  ngOnInit() {
  }

}
