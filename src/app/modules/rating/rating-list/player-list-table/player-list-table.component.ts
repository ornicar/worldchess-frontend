import { ActivatedRoute } from '@angular/router';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  OnDestroy
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { distinctUntilChanged, map, mergeMap, tap, takeUntil } from 'rxjs/operators';
import * as fromRoot from '@app/reducers/index';
import * as fromCountry from '@app/broadcast/core/country/country.reducer';
import { IPlayerRating } from '../../../app-common/services/player-rating.model';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { IPlayerWithCountry, SearchPlayerHelper } from '../search-player.helper';
import { PlayerRatingResourceService } from '@app/modules/app-common/services/player-rating-resource.service';

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
export class PlayerListTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() searchQuery = '';

  private section: string | undefined;

  @OnChangesInputObservable()
  searchQuery$ = new BehaviorSubject<string>(this.searchQuery);

  openPlayerId: number;
  sortField$ = new BehaviorSubject<SortData>(DEFAULT_SORT_FIELD);

  public playersList$ = new BehaviorSubject([]);


  private topPlayersList: BehaviorSubject<any[]> = new BehaviorSubject([]);
  public topPlayersList$ = this.topPlayersList.asObservable();

  public showTopCount = 10;
  public showTop = false;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private store$: Store<fromRoot.State>,
    private ratingResource: PlayerRatingResourceService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.route.queryParams.pipe(
      mergeMap(params => combineLatest(
          this._getPlayers(params.section),
          this.searchQuery$.pipe(distinctUntilChanged()),
          this.sortField$.pipe(distinctUntilChanged())
      ).pipe(
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
      )),
      tap(() => this.cd.markForCheck()),
      takeUntil(this.destroy$)
    )
    .subscribe(this.playersList$);
  }

  ngOnDestroy () {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

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
  ngOnChanges(changes: SimpleChanges): void {}


  private _getPlayers(section: string | undefined): Observable<IPlayerWithCountry[]> {
    return combineLatest(
      this.ratingResource.getAllRating(section),
      this.store$.pipe(select(fromCountry.selectAll)),
    ).pipe(
      map(([players, countries]) => {
        return players.map(p => {
          const pl: IPlayerWithCountry = { ...p } as any;
          const country = countries.find(c => c.id === pl.federation);
          let rating = pl.rating;
          pl.country_name = country ? country.name : null;
          if (section === 'passport-online') {
            rating = pl.fide_bullet;
          }

          if (section === 'world-chess') {
            rating = pl.worldchess_bullet;
          }
          return {
            ...pl, rating: rating
          };
        });
      })
    );
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
