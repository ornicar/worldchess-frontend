import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnChanges, ViewChild} from '@angular/core';
import { GameOpenEmbeddedWidgetModal } from '@app/broadcast/chess/chess-page/game/game.actions';
import { Store } from '@ngrx/store';
import * as fromBoard from '../../../core/board/board.reducer';
import { ITour } from '../../../core/tour/tour.model';
import { Tournament } from '../../../core/tournament/tournament.model';
import { IGameState } from '../game/game.model';
import { Color } from 'chessground/types';
import { DomHelper } from '../../../../shared/helpers/dom.helper';
import { FileHelper } from '../../../../shared/helpers/file.helper';
import { BoardResourceService } from '../../../core/board/board-resource.service';

@Component({
  selector: 'wc-chess-board-area',
  templateUrl: './chess-board-area.component.html',
  styleUrls: ['./chess-board-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessBoardAreaComponent {
  @Input() tournament: Tournament;

  @Input() tour: ITour;

  @Input() gameState: IGameState;

  orientation: Color = 'white';
  isShowBoardMenu = false;

  @ViewChild('boardMenu') boardMenu: ElementRef;

  constructor(
    private store$: Store<fromBoard.State>,
    private boardResource: BoardResourceService,
    private ch: ChangeDetectorRef
  ) {
  }

  public onFlipBoard() {
    this.orientation = (this.orientation === 'white') ? 'black' : 'white';
    this.ch.markForCheck();
  }

  public toggleBoardMenu() {
    this.isShowBoardMenu = !this.isShowBoardMenu;
    this.ch.markForCheck();
  }

  public onLoadPGN() {
    if (this.gameState.board) {
      this.boardResource.getPgn(this.gameState.board.id)
        .subscribe(pgnData => {
          FileHelper.downloadURI(pgnData.pgn_file.file_path);
        });
    }
  }

  public canOpenMultiboard() {
    return this.tour && this.tour.boards_count > 1;
  }

  public share() {
    this.store$.dispatch(new GameOpenEmbeddedWidgetModal());
    window['gtag']('event', 'click', {event_category: 'share', event_label: this.tournament.title});
  }

  @HostListener('document:click', ['$event.target'])
  private onClickOutside(targetElement) {
    if (DomHelper.isOutsideElement(this.boardMenu, targetElement) && this.isShowBoardMenu) {
      this.isShowBoardMenu = false;
      this.ch.markForCheck();
    }
  }
}
