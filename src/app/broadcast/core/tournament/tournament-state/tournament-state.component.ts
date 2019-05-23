import { NgClass } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, OnInit, Self, SimpleChanges } from '@angular/core';
import { Tournament, TournamentState } from '../tournament.model';
import { OnChangesInputObservable, OnChangesObservable } from '../../../../shared/decorators/observable-input';
import { BehaviorSubject, Subscription } from 'rxjs';
import { getTournamentState } from '../tournament.reducer';
import * as moment from 'moment';


@Component({
  selector: 'wc-tournament-state',
  templateUrl: './tournament-state.component.html',
  styleUrls: ['./tournament-state.component.scss'],
  providers: [
    NgClass
  ]
})
export class TournamentStateComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tournament: Tournament;
  
  @OnChangesInputObservable()
  tournament$ = new BehaviorSubject<Tournament>(this.tournament);

  public stateText: string;
  public stateDate: Date;
  public monthCount: number;

  private tournamentSs: Subscription;

  constructor(@Self() private ngClass: NgClass) {}

  ngOnInit(): void {
    this.tournamentSs = this.tournament$
      .subscribe((t) => this.updateView(t));
  }

  @OnChangesObservable()
  ngOnChanges(changes: SimpleChanges): void {
  }

  private setComponentClass(className) {
    this.ngClass.ngClass = className;
    this.ngClass.ngDoCheck();
  }

  ngOnDestroy(): void {
    if (this.tournamentSs) {
      this.tournamentSs.unsubscribe();
    }
  }

  updateView(tournament) {
    const state = getTournamentState(tournament);

    this.monthCount = moment
      .duration(moment(tournament.datetime_of_tournament, 'YYYY/MM/DD HH:mm')
        .diff(moment.now())
      ).months();

    switch (state) {
      case TournamentState.TBD: {
        this.stateText = 'Date TBD';
        this.stateDate = null;
        this.setComponentClass('state--tbd');
        break;
      }

      case TournamentState.Start: {
        this.stateText = 'Starts in';
        this.stateDate = tournament.datetime_of_tournament;
        this.setComponentClass('state--starts');
        break;
      }

      case TournamentState.Live: {
        this.stateText = 'Watch Live';
        this.stateDate = null;
        this.setComponentClass('state--live');
        break;
      }

      case TournamentState.Webcast: {
        this.stateText = 'Watch Webcast';
        this.stateDate = null;
        this.setComponentClass('state--webcast');
        break;
      }
    }
  }
}
