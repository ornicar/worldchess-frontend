import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

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
  selector: 'wc-figure',
  templateUrl: './figure.component.html',
  styleUrls: ['./figure.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FigureComponent {

  @Input() san: string;
  @Input() isWhite: boolean;

  getIconClass() {
    return this.san
      ? (this.isWhite ? 'w' : 'b') + (iconClasses[this.san[0]] || iconClasses['P'])
      : '';
  }
}
