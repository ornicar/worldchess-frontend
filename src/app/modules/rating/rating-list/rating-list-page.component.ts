import { boolean } from 'io-ts';
import { IPlayerRating } from '@app/modules/app-common/services/player-rating.model';
import { ActivatedRoute } from '@angular/router';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  OnInit,
  OnDestroy
} from '@angular/core';
import { map, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { PlayerRatingResourceService } from '@app/modules/app-common/services/player-rating-resource.service';

const PLAYERS_PER_PAGE = 10;

@Component({
  selector: 'app-rating-page',
  templateUrl: './rating-list-page.component.html',
  styleUrls: ['./rating-list-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingListPageComponent implements OnInit, OnDestroy {

  public isTableMode = true;
  public searchQuery = '';
  public showSearchBar = false;
  public showMoreBestPlayersBtn = true;
  public showMainNav = true;

  public players$: Observable<IPlayerRating[]> = null;

  public page$ = new BehaviorSubject(1);
  public bestPlayers$ = new BehaviorSubject([]);
  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('ratingTableStart', {read: ElementRef, static: true}) ratingTableStart: ElementRef;

  constructor(
    private cd: ChangeDetectorRef,
    private ratingResource: PlayerRatingResourceService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.route.queryParams.pipe(
      mergeMap(params =>
        combineLatest([
          this.ratingResource.getAllRating(params.section),
          this.page$
        ]).pipe(
          map(([ratings, page]) => {
            this.showMoreBestPlayersBtn = ratings.length > PLAYERS_PER_PAGE * page;
            return ratings.slice(0, PLAYERS_PER_PAGE * page);
          }),
        )),
      takeUntil(this.destroy$),
      tap(() => this.cd.markForCheck()),
    ).subscribe(this.bestPlayers$);
  }

  setGrey(section: string | null): object {
    let flag = false;
    if (this.route.snapshot.queryParamMap.get('section') === section) {
      flag = true;
    }
    return {'grey': !flag};
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  onChangeSearchText() {
    this.calculateSearchBar();
  }

  showMore() {
    this.page$.next(this.page$.value + 1);
  }

  setTableView(state: boolean) {
    this.isTableMode = state;
  }

  @HostListener('window:scroll')
  onScroll() {
    this.calculateSearchBar();
  }

  calculateSearchBar() {
    if (!this.ratingTableStart) {
      return;
    }
    const targetHeight = this.ratingTableStart.nativeElement.offsetTop;
    this.showSearchBar = !!this.searchQuery || window.scrollY > targetHeight;
    this.cd.markForCheck();
  }
}
