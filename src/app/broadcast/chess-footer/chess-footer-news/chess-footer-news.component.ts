import {
  Component,
  OnInit,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  Output,
  Input,
  OnChanges
} from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';
import { Tournament } from '../../core/tournament/tournament.model';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../reducers/index';
import { OnChangesInputObservable, OnChangesObservable } from '../../../shared/decorators/observable-input';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { NewsResourceService } from '../news/news-resource.service';
import { NewsPaginationService } from '../news/news-pagination.service';
import { ScreenStateService } from '../../../shared/screen/screen-state.service';

@Component({
  selector: 'wc-chess-footer-news',
  templateUrl: './chess-footer-news.component.html',
  styleUrls: ['./chess-footer-news.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NewsPaginationService]
})
export class ChessFooterNewsComponent implements OnInit, OnDestroy, OnChanges {
  @Output() changeTab = new EventEmitter();
  @Input() tournament: Tournament = null;

  public newsSs: Subscription;
  public init = false;

  @OnChangesInputObservable('tournament')
  public tournament$ = new BehaviorSubject<Tournament>(this.tournament);

  public tournamentSlug$ = this.tournament$
    .pipe(
      map(t => (t && t.slug) ? t.slug : null),
      distinctUntilChanged(),
      filter(slug => !!slug)
    );

  desktopWidth = 1280;

  constructor(
    private cd: ChangeDetectorRef,
    private store$: Store<fromRoot.State>,
    private newsResource: NewsResourceService,
    public newsLoader: NewsPaginationService,
    private screenState: ScreenStateService,
  ) {
  }

  public ngOnInit() {
    this.newsSs = this.tournamentSlug$
      .pipe(
        switchMap((slug) => this.newsResource.getCategoriesBySlug(slug)),
        switchMap((categories) => {
          this.newsLoader.filter = {categories: categories.map(c => c.id.toString())};
          return this.screenState.matchMediaTablet$;
        }),
        switchMap((matchTableScreen) => {
          return this.newsLoader.load(matchTableScreen ? 7 : 4);
        })
      )
      .subscribe(
        () => {
          this.init = true;
          this.cd.markForCheck();
        },
        err => console.error(err)
      );
  }

  @OnChangesObservable()
  public ngOnChanges() {
  }

  public ngOnDestroy() {
    if (this.newsSs) {
      this.newsSs.unsubscribe();
    }
  }

  public showMore() {
    const width = document.documentElement.clientWidth;
    this.newsLoader.showMore(width >= this.desktopWidth ? 6 : 3)
      .subscribe(
        () => this.cd.markForCheck(),
        err => console.error(err)
      );
  }
}
