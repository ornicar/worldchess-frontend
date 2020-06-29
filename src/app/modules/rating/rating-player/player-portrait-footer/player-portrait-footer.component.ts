import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';

import { IPlayerRatingGroup, IPlayerRatingFooterData } from '../../../app-common/services/player-rating.model';

@Component({
  selector: 'wc-player-portrait-footer',
  templateUrl: './player-portrait-footer.component.html',
  styleUrls: ['./player-portrait-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPortraitFooterComponent implements OnInit {
  @Input() player: IPlayerRatingFooterData;

  constructor() {}

  ngOnInit() {
  }
}
