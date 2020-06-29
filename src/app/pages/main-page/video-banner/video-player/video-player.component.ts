import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { IVideo, VideoType } from '../../store/main-page.reducer';
import { DomHelper } from '../../../../shared/helpers/dom.helper';
import { YoutubePlayerComponent } from '../../../../shared/widgets/youtube-player/youtube-player.component';
import { Subject } from 'rxjs';
import { VideoPlayerMouseEvents } from '../video-banner.component';


@Component({
  selector: 'wc-video-banner-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoBannerPlayerComponent {
  VideoType = VideoType;
  @Input() video: IVideo = null;
  @Input() mouseEvents: Subject<VideoPlayerMouseEvents>;
  @ViewChild('player', { static: false }) playerWrapper: ElementRef;
  @ViewChild(YoutubePlayerComponent, { static: false }) youtubePlayer: YoutubePlayerComponent;

  youtubeParams = {
    playerVars: {
      autoplay: 0,
      autohide: 0,
      controls: 0,
      disablekb: 1,
      enablejsapi: 1,
      iv_load_policy: 3,
      loop: 1,
      modestbranding: 1,
      showinfo: 0,
      rel: 0,
      fs: 0,
    }
  };

  get youtubeVideoId(): string {
    if (this.video && this.video.video_type === VideoType.Youtube)  {
      const a = document.createElement('a');
      a.href = this.video.url;
      const params = new URLSearchParams(a.search);
      const videoId = params.get('v');
      return videoId || null;
    }
    return null;
  }

  resizePlayers() {
    const parent = DomHelper.findParentByClass(this.playerWrapper.nativeElement, 'banner-video');
    if (this.video.video_type === VideoType.Youtube && this.youtubePlayer) {
      this.youtubePlayer.setSize(parent.offsetWidth, parent.offsetHeight);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.resizePlayers();
  }

  onYoutubePlayerReady() {
    this.resizePlayers();
  }
}
