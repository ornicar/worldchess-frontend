import { Component, ElementRef, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { NewsService } from '../news.service';
import { ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { combineLatest, ReplaySubject, Subscription, zip } from 'rxjs';
import { INews } from '@app/broadcast/chess-footer/news/news.model';

@Component({
  selector: 'app-news-view',
  templateUrl: './news-view.component.html',
  styleUrls: ['./news-view.component.scss'],
})
export class NewsViewComponent implements OnDestroy {
  public routeSs: Subscription;
  public news$: ReplaySubject<INews> = new ReplaySubject<INews>(1);

  @ViewChildren('newsContent') newsContentQuery: QueryList<ElementRef<HTMLElement>>;

  constructor(
    private newsService: NewsService,
    private route: ActivatedRoute,
  ) {

    this.routeSs = this.route.params
      .pipe(
        switchMap((params) => {
          return combineLatest([
            this.newsService.getNewsBySlug(params['slug']),
            this.newsService.loadScripts(),
          ]);
        }),
        tap(([news, _]) => this.news$.next(news))
      )
      .subscribe();
  }


  public ngOnDestroy() {
    this.routeSs.unsubscribe();
  }

  public getImageUrl(image) {
    return `url(${image.full})`;
  }
}
