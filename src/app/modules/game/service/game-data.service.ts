import { takeUntil } from 'rxjs/operators';
import { combineLatest, Subject } from 'rxjs';
import { GameTranslateService } from './game-translate.service';
import { GameBadgeNotificationType } from '@app/modules/game/game-page/game-page.component';
import { EndReason, GameResult } from '@app/modules/game/state/game-result-enum';
import { IGameMove, CheckState } from '@app/modules/game/state/game-move.model';
import { Injectable } from '@angular/core';

type typeGetTopBadgeNotify = (
  value: [(boolean | IGameMove | CheckState)[], EndReason, GameResult, string],
  index: number
) => {
  notificationType: GameBadgeNotificationType;
  notification: string;
};

type typeGetBottomBadgeNotify = (
  value: [[boolean, CheckState, boolean], EndReason, GameResult],
  index: number
) => {
  notificationType: GameBadgeNotificationType;
  notification: string;
};

@Injectable()
export class GameDataService {
  private destroy$ = new Subject<void>();

  private mapMessages = new Map<string, string>();

  constructor(private gameTranslateService: GameTranslateService) {
    this.getMsgBadgeNotify();
  }

  private getMsgBadgeNotify(): void {
    combineLatest([
      this.gameTranslateService.getTranslate('MESSAGES.GAME_REVIEW'),
      this.gameTranslateService.getTranslate('MESSAGES.OFFERED_DRAW'),
      this.gameTranslateService.getTranslate('MESSAGES.OFFERING_DRAW'),
      this.gameTranslateService.getTranslate('MESSAGES.LET_PLAY'),
      this.gameTranslateService.getTranslate('MESSAGES.CHECKMATE'),
      this.gameTranslateService.getTranslate('MESSAGES.CHECK'),
      this.gameTranslateService.getTranslate('MESSAGES.A_DRAW'),
      this.gameTranslateService.getTranslate('MESSAGES.OPPONENT_RESIGNED'),
      this.gameTranslateService.getTranslate('MESSAGES.DRAW_BECAUSE'),
      this.gameTranslateService.getTranslate('MESSAGES.YOU_RESIGNED'),
      this.gameTranslateService.getTranslate('MESSAGES.YOU_WIN_TIME'),
      this.gameTranslateService.getTranslate('MESSAGES.YOU_LOST_TIME'),
      this.gameTranslateService.getTranslate('MESSAGES.YOU_LOST'),
      this.gameTranslateService.getTranslate('MESSAGES.STALEMATE_DRAW'),
      this.gameTranslateService.getTranslate('GAME.DRAW'),
      this.gameTranslateService.getTranslate('ACCEPT_DRAW'),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        ([
          gameReview,
          offeredDraw,
          offeringDraw,
          letPlay,
          checkmate,
          check,
          aDraw,
          opponentResigned,
          drawBecause,
          youResigned,
          youWinTime,
          youLostTime,
          youLost,
          stalemateDraw,
          gameDraw,
          acceptDraw,
        ]) => {
          this.mapMessages.set('GAME_REVIEW', gameReview);
          this.mapMessages.set('OFFERED_DRAW', offeredDraw);
          this.mapMessages.set('OFFERING_DRAW', offeringDraw);
          this.mapMessages.set('LET_PLAY', letPlay);
          this.mapMessages.set('CHECKMATE', checkmate);
          this.mapMessages.set('CHECK', check);
          this.mapMessages.set('A_DRAW', aDraw);
          this.mapMessages.set('OPPONENT_RESIGNED', opponentResigned);
          this.mapMessages.set('DRAW_BECAUSE', drawBecause);
          this.mapMessages.set('YOU_RESIGNED', youResigned);
          this.mapMessages.set('YOU_WIN_TIME', youWinTime);
          this.mapMessages.set('YOU_LOST_TIME', youLostTime);
          this.mapMessages.set('YOU_LOST', youLost);
          this.mapMessages.set('STALEMATE_DRAW', stalemateDraw);
          this.mapMessages.set('DRAW', gameDraw);
          this.mapMessages.set('ACCEPT_DRAW', acceptDraw);
        }
      );
  }
  /**
   * @param  {string} code
   * @param  {string=''} defaultMsg
   * @returns string
   */
  private getMsgMap(code: string, defaultMsg: string = ''): string {
    return this.mapMessages.has(code) ? this.mapMessages.get(code) : defaultMsg;
  }

  /**
   * @returns typeGetTopBadgeNotify
   */
  public getTopBadgeNotify(): typeGetTopBadgeNotify {
    return ([some, endReason, gameResult, opponentName]) => {
      const [
        isResultShown,
        isCheck,
        playerOfferedDraw,
        playerReadyToOfferDraw,
        opponentOfferedDraw,
        isLetsPlayNotification,
        selectedMove,
      ] = some;
      if (!!selectedMove) {
        return {
          notificationType: GameBadgeNotificationType.Info,
          notification: this.getMsgMap('GAME_REVIEW', 'Game Review'),
        };
      }
      if (playerOfferedDraw) {
        return {
          notificationType: GameBadgeNotificationType.OfferedDraw,
          notification: this.getMsgMap('OFFERED_DRAW', 'You offered a draw'),
        };
      }
      if (playerReadyToOfferDraw) {
        return {
          notificationType: GameBadgeNotificationType.ReadyToOfferDraw,
          notification: this.getMsgMap('OFFERING_DRAW', 'Offering a draw'),
        };
      }

      if (isLetsPlayNotification) {
        return {
          notificationType: GameBadgeNotificationType.Message,
          notification: this.getMsgMap('LET_PLAY', 'Let’s play'),
        };
      }
      /*if (endReason === EndReason.FOLD_REPETITION) {
        return {
          notificationType: GameBadgeNotificationType.OfferedDraw,
          notification: 'because of 5 repetitions',
        };
      }*/
      if (isResultShown) {
        if (endReason === EndReason.CLASSIC && gameResult === GameResult.LOST) {
          return {
            notificationType: GameBadgeNotificationType.Message,
            notification: this.getMsgMap('CHECKMATE', 'Checkmate!'),
          };
        }
        if (endReason === EndReason.RESIGN && gameResult === GameResult.WON) {
          return {
            notificationType: GameBadgeNotificationType.Info,
            notification: `${opponentName} ${this.getMsgMap('OPPONENT_RESIGNED', 'resigned')}`,
          };
        }
      }

      if (isCheck === CheckState.OpponentChecks) {
        return {
          notificationType: GameBadgeNotificationType.Message,
          notification: this.getMsgMap('CHECK', 'Check!'),
        };
      }

      if (opponentOfferedDraw) {
        return {
          notificationType: GameBadgeNotificationType.Message,
          notification: this.getMsgMap('A_DRAW', 'A draw?'),
        };
      }
    };
  }
  /**
   * @returns typeGetBottomBadgeNotify
   */
  public getBottomBadgeNotify(): typeGetBottomBadgeNotify {
    return ([some, endReason, gameResult]) => {
      const [isResultShown, isCheck, opponentOfferedDraw] = some;
      if (isResultShown) {
        switch (endReason) {
          case EndReason.CLASSIC: {
            if (gameResult === GameResult.WON) {
              return {
                notificationType: GameBadgeNotificationType.Message,
                notification: this.getMsgMap('CHECKMATE', 'Checkmate!'),
              };
            } else if (gameResult === GameResult.LOST) {
              return {
                notificationType: GameBadgeNotificationType.Info,
                notification: this.getMsgMap('YOU_LOST', 'You lost'),
              };
            } else if (gameResult === GameResult.DRAW) {
              return {
                notificationType: GameBadgeNotificationType.Info,
                notification: this.getMsgMap('STALEMATE_DRAW', 'Stalemate. Draw'),
              };
            }
            break;
          }

          case EndReason.TIME_CONTROL: {
            if (gameResult === GameResult.LOST) {
              return {
                notificationType: GameBadgeNotificationType.Info,
                notification: this.getMsgMap('YOU_LOST_TIME', 'You lost on time'),
              };
            } else if (gameResult === GameResult.WON) {
              return {
                notificationType: GameBadgeNotificationType.Info,
                notification: this.getMsgMap('YOU_WIN_TIME', 'You win on time'),
              };
            }
            break;
          }

          case EndReason.RESIGN: {
            if (gameResult === GameResult.LOST) {
              return {
                notificationType: GameBadgeNotificationType.Info,
                notification: this.getMsgMap('YOU_RESIGNED', 'You resigned'),
              };
            }
            break;
          }

          case EndReason.FOLD_REPETITION: {
            if (gameResult === GameResult.DRAW) {
              return {
                notificationType: GameBadgeNotificationType.Info,
                notification: this.getMsgMap('DRAW_BECAUSE', 'Draw: because of 5 repetitions'),
              };
            }
            break;
          }

          default: {
            if (gameResult === GameResult.DRAW) {
              return {
                notificationType: GameBadgeNotificationType.Info,
                notification: this.getMsgMap('DRAW', 'Draw'),
              };
            }
          }
        }
      }

      if (opponentOfferedDraw) {
        return {
          notificationType: GameBadgeNotificationType.AcceptDraw,
          notification: this.getMsgMap('ACCEPT_DRAW', 'Accept a draw'),
        };
      }

      if (isCheck === CheckState.PlayerChecks) {
        return {
          notificationType: GameBadgeNotificationType.Message,
          notification: this.getMsgMap('CHECK', 'Check!'),
        };
      }
    };
  }
}
