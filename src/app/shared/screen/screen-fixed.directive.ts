import {AfterViewInit, Directive, ElementRef, OnDestroy} from '@angular/core';
import {ScreenStateService} from './screen-state.service';

@Directive({
  selector: '[wcScreenFixed]'
})
export class ScreenFixedDirective implements AfterViewInit, OnDestroy {

  constructor(
    private screenState: ScreenStateService,
    private elementRef: ElementRef
  ) {
  }

  ngAfterViewInit() {
    this.screenState.addFixedElement(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    this.screenState.removeFixedElement(this.elementRef.nativeElement);
  }
}
