import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {PlayerLabel} from '../../app-common/services/player-rating.model';

export const PLAYER_LABEL_TITLE = {
  [PlayerLabel.KING]: 'THE BEST PLAYER',
  [PlayerLabel.BLITZ]: 'THE BEST BLITZ',
  [PlayerLabel.RAPID]: 'THE BEST RAPID',
  [PlayerLabel.WOMAN]: 'THE BEST WOMAN',
  [PlayerLabel.GAIN]: 'GAIN',
  [PlayerLabel.LOST]: 'LOST',
  [PlayerLabel.YOUNGEST]: 'YOUNGEST',
  [PlayerLabel.OLDEST]: 'OLDEST',
  [PlayerLabel.ACTIVE]: 'MORE ACTIVE',
};

export const PLAYER_LABEL_COLOR = {
  [PlayerLabel.KING]: '#B4966E',
  [PlayerLabel.BLITZ]: '#1AE2D7',
  [PlayerLabel.RAPID]: '#FF5D53',
  [PlayerLabel.WOMAN]: '#BD53D3',
  [PlayerLabel.GAIN]: '#793C00',
  [PlayerLabel.LOST]: '#3C40C6',
  [PlayerLabel.YOUNGEST]: '#8D73FF',
  [PlayerLabel.OLDEST]: '#383838',
  [PlayerLabel.ACTIVE]: '#A2C91F',
};

@Component({
  selector: 'wc-player-labels',
  templateUrl: './player-labels.component.html',
  styleUrls: ['./player-labels.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PlayerLabelsComponent implements OnInit {
  @Input() labels: PlayerLabel[];

  constructor() {}

  ngOnInit() {
  }

  getTitle(label: PlayerLabel) {
    return PLAYER_LABEL_TITLE[label];
  }

  getColor(label: PlayerLabel) {
    return PLAYER_LABEL_COLOR[label];
  }
}
