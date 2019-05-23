import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {IImagePreset} from '../../../shared/interfaces/media';

export enum miniBannerType {
  Normal = 'normal',
  Glow = 'glow',
  Focus = 'focus'
}

export interface IMiniBanner {
  type: string;
  title: string;
  link: {
    label: string,
    navigation?: string,
    path?: string
  };
  image?: IImagePreset;
}

@Component({
  selector: 'wc-mini-banner',
  templateUrl: './mini-banner.component.html',
  styleUrls: ['./mini-banner.component.scss']
})
export class MiniBannerComponent implements OnInit {

  @Input()
  type: miniBannerType = miniBannerType.Normal;

  @Input()
  content: IMiniBanner;

  @HostBinding('class.glow')
  get isGlow() { return this.type === miniBannerType.Glow; }

  @HostBinding('class.focus')
  get isFocus() { return this.type === miniBannerType.Focus; }

  constructor() { }

  ngOnInit() {
  }

}
