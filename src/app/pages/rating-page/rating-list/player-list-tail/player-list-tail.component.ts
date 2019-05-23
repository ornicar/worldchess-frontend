import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {distinctUntilChanged, map} from 'rxjs/operators';
import * as fromRoot from '../../../../reducers';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {OnChangesInputObservable, OnChangesObservable} from '../../../../shared/decorators/observable-input';
import * as fromPlayersRating from '../../../../broadcast/core/playerRating/player-rating.reducer';
import {SearchPlayerHelper} from '../search-player.helper';
import { IPlayerRating } from '../../../../broadcast/core/playerRating/player-rating.model';

@Component({
  selector: 'wc-player-list-tail',
  templateUrl: './player-list-tail.component.html',
  styleUrls: ['./player-list-tail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerListTailComponent implements OnInit, OnChanges {
  @Input() searchQuery = '';

  @OnChangesInputObservable()
  searchQuery$ = new BehaviorSubject<string>(this.searchQuery);

  private players$ = this.store$.pipe(select(fromPlayersRating.selectAll));

  public playersList$ = combineLatest(
    this.players$,
    this.searchQuery$.pipe(distinctUntilChanged())
  )
    .pipe(map(SearchPlayerHelper.filterPlayers));

  constructor(private store$: Store<fromRoot.State>) {}

  ngOnInit() {
  }

  @OnChangesObservable()
  ngOnChanges(changes: SimpleChanges): void {
  }

  calcTileColor(player: IPlayerRating, index: number): string {
    if (!player.labels.length) {
      return index < 10 ? 'rating-tile__elem--king' : '';
    } else {
      const label = player.labels[0];
      if (label === "#1") {
        return 'rating-tile__elem--king';
      } else {
        return `rating-tile__elem--${player.labels[0]}`;
      }
    }
  }
}
