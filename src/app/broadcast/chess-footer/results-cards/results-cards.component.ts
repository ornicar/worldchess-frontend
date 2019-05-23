import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IPlayerResults } from '../../core/result/result.model';
import { IPlayer } from '../../core/player/player.model';

@Component({
  selector: 'results-cards',
  templateUrl: 'results-cards.component.html',
  styleUrls: ['results-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsCardsComponent {
  @Input() playersResults: IPlayerResults[];

  public parseInt(value: number): number {
    return Number.parseInt(String(value), 10);
  }

  public isInteger(value: number): boolean {
    return Number.isInteger(value);
  }

  public trackByFn(index: number, playerResults: IPlayerResults): number {
    return playerResults.player.fide_id;
  }
}
