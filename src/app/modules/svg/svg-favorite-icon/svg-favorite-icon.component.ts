import { Component, OnInit, ChangeDetectionStrategy, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'svg-favorite-icon',
  templateUrl: './svg-favorite-icon.component.svg',
  styleUrls: ['./svg-favorite-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgFavoriteIconComponent implements OnInit {

  @Input()
  @HostBinding('class.checked')
  checked = false;

  @Input()
  @HostBinding('class.disabled')
  disabled = false;

  @Input()
  @HostBinding('class.fill')
  fill = false;

  constructor() { }

  ngOnInit() {
  }

}
