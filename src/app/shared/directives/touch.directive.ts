import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[touch]'
})
export class TouchDirective {

  @Output() touchStarted = new EventEmitter<Touch>();

  @HostListener('touchstart', ['$event'])
  touchStart(event: AppTouchEvent) {
    this.touchStarted.emit(
      event.targetTouches
        && event.targetTouches[0]);
  }

  constructor(private elementRef: ElementRef<HTMLElement>) {
  }
}

export type AppTouchEvent = TouchEvent;
