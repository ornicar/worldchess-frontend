import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {BehaviorSubject, of, combineLatest} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import * as fromRoot from '../../../../reducers/index';
import {OnChangesInputObservable, OnChangesObservable} from '../../../../shared/decorators/observable-input';
import * as fromPlayer from '../../../core/player/player.reducer';

@Component({
  selector: 'wc-player-option',
  templateUrl: './player-option.component.html',
  styleUrls: ['./player-option.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerOptionComponent implements OnChanges {

  @Input() playerName: string;
  @OnChangesInputObservable() playerName$ = new BehaviorSubject<string>(this.playerName);

  @Input() playerId: number;
  @OnChangesInputObservable() playerId$ = new BehaviorSubject<number>(this.playerId);

  private selectPlayerById = fromPlayer.selectPlayerById();

  player$ = combineLatest(this.playerId$, this.playerName$).pipe(
    switchMap(([playerId, playerName ]) => {
      if (!playerId) {
        return of({
          full_name: playerName
        });
      } else {
        return this.store$.pipe(
          select(this.selectPlayerById, { playerId })
        );
      }
    })
  );

  constructor(private store$: Store<fromRoot.State>) { }

  @OnChangesObservable()
  ngOnChanges() {
  }

}
