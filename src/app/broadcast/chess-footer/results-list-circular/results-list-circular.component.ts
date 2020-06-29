import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, HostBinding, OnDestroy } from '@angular/core';
import { IResultRecord, Result } from '../../core/result/result.model';
import { IPlayer } from '../../core/player/player.model';
import { ChessFooterResultsComponent } from '../chess-footer-results/chess-footer-results.component';
import { ScreenStateService } from '@app/shared/screen/screen-state.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { Tournament } from '@app/broadcast/core/tournament/tournament.model';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IBoard } from '@app/broadcast/core/board/board.model';

@Component({
  selector: 'results-list-circular',
  templateUrl: 'results-list-circular.component.html',
  styleUrls: ['results-list-circular.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsListCircularComponent implements OnDestroy {
  @Input() results: IResultRecord[];
  @Input() players: IPlayer[];
  @Input() tournament: Tournament = null;
  @Input() board: IBoard;

  @HostBinding('class.active') showPlayerInfo = false;
  selectedPlayer: IPlayer;

  isMobile$ = new BehaviorSubject(false);
  destroy$ = new Subject();

  constructor(
    private cd: ChangeDetectorRef,
    private screenService: ScreenStateService,
    private router: Router,
  ) {
    this.screenService.matchMediaMobile$.pipe(takeUntil(this.destroy$)).subscribe((isMobile) => {
      this.isMobile$.next(isMobile);
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  trackByFn(player: IPlayer): number {
    return player.fide_id;
  }

  getPlayerOpponentsScore(player: IPlayer): Array<{ opponent: string; result: number; federation: number; }> {
    if (!player) {
      return null;
    }

    return this.results.filter((result: IResultRecord) => {
      if (result.result === Result.NOT_PLAYED) {
        return false;
      }
      const isWhitePlayer = this.compareResultAndPlayer(result, 'white_player', player);
      const isBlackPlayer = this.compareResultAndPlayer(result, 'black_player', player);
      return isWhitePlayer || isBlackPlayer;
    }).map((result: IResultRecord) => {
      const isWhitePlayer = this.compareResultAndPlayer(result, 'white_player', player);
      if (isWhitePlayer) {
        return {
          opponent: result.black_player ? result.black_player.full_name : result.black_player_name,
          result: result.result === Result.WHITE_WIN ? 1 : result.result === Result.DRAW ? 0.5 : 0,
          federation: result.black_player && result.black_player.federation,
        };
      } else {
        return {
          opponent: result.white_player ? result.white_player.full_name : result.white_player_name,
          result: result.result === Result.BLACK_WIN ? 1 : result.result === Result.DRAW ? 0.5 : 0,
          federation: result.white_player && result.white_player.federation,
        };
      }
    });
  }

  getPlayerTotalScore(player: IPlayer): number {
    if (!player) {
      return 0;
    }
    let total = 0;
    this.results.forEach((result: IResultRecord) => {
      if (result.result !== Result.NOT_PLAYED) {
        const isWhitePlayer = this.compareResultAndPlayer(result, 'white_player', player);
        const isBlackPlayer = this.compareResultAndPlayer(result, 'black_player', player);

        if (isWhitePlayer) {
          total += result.result === Result.WHITE_WIN ? 1 : result.result === Result.DRAW ? 0.5 : 0;
        } else if (isBlackPlayer) {
          total += result.result === Result.BLACK_WIN ? 1 : result.result === Result.DRAW ? 0.5 : 0;
        }
      }
    });
    return total;
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

  private scrollY = null;
  togglePlayerInfo(open: boolean, player?: IPlayer) {
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
      this.selectedPlayer = player;
    } else if (!open) {
      setTimeout(() => {
        this.selectedPlayer = null;
      }, 1);
    }
    this.cd.markForCheck();
  }
}
