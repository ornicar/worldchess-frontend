import { Injectable } from '@angular/core';
import { BoardType, GameRatingMode, ITimeControl } from '@app/broadcast/core/tour/tour.model';
import * as moment from 'moment';
import { Store } from '@ngxs/store';

@Injectable()
export class GameSharedService {
  constructor(
    private store: Store
  ) {}

  convertBoardType(boardType: BoardType): string {
    switch (boardType) {
      case BoardType.BULLET:
        return 'bullet';
      case BoardType.BLITZ:
        return 'blitz';
      case BoardType.RAPID:
        return 'rapid';
    }
    return '';
  }

  convertTime(timeControl: ITimeControl): string {
    let result = moment.duration(timeControl.start_time).asMinutes().toString();
    if (moment.duration(timeControl.increment).asSeconds()) {
      result += '+' + moment.duration(timeControl.increment).asSeconds().toString();
    } else {
      result += ' min';
    }
    return result;
  }

  convertGameMode(gameRatingMode: GameRatingMode): string {
    switch (gameRatingMode) {
      case GameRatingMode.UNRATED:
        return 'Non-rated';
      case GameRatingMode.FIDERATED:
        return 'FIDE Rated';
      case GameRatingMode.RATED:
        return 'Rated';
    }
  }

  boardTypeTitle(boardType: BoardType) {
    switch (boardType) {
      case BoardType.RAPID:
        return 'Rapid';
      case BoardType.BLITZ:
        return 'Blitz';
      case BoardType.BULLET:
        return 'Bullet';
      case BoardType.ARMAGEDDON:
        return 'Armageddon';
      case BoardType.CLASSIC:
        return 'Bullet';
    }
  }
}
