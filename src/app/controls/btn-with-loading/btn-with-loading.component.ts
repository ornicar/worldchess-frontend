import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'wc-btn-with-loading',
  template: `
    <button class="btn-new"
            [class.disabled]="isDisabled$ | async"
            [disabled]="loading$ | async"
            type="submit"
            (click)="click.emit($event)"
    >
      <ng-container *ngIf="loading$ | async; else text">
        <svg-preloader></svg-preloader>
      </ng-container>
      <ng-template #text>
        <ng-content></ng-content>
      </ng-template>
    </button>
  `,
  styleUrls: [
    './btn-with-loading.component.scss',
  ],
})
export class BtnWithLoadingComponent implements OnChanges {
  @Input() loading = false;
  @Input() disabled = false;
  @Output() click = new EventEmitter<MouseEvent>();

  disabled$ = new BehaviorSubject(false);
  loading$ = new BehaviorSubject(false);
  isDisabled$ = combineLatest(
    this.disabled$,
    this.loading$,
  ).pipe(map(([disabled, loading]) => disabled || loading));

  ngOnChanges(changes: SimpleChanges) {
    if (changes['loading']) {
      this.loading$.next(changes['loading'].currentValue);
    }

    if (changes['disabled']) {
      this.disabled$.next(changes['disabled'].currentValue);
    }
  }
}
