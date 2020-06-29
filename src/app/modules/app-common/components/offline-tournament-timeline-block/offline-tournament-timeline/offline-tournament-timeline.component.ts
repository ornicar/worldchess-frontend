import {Component, HostListener, Input, OnInit, SimpleChanges, ViewChild, ViewContainerRef} from '@angular/core';
import {BehaviorSubject, Subject} from "rxjs";
import * as moment from "moment";
import {distinctUntilChanged, filter, takeUntil} from "rxjs/operators";
import {Moment} from "moment";
import {ITimelineTournament, ITournament} from "@app/modules/main/model/tournament";

interface ITimeLabel {
  label: string;
  offset: number;
  today: boolean,
  weekend: boolean
}

const weekDays = {
  1: 'Mo',
  2: 'Tu',
  3: 'We',
  4: 'Th',
  5: 'Fr',
  6: 'Sa',
  0: 'Su'
}

const weekDaysClass = {
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
  0: 'sun'
}


@Component({
  selector: 'offline-tournament-timeline',
  templateUrl: './offline-tournament-timeline.component.html',
  styleUrls: ['./offline-tournament-timeline.component.scss']
})
export class OfflineTournamentTimelineComponent implements OnInit {

  window = window;

  @Input()
  hideEmpty = false;

  @Input()
  tournaments: ITournament[] = [];
  tournaments$: BehaviorSubject<ITournament[]> = new BehaviorSubject([]);

  @ViewChild('timeline', {read: ViewContainerRef, static: true})
  timeline;
  @ViewChild('timelineContainer', {read: ViewContainerRef, static: true})
  timelineContainer;

  timeLabels$: BehaviorSubject<ITimeLabel[]> = new BehaviorSubject([]);
  isDragProceed$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  startDragX: number;

  sizeOfDay = 60;
  dateLeft = moment().add(-6, 'month').startOf("day");
  dateRight = moment().add(6, "month").endOf("day");
  timeLabelHeight = 45;
  tournamentLineHeight = 100;
  minTimeWidthOfCardInMinutes = 290 / this.sizeOfDay ;

  timelineClass = weekDaysClass[moment().weekday()]

  startTime = this.dateLeft;
  endTime = this.dateRight;

  destroy$ = new Subject();
  timelineWidth = 0;
  timelineContainerWidth = 0;
  timelineHeight = 0;

  tournamentLines$: BehaviorSubject<ITimelineTournament[][]> = new BehaviorSubject([]);
  hidden$: BehaviorSubject<boolean> = new BehaviorSubject(this.hideEmpty);
  pastAreaLeft = 0;

  constructor() {
  }

  ngOnInit() {
    this.hidden$.next(this.hideEmpty);
    this.tournaments$.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      filter((tournaments) => !!tournaments)
    ).subscribe((tournaments) => {
      const tournamentLines = [];

      const tournamentsSorted = tournaments
        .map((tournament, index) => {
          const start = tournament.datetime_of_tournament;
          const end = tournament.datetime_of_finish;
          return {
            ...tournament,
            momentTime: moment(start),
            datetime_of_tournament:start,
            datetime_of_finish:  end,
          } as ITimelineTournament;
        })
        .sort((a, b) => {
          return a.momentTime.diff(b.momentTime);
        }).filter(item=>moment(item.datetime_of_tournament).diff(this.startTime,'day')>=0 && moment(item.datetime_of_finish).diff(this.endTime)<=0);
      this.calcLines(tournamentsSorted, tournamentLines);
      this.hidden$.next(this.hideEmpty && tournamentLines.length === 0);
      this.tournamentLines$.next(tournamentLines);
      this.calcGroupLabelTop();
      this.calcPastArea();
      setTimeout(() => (this.timeline.element.nativeElement.scrollLeft = this.pastAreaLeft - 30), 0);
    });

    this.timelineWidth = this.sizeOfDay * (this.endTime.diff(this.startTime, 'day'));

    const startLabel = this.dateLeft;

    const initialOffset = (0) * this.sizeOfDay;
    const tempTime = startLabel.clone();
    const timeLabels: ITimeLabel[] = [];

    let index = 0;
    while (tempTime.diff(this.endTime) < 0) {
      const timeWithDate = tempTime.format('MMM D');
      const weekDay = tempTime.weekday();
      const timeWithWeekDay = tempTime.format('D ') + weekDays[weekDay];

      timeLabels.push({
        label: this.isToday(tempTime) ? timeWithDate : timeWithWeekDay,
        today: this.isToday(tempTime),
        offset: initialOffset + index * this.sizeOfDay,
        weekend: weekDay == 6 || weekDay == 0
      });

      tempTime.add({day: 1});
      index++;
    }

    this.timeLabels$.next(timeLabels);
    this.calcPastArea();
    setTimeout(() => (this.timeline.element.nativeElement.scrollLeft = this.pastAreaLeft - 30), 0);
  }

  calcFinishTime(tournament: ITournament): string {
    let result = tournament.datetime_of_finish;
    if (moment(tournament.datetime_of_finish).diff(tournament.datetime_of_tournament, 'minutes') < this.minTimeWidthOfCardInMinutes) {
      result = moment(tournament.datetime_of_tournament).add(this.minTimeWidthOfCardInMinutes, 'm').toISOString();
    }

    return result;
  }

  isToday(time: Moment) {
    return !(time.clone().startOf('day').diff(moment().startOf('day')));
  }

  calcLines(tournaments: ITournament[], accumulator) {
    const nextTournaments = [...tournaments];
    let deletedCount;
    let currentLine: ITournament[];

    while (tournaments.length) {
      deletedCount = 0;
      currentLine = [];
      tournaments
        .forEach((tournament, index) => {
          if (currentLine.length
            && currentLine[currentLine.length - 1]) {
            if (moment(currentLine[currentLine.length - 1].datetime_of_finish).diff(moment(tournament.datetime_of_tournament)) < 0) {
              currentLine.push(tournament);
              nextTournaments.splice(index - deletedCount, 1);
              deletedCount++;
            }
          } else {
            currentLine.push(tournament);
            nextTournaments.splice(index - deletedCount, 1);
            deletedCount++;
          }
        });
      tournaments = [...nextTournaments];
      accumulator.push(currentLine);
    }
  }

  calcTournamentOffset(tournament: ITimelineTournament) {
    const res = tournament.momentTime.diff(this.startTime, 'm') / (24*60) * this.sizeOfDay;
    return res;
  }

  calcTournamentWidth(tournament: ITimelineTournament) {
    const res = Math.abs(moment(tournament.datetime_of_finish).diff(tournament.momentTime, 'm')) / (24*60) * this.sizeOfDay;
    return res;
  }

  calcTournamentTop(tournament: ITimelineTournament, index: number) {
    return index * this.tournamentLineHeight + this.timeLabelHeight  + 6;
  }

  scrollHorizontally(delta) {
    if (this.timeline.element.nativeElement.scrollLeft - (delta * 2) < this.timelineWidth - this.timelineContainerWidth) {
      this.timeline.element.nativeElement.scrollLeft -= (delta * 2);
    }
  }

  ngAfterViewInit(): void {
    if (this.timelineContainer) {
      this.timelineContainerWidth = this.timelineContainer.element.nativeElement.clientWidth;
      this.calcGroupLabelTop();
    }
  }

  startDrag(event: MouseEvent) {
    this.isDragProceed$.next(true);
    this.startDragX = event.clientX;
  }

  @HostListener('document:mouseup')
  stopDrag() {
    this.isDragProceed$.next(false);
  }

  @HostListener('document:mousemove', ['$event'])
  moveCursor(e: MouseEvent) {
    e.preventDefault();
    if (this.isDragProceed$.value) {
      this.scrollHorizontally(e.clientX - this.startDragX);
      this.startDragX = e.clientX;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tournaments']) {
      this.tournaments$.next(changes['tournaments'].currentValue);
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.timelineContainer) {
      this.timelineContainerWidth = this.timelineContainer.element.nativeElement.clientWidth;
      if (this.timeline.element.nativeElement.scrollLeft > this.timelineWidth - this.timelineContainerWidth) {
        this.timeline.element.nativeElement.scrollLeft = this.timelineWidth - this.timelineContainerWidth;
      }
      this.calcGroupLabelTop();
    }
  }

  calcGroupLabelTop() {
    this.timelineHeight = this.tournamentLines$.value.length * this.tournamentLineHeight
      + this.timeLabelHeight + 33 ;
  }

  calcPastArea() {
    this.pastAreaLeft = moment().diff(this.startTime, 'm') / (60 * 24) * this.sizeOfDay;
  }
}
