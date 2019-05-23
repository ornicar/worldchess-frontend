import {ChangeDetectionStrategy, Component, EventEmitter, Input, NgZone, OnChanges, OnDestroy, Output, SimpleChanges} from '@angular/core';
import {fromEvent} from 'rxjs';
import {throttleTime} from 'rxjs/operators';
import {MousetrapHelper} from '../../../../../shared/helpers/mousetrap.helper';
import {SubscriptionHelper, Subscriptions} from '../../../../../shared/helpers/subscription.helper';
import {IPredictPosition} from '../../../../move/move.model';

@Component({
  selector: 'wc-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PredictionComponent implements OnChanges, OnDestroy {
  @Input() score: number;
  @Input() predictions: IPredictPosition[] = [];
  @Input() selectedPrediction: IPredictPosition;

  @Output() predictionChange = new EventEmitter<IPredictPosition>();

  private hasCurrentPredictPosition = false;

  private prevPrediction?: IPredictPosition;
  private nextPrediction?: IPredictPosition;

  private subs: Subscriptions = {};

  constructor(private ngZone: NgZone) {}

  private subscribeKeyboardEvents() {
    if (!this.subs.onLeft) {
      this.subs.onLeft = fromEvent(MousetrapHelper.eventTargetLike(this.ngZone), 'left')
        .pipe(throttleTime(100))
        .subscribe(() => {
          if (this.prevPrediction) {
            this.predictionChange.next(this.prevPrediction);
          }
        });
    }

    if (!this.subs.onRight) {
      this.subs.onRight = fromEvent(MousetrapHelper.eventTargetLike(this.ngZone), 'right')
        .pipe(throttleTime(100))
        .subscribe(() => {
          if (this.nextPrediction) {
            this.predictionChange.next(this.nextPrediction);
          }
        });
    }
  }

  private unsubscribeKeyboardEvents() {
    if (this.subs.onLeft) {
      this.subs.onLeft.unsubscribe();
      delete this.subs.onLeft;
    }

    if (this.subs.onRight) {
      this.subs.onRight.unsubscribe();
      delete this.subs.onRight;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedPrediction) {
      const currentPredictionIndex = this.predictions.indexOf(changes.selectedPrediction.currentValue);

      this.hasCurrentPredictPosition = currentPredictionIndex !== -1;

      if (this.hasCurrentPredictPosition) {
        this.prevPrediction = this.predictions[currentPredictionIndex - 1] || null;
        this.nextPrediction = this.predictions[currentPredictionIndex + 1] || null;

        this.subscribeKeyboardEvents();
      } else {
        // Select a first position after first click on the next or prev.
        this.prevPrediction = this.predictions[0] || null;
        this.nextPrediction = this.predictions[0] || null;

        this.unsubscribeKeyboardEvents();
      }

      // @todo cd.
    }
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  moveClick(predictPosition: IPredictPosition) {
    this.predictionChange.next(predictPosition);
  }

  onPrevMove($event) {
    $event.preventDefault();

    if (this.prevPrediction) {
      this.predictionChange.next(this.prevPrediction);
    }
  }

  onNextMove($event) {
    $event.preventDefault();

    if (this.nextPrediction) {
      this.predictionChange.next(this.nextPrediction);
    }
  }
}
