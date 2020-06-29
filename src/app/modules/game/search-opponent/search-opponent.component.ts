import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { GameState } from '../state/game.state';
import { Observable } from 'rxjs';
import { RequestOpponent, RejectOpponentRequest, RestartGame } from '../state/game.actions';
import { take } from 'rxjs/operators';
import { ITimeControl } from '@app/broadcast/core/tour/tour.model';
import * as moment from 'moment';

export interface ITimeControlItems {
  model: ITimeControl;
  startTime: number;
  increment: number;
}

@Component({
  selector: 'search-opponent',
  templateUrl: 'search-opponent.component.html',
  styleUrls: ['search-opponent.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchOpponentComponent {
  @Select(GameState.waitingOpponent) waitingOpponent$: Observable<boolean>;
  @Select(GameState.gameReady) gameReady$: Observable<boolean>;

  @Input()
  onlyButton = false;

  @Input()
  timeControls: ITimeControl[];

  @Input()
  selectedTimeControl: ITimeControl;

  @Output()
  selectTimeControl: EventEmitter<ITimeControl> = new EventEmitter();

  constructor(
    private store: Store,
  ) { }

  public searchOpponent(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    this.gameReady$.pipe(take(1)).subscribe((ready) => {
      if (ready) {
        this.store.dispatch(new RestartGame());
      }
      this.store.dispatch(new RequestOpponent());
    });
  }

  public stopSearch(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    this.store.dispatch(new RejectOpponentRequest());
  }

  public get timeControlItems(): ITimeControlItems[] {
    if (!Array.isArray(this.timeControls)) {
      return;
    }

    return this.timeControls.map((timeControl) => {
      return {
        model: timeControl,
        startTime: moment(timeControl.start_time, 'HH:mm:ss').minutes(),
        increment: moment(timeControl.increment, 'HH:mm:ss').seconds(),
      };
    });
  }

  public onSelectTimeControl(timeControl: ITimeControl): void {
    this.selectTimeControl.emit(timeControl);
  }

}
