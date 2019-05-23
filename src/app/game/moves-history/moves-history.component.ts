import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { IGameMove } from '../state/game-move.model';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'moves-history',
  templateUrl: 'moves-history.component.html',
  styleUrls: ['moves-history.component.scss']
})
export class MovesHistoryComponent implements OnChanges {
  @Input()
  moves: IGameMove[];

  _groupedMoves = new BehaviorSubject<[IGameMove, IGameMove][]>([]);
  groupedMoves$ = this._groupedMoves.asObservable();

  @Input()
  selectedMove: IGameMove;

  @Output()
  select: EventEmitter<IGameMove> = new EventEmitter()

  @ViewChild('wrapper')
  wrapper: ElementRef;

  get groupedMoves(): Array<[IGameMove, IGameMove]> {
    if (this.moves && this.moves.length) {
      const groupedMoves = [];
      let i = 0;

      while (i < this.moves.length) {
        let [white, black] = this.moves.slice(i, i + 2);

        if (!white.is_white_move) {
          [white, black] = [null, white];
        }

        if (black && black.is_white_move) {
          black = null;
        }

        groupedMoves.push([white, black]);

        i += white && black ? 2 : 1;
      }
      return groupedMoves;
    }

    return [];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['moves']) {
      this._groupedMoves.next(this.groupedMoves);
      setTimeout(() => {
        this.wrapper.nativeElement.scrollTop = this.wrapper.nativeElement.scrollHeight;
      },0);
    }
  }

  goToLast() {
    return this.moves && this.moves.length > 0 && this.select.emit(this.moves[this.moves.length - 1]);
  }

  goToFirst() {
    return this.moves && this.moves.length > 0 && this.select.emit(this.moves[0]);
  }

  goForward() {
    const index = this.moves && this.selectedMove && this.moves.length > 0 ?
      this.moves.findIndex(m => m.created === this.selectedMove.created) : null;
    if (index !== undefined && this.moves.length > index + 1) {
      this.select.emit(this.moves[index + 1]);
    }
  }

  clear() {
    this.select.emit(null);
  }

  goBackward() {
    const index = this.moves && this.moves.length > 0 && this.selectedMove ?
      this.moves.findIndex(m => m.created === this.selectedMove.created) : null;
    if (index && index > 0) {
      this.select.emit(this.moves[index - 1]);
    }
  }

  onMoveSelected(move: IGameMove) {
    if (this.selectedMove === move) {
      this.clear();
    } else {
      this.select.emit(move);
    }
  }

  trackByMoveGroup(index, moves) {
    return moves;
  }

  trackByMove(index, move) {
    return move;
  }
}

