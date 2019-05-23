import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable()
export class YoutubePlayerService {
  private _ready: BehaviorSubject<boolean> = new BehaviorSubject(false);

  createPlayer(playerId, videoId, params) {
    if (this._ready.value) {
      const player = new window['YT'].Player(playerId, {
        ...params,
        videoId: videoId,
      });
      return player;
    } else {
      return null;
    }
  }

  init(): Observable<boolean> {
    if (!this._ready.value) {
      this.loadApi();
      window['onYouTubeIframeAPIReady'] = () => {
        this._ready.next(true);
      };
    }
    return this.isReady;
  }

  loadApi() {
    const apiScript = document.createElement('script');
    apiScript.type = 'text/javascript';
    apiScript.src = 'https://youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(apiScript, firstScriptTag);
  }

  get isReady(): Observable<boolean> {
    return this._ready.asObservable();
  }
}
