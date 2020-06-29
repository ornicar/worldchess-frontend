import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef, HostListener, Input,
  ViewChild
} from '@angular/core';

import { pie, arc } from 'd3-shape';
import { interpolate } from 'd3-interpolate';
import { Selection, select } from 'd3-selection';
import 'd3-transition';

import { Throttle } from '../../../../shared/decorators/throttle';

export type StatisticMode = 'white' | 'black' | 'white_and_black';
export type StatisticPart = 'win' | 'draw' | 'loss';

const colorPieChart = {
  win: '#8cd8ff',
  draw: '#dcdcdc',
  loss: '#ff3828'
};
const startAngle = -60;

@Component({
  selector: 'wc-game-statistic-pie-chart',
  templateUrl: './game-statistic-pie-chart.component.html',
  styleUrls: ['./game-statistic-pie-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameStatisticPieChartComponent implements AfterViewInit {
  @Input() data: {[key: string]: {name: string, value: number}[]} = {};
  @Input() title: string;

  public mode: StatisticMode = 'white';

  @ViewChild('chart', { read: ElementRef, static: true }) chart: ElementRef;

  private pie: any;
  private path: Selection<any, any, any, any>;

  private arc: any;
  private prevWidth: number;
  private prevHeight: number;

  ngAfterViewInit(): void {
    this.updateChart();
  }

  updateChart() {
    const rect = this.chart.nativeElement.getBoundingClientRect();
    const width = this.prevWidth = rect.width;
    const height = this.prevHeight = rect.height;

    const radius = Math.min(width, height) / 2;
    const thickness = radius - 20;

    // Clear chart content for IE
    while (this.chart.nativeElement.firstChild) {
      this.chart.nativeElement.removeChild(this.chart.nativeElement.firstChild);
    }

    const svg: Selection<any, any, any, any> = select(this.chart.nativeElement)
      .attr('width', width)
      .attr('height', width);

    // Create area pie chart
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2}) rotate(${startAngle})`);

    this.pie = pie()
      .value((d: any) => d.value)
      .sort(null);

    this.arc = arc()
      .innerRadius(thickness)
      .outerRadius(radius);

    this.path = g.selectAll('path')
      .data(this.pie(this.getData()))
      .enter()
      .append('g')
      .append('path')
      .attr('d', this.arc as any)
      .attr('fill', (d, i) => colorPieChart[d['data']['name']])
      .each(function (d) { this['_current'] = d; });
  }

  private getData(): any {
    if (this.mode === 'white_and_black') {
      return this.data['white'].map((item, i) => {
        return {name: item.name, value: item.value + this.data['black'][i].value};
      });
    } else {
      return this.data[this.mode];
    }
  }

  @HostListener('window:resize')
  @Throttle(100)
  onResize() {
    if (this.prevWidth !== this.chart.nativeElement.clientWidth ||
      this.prevHeight !== this.chart.nativeElement.clientHeight) {
      this.updateChart();
    }
  }

  setMode(mode: StatisticMode) {
    if (this.mode === mode) {
      return;
    }

    this.mode = mode;
    this.path.data(this.pie(this.getData()));

    const _arc = this.arc;

    // Animation statistic chart
    this.path.transition()
      .duration(750)
      // redraw the arcs
      .attrTween('d', function (a) {
        const i = interpolate(this['_current'], a);
        this['_current'] = i(0);
        return t => _arc(i(t));
      });
  }

  getPercent(part: StatisticPart) {
    const data = this.getData();
    const sum = data.reduce((s, v) => s + v.value, 0);
    return ((data.find(d => d.name === part).value * 100 / sum) || 0 ).toFixed();
  }
}
