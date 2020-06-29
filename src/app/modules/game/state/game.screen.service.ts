import { HostListener, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class GameScreenService {

  isMobile$ = new BehaviorSubject(this.isMobile());

  isMobile() {
    return window.innerWidth < 999;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile$.next(this.isMobile());
  }

  constructor() {
    window.addEventListener('resize', this.onResize.bind(this));
  }
}
