import { Component, HostListener, Input } from '@angular/core';
import { VideoBanner } from '../store/main-page.reducer';
import { Subject } from 'rxjs';

export enum VideoPlayerMouseEvents {
  MOUSE_OVER,
  MOUSE_OUT,
  CLICK
}

@Component({
  selector: 'wc-main-page-video-banner',
  templateUrl: './video-banner.component.html',
  styleUrls: ['./video-banner.component.scss']
})
export class MainPageVideoBannerComponent {
  @Input() banner: VideoBanner;

  mouseEvents: Subject<VideoPlayerMouseEvents> = new Subject();

  @HostListener('click', ['$event'])
  onBannerWrapperClick() {
    this.mouseEvents.next(VideoPlayerMouseEvents.CLICK);
  }

  @HostListener('mouseover', ['$event'])
  onBannerWrapperMouseOver() {
    this.mouseEvents.next(VideoPlayerMouseEvents.MOUSE_OVER);
  }

  @HostListener('mouseout', ['$event'])
  onBannerWrapperMouseOut() {
    this.mouseEvents.next(VideoPlayerMouseEvents.MOUSE_OUT);
  }
}
