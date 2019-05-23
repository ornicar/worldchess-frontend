import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {BehaviorSubject} from 'rxjs';
import {distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import * as fromRoot from '../../../../reducers/index';
import {OnChangesInputObservable, OnChangesObservable} from '../../../../shared/decorators/observable-input';
import * as fromTeam from '../../../core/team/team.reducer';

@Component({
  selector: 'wc-match-option',
  templateUrl: './match-option.component.html',
  styleUrls: ['./match-option.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchOptionComponent implements OnChanges {

  @Input() teamId: number;

  @OnChangesInputObservable()
  teamId$ = new BehaviorSubject<number>(this.teamId);

  @Input() showOnlyFlag: boolean;

  team$ = this.teamId$.pipe(
    switchMap(id => this.store$
      .pipe(
        select(fromTeam.selectEntities),
        map(teams => teams[id]),
        distinctUntilChanged()
      ))
  );

  constructor(private store$: Store<fromRoot.State>) {}

  @OnChangesObservable()
  ngOnChanges() {
  }

}
