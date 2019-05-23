import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import { scaleLinear } from 'd3-scale';
import { area, curveCardinal } from 'd3-shape';
import { Selection, select } from 'd3-selection';

@Component({
  selector: 'wc-moves-navigation-chart',
  templateUrl: './moves-navigation-chart.component.html',
  styleUrls: ['./moves-navigation-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovesNavigationChartComponent implements OnChanges, AfterViewChecked {
  @Input() scores: number[] = [];
  @Input() isWhiteMode = false;

  @ViewChild('chart', { read: ElementRef }) chart: ElementRef;

  readonly maxScore = 4;

  readonly DEFAULT_COLOR = '#474747';
  readonly WHITE_COLOR = '#D2CAFF';

  private prevWidth: number = null;

  constructor(private elementRef: ElementRef) {}

  private getScoresString(scores?: number[]) {
    return (scores || []).reduce((result, score) => result + score.toString(), '');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      // to avoid redraw when nothing changed
      (changes.scores
        && this.getScoresString(changes.scores.currentValue) !== this.getScoresString(changes.scores.previousValue))
      || changes.isWhiteMode
    ) {
      this.updateChart();
    }
  }

  ngAfterViewChecked() {
    if (this.elementRef.nativeElement.clientWidth !== this.prevWidth) {
      this.prevWidth = this.elementRef.nativeElement.clientWidth;
      this.updateChart();
    }
  }

  private updateChart(): void {
    const svg: Selection<any, any, any, any> = select(this.chart.nativeElement);

    const points = this.scores.map(score => {
      score = score <= this.maxScore ? score : this.maxScore;
      score = score >= -this.maxScore ? score : -this.maxScore;
      return [0, score];
    });

    const minY = -this.maxScore;
    const maxY = this.maxScore;
    const maxX = points.length - 1;

    const width = this.elementRef.nativeElement.clientWidth;
    const height = this.elementRef.nativeElement.clientHeight;

    const x = scaleLinear()
      .domain([0, maxX])
      .range([0, width]);

    const y = scaleLinear()
      .domain([minY, maxY])
      .range([height, 0]);

    const _area = area()
      .x((point, i) => x(i))
      .y0(() => height / 2)
      .y1(point => y(point[1]))
      .curve(curveCardinal);

    svg.selectAll('path')
      .remove();

    svg.selectAll('path')
      .data([points])
      .enter()
      .append('path')
      .attr('d', _area)
      .attr('fill', this.isWhiteMode ? this.WHITE_COLOR : this.DEFAULT_COLOR);
  }
}
