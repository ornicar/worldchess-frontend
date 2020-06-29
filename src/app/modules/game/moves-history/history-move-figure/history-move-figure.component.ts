import { Component, Input } from '@angular/core';


const iconClasses = {
  'Q': 'Q',
  'P': 'P',
  'B': 'B',
  'R': 'R',
  'K': 'K',
  'N': 'N',
  'O': 'K' // For Castling.
};


@Component({
  selector: 'wc-history-move-figure',
  templateUrl: './history-move-figure.component.html',
  styleUrls: ['./history-move-figure.component.scss']
})
export class HistoryMoveFigureComponent {

  @Input() san: string;
  @Input() isWhite: boolean;

  get figure(): string {
   const s = iconClasses[this.san[0]] || iconClasses['P'];
   return (this.isWhite ? 'w' : 'b') + s;
  }
}

