import { Component, Input } from '@angular/core';
import { IGameMove } from '../../state/game-move.model';

@Component({
  selector: 'wc-history-move',
  templateUrl: './history-move.component.html',
  styleUrls: ['./history-move.component.scss'],
})
export class HistoryMoveComponent {

  @Input() move: IGameMove;

  @Input() isSelected: boolean;
  get isWhite(): boolean {
    return this.move.is_white_move;
  }
}

