import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ITour } from '../../../../core/tour/tour.model';
import { Tournament } from '../../../../core/tournament/tournament.model';

@Component({
  selector: 'wc-history-moves-placeholder',
  templateUrl: './history-moves-placeholder.component.html',
  styleUrls: ['./history-moves-placeholder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryMovesPlaceholderComponent {

  @Input()
  myGameIsActive = false;

  @Input()
  hideMoveNumbers = false;

  @Input()
  tour: ITour;

  @Input()
  tournament: Tournament;
}
