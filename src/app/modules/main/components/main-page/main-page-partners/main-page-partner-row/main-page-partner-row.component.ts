import {Component, HostListener, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Partner} from "@app/modules/main/model/partner";
import {BehaviorSubject, timer} from "rxjs";

@Component({
  selector: 'main-page-partner-row',
  templateUrl: './main-page-partner-row.component.html',
  styleUrls: ['./main-page-partner-row.component.scss']
})
export class MainPagePartnerRowComponent implements OnInit {

  constructor() {
  }

  @Input()
  partners: Partner[];

  @Input()
  isMoving: boolean

  ngOnInit() {
    this.doScroll()
  }

  doScroll = ()=>{
    if (this.isMoving) {
      if (!this.moseHover$.value && !this.isDragging$.value) {
        this.scrollHorizontally(-1);
      }
      if (!this.destroy$.value) {
        setTimeout(this.doScroll, 50);
      }
    }
  }

  @ViewChild('cardContainer', {read: ViewContainerRef, static: true})
  cardContainer;

  @ViewChild('cardHost', {read: ViewContainerRef, static: true})
  cardHost;

  isDragProceed$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isDragging$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  moseHover$: BehaviorSubject<number> = new BehaviorSubject<number>(0)
  startDragX: number;


  cardContainerWidth = 0;
  cardHostWidth = 0;

  destroy$ = new BehaviorSubject(false);

  startDrag(event: MouseEvent) {
    this.isDragProceed$.next(true);
    this.isDragging$.next(false);
    this.startDragX = event.clientX;
  }

  mouseEnter(event: MouseEvent) {
    this.moseHover$.next(Date.now())
  }

  mouseLeave(event: MouseEvent) {
    const enterTime = this.moseHover$.value;
    timer(2000).subscribe(val => {
      if (this.moseHover$.value === enterTime) {
        this.moseHover$.next(0);
      }
    })
  }

  @HostListener('document:mouseup')
  stopDrag($event: MouseEvent) {
    this.isDragProceed$.next(false);
    this.isDragging$.next(false)
  }

  @HostListener('document:mousemove', ['$event'])
  moveCursor(e: MouseEvent) {
    e.preventDefault();
    if (this.isDragProceed$.value) {
      this.scrollHorizontally(e.clientX - this.startDragX);
      this.startDragX = e.clientX;
      this.isDragging$.next(true);
    }
  }

  ngAfterViewInit(): void {
    if (this.cardContainer) {
      this.cardContainerWidth = this.cardContainer.element.nativeElement.clientWidth;
    }
  }

  scrollHorizontally(delta) {
    if (this.cardHost) {
      this.cardHostWidth = this.cardHost.element.nativeElement.clientWidth
    }
    if (this.cardContainer) {
      this.cardContainerWidth = this.cardContainer.element.nativeElement.clientWidth;
    }
    let scrollLeft = this.cardContainer.element.nativeElement.scrollLeft;
    if (!this.cardContainerWidth) {
      return;
    }
    const leftBound = this.cardHostWidth / 3;
    const rightBound = 2 * this.cardHostWidth / 3
    if (scrollLeft - (delta * 2) < this.cardHostWidth - this.cardContainerWidth) {
      scrollLeft -= (delta * 2);
    }
    if (scrollLeft < leftBound || scrollLeft > rightBound) {
      scrollLeft = leftBound + (scrollLeft % leftBound);
    }
    this.cardContainer.element.nativeElement.scrollTo({left: scrollLeft}) ;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.cardContainer) {
      this.cardContainerWidth = this.cardContainer.element.nativeElement.clientWidth;
      if (this.cardHost.element.nativeElement.scrollLeft > this.cardHostWidth - this.cardContainerWidth) {
        this.cardContainer.element.nativeElement.scrollLeft = this.cardHostWidth - this.cardContainerWidth;
      }
    }
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
