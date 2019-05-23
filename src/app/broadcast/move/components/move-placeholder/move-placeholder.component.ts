import {ChangeDetectionStrategy, Component, HostBinding, Input, OnInit} from '@angular/core';

@Component({
  selector: 'wc-move-placeholder',
  template: '...',
  styleUrls: ['./move-placeholder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovePlaceholderComponent implements OnInit {

  @Input()
  @HostBinding('class.select')
  selected = false;

  constructor() { }

  ngOnInit() {}
}
