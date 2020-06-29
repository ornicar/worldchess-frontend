import {Component, HostListener, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {IOnlineTournament} from "@app/modules/game/tournaments/models/tournament.model";
import {BehaviorSubject, EMPTY, empty, interval, of, Subject, timer} from "rxjs";
import {delay, takeUntil} from "rxjs/operators";

@Component({
  selector: 'main-page-tournaments-today-row',
  templateUrl: './main-page-tournaments-today-row.component.html',
  styleUrls: ['./main-page-tournaments-today-row.component.scss']
})
export class MainPageTournamentsTodayRowComponent implements OnInit {

  constructor() {
  }

  @Input() move: "left" | "right" = "left";

  @Input() tournaments: IOnlineTournament[];

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

  ngOnInit() {
    if (!this.destroy$.value) {
      setTimeout(this.doScroll, 100)
    }
  }

  doScroll = () => {
    if (!this.destroy$.value) {
      if (!this.moseHover$.value && !this.isDragging$.value) {
        this.scrollHorizontally(this.move === "right" ? -1 : 1);
      }
      setTimeout(this.doScroll, 100)
    }
  }


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
    if (this.isDragging$.value) {
      $event.stopPropagation();
      $event.preventDefault();
      this.isDragProceed$.next(false);
      this.isDragging$.next(false)
    }
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
    this.cardContainer.element.nativeElement.scrollLeft = scrollLeft;
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
