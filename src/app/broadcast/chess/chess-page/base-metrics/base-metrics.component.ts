import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

export interface IBaseMetric {
  title: string;
  value: string;
}

@Component({
  selector: 'wc-base-metrics',
  templateUrl: './base-metrics.component.html',
  styleUrls: ['./base-metrics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseMetricsComponent {

  @Input()
  metrics: IBaseMetric[] = [];

  trackByMetric(index, metric: IBaseMetric) {
    return metric;
  }
}
