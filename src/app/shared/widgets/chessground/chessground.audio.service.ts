import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface IGameSoundResponse {
  sound_type: string;
  file: string;
  file_encoded: string;
}

export enum SoundType {
  knock = 'knock',
  slide = 'slide'
}

@Injectable({
  providedIn: 'root'
} )
export class ChessgroundAudioService {
  private knockSounds: HTMLAudioElement[] = [];

  public prepareAudioElement() {
    if (this.knockSounds) {
      this.knockSounds.forEach((knockSound) => {
        const lastSrc = knockSound.src;
        knockSound.src = '';
        knockSound.play().then().catch(() => {});
        knockSound.pause();
        knockSound.src = lastSrc;
      });
    }
  }

  public initSoundUrls(soundLinks: IGameSoundResponse[]) {
    soundLinks.forEach((soundLink) => {
      if (soundLink.sound_type === SoundType.knock) {
        const tempAudio = new Audio();
        tempAudio.src = `data:audio/wav;base64,${soundLink.file_encoded}`;
        this.knockSounds.push(tempAudio);
      }
    });
  }

  public playKnock(): Promise<any> {
    if (this.knockSounds && this.knockSounds.length) {
      const randomNumber = Math.floor(Math.random() * this.knockSounds.length);
      return new Promise((resolve, reject) => {
        this.knockSounds[randomNumber].currentTime = 0;
        this.knockSounds[randomNumber].play().then(() => {}).catch(() => {});
        this.knockSounds[randomNumber].onended = resolve;
        this.knockSounds[randomNumber].onerror = reject;
      });
    }
  }

  constructor(
    private httpClient: HttpClient
  ) {
    this.httpClient.get<any>(`${environment.endpoint}/online/game-sounds/`).pipe(
      take(1)
    ).subscribe((response) => {
      this.initSoundUrls(response);
    });
  }
}
