import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { IPlayerResults, IResultRecord, Result } from '../../core/result/result.model';
import { IPlayer } from '@app/broadcast/core/player/player.model';

@Component({
  selector: 'wc-results-list-swiss',
  templateUrl: 'results-list-swiss.component.html',
  styleUrls: ['results-list-swiss.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsListSwissComponent {
  @Input() playersResults: IPlayerResults[];
  showPlayerInfo = false;
  selectedResult: IPlayerResults;

  constructor(private cd: ChangeDetectorRef) {}

  public trackByFn(index: number, playerResults: IPlayerResults): number {
    return playerResults.player.fide_id;
  }

  private scrollY = null;
  togglePlayerInfo(open: boolean, player?: IPlayerResults) {
    this.showPlayerInfo = open;
    if(open) {
      this.scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
    } else {
      document.body.style.overflow = null;
      document.body.style.position = null;
      if (this.scrollY) {
        window.scrollTo({top: this.scrollY});
        this.scrollY = null;
      }
    }
    if (player) {
      this.selectedResult = player;
    } else if (!open) {
      setTimeout(() => {
        this.selectedResult = null;
      }, 1);
    }
    this.cd.markForCheck();
  }
}
