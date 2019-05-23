import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';
import {DomHelper} from '../helpers/dom.helper';

@Directive({
  selector: '[wcInsideScrollArea]'
})
export class InsideScrollAreaDirective implements OnChanges, AfterViewInit, OnDestroy {

  @Input()
  private wcInsideScrollAreaWrap: HTMLElement;

  /**
   * The percentage of the height of the element to offset.
   *
   * 0 - the intersection will is true only if the item is fully inside.
   * 1 - the intersection will is true even if part of the element is inside.
   */
  @Input()
  private wcInsideScrollAreaElementHeightOffset = 0;

  /**
   * The percentage of the width of the element to offset.
   *
   * 0 - the intersection will is true only if the item is fully inside.
   * 1 - the intersection will is true even if part of the element is inside.
   */
  @Input()
  private wcInsideScrollAreaElementWidthOffset = 0;

  @Output()
  private wcInsideScrollAreaIsInside = new EventEmitter<boolean>();

  private _isInside;

  private onScrollListener: Function;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private ngZone: NgZone
  ) {
    this.onScrollListener = this.onScroll.bind(this);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.wcInsideScrollAreaWrap) {
      this.ngZone.runOutsideAngular(() => {
        if (changes.wcInsideScrollAreaWrap.previousValue) {
          changes.wcInsideScrollAreaWrap.previousValue.removeEventListener('scroll', this.onScrollListener);
        }

        if (changes.wcInsideScrollAreaWrap.currentValue) {
          changes.wcInsideScrollAreaWrap.currentValue.addEventListener(
            'scroll',
            this.onScrollListener,
            DomHelper.isPassiveSupported() ? { passive: true } : false
          );
        }
      });
    }
  }

  private isInsideScrollArea(): boolean {
    if (!this.wcInsideScrollAreaWrap || !this.elementRef.nativeElement) {
      return false;
    }

    const elmRect = this.elementRef.nativeElement.getBoundingClientRect();
    const wrapRect = this.wcInsideScrollAreaWrap.getBoundingClientRect();
    const offsetY = elmRect.height * this.wcInsideScrollAreaElementHeightOffset;
    const offsetX = elmRect.width * this.wcInsideScrollAreaElementWidthOffset;

    const offsetTop = elmRect.top + offsetY - wrapRect.top;
    const offsetBottom = wrapRect.bottom + offsetY - elmRect.bottom;

    const offsetLeft = elmRect.left + offsetX - wrapRect.left;
    const offsetRight = wrapRect.right + offsetX - elmRect.right;

    return offsetTop >= 0 && offsetBottom >= 0 && offsetLeft >= 0 && offsetRight >= 0;
  }

  private onScroll() {
    const isInside = this.isInsideScrollArea();

    if (this._isInside !== isInside) {
      this.ngZone.run(() => {
        this._isInside = isInside;
        this.wcInsideScrollAreaIsInside.next(isInside);
      });
    }
  }

  ngAfterViewInit() {
    // Set init state.
    this.onScroll();
  }

  ngOnDestroy() {
    this.wcInsideScrollAreaIsInside.next(false);
  }
}
