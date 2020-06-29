import {Component, HostListener, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {IOnlineTournament} from "@app/modules/game/tournaments/models/tournament.model";
import {TournamentService} from "@app/modules/app-common/services/tournament.service";
import * as moment from "moment";

@Component({
  selector: 'main-page-join-tournaments',
  templateUrl: './main-page-join-tournaments.component.html',
  styleUrls: ['./main-page-join-tournaments.component.scss']
})
export class MainPageJoinTournamentsComponent implements OnInit {

  @Input()
  full: boolean = false;

  @Input()
  data:IOnlineTournament[] = [];

  visibleData: IOnlineTournament[] = [];

  totalCount: number = 1;

  now = moment().utcOffset(0);

  isDragProceed$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isDragging$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  startDragX: number;

  @ViewChild('cardContainer', {read: ViewContainerRef, static: true})
  cardContainer;

  @ViewChild('cardHost', {read: ViewContainerRef, static: true})
  cardHost;

  cardContainerWidth = 0;
  cardHostWidth = 0;

  constructor() { }

  ngOnInit() {
    this.totalCount = this.full? 4: 1;
    this.visibleData = this.data.slice(0, this.totalCount);
  }

  startDrag(event: MouseEvent) {
    this.isDragProceed$.next(true);
    this.isDragging$.next(false);
    this.startDragX = event.clientX;
  }

  @HostListener('document:mouseup')
  stopDrag($event:MouseEvent) {
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
    if (this.cardHost){
       this.cardHostWidth = this.cardHost.element.nativeElement.clientWidth
    }
    if (this.cardHost.element.nativeElement.scrollLeft - (delta * 2) < this.cardHostWidth - this.cardContainerWidth) {
      this.cardContainer.element.nativeElement.scrollLeft -= (delta * 2);
    }
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
}
