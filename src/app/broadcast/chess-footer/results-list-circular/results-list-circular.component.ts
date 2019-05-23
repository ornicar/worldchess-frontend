import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IResultRecord, Result } from '../../core/result/result.model';
import { IPlayer } from '../../core/player/player.model';
import { ChessFooterResultsComponent } from '../chess-footer-results/chess-footer-results.component';

@Component({
  selector: 'results-list-circular',
  templateUrl: 'results-list-circular.component.html',
  styleUrls: ['results-list-circular.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsListCircularComponent {
  @Input() results: IResultRecord[];
  @Input() players: IPlayer[];

  trackByFn(player: IPlayer): number {
    return player.fide_id;
  }

  getPlayerResult(player1: IPlayer, player2: IPlayer) {
    if (player1 === player2) {
      return null;
    }

    const playerResults: IResultRecord[] = this.results.filter((result) => {
      const compareWhite = this.compareResultAndPlayer(result, 'white_player', player1) &&
        this.compareResultAndPlayer(result, 'black_player', player2);

      const compareBlack = this.compareResultAndPlayer(result, 'black_player', player1) &&
        this.compareResultAndPlayer(result, 'white_player', player2);

      return compareWhite || compareBlack;
    })
    .filter(result => result.result !== Result.NOT_PLAYED);

    return playerResults.map(result => this.getScore(player1, result));
  }

  private compareResultAndPlayer(result: IResultRecord, playerColor: string, player: IPlayer): boolean {
    const playerId = this.getPlayerKey(result, playerColor);
    const firstPlayerByFideId = typeof playerId === 'number';
    const secondPlayerByFideId = Number.isInteger(player.fide_id);

    if (firstPlayerByFideId && secondPlayerByFideId) {
      return playerId === player.fide_id;
    }

    return playerId === player.full_name;
  }

  private getPlayerKey(result: IResultRecord, playerColor: string): string | number {
    return ChessFooterResultsComponent.getPlayerKey(result, playerColor);
  }

  private getScore(player: IPlayer, result: IResultRecord): string {
    if (result.result === Result.DRAW) {
      return '½';
    }

    if (this.compareResultAndPlayer(result, 'white_player', player)) {
      return result.result === Result.WHITE_WIN ? '1' : '0';
    }

    if (this.compareResultAndPlayer(result, 'black_player', player)) {
      return result.result === Result.BLACK_WIN ? '1' : '0';
    }
  }
}
