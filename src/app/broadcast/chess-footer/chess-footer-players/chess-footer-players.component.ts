import {
  Component,
  Output,
  EventEmitter,
  OnDestroy,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  OnChanges,
  Input,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Tournament } from '../../core/tournament/tournament.model';
import { OnChangesObservable, OnChangesInputObservable } from '../../../shared/decorators/observable-input';

@Component({
  selector: 'wc-chess-footer-players',
  templateUrl: './chess-footer-players.component.html',
  styleUrls: ['./chess-footer-players.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChessFooterPlayersComponent implements OnDestroy, OnChanges {
  @Output() changeTab = new EventEmitter();
  @Input() tournament = null;

  @OnChangesInputObservable('tournament')
  public tournament$ = new BehaviorSubject<Tournament>(this.tournament);

  // TODO доставать игроков отдельным запросом с лимитом и модалкой
  constructor() {
  }

  @OnChangesObservable()
  public ngOnChanges() {
  }

  public ngOnDestroy() {
  }

}
