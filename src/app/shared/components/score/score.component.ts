import { Component, Input } from '@angular/core';

@Component({
  selector: 'wc-score',
  template: `
    <div class="score" *ngIf="scoreObj">
      <div class="score__number" *ngIf="scoreObj.number">{{ scoreObj.number }}</div>
      <div class="score__half" *ngIf="scoreObj.half"><span>1</span><span>2</span></div>
      <div class="score__number" *ngIf="!scoreObj.number && !scoreObj.half">0</div>
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./score.component.scss'],
})
export class ScoreComponent {
  @Input() score = 0;

  get scoreObj() {
    const floor = Math.floor(this.score);
    return {
      number: floor !== 0 ? floor : null,
      half: this.score % 1 !== 0,
    };
  }
}
