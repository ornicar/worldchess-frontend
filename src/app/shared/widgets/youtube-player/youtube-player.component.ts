import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { VideoPlayerMouseEvents } from '../../../pages/main-page/video-banner/video-banner.component';
import { YoutubePlayerService } from './youtube-player.service';
import { skipWhile, take } from 'rxjs/operators';


export enum PlayerState {
  UNKNOWN = 0,
  PRELOADING = 1,
  PLAYING = 2,
  PAUSED = 3
}

@Component({
  selector: 'wc-youtube-player',
  templateUrl: './youtube-player.component.html',
  styleUrls: ['./youtube-player.component.scss'],
})
export class YoutubePlayerComponent implements OnDestroy, OnChanges, AfterViewInit {
  @Input() playerId: string = null;
  @Input() videoId: string = null;
  @Input() params: any = {};
  @Input() mouseEvents: Subject<VideoPlayerMouseEvents>;
  subscription: Subscription;

  @Output() playerReady = new EventEmitter<boolean>();
  @Output() playerState = new EventEmitter<YT.PlayerState>();
  @Output() playerError = new EventEmitter<YT.PlayerError>();

  player: YT.Player;

  state = PlayerState.PRELOADING;
  PlayerState = PlayerState;
  isHover = false;

  constructor(private youtubePlayerService: YoutubePlayerService,
              private cd: ChangeDetectorRef) {}

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mouseEvents'] && changes['mouseEvents'].currentValue) {
      this.subscription = this.mouseEvents.subscribe((event) => {
        switch (event) {
          case VideoPlayerMouseEvents.CLICK:
            this.playerClick();
            break;
          case VideoPlayerMouseEvents.MOUSE_OVER:
            this.isHover = true;
            break;
          case VideoPlayerMouseEvents.MOUSE_OUT:
            this.isHover = false;
        }

      });
    }
  }

  ngAfterViewInit() {
    this.youtubePlayerService.init()
      .pipe(
        skipWhile(value => !value),
        take(1),
      ).subscribe(() => {
      this.params.playerVars.playlist = this.videoId;
      this.player = this.youtubePlayerService.createPlayer(this.playerId, this.videoId, {
        ...this.params,
        width: '0',
        height: '0',
        events: {
          onStateChange: (event) => this.onPlayerStateChange(event),
          onError: (event) => this.onPlayerError(event),
          onReady: () => {
            this.playerReady.emit(true);
            this.onPlayerStateChange({ data: -1 });
          },
        }
      });
    });
  }

  onPlayerStateChange(event) {
    switch (event.data) {
      case 1:
        this.state = PlayerState.PLAYING;
        break;
      case -1:
      case 2:
        this.state = PlayerState.PAUSED;
        break;
      default:
        this.state = PlayerState.UNKNOWN;
    }
    this.cd.detectChanges();
    this.playerState.emit(event.data);
  }

  onPlayerError(event) {
    this.playerError.emit(event.data);
  }

  play() {
    if (this.player) {
      this.player.playVideo();
    }
  }

  pause() {
    if (this.player) {
      this.player.pauseVideo();
    }
  }

  setSize(width, height) {
    this.rescalePlayer(width, height);
  }


  rescalePlayer(width, height) {
    if (!this.player) {
      return;
    }
    if (width / height > 16 / 9) {
      this.player.setSize(width, width / 16 * 9);
    } else {
      this.player.setSize(height / 9 * 16, height);
    }
  }

  playerClick() {
    if (this.state === PlayerState.PLAYING) {
      this.state = PlayerState.PAUSED;
      this.pause();
    } else {
      this.state = PlayerState.PLAYING;
      this.play();
    }
  }
}
