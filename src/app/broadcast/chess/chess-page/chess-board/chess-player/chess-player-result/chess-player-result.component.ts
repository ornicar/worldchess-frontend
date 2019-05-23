import {ChangeDetectionStrategy, Component, HostBinding, Input} from '@angular/core';
import {Color} from 'chessground/types';
import {BoardResult, IBoard} from '../../../../../core/board/board.model';

@Component({
  selector: 'wc-chess-player-result',
  templateUrl: './chess-player-result.component.html',
  styleUrls: ['./chess-player-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessPlayerResultComponent {

  @Input()
  private position: 'top' | 'bottom';

  @Input()
  private playerColor: Color;

  @Input()
  private board: IBoard;

  get result(): string {
    switch (this.board.result) {
      case BoardResult.DRAW:
        return '1/2';

      case BoardResult.VICTORY:
        return this.playerColor === 'white' ? '1' : '0';

      case BoardResult.DEFEAT:
        return this.playerColor === 'black' ? '1' : '0';

      case BoardResult.NOTHING:
        return '0';
    }
  }

  @HostBinding('class.white-player')
  get isWhitePlayer() {
    return this.playerColor === 'white';
  }

  @HostBinding('class.black-player')
  get isBlackPlayer() {
    return this.playerColor === 'black';
  }

  @HostBinding('class.top-position')
  get isTopPosition() {
    return this.position === 'top';
  }

  @HostBinding('class.bottom-position')
  get isBottomPosition() {
    return this.position === 'bottom';
  }
}
