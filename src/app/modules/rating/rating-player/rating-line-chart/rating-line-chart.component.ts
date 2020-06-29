import { RatingTypeGame } from '../../../app-common/services/player-rating.model';
import {
  AfterViewInit,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
  ViewEncapsulation,
  OnChanges,
  SimpleChanges
  } from '@angular/core';
import { extent, max, ticks } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleLinear, scaleTime } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { line } from 'd3-shape';
import { timeMonth } from 'd3-time';
import { utcParse } from 'd3-time-format';
import * as moment from 'moment';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';

const ratingLineColor = {
  [RatingTypeGame.CLASSIC]: '#8D73FF',
  [RatingTypeGame.BLITZ]: '#979797',
  [RatingTypeGame.RAPID]: '#32FEC9',
  [RatingTypeGame.FIDE_BULLET]: '#8D73FF',
  [RatingTypeGame.FIDE_BLITZ]: '#979797',
  [RatingTypeGame.FIDE_RAPID]: '#32FEC9',
  [RatingTypeGame.WORLDCHESS_BULLET]: '#8D73FF',
  [RatingTypeGame.WORLDCHESS_BLITZ]: '#979797',
  [RatingTypeGame.WORLDCHESS_RAPID]: '#32FEC9',
};

const MIN_DISPLAY_RATING = 1000;
const MONTH_STEP_SIZE = 30;

@Component({
  selector: 'wc-rating-line-chart',
  templateUrl: './rating-line-chart.component.html',
  styleUrls: ['./rating-line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class RatingLineChartComponent implements AfterViewInit, OnInit, OnChanges {
  _data: {[key: string]: {date: string, rating: number}[]} = {};
  @Input() data: {[key: string]: {date: string, rating: number}[]} = {};
  @Input() dataFide: {[key: string]: {date: string, rating: number}[]} = {};
  @Input() dataWS: {[key: string]: {date: string, rating: number}[]} = {};


  public mode: RatingTypeGame = RatingTypeGame.CLASSIC;
  public RatingTypeGame = RatingTypeGame;

  @ViewChild('chart', { read: ElementRef, static: true }) chart: ElementRef;
  @ViewChild('chartPoints', { read: ElementRef, static: true }) chartPoints: ElementRef;

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.data = changes['data'].currentValue;
    }
    if (changes['dataWS']) {
      this.dataWS = changes['dataWS'].currentValue;
    }
    if (changes['dataFide']) {
      this.dataFide = changes['dataFide'].currentValue;
    }
    this.updateData();
    this.updateChart();
  }

  ngOnInit() {
    if (this.data) {
      this.mode = RatingTypeGame.CLASSIC;
    } else if (this.dataFide &&
      (this.dataFide[RatingTypeGame.FIDE_RAPID] || this.dataFide[RatingTypeGame.FIDE_BLITZ] || this.dataFide[RatingTypeGame.FIDE_BULLET])) {
      this.mode = this.checkFide();
    } else if (this.dataWS &&
      (this.dataWS[RatingTypeGame.WORLDCHESS_BULLET]
        || this.dataWS[RatingTypeGame.WORLDCHESS_BLITZ]
        || this.dataWS[RatingTypeGame.WORLDCHESS_RAPID])) {
      this.mode = this.checkWS();
    }
    this._data = {...this.data, ...this.dataFide, ...this.dataWS};
  }

  private checkFide(): RatingTypeGame {
    if (this.dataFide[RatingTypeGame.FIDE_BULLET]) {
      return RatingTypeGame.FIDE_BULLET;
    }
    if (this.dataFide[RatingTypeGame.FIDE_BLITZ]) {
      return RatingTypeGame.FIDE_BLITZ;
    }
    if (this.dataFide[RatingTypeGame.FIDE_RAPID]) {
      return RatingTypeGame.FIDE_RAPID;
    }
    return RatingTypeGame.FIDE_BULLET;
  }

  private checkWS(): RatingTypeGame {
    if (this.dataWS[RatingTypeGame.WORLDCHESS_BULLET]) {
      return RatingTypeGame.WORLDCHESS_BULLET;
    }
    if (this.dataWS[RatingTypeGame.WORLDCHESS_BLITZ]) {
      return RatingTypeGame.WORLDCHESS_BLITZ;
    }
    if (this.dataWS[RatingTypeGame.WORLDCHESS_RAPID]) {
      return RatingTypeGame.WORLDCHESS_RAPID;
    }
    return RatingTypeGame.WORLDCHESS_BULLET;
  }

  @HostListener('window:resize', ['$event'])
  updateChart() {
    let width = 0;
    const rect = this.chart.nativeElement.getBoundingClientRect();
    let height = rect.height || this.chart.nativeElement.clientHeight;
    // set dimensions and margins of graph
    const margin = {top: 30, right: 50, bottom: 40, left: 10};

    // parse date / time
    const parseTime = utcParse('%Y-%m-%dT%H:%M:%S');
    const parseTimeUTC = utcParse('%Y-%m-%dT%H:%M:%S.%f%Z');

    // format data
    const data = this.getPageData()
      .filter(d => d.rating >= MIN_DISPLAY_RATING)
      .map((d) => {
        return {
          date: parseTime(d.date) || parseTimeUTC(d.date),
          rating: +d.rating
        };
      });


    width += data.length >= 5 ? MONTH_STEP_SIZE * data.length : MONTH_STEP_SIZE * 5;

    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    // set ranges
    const x = scaleTime().range([0, width]);
    const y = scaleLinear().range([height, 0]);

    // define line
    const valueline = line()
      .x(d => {
        return x(d['date']);
      })
      .y(d => {
        return y(d['rating']);
      });


    // Clear chart content for IE
    while (this.chart.nativeElement.firstChild) {
      this.chart.nativeElement.removeChild(this.chart.nativeElement.firstChild);
      this.chartPoints.nativeElement.removeChild(this.chartPoints.nativeElement.firstChild);
    }

    // set area chart
    const svgPoints: Selection<any, any, any, any> = select(this.chartPoints.nativeElement)
      .attr('width', margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.right + ',' + margin.top + ')');

    const svg: Selection<any, any, any, any> = select(this.chart.nativeElement)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(0,' + margin.top + ')');

    // create y ticks first 200 other by 500
    const maxRating = max(data, d => d.rating);
    const maxY = Math.ceil(maxRating / 500) * 500;

    // Scale range of data
    x.domain(extent(data, d => d.date));
    y.domain([MIN_DISPLAY_RATING, maxY]);

    // add X grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(axisBottom(x)
        .ticks(timeMonth.every(4))
        .tickSize(-height)
        .tickFormat((d: Date) => {
          let out = '';
          if (d.getMonth() === 0) {
            out = d.getFullYear().toString();
          } else {
            out = moment(d).format('MMM');
          }
          return out;
        })
      );

    // Add Y Axis
    const yTicks = [...ticks(MIN_DISPLAY_RATING, maxY, (maxY - MIN_DISPLAY_RATING) / 100)];
    svgPoints.append('g')
      .attr('class', 'yaxis')
      .call(axisLeft(y)
        .tickValues(yTicks)
      );

    const xScale = scaleTime()
      .domain([0, data.length - 1]) // input
      .range([0, width]); // output

    // 6. Y scale
    const yScale = scaleLinear()
      .domain([MIN_DISPLAY_RATING, maxY]) // input
      .range([height, 0]); // output

    const gradientId = 'ratingLineChartGradient';

    // Add value line path.
    svg.append('path')
      .data([data])
      .attr('class', 'line')
      .style('fill', 'none')
      .style('stroke', `url(#${gradientId}) ${ratingLineColor[this.mode]}`)
      .style('stroke-width', '3px')
      .attr('d', valueline as any);

    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle') // Uses the enter().append() method
      .attr('class', 'dot') // Assign a class for styling
      .attr('fill', ratingLineColor[this.mode]) // Assign a class for styling
      .attr('cx', (d, i) => {
        return xScale(i);
      })
      .attr('cy', d => {
        return yScale(d.rating);
      })
      .attr('r', (d, i) => i < data.length - 1 ? 0 : 10)
      .attr('style', 'stroke: url(#radialDotGradient)')
      .attr('stroke-width', (_, i) => i < data.length - 1 ? 0 : 7)
      .on('mouseover', function (a, b, c) {
        // this.attr('class', 'focus');
      });

    // Create the svg:defs element and the main gradient definition.
    const svgDefs = svg.append('defs');

    const radialDotGradient = svgDefs.append('radialGradient')
      .attr('id', 'radialDotGradient')
      .attr('spreadMethod', 'reflect')
      .attr('gradientUnits', 'objectBoundingBox')
      .attr('r', '100%')
      .attr('fr', '30%');
    radialDotGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', ratingLineColor[this.mode]);
    radialDotGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', 'rgb(255, 255, 255, 0.1)');

    const mainGradient = svgDefs.append('linearGradient')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0.08') // Set  length of gradient 5%
      .attr('y2', '0')
      .attr('id', gradientId);

    // Create the stops of the main gradient.
    mainGradient.append('stop')
      .attr('stop-color', ratingLineColor[this.mode])
      .attr('stop-opacity', '0')
      .attr('offset', '0');

    mainGradient.append('stop')
      .attr('stop-color', ratingLineColor[this.mode])
      .attr('stop-opacity', '1')
      .attr('offset', '1');
  }

  setMode(mode: RatingTypeGame) {
    this.mode = mode;
    this.updateChart();
    this.cd.markForCheck();
  }

  private getPageData() {
    return (this._data[this.mode]) ? this._data[this.mode] : [];
  }

  private updateData() {
    this._data = {...this.data, ...this.dataFide, ...this.dataWS};
    if (this.data) {
      this.setMode(RatingTypeGame.CLASSIC);
    }
    if (this.dataFide) {
      this.setMode(this.checkFide());
    }
    if (this.dataWS) {
      this.setMode(this.checkWS());
    }
  }
}
