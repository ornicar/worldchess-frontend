import { AccountService } from './../../../../account/account-store/account.service';
import {
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { area } from 'd3-shape';
import { select, Selection } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { max, min } from 'd3-array';
import { GameState, IOnlineRating } from '@app/modules/game/state/game.state';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil, throttleTime, withLatestFrom } from 'rxjs/operators';
import { SetLeftExpandingRatingRange, SetStartOnlineRatingRange, SetWidthOnlineRatingRange } from '@app/modules/game/state/game.actions';
import { Select, Store } from '@ngxs/store';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppTouchEvent } from '@app/shared/directives/touch.directive';

enum TouchedElement {
  LeftExpander,
  RightExpander,
  Selector
}

@Component({
  selector: 'wc-game-rating-select-form',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GameRatingSelectFormComponent),
      multi: true
    }
  ],
  templateUrl: './game-rating-select-form.component.html',
  styleUrls: ['./game-rating-select-form.component.scss']
})
export class GameRatingSelectFormComponent implements OnInit, OnChanges, ControlValueAccessor, OnDestroy {

  @ViewChild('chart', { read: ElementRef, static: true }) chart: ElementRef;
  @ViewChild('chartContainer', { read: ElementRef, static: true }) chartContainer: ElementRef;
  @ViewChild('selector', { read: ElementRef, static: true }) selector: ElementRef;

  TouchedElement = TouchedElement;

  @Input()
  onlineRatings: IOnlineRating[] = [];
  onlineRatings$ = new BehaviorSubject<IOnlineRating[]>([]);

  @Select(GameState.startIndexOnlineRatingRange) startRangeIndex$: Observable<number>;
  @Select(GameState.widthOnlineRatingRange) widthOnlineRatingRange$: Observable<number>;
  @Select(GameState.currentSelectedRating) currentRating$: Observable<number>;

  currentStartIndex$ = new BehaviorSubject(0);
  currentWidth$ = new BehaviorSubject(0);

  destroy$ = new Subject();
  resize$ = new BehaviorSubject(false);
  disabled = false;
  fixRightBorderOfSelector = false;
  fixedRightBorder = 0;

  svg: Selection<any, any, any, any>;

  private isDragProceed$ = new BehaviorSubject(false);
  private isLeftExpandProceed$ = new BehaviorSubject(false);
  private isRightExpandProceed$ = new BehaviorSubject(false);
  private startDragX = 0;
  private startSelectorOffsetX = 0;
  private lastIndex = 0;
  private lastWidth = 0;
  private mousex$ = new BehaviorSubject(0);

  selectedRange$ = combineLatest([
    this.startRangeIndex$,
    this.widthOnlineRatingRange$,
    this.onlineRatings$,
    this.resize$
  ]).pipe(
    map(([index, widthRange, onlineRatings]) => {
      let startIndex = 0, width = 0;
      if (onlineRatings.length && Math.round(index / onlineRatings.length * this.chartContainer.nativeElement.offsetWidth) > 2) {
        startIndex = (Math.round((index / onlineRatings.length * this.chartContainer.nativeElement.offsetWidth)) - 2);
      }
      if (onlineRatings.length) {
        width = Math.floor(widthRange / onlineRatings.length * this.chartContainer.nativeElement.offsetWidth);
      }
      return {
        startIndex, width
      };
    }),
  );

  ratingDotPosition$ = combineLatest([
    this.currentRating$,
    this.onlineRatings$,
    this.resize$
  ]).pipe(
    map(([currentRating, onlineRatings]) => {
      if (onlineRatings.length && currentRating) {
        return Math.floor(currentRating / 10 / onlineRatings.length * this.chartContainer.nativeElement.offsetWidth);
      }
      return 0;
    }),
  );


  cursor$ = this.mousex$.pipe(
    takeUntil(this.destroy$),
    throttleTime(20, undefined, { leading: true, trailing: true }),
    filter(x => !!this.selector),
    withLatestFrom(this.onlineRatings$, this.widthOnlineRatingRange$),
    map(([cursor, onlineRatings, width]) => {
      const deltaX = cursor - this.startDragX;
      const currentSelectorLeftX = this.startSelectorOffsetX + deltaX;
      const chartContainerLeft = this.chartContainer.nativeElement.getBoundingClientRect().left;
      const chartContainerWidth = this.chartContainer.nativeElement.offsetWidth;
      const selectorWidth = this.selector.nativeElement.offsetWidth;
      const selectorLeft = this.selector.nativeElement.getBoundingClientRect().left;

      let minX = chartContainerLeft;
      let maxX = chartContainerWidth + chartContainerLeft - selectorWidth;
      if (this.isLeftExpandProceed$.value) {
        maxX = selectorLeft + selectorWidth - 20;
      }
      if (this.isRightExpandProceed$.value) {
        minX = selectorLeft + 20;
        maxX = chartContainerWidth + chartContainerLeft;
      }

      if (currentSelectorLeftX < minX) {
        return this.calcIndex(minX, chartContainerLeft, chartContainerWidth, onlineRatings.length);
      }
      if (currentSelectorLeftX > maxX) {
        return this.calcIndex(maxX, chartContainerLeft, chartContainerWidth, onlineRatings.length);
      }

      return this.calcIndex(currentSelectorLeftX, chartContainerLeft, chartContainerWidth, onlineRatings.length);
    }),
    distinctUntilChanged(),
  );

  calcIndex(cursorX: number, containerLeft: number, containerWidth, rangeLength: number) {
    return Math.round((cursorX - containerLeft) / containerWidth * rangeLength);
  }

  constructor(
    private store$: Store,
    public accountService: AccountService,
  ) {
    this.startRangeIndex$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(this.currentStartIndex$);

    this.widthOnlineRatingRange$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(this.currentWidth$);

    this.cursor$.pipe(
      distinctUntilChanged(),
    ).subscribe((index) => {
      if (this.isDragProceed$.value) {
        this.store$.dispatch(new SetStartOnlineRatingRange(index));
      }
      if (this.isLeftExpandProceed$.value) {
        this.store$.dispatch(new SetLeftExpandingRatingRange(index));
      }
      if (this.isRightExpandProceed$.value) {
        this.store$.dispatch(new SetWidthOnlineRatingRange(
          this.lastWidth + index - this.lastIndex
        ));
      }
    });
  }


  ngOnInit() {
    this.svg = select(this.chart.nativeElement);

    combineLatest([
      this.onlineRatings$,
      this.startRangeIndex$,
      this.widthOnlineRatingRange$,
      this.resize$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([onlineRating, startIndex, width]) => this.updateChart(startIndex, width));
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.resize$.next(true);
  }

  updateChart(startIndex: number = 0, widthSelectedRange: number = 0) {
    const onlineRatingData = this.onlineRatings$.value;

    const preSelectedArea = onlineRatingData.slice(0, startIndex);

    const selectedArea = onlineRatingData.slice(startIndex, startIndex + widthSelectedRange);

    const postSelectedArea = onlineRatingData.slice(startIndex + widthSelectedRange, onlineRatingData.length);

    const rect = this.chart.nativeElement.getBoundingClientRect();
    const height = rect.height || this.chart.nativeElement.clientHeight;
    const width = rect.width || this.chart.nativeElement.clientWidth;

    const x = scaleLinear()
      .domain([
        min(onlineRatingData, (data) => data.rating),
        max(onlineRatingData, (data) => data.rating)
      ])
      .range([0, width]);

    const y = scaleLinear()
      .domain([0, max(onlineRatingData, (data) => data.count)])
      .range([height, 0]);

    const areaL = area()
      .x((d) => x(d['rating']))
      .y0(y(0))
      .y1((d) => y(d['count']));

    while (this.chart.nativeElement.firstChild) {
      this.chart.nativeElement.removeChild(this.chart.nativeElement.firstChild);
    }

    this.svg = select(this.chart.nativeElement);

    this.svg.attr('width', width)
      .attr('height', height);

    this.svg.append('path')
      .datum(preSelectedArea)
      .attr('fill', '#191919')
      .attr('d', areaL as any);

    this.svg.append('path')
      .datum(selectedArea)
      .attr('fill', '#b4966e')
      .attr('d', areaL as any);

    this.svg.append('path')
      .datum(postSelectedArea)
      .attr('fill', '#191919')
      .attr('d', areaL as any);

    this.svg.append('g')
      .attr('transform', 'translate(0,0)');
  }

  startDrag(event: MouseEvent) {
    if (!this.disabled) {
      this.isDragProceed$.next(true);
      this.startDragX = event.clientX;
      this.startSelectorOffsetX = this.selector.nativeElement.getBoundingClientRect().left;
    }
  }

  startExpandLeft(event: MouseEvent) {
    if (!this.disabled) {
      this.isLeftExpandProceed$.next(true);
      this.startDragX = event.clientX;
      this.lastIndex = this.currentStartIndex$.value;
      this.lastWidth = this.currentWidth$.value;
      const selectorRect = this.selector.nativeElement.getBoundingClientRect();
      const chartContainerLeft = this.chartContainer.nativeElement.getBoundingClientRect().left;
      const chartContainerWidth = this.chartContainer.nativeElement.offsetWidth;
      this.fixedRightBorder = chartContainerWidth + chartContainerLeft - 1 - selectorRect.left - selectorRect.width;
      this.fixRightBorderOfSelector = true;
      this.startSelectorOffsetX = this.selector.nativeElement.getBoundingClientRect().left;
    }
  }

  startExpandRight(event: MouseEvent) {
    if (!this.disabled) {
      this.isRightExpandProceed$.next(true);
      this.startDragX = event.clientX;
      this.lastIndex = this.currentStartIndex$.value + this.currentWidth$.value;
      this.lastWidth = this.currentWidth$.value;
      this.startSelectorOffsetX = this.selector.nativeElement.getBoundingClientRect().left
        + this.selector.nativeElement.offsetWidth;
    }
  }

  touchStart(event: TouchedElement, touch: Touch) {
    switch (event) {
      case TouchedElement.LeftExpander:
        this.startExpandLeft({clientX: touch.clientX} as MouseEvent);
        break;
      case TouchedElement.RightExpander:
        this.startExpandRight({clientX: touch.clientX} as MouseEvent);
        break;
      case TouchedElement.Selector:
        this.startDrag({clientX: touch.clientX} as MouseEvent);
        break;
    }
  }

  @HostListener('touchmove', ['$event'])
  touchMove(event: AppTouchEvent) {
    if (this.isDragProceed$.value
      || this.isLeftExpandProceed$.value
      || this.isRightExpandProceed$.value) {
      this.mousex$.next(event.targetTouches
        && event.targetTouches[0]
        && event.targetTouches[0].clientX);
    }
  }

  @HostListener('touchend', ['$event'])
  touchEnd(event) {
    event.stopPropagation();
    event.preventDefault();
    this.isDragProceed$.next(false);
    this.isLeftExpandProceed$.next(false);
    this.isRightExpandProceed$.next(false);
    this.fixRightBorderOfSelector = false;
  }

  @HostListener('document:mouseup')
  stopDrag() {
    this.isDragProceed$.next(false);
    this.isLeftExpandProceed$.next(false);
    this.isRightExpandProceed$.next(false);
    this.fixRightBorderOfSelector = false;
  }

  @HostListener('document:mousemove', ['$event'])
  moveCursor(e: MouseEvent) {
    e.preventDefault();
    if (this.isDragProceed$.value
      || this.isLeftExpandProceed$.value
      || this.isRightExpandProceed$.value) {
      this.mousex$.next(e.clientX);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['onlineRatings']) {
      this.onlineRatings$.next(changes['onlineRatings'].currentValue);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  get value() {
    return {
      currentStartIndex: this.currentStartIndex$.value,
      currentWidth: this.currentWidth$.value
    };
  }

  set value(val) {
  }

  onChange: any = () => { };
  onTouched: any = () => { };

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  writeValue(val) {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
