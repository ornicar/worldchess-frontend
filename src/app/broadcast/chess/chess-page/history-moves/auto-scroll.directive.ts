import { AfterViewChecked, Directive, ElementRef, Input, NgZone, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[wcAutoScroll]'
})
export class AutoScrollDirective implements OnChanges, AfterViewChecked {

  private shouldScroll = false;

  @Input() whenScroll = false;
  @Input() autoScrollWrap: HTMLElement;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private ngZone: NgZone
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.whenScroll.currentValue) {
      this.shouldScroll = true;
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.ngZone.runOutsideAngular(() =>
        setTimeout(() => {
          if (this.autoScrollWrap) {
            const wrap = this.autoScrollWrap;
            const elmRect = this.elementRef.nativeElement.getBoundingClientRect();
            const wrapRect = wrap.getBoundingClientRect();

            const offsetBottom = elmRect.bottom - wrapRect.bottom;
            const offsetTop = wrapRect.top - elmRect.top;

            if (offsetBottom > 0) {
              wrap.scrollTop += offsetBottom;
            } else if (offsetTop > 0) {
              wrap.scrollTop -= offsetTop;
            }
          }
        }, 0)
      );

      this.shouldScroll = false;
    }
  }
}
