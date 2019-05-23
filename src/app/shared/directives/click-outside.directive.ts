import {AfterViewInit, Directive, ElementRef, EventEmitter, OnDestroy, Output} from '@angular/core';
import {fromEvent, Subscription} from 'rxjs';
import {DomHelper} from '../helpers/dom.helper';

@Directive({
  selector: '[wcClickOutside]'
})
export class ClickOutsideDirective implements AfterViewInit, OnDestroy {

  private clickSub: Subscription;

  @Output()
  public wcClickOutside = new EventEmitter<Event>();

  constructor(private elementRef: ElementRef<HTMLElement>) { }

  ngAfterViewInit() {
    this.clickSub = fromEvent(document.documentElement, 'click').subscribe(event => {
      if (DomHelper.isOutsideElement(this.elementRef, event.target)) {
        this.wcClickOutside.next(event);
      }
    });
  }

  ngOnDestroy() {
    if (this.clickSub) {
      this.clickSub.unsubscribe();
    }
  }
}
