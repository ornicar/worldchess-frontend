import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef, Input,
  ViewChild,
  ViewEncapsulation,
  HostListener,
} from '@angular/core';

import { line } from 'd3-shape';
import { timeMonth } from 'd3-time';
import { utcParse } from 'd3-time-format';
import { max, extent, ticks } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { Selection, select } from 'd3-selection';
import { scaleTime, scaleLinear } from 'd3-scale';

import * as moment from 'moment';
import { RatingTypeGame } from '../../../../broadcast/core/playerRating/player-rating-resource.service';

const ratingLineColor = {
  [RatingTypeGame.CLASSIC]: '#8D73FF',
  [RatingTypeGame.BLITZ]: '#979797',
  [RatingTypeGame.RAPID]: '#32FEC9',
};

const MIN_DISPLAY_RATING = 2500;
const MONTH_STEP_SIZE = 30;

@Component({
  selector: 'wc-rating-line-chart',
  templateUrl: './rating-line-chart.component.html',
  styleUrls: ['./rating-line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class RatingLineChartComponent implements AfterViewInit {
  @Input() data: {[key: string]: {date: string, rating: number}[]} = {};

  public mode: RatingTypeGame = RatingTypeGame.CLASSIC;
  public RatingTypeGame = RatingTypeGame;

  @ViewChild('chart', {read: ElementRef}) chart: ElementRef;
  @ViewChild('chartPoints', {read: ElementRef}) chartPoints: ElementRef;

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.updateChart();
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


    // format data
    const data = this.getPageData()
      .filter(d => d.rating >= MIN_DISPLAY_RATING)
      .map((d) => {
        return {
          date: parseTime(d.date),
          rating: +d.rating
        };
      });

    width += MONTH_STEP_SIZE * data.length;

    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    // set ranges
    const x = scaleTime().range([0, width]);
    const y = scaleLinear().range([height, 0]);

    // define line
    const valueline = line()
      .x(d => x(d['date']))
      .y(d => y(d['rating']));

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
      .style('stroke-width', '2px')
      .attr('d', valueline as any);

    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle') // Uses the enter().append() method
      .attr('class', 'dot') // Assign a class for styling
      .attr('fill', ratingLineColor[this.mode]) // Assign a class for styling
      .attr('cx', (d, i) => xScale(i))
      .attr('cy', d => yScale(d.rating))
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
    return this.data[this.mode];
  }
}
