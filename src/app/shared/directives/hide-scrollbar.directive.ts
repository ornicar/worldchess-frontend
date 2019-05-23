import {DOCUMENT} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  HostBinding,
  Inject,
  Injectable,
  Input,
  Renderer2
} from '@angular/core';
import {AfterViewChecked} from '@angular/core/src/metadata/lifecycle_hooks';

@Injectable()
export class HideScrollbarService {

  public scrollbarWidth: number;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.scrollbarWidth = this.getScrollbarWidth();
  }

  private getScrollbarWidth(): number {
    /**
     * Browser Scrollbar Widths (2016)
     * OSX (Chrome, Safari, Firefox) - 15px
     * Windows XP (IE7, Chrome, Firefox) - 17px
     * Windows 7 (IE10, IE11, Chrome, Firefox) - 17px
     * Windows 8.1 (IE11, Chrome, Firefox) - 17px
     * Windows 10 (IE11, Chrome, Firefox) - 17px
     * Windows 10 (Edge 12/13) - 12px
     */
    const outer = this.renderer.createElement('div');
    this.renderer.setStyle(outer, 'visibility', 'hidden');
    this.renderer.setStyle(outer, 'width', '100px');
    this.renderer.setStyle(outer, 'msOverflowStyle', 'scrollbar');  // needed for WinJS apps

    this.renderer.appendChild(this.document.body, outer);

    const widthNoScroll = outer.offsetWidth;
    // force scrollbars
    this.renderer.setStyle(outer, 'overflow', 'scroll');

    // add innerdiv
    const inner = this.renderer.createElement('div');
    this.renderer.setStyle(inner, 'width', '100%');
    this.renderer.appendChild(outer, inner);

    const widthWithScroll = inner.offsetWidth;

    // remove divs
    this.renderer.removeChild(this.document.body, outer);

    return widthNoScroll - widthWithScroll;
  }
}

@Directive({
  selector: '[wcHideScrollbar]',
  providers: [
    HideScrollbarService
  ]
})
export class HideScrollbarDirective implements AfterViewInit, AfterViewChecked {

  @Input('wcHideScrollbarType')
  wcHideScrollbarType: 'vertical' | 'horizontal' | 'both' = 'vertical';


  @Input('wcForceHideVerticalScrollBar')
  wcForceHideVerticalScrollBar = false;

  constructor(
    private elementRef: ElementRef,
    private cd: ChangeDetectorRef,
    private hideScrollbarService: HideScrollbarService
  ) {
  }

  private hideVerticalScrollbar = false;
  private hideHorizontalScrollbar = false;

  @HostBinding('style.margin-right.px')
  get verticalScrollbarWidth() {
    return (this.wcForceHideVerticalScrollBar || this.hideVerticalScrollbar)
      ? -this.hideScrollbarService.scrollbarWidth : null;
  }

  @HostBinding('style.margin-bottom.px')
  get horizontalScrollbarWidth() {
    return this.hideHorizontalScrollbar ? -this.hideScrollbarService.scrollbarWidth : null;
  }

  private checkScroll() {
    const target = this.wcHideScrollbarType;
    const elm = this.elementRef.nativeElement;

    if (!this.wcForceHideVerticalScrollBar && (target === 'vertical' || target === 'both')) {
      this.hideVerticalScrollbar = elm.scrollHeight > elm.clientHeight;
    }

    if (target === 'horizontal' || target === 'both') {
      this.hideHorizontalScrollbar = elm.scrollWidth > elm.clientWidth;
    }
  }

  ngAfterViewInit() {
    this.checkScroll();
    this.cd.detectChanges();
  }

  ngAfterViewChecked() {
    this.checkScroll();
  }
}
