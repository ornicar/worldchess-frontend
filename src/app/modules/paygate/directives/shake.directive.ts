import { AfterViewInit, Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { BehaviorSubject, interval, isObservable, Observable, pipe, Subject } from 'rxjs';
import { finalize, map, takeUntil, takeWhile } from 'rxjs/operators';

@Directive({
  selector: '[shake]',
})
export class ShakeDirective implements OnChanges, OnInit, OnDestroy, AfterViewInit {

  destroy$ = new Subject();

  @Input('shake') shake: boolean | Observable<any> = false;
  @Input('shakePadding') shakePadding = false;
  private initialMargin: number;
  private initialPadding: number;

  constructor(
    private el: ElementRef,
  ) {
  }

  ngOnInit() {
    if (isObservable(this.shake)) {
      this.shake.pipe(
        takeUntil(this.destroy$),
      ).subscribe((shake) => {
        if (shake) {
          this.shakeIt();
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.initialPadding = parseInt(window.getComputedStyle(this.el.nativeElement).paddingLeft || '0', 10);
    this.initialMargin = parseInt(window.getComputedStyle(this.el.nativeElement).marginLeft || '0', 10);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['shake'] && !!changes['shake'].currentValue) {
      if (isObservable(changes['shake'].currentValue)) {
        this.ngOnInit();
      } else {
        this.shakeIt();
      }
    }
  }

  shakeIt() {
    const initialMarginOrPadding = this.shakePadding ? this.initialPadding : this.initialMargin;
      interval(10)
        .pipe(
          takeWhile(x => x < 82),
          map(x => (1 / (Math.pow (x, 1.25) / 20 + 0.5) - 0.05) * Math.sin(x / 2) * 25 + initialMarginOrPadding),
          finalize(() => this.shakeElement(initialMarginOrPadding)),
        ).subscribe(this.shakeElement);
  }

  shakeElement = (x) => {
    if (this.shakePadding) {
      this.el.nativeElement.style.paddingLeft = x + 'px';
    } else {
      this.el.nativeElement.style.marginLeft = x + 'px';
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
