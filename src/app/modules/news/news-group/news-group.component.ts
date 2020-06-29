import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { NewsPaginationService } from '@app/broadcast/chess-footer/news/news-pagination.service';
import { NewsResourceService } from '@app/broadcast/chess-footer/news/news-resource.service';
import { ScreenStateService } from '@app/shared/screen/screen-state.service';
import { INews } from '@app/broadcast/chess-footer/news/news.model';


@Component({
  selector: 'app-news-group',
  templateUrl: './news-group.component.html',
  styleUrls: ['./news-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NewsPaginationService],
})
export class NewsGroupComponent implements OnInit, OnDestroy {
  routeSs: Subscription;
  sm = 576;
  lg = 986;
  @Input() isNewsPage = true;

  constructor(
    private newsResource: NewsResourceService,
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private newsLoader: NewsPaginationService,
    private screenState: ScreenStateService) {
  }

  ngOnInit() {
    this.newsLoader.isNewsPage = this.isNewsPage;

    this.routeSs = this.route.queryParams.subscribe((params) => {
      const { tags } = params;
      if (tags) {
        const arr = tags.split(',');
        this.newsLoader.filter = { tags: arr };
      }

      this.startCountNews$
          .pipe(
            switchMap(countShow => this.newsLoader.load(countShow)),
          )
          .subscribe(() => this.cd.markForCheck());
    });
  }

  private get startCountNews$(): Observable<number> {
    return combineLatest(
      this.screenState.matchMediaMobileSmall$,
      this.screenState.matchMediaTabletSmall$,
    ).pipe(
      filter(([mobileMatch, tableMatch]) => {
        return mobileMatch !== null && tableMatch !== null;
      }),
      take(1),
      map(([mobileMatch, tableMatch]) => {
        if (!tableMatch) {
          return this.isNewsPage ? 5 : 4;
        } else if (!mobileMatch) {
          return this.isNewsPage ? 3 : 2;
        } else {
          return 4;
        }
      }),
    );
  }

  public ngOnDestroy() {
    if (this.routeSs) {
      this.routeSs.unsubscribe();
    }
  }

  public onTagClick(tagId) {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   this.filterByTag(tagId);
  }

  // public filterByTag(tagId: string) {
  //   const tag = tagId.toString();
  //   const nextFilter = this.newsLoader.filter ? this.newsLoader.filter : { tags: [] };
  //
  //   if (this.isTagActive(tag)) {
  //     nextFilter.tags = nextFilter.tags.filter(item => item !== tag);
  //   } else {
  //     nextFilter.tags.push(tag);
  //   }
  //
  //   this.newsLoader.filter = nextFilter;
  //   if (this.newsLoader.filter.tags.length === 0) {
  //     this.clearFilters();
  //   }
  //   const params = this.newsLoader.preparedFilters();
  //   this.router.navigate(['/news'], { queryParams: params ? { tags: params.tags } : null });
  // }

  // public clearFilters() {
  //   this.newsLoader.filter = null;
  //   this.cd.markForCheck();
  // }

  public isTagActive(tag: string | number) {
  //   const filters = this.newsLoader.filter;
  //   return filters && filters.tags && !!filters.tags.find(tagItem => tagItem === tag.toString());
  }

  public showMore() {
    if (this.newsLoader.isNewsPage) {
      this.screenState.matchMediaTabletSmall$.pipe(
        take(1),
        map(match => match ? 3 : 4),
        switchMap(count => this.newsLoader.showMore(count)),
      )
          .subscribe(() => this.cd.markForCheck());
    } else {
      this.router.navigate(['/news']);
    }
  }

  getImageUrl(news: INews): string {
    return news.image && news.image.full && `url(${news.image.full})`;
  }
}
