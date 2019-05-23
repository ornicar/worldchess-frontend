import { Component, OnInit, Output, EventEmitter, Input, OnChanges  } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject } from 'rxjs';
import * as fromRoot from '../../../reducers';
import { Tournament, TournamentResourceType } from '../../core/tournament/tournament.model';
import { OnChangesObservable, OnChangesInputObservable } from '../../../shared/decorators/observable-input';

@Component({
  selector: 'wc-chess-footer-info',
  templateUrl: './chess-footer-info.component.html',
  styleUrls: ['./chess-footer-info.component.scss']
})
export class ChessFooterInfoComponent implements OnInit, OnChanges {
  @Output() public goToMedia = new EventEmitter();
  @Input() public showMedia = true;

  @Input() public tournament = null;

  @OnChangesInputObservable('tournament')
  tournament$: Observable<Tournament> = new BehaviorSubject<Tournament>(this.tournament);

  constructor(private store$: Store<fromRoot.State>) { }

  ngOnInit() {
  }

  @OnChangesObservable()
  ngOnChanges() {
  }
}
