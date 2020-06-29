import {DOCUMENT} from '@angular/common';
import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  HostBinding,
  Inject,
  Injectable,
  Input,
  Renderer2,
} from '@angular/core';

enum BrowserType {
  Chrome,
  MobileChrome,
  OtherDesktop
}

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

    const widthWithScroll = inner.clientWidth;

    // remove divs
    this.renderer.removeChild(this.document.body, outer);

    const ua = navigator.userAgent;

    let browserType = BrowserType.OtherDesktop;

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)) {
      browserType = BrowserType.MobileChrome;
    } else if (/Chrome/i.test(ua)) {
      browserType = BrowserType.Chrome;
    }

    let result = 0;

    if (browserType === BrowserType.MobileChrome) {
      result = 6;
    } else {
      result = widthNoScroll - widthWithScroll;
    }

    return result;
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

  @Input('needPaddingRight')
  needPaddingRight = false;

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
    if (this.needPaddingRight) {
      this.elementRef.nativeElement.style.paddingRight = this.hideScrollbarService.scrollbarWidth + 'px';
    }
    return (this.wcForceHideVerticalScrollBar || this.hideVerticalScrollbar)
      ? -this.hideScrollbarService.scrollbarWidth : 0;
  }

  @HostBinding('style.margin-bottom.px')
  get horizontalScrollbarWidth() {
    return this.hideHorizontalScrollbar ? -this.hideScrollbarService.scrollbarWidth : 0;
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
