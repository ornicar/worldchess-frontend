import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as ChessgroundType from 'chessground/types';
import { IMovePosition } from '../../../app/broadcast/move/move.model';
import { EndReason, GameResult } from '../state/game-result-enum';
import { Store } from '@ngxs/store';
import { ShowGameResult, CallAnArbiter } from '../state/game.actions';
import { IPlayer } from '../../broadcast/core/player/player.model';

export enum ChessColors {
  White = 'white',
  Black = 'black'
}

@Component({
  selector: 'chess-board',
  templateUrl: 'chess-board.component.html',
  styleUrls: ['chess-board.component.scss']
})
export class ChessBoardComponent {
  @Input()
  readOnly: boolean;

  @Input()
  bottomPlayerColor: ChessgroundType.Color = ChessColors.White;

  @Input()
  isResultShown: boolean;

  // TODO: Maybe should remove it, seems like useless
  @Input()
  canCompleteMove = true;

  @Input()
  position: IMovePosition;

  @Input()
  gameResult: GameResult;

  @Input()
  endReason: EndReason;

  @Input()
  ratingChange: number;

  @Input()
  player: IPlayer;

  @Input()
  isAuthorized = false;

  @Input()
  pgnUrl: string;

  @Input()
  canCallAnArbiter: boolean;

  @Output()
  move: EventEmitter<IMovePosition> = new EventEmitter();

  @Output()
  newGame: EventEmitter<void> = new EventEmitter();

  @Output()
  callAnArbiter: EventEmitter<void> = new EventEmitter();

  public GameResult = GameResult;
  public EndReason = EndReason;

  constructor(private state: Store) {}

  hideResult() {
    this.isResultShown = false;
  }

  public onCancelMove(): void {
    console.log('canceled move');
  }

  public changePosition(position: IMovePosition): void {
    this.move.emit(position);
  }

  public findAnotherGame(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    this.newGame.emit();
  }

  public get isBottomWhite(): boolean {
    return this.bottomPlayerColor === ChessColors.White;
  }

  public onCallAnArbiter(): void {
    this.callAnArbiter.emit();
  }
}
