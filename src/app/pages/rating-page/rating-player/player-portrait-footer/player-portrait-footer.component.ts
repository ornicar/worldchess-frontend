import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';

export interface IPlayerRatingFooterData {
  rating: number;
  title: string;
  federation: number;
}

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
