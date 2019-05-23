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
import * as fromCountry from '../../../../broadcast/core/country/country.reducer';
import {IPlayerRating} from '../../../../broadcast/core/playerRating/player-rating.model';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {OnChangesInputObservable, OnChangesObservable} from '../../../../shared/decorators/observable-input';
import * as fromPlayersRating from '../../../../broadcast/core/playerRating/player-rating.reducer';
import {IPlayerWithCountry, SearchPlayerHelper} from '../search-player.helper';

const DEFAULT_SORT_FIELD = {
  field: 'rank',
  direction: 1
};

interface SortData {
  field: string;
  direction: number;
}

@Component({
  selector: 'wc-player-list-table',
  templateUrl: './player-list-table.component.html',
  styleUrls: ['./player-list-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerListTableComponent implements OnInit, OnChanges {
  @Input() searchQuery = '';

  @OnChangesInputObservable()
  searchQuery$ = new BehaviorSubject<string>(this.searchQuery);

  openPlayerId: number;
  sortField$ = new BehaviorSubject<SortData>(DEFAULT_SORT_FIELD);

  private players$: Observable<IPlayerWithCountry[]> = combineLatest(
    this.store$.pipe(select(fromPlayersRating.selectAll)),
    this.store$.pipe(select(fromCountry.selectAll)),
  ).pipe(
    map(([players, countries]) => {
      return players.map(p => {
        const pl: IPlayerWithCountry = { ...p } as any;
        const country = countries.find(c => c.id === pl.federation);
        pl.country_name = country ? country.name : null;
        return pl;
      });
    })
  );

  public playersList$ = combineLatest(
    this.players$,
    this.searchQuery$.pipe(distinctUntilChanged()),
    this.sortField$.pipe(distinctUntilChanged())
  )
    .pipe(
      map(([players, searchQuery, sort]) => {
        const playerList = SearchPlayerHelper.filterPlayers([players, searchQuery]);
        if (sort.field === 'rank' && sort.direction === 1 && !searchQuery) {
          this.showTop = true;
        } else if (this.showTop === true) {
          this.showTop = false;
        }
        return SearchPlayerHelper.sortPlayers([playerList, (sort.direction === -1 ? '-' : '') + sort.field]);
      }),
      map(players => {
        if (this.showTop) {
          const [
            top,
            another,
          ] = players.reduce((res, player) => {
            if (player.rank <= this.showTopCount) {
              res[0].push(player);
            } else {
              res[1].push(player);
            }
            return res;
          }, [[], []]);
          this.topPlayersList.next(top);
          return another;
        } else {
          this.topPlayersList.next([]);
        }

        return players;
      }),
    );

  private topPlayersList: BehaviorSubject<any[]> = new BehaviorSubject([]);
  public topPlayersList$ = this.topPlayersList.asObservable();

  public showTopCount = 10;
  public showTop = false;

  constructor(private store$: Store<fromRoot.State>) {}

  ngOnInit() {}

  onSort(fieldSort: string) {
    const sort = Object.assign({}, this.sortField$.value);
    if (sort.field === fieldSort) {
      // Change directions sort
      sort.direction = sort.direction * -1;
    } else {
      // Sort by default direction
      sort.field = fieldSort;
      sort.direction = this.defaultSort[fieldSort];
    }
    this.sortField$.next(sort);
  }

  openPlayerRow($event: MouseEvent, player: IPlayerRating) {
    $event.stopPropagation();

    if (this.openPlayerId === player.fide_id) {
      this.openPlayerId = null;
      return;
    }

    this.openPlayerId = player.fide_id;
  }

  @OnChangesObservable()
  ngOnChanges(changes: SimpleChanges): void {
  }

  private get defaultSort(): {[key: string]: number} {
    return {
      rank: 1,
      full_name: 1,
      country_name: 1,
      rating: -1,
      blitz_rating: -1,
      rapid_rating: -1,
      birth_year: -1,
    };
  }
}
