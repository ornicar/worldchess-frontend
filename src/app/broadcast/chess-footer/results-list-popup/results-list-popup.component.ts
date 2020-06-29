import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { IResultRecord, Result } from '@app/broadcast/core/result/result.model';

@Component({
  selector: 'wc-results-list-popup',
  templateUrl: './results-list-popup.component.html',
  styleUrls: ['./results-list-popup.component.scss'],
})
export class ResultsListPopupComponent {
  @Input() player: IPlayer = null;
  @Input() playerName = '';
  @Input() results: IResultRecord[] = [];
  @Output() close = new EventEmitter();

  @ViewChild('popup', { static: false, read: ElementRef }) popup: ElementRef;

  get points(): number {
    return this.results && (this.player || this.playerName) ? this.results.reduce((acc, curr) => acc + this.getPlayerResult(curr), 0) : 0;
  }

  getPlayerResult(result: IResultRecord): number {
    if ((!this.player && !this.playerName) || !result) {
      return 0;
    }
    switch (result.result) {
      case Result.WHITE_WIN: {
        return this.isPlayerWhite(result) ? 1 : 0;
      }
      case Result.BLACK_WIN: {
        return this.isPlayerBlack(result) ? 1 : 0;
      }
      case Result.DRAW:
        return 0.5;
      default:
        return 0;
    }
  }

  getPlayerOpponent(result) {
    const isWhite = this.isPlayerWhite(result);
    return {
      result,
      opponent: isWhite ? result.black_player : result.white_player,
      opponentName: isWhite ? result.black_player_name : result.white_player_name,
    };
  }

  isPlayerWhite(result: IResultRecord): boolean {
    const name = this.player ? this.player.full_name : this.playerName;
    return (result.white_player && result.white_player.full_name === name) ||
      (result.white_player_name && result.white_player_name === name);
  }

  isPlayerBlack(result: IResultRecord): boolean {
    const name = this.player ? this.player.full_name : this.playerName;
    return (result.black_player && result.black_player.full_name === name) ||
      (result.black_player_name && result.black_player_name === name);
  }

  onClose() {
    this.close.emit();
  }

  public scrollTo() {
    setTimeout(() => {
      if (this.popup) {
        this.popup.nativeElement.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, 100);
  }
}
