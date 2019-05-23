import {DOCUMENT} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy, Output
} from '@angular/core';
import {fromEvent} from 'rxjs';
import {DomHelper} from '../../helpers/dom.helper';
import {SubscriptionHelper, Subscriptions} from '../../helpers/subscription.helper';

export enum DragScrollStatus {
  Off,
  On, // When press.
  Dragging, // When user start move more than 5px.
}

@Component({
  selector: 'wc-drag-scroll',
  templateUrl: './drag-scroll.component.html',
  styleUrls: ['./drag-scroll.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DragScrollComponent implements OnDestroy, AfterViewInit, OnChanges {

  public status: DragScrollStatus = DragScrollStatus.Off;

  /**
   * Is the user currently pressing the element
   */
  private isPressed = false;

  /**
   * The x coordinates on the element
   */
  private downX = 0;

  private startDownX = 0;

  /**
   * The y coordinates on the element
   */
  private downY = 0;

  private startDownY = 0;

  @Input()
  private dragDisabled = false;

  /**
   * Whether horizontally dragging and scrolling is be disabled
   */
  @Input()
  private dragScrollXDisabled = false;

  /**
   * Whether vertically dragging and scrolling events is disabled
   */
  @Input()
  private dragScrollYDisabled = false;

  @Output()
  private dragScrollStatus = new EventEmitter<DragScrollStatus>();

  private subs: Subscriptions = {};

  private onMouseDown$ = fromEvent<MouseEvent>(
    this.elementRef.nativeElement,
    'mousedown'
  );

  private onMouseMove$ = fromEvent<MouseEvent>(
    this.document.documentElement,
    'mousemove',
    DomHelper.isPassiveSupported() ? {passive: true} : undefined
  );

  private onMouseUp$ = fromEvent<MouseEvent>(
    this.document.documentElement,
    'mouseup'
  );

  constructor(
    public elementRef: ElementRef,
    private cd: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document
  ) {
  }

  ngOnChanges() {}

  ngAfterViewInit() {
    this.subs.onMouseDown = this.onMouseDown$.subscribe(this.onMouseDownHandler.bind(this));

    // @todo add fix for firefox only for child elements.
    // prevent Firefox from dragging images
    // this._renderer.listen('document', 'dragstart', (e) => {
    //   console.log(121212121);
    //
    //   e.preventDefault();
    // });
  }

  ngOnDestroy() {
    if (this.isPressed) {
      this.isPressed = false;

      this.status = DragScrollStatus.Off;
      this.dragScrollStatus.emit(DragScrollStatus.Off);
    }

    SubscriptionHelper.unsubscribe(this.subs);
  }

  onMouseDownHandler({clientX, clientY}: MouseEvent) {
    if (!this.isPressed && !this.dragDisabled) {
      this.isPressed = true;
      this.downX = this.startDownX = clientX;
      this.downY = this.startDownY = clientY;

      this.startGlobalListening();
      this.status = DragScrollStatus.On;
      this.dragScrollStatus.emit(DragScrollStatus.On);
      this.cd.detectChanges();
    }
  }

  onMouseMoveHandler({clientX, clientY}: MouseEvent) {
    if (this.isPressed && !this.dragDisabled) {
      // Drag X
      if (!this.dragScrollXDisabled) {
        this.elementRef.nativeElement.scrollLeft += - clientX + this.downX;
        this.downX = clientX;
      }

      // Drag Y
      if (!this.dragScrollYDisabled) {
        this.elementRef.nativeElement.scrollTop += - clientY + this.downY;
        this.downY = clientY;
      }

      if (
        this.status === DragScrollStatus.On
        && (
          (!this.dragScrollXDisabled && Math.abs(clientX - this.startDownX) > 5)
          || (!this.dragScrollYDisabled && Math.abs(clientY - this.startDownY) > 5)
        )
      ) {
        this.status = DragScrollStatus.Dragging;
        this.dragScrollStatus.emit(DragScrollStatus.Dragging);
      }
    }
  }

  onMouseUpHandler() {
    if (this.isPressed) {
      this.isPressed = false;

      this.stopGlobalListening();
      this.status = DragScrollStatus.Off;
      this.dragScrollStatus.emit(DragScrollStatus.Off);
      this.cd.detectChanges();
    }
  }

  private startGlobalListening() {
    if (!this.subs.onMouseMove) {
      this.subs.onMouseMove = this.onMouseMove$.subscribe(this.onMouseMoveHandler.bind(this));
    }

    if (!this.subs.onMouseUp) {
      this.subs.onMouseUp = this.onMouseUp$.subscribe(this.onMouseUpHandler.bind(this));
    }
  }

  private stopGlobalListening() {
    if (this.subs.onMouseMove) {
      this.subs.onMouseMove.unsubscribe();
      delete this.subs.onMouseMove;
    }

    if (this.subs.onMouseUp) {
      this.subs.onMouseUp.unsubscribe();
      delete this.subs.onMouseUp;
    }
  }
}
