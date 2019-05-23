import { Component, OnInit, Input, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {IMediaFile} from '../media-files/media-files.model';

@Component({
  selector: 'wc-media-modal',
  templateUrl: './media-modal.component.html',
  styleUrls: ['./media-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaModalComponent implements OnInit, OnChanges {
  @Input() public data;
  @Input() public isAbleToPrev = false;
  @Input() public isAbleToNext = false;

  public loading = false;

  public selectedMedia: IMediaFile;

  constructor(private cd: ChangeDetectorRef,
    public ngxModalService: NgxSmartModalService) { }

  ngOnInit() {
    this.loading = true;
    this.cd.markForCheck();
  }

  ngOnChanges() {
    this.initMedia();
  }

  public initMedia() {
    this.loading = true;
    this.cd.markForCheck();
    if (this.data && this.data.id) {
      this.selectedMedia = this.data;
      this.loading = false;
      this.cd.markForCheck();
    }
  }
  public closeModal() {
    this.ngxModalService.getModal('myModal').close();
    this.cd.markForCheck();
  }

  public goPrev() {
    this.ngxModalService.getModal('myModal').setData('prev', true);
  }
  public goNext() {
    this.ngxModalService.getModal('myModal').setData('next', true);
  }

  public getYoutubeVideoUrl() {

    const url = this.selectedMedia.video_url;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[7].length === 11) ? match[7] : false;
    return `https://www.youtube.com/embed/${videoId}`;
  }
}
