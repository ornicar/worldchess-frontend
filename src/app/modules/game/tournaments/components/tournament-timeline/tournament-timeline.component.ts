import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { IOnlineTournament, IOnlineTournamentSorted } from '@app/modules/game/tournaments/models/tournament.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { Moment } from 'moment';
import { BoardType, GameRatingMode } from '@app/broadcast/core/tour/tour.model';

interface ITimeLabel {
  label: string;
  offset: number;
}

@Component({
  selector: 'wc-tournament-timeline',
  templateUrl: './tournament-timeline.component.html',
  styleUrls: ['./tournament-timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentTimelineComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  tournament: IOnlineTournament = {};
  window = window;

  @Input()
  hideEmpty = false;

  @Input()
  onlineTournaments: IOnlineTournament[] = [];
  onlineTournaments$: BehaviorSubject<IOnlineTournament[]> = new BehaviorSubject([]);

  @ViewChild('timeline', { read: ViewContainerRef, static: true })
  timeline;
  @ViewChild('timelineContainer', { read: ViewContainerRef, static: true })
  timelineContainer;

  timeLabels$: BehaviorSubject<ITimeLabel[]> = new BehaviorSubject([]);
  isDragProceed$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  startDragX: number;

  sizeOfHalfAnHour = 140;
  hoursLeft = 12;
  hoursRight = 24;
  timeLabelHeight = 45;
  ratingTypeLabelHeight = 40;
  tournamentLineHeight = 78;
  minTimeWidthOfCardInMinutes = 290 / this.sizeOfHalfAnHour * 30;

  startTime = moment().subtract({ hours: this.hoursLeft });
  endTime = moment().add({ hours: this.hoursRight });

  destroy$ = new Subject();
  timelineWidth = 0;
  timelineContainerWidth = 0;
  timelineHeight = 0;

  fideRatedLines$: BehaviorSubject<IOnlineTournamentSorted[][]> = new BehaviorSubject([]);
  wCRatedLines$: BehaviorSubject<IOnlineTournamentSorted[][]> = new BehaviorSubject([]);
  hidden$: BehaviorSubject<boolean> = new BehaviorSubject(this.hideEmpty);

  wcRatedLabelTop = 0;
  fideRatedLabelTop = 0;

  pastAreaLeft = 0;
  pastAreaLabel = '';

  constructor() { }

  ngOnInit() {
    this.hidden$.next(this.hideEmpty);
    this.onlineTournaments$.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      filter((onlineTournaments) => !!onlineTournaments)
    ).subscribe((onlineTournaments) => {
      const fideRatedLines = [];
      const wCRatedLines = [];

      const onlineTournamentsSorted = onlineTournaments
        .map((tournament) => {
          return {
            ...tournament,
            momentTime: moment(tournament.datetime_of_tournament),
            datetime_of_finish: this.calcFinishTime(tournament),
            comparable_datetime_of_finish: this.calcComparableFinishTime(tournament)
          };
        })
        .sort((a, b) => {
          return a.momentTime.diff(b.momentTime);
        });

      const tournamentsFide = [...onlineTournamentsSorted].filter((tournament) => (tournament.rating_type === GameRatingMode.FIDERATED));
      const tournamentsWC = [...onlineTournamentsSorted].filter((tournament) => (tournament.rating_type === GameRatingMode.RATED));

      this.calcLines(tournamentsFide, fideRatedLines);
      this.calcLines(tournamentsWC, wCRatedLines);

      this.hidden$.next(this.hideEmpty && (fideRatedLines.length === 0 && wCRatedLines.length === 0));
      this.fideRatedLines$.next(fideRatedLines);
      this.wCRatedLines$.next(wCRatedLines);
      this.calcGroupLabelTop();
      this.calcPastArea();
      setTimeout(() => (this.timeline.element.nativeElement.scrollLeft = this.pastAreaLeft - 30), 0);
    });

    this.timelineWidth = this.sizeOfHalfAnHour * (this.hoursLeft + this.hoursRight) * 2;

    const startLabel = moment().subtract({ hours: this.hoursLeft }).startOf('hour').add({ minutes: 30 });

    if (startLabel.diff(this.startTime) < 0) {
      startLabel.add({ minutes: 30 });
    }

    const diffMinute = startLabel.diff(this.startTime, 'm');
    const initialOffset = (diffMinute / 30) * this.sizeOfHalfAnHour;
    const tempTime = startLabel.clone();
    const timeLabels: ITimeLabel[] = [];

    let index = 0;
    while (tempTime.diff(this.endTime) < 0) {
      const timeWithDate = tempTime.format('MMM DD · HH:mm');
      const timeWithoutDate = tempTime.format('HH:mm');

      timeLabels.push({
        label: this.isToday(tempTime)
          ? timeWithoutDate
          : timeWithoutDate === '00:00'
            ? timeWithDate
            : timeWithoutDate,
        offset: initialOffset + index * this.sizeOfHalfAnHour
      });

      tempTime.add({ minutes: 30 });
      index++;
    }

    this.timeLabels$.next(timeLabels);
    this.calcPastArea();
    setTimeout(() => (this.timeline.element.nativeElement.scrollLeft = this.pastAreaLeft - 30), 0);
  }

  calcFinishTime(tournament: IOnlineTournament): string {
    let result = tournament.datetime_of_finish;
    if (moment(tournament.datetime_of_finish).diff(tournament.datetime_of_tournament, 'minutes') < this.minTimeWidthOfCardInMinutes) {
      result = moment(tournament.datetime_of_tournament).add(this.minTimeWidthOfCardInMinutes, 'm').toISOString();
    }

   return result;
  }

  calcComparableFinishTime(tournament: IOnlineTournament): string {
    let result = this.calcFinishTime(tournament);

    // если тип турнира BULLET, то увеличиваем ширину на 30 пикселей, т.к. в конце есть дополнительное скругление
    if (tournament.time_control.board_type === BoardType.BULLET) {
      result = moment(result).add(30 * 30 / this.sizeOfHalfAnHour, 'm').toISOString();
    }

   return result;
  }

  isToday(time: Moment) {
    return !(time.clone().startOf('day').diff(moment().startOf('day')));
  }

  calcLines(tournaments: IOnlineTournamentSorted[], accumulator) {
    const nextTournaments = [...tournaments];
    let deletedCount;
    let currentLine: IOnlineTournamentSorted[];

    while (tournaments.length) {
      deletedCount = 0;
      currentLine = [];
      tournaments
        .forEach((tournament, index) => {
          if (currentLine.length
            && currentLine[currentLine.length - 1]) {
            if (moment(currentLine[currentLine.length - 1].comparable_datetime_of_finish).diff(tournament.momentTime) < 0) {
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

  calcTournamentOffset(tournament: IOnlineTournamentSorted) {
    return tournament.momentTime.diff(this.startTime, 'm') / 30 * this.sizeOfHalfAnHour;
  }

  calcTournamentWidth(tournament: IOnlineTournamentSorted) {
    return Math.abs(moment(tournament.datetime_of_finish).diff(tournament.momentTime, 'm')) / 30 * this.sizeOfHalfAnHour;
  }

  calcTournamentTop(tournament: IOnlineTournamentSorted, index: number) {
    return index * 78 + this.timeLabelHeight + this.ratingTypeLabelHeight + 12
            + (tournament.rating_type === GameRatingMode.FIDERATED
                ? 0
                : (this.fideRatedLines$.value.length * 78 + 12
                    + (this.fideRatedLines$.value.length ? this.ratingTypeLabelHeight : 0)));
  }

  scrollHorizontally(delta) {
    if (this.timeline.element.nativeElement.scrollLeft - (delta * 2) < this.timelineWidth - this.timelineContainerWidth) {
      this.timeline.element.nativeElement.scrollLeft -= (delta * 2);
    }
  }

  ngAfterViewInit(): void {
    // if (this.timeline.element.nativeElement.addEventListener) {
    //   // IE9, Chrome, Safari, Opera
    //   this.timeline.element.nativeElement.addEventListener('mousewheel', this.scrollHorizontally.bind(this), false);
    //   // Firefox
    //   this.timeline.element.nativeElement.addEventListener('DOMMouseScroll', this.scrollHorizontally.bind(this), false);
    // } else {
    //   // IE 6/7/8
    //   this.timeline.element.nativeElement.attachEvent('onmousewheel', this.scrollHorizontally.bind(this));
    // }
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
    if (changes['onlineTournaments']) {
      this.onlineTournaments$.next(changes['onlineTournaments'].currentValue);
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
    this.timelineHeight = (this.fideRatedLines$.value.length + this.wCRatedLines$.value.length) * this.tournamentLineHeight
      + this.timeLabelHeight + 33 +
      + this.ratingTypeLabelHeight * ((this.fideRatedLines$.value.length ? 1 : 0) + (this.wCRatedLines$.value.length ? 1 : 0)) ;
    this.fideRatedLabelTop = 76;
    this.wcRatedLabelTop = this.fideRatedLabelTop + this.fideRatedLines$.value.length * this.tournamentLineHeight
      + (this.fideRatedLines$.value.length ? this.ratingTypeLabelHeight : 0) + 14;
  }

  calcPastArea() {
    this.pastAreaLeft = moment().diff(this.startTime, 'm') / 30 * this.sizeOfHalfAnHour;
    this.pastAreaLabel = moment().format('HH:mm');
  }
}
