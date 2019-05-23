import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {map, tap} from 'rxjs/operators';
import * as fromPlayersRating from '../../../broadcast/core/playerRating/player-rating.reducer';
import {select, Store} from '@ngrx/store';
import * as fromRoot from '../../../reducers';
import {GetRatings} from '../../../broadcast/core/playerRating/player-rating.actions';
import {GetCountries} from '../../../broadcast/core/country/country.actions';
import {BehaviorSubject, combineLatest} from 'rxjs';

const PLAYERS_PER_PAGE = 10;

@Component({
  selector: 'app-rating-page',
  templateUrl: './rating-list-page.component.html',
  styleUrls: ['./rating-list-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingListPageComponent implements OnInit, OnDestroy {
  public isShowFilter = false;
  public isTableMode = true;
  public searchQuery = '';
  public showSearchBar = false;
  public showMoreBestPlayersBtn = true;

  public players$ = this.store$.pipe(select(fromPlayersRating.selectAll));
  public page$ = new BehaviorSubject(1);
  public bestPlayers$ = combineLatest(this.players$, this.page$)
    .pipe(
      map(([ratings, page]) => {
        this.showMoreBestPlayersBtn = ratings.length > PLAYERS_PER_PAGE * page;
        return ratings.slice(0, PLAYERS_PER_PAGE * page);
      }),
    );

  @ViewChild('ratingTableStart', {read: ElementRef}) ratingTableStart: ElementRef;

  constructor(
    private store$: Store<fromRoot.State>,
    private cd: ChangeDetectorRef,
  ) {
    this.store$.dispatch(new GetRatings());
    this.store$.dispatch(new GetCountries());
  }

  ngOnInit() {}

  onChangeSearchText($event) {
    this.searchQuery = $event.target.value;
  }

  ngOnDestroy(): void {
  }

  toggleFilters() {
    this.isShowFilter = !this.isShowFilter;
  }

  showMore() {
    this.page$.next(this.page$.value + 1);
  }

  setTableView(state: boolean) {
    this.isTableMode = state;
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!this.ratingTableStart) {
      return;
    }
    const targetHeight = this.ratingTableStart.nativeElement.offsetTop - window.innerHeight;
    this.showSearchBar = window.scrollY > targetHeight;
    this.cd.markForCheck();
  }
}
