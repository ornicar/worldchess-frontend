import { Component, OnInit, Input, OnChanges, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { IMediaBlock, IMediaFile } from '../media-files/media-files.model';

@Component({
  selector: 'wc-media-list',
  templateUrl: './media-list.component.html',
  styleUrls: ['./media-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MediaListComponent implements OnInit {
  @Input() public list: any;
  @Input() public block: IMediaBlock;
  @Input() public showButton;
  @Output() public showMore = new EventEmitter();
  @Output() public openMedia = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  public onShowMore() {
    this.showMore.emit(this.block.id);
  }

  public getUsualImage(img: IMediaFile) {
    if (!img.image || !img.image.medium) {
      return '';
    }
    return `url(${img.image.medium})`;
  }

  public getYoutubeImage(img: IMediaFile) {
    if (!img.video_url) {
      return;
    }
    const url = img.video_url;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[7].length === 11) ? match[7] : false;

    return videoId ? `url(https://img.youtube.com/vi/${videoId}/0.jpg)` : '';
  }

  public getImage(img: IMediaFile) {
    if (!!img.video_url) {
      return this.getYoutubeImage(img);
    } else {
      return this.getUsualImage(img);
    }
  }
  public trackByFn(media: IMediaFile) {
    return media.id;
  }

  public onMediaClick( idx, block_id) {
    this.openMedia.emit({idx, block_id});
  }
}
