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
  isShownSocialBtns = false;

  @ViewChild('boardMenu', { static: true }) boardMenu: ElementRef;
  @ViewChild('shareBtn', { static: true }) shareBtn: ElementRef;

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
    if(this.isShownSocialBtns) {
      this.isShownSocialBtns = false;
    } else {
      this.isShownSocialBtns = true;
    }
  }

  @HostListener('document:click', ['$event.target'])
  @HostListener('window:scroll')
  private onClickOutside(targetElement) {
    if (DomHelper.isOutsideElement(this.boardMenu, targetElement) && this.isShowBoardMenu) {
      this.isShowBoardMenu = false;
      this.ch.markForCheck();
    }

    if (DomHelper.isOutsideElement(this.shareBtn, targetElement) && this.isShownSocialBtns) {
      this.isShownSocialBtns = false;
      this.ch.markForCheck();
    }

  }

  public showWidgetWindow(): void {
    this.store$.dispatch(new GameOpenEmbeddedWidgetModal());
    window['gtag']('event', 'click', {event_category: 'share', event_label: this.tournament.title});
  }

  public shareToTwitter(): void {
    window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=I'm watching ${this.tournament.title}`, '_blank');
  }

  public shareToFacebook(): void {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=I'm watching ${this.tournament.title}`, '_blank');
  }
}
