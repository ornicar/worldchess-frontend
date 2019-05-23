import {ChangeDetectionStrategy, Component, HostBinding, Input} from '@angular/core';

@Component({
  selector: 'wc-game-favorite-icon',
  templateUrl: './game-favorite-icon.component.html',
  styleUrls: ['./game-favorite-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameFavoriteIconComponent {

  @Input()
  @HostBinding('class.checked')
  checked = false;

  @Input()
  @HostBinding('class.disabled')
  disabled = false;

  @Input()
  @HostBinding('class.fill')
  fill = false;
}
