import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IPlayerResults } from '../../core/result/result.model';

@Component({
  selector: 'wc-results-list-swiss',
  templateUrl: 'results-list-swiss.component.html',
  styleUrls: ['results-list-swiss.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsListSwissComponent {
  @Input() playersResults: IPlayerResults[];

  public trackByFn(index: number, playerResults: IPlayerResults): number {
    return playerResults.player.fide_id;
  }
}
