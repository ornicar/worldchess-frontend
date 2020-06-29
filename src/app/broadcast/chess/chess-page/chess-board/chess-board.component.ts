import { CheckmateState } from '@app/shared/widgets/chessground/figure.model';
import { SetCheckmate } from './../../../../modules/game/state/game.actions';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  OnInit,
} from '@angular/core';
import { Color } from 'chessground/types';
import { BoardStatus, IBoard } from '../../../core/board/board.model';
import { IMovePosition, MoveReaction } from '../../../move/move.model';

export enum ChessBoardViewMode {
  Normal,
  MultiboardNormal,
  MultiboardMedium,
  GamingNormal,
  OnlyBoard,
  WidgetVertical
}

@Component({
  selector: 'wc-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessBoardComponent implements OnInit {

  private defaultBottomPlayerColor: Color = 'white';

  checkmateState: CheckmateState;

  @Input()
  viewMode: ChessBoardViewMode = ChessBoardViewMode.Normal;

  @Input()
  bottomPlayerColor: Color = this.defaultBottomPlayerColor;

  @Input()
  myGameIsActive = false;

  @Input()
  canMove = false;

  @Input()
  canCompleteMove = false;

  @Input()
  board?: IBoard;

  @Input()
  moveScore?: number;

  @Input()
  moveReaction?: MoveReaction;

  @Input()
  position?: IMovePosition = null;

  @Output()
  moveCompleted = new EventEmitter<IMovePosition>();

  @Output()
  moveCancelled = new EventEmitter<void>();

  BoardStatus = BoardStatus;

  @HostBinding('class.players-switched')
  get isPlayersSwitched() {
    return this.bottomPlayerColor !== this.defaultBottomPlayerColor;
  }

  ChessBoardViewMode = ChessBoardViewMode;

  @HostBinding('class.view-mode--multiboard-normal')
  get viewModeIsMultiboardNormal() {
    return this.viewMode === ChessBoardViewMode.MultiboardNormal;
  }

  @HostBinding('class.view-mode--gaming-normal')
  get viewModeIsGamingNormal() {
    return this.viewMode === ChessBoardViewMode.GamingNormal;
  }

  @HostBinding('class.view-mode--multiboard-medium')
  get viewModeIsMultiboardMedium() {
    return this.viewMode === ChessBoardViewMode.MultiboardMedium;
  }

  @HostBinding('class.view-mode--only-board')
  get viewModeIsOnlyBoard() {
    return this.viewMode === ChessBoardViewMode.OnlyBoard;
  }

  @HostBinding('class.view-mode--widget-vertical')
  get viewModeIsWidgetVertical() {
    return this.viewMode === ChessBoardViewMode.WidgetVertical;
  }

  get isMinimalViewModeForPlayer() {
    return this.viewMode === ChessBoardViewMode.MultiboardNormal
    || this.viewMode === ChessBoardViewMode.MultiboardMedium;
  }

  get isMinimalViewModeForTimer() {
    return this.viewMode === ChessBoardViewMode.MultiboardMedium;
  }

  onTriedToMove() {
    this.moveCancelled.emit();
  }

  ngOnInit() {
    if (this.bottomPlayerColor === null) {
      this.bottomPlayerColor = this.defaultBottomPlayerColor;
    }
  }

  getCheckmate(color: string = 'white'): boolean {
    let flagCheckmate: boolean = false;
    if (this.checkmateState) {
      switch (color) {
        case 'white':
          flagCheckmate = !(this.checkmateState === CheckmateState.WhiteCheckmates);
          break;
        case 'black':
          flagCheckmate = !(this.checkmateState === CheckmateState.BlackCheckmates);
          break;
        default:
          flagCheckmate = false;
          break;
      }
      return flagCheckmate;
    } else {
      return false;
    }
  }

  setCheckmate($event) {
    this.checkmateState = $event;
  }
}
