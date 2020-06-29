import { INewsPagination, NewsResourceService } from './news-resource.service';
import { INews } from './news.model';
import { catchError, map, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, EMPTY, of } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class NewsPaginationService {
  isNewsPage = false;
  showButton = false;
  nextNewsUrl: string;
  count = 0;
  filter: INewsPagination;

  private show$ = new BehaviorSubject<number>(0);
  news$ = new BehaviorSubject<INews[]>([]);

  private page = 1;
  private _loading = false;

  constructor(private newsResource: NewsResourceService) {
  }

  get show() {
    return this.show$.value;
  }

  public get loading(): boolean {
    return this._loading;
  }

  load(countShow) {
    this._loading = true;
    this.page = 1;
    this.show$.next(countShow);
    return this.loadNextPageNews();
  }

  private loadNextPageNews() {
    const params = this.prepareFilter() || {};
    this._loading = true;

    return this.newsResource.loadNews(this.filter)
      .pipe(
        map((response) => {
          this.count = response.count;
          this.nextNewsUrl = response.next;

          return response.results.map((news) => this.newsResource.parseNewsResponseItem(news));
        }),
        map(n => this.sortTags(n)),
        tap((news) => {
          const nextList = this.news$.value;
          nextList.push(...news);
          this.news$.next(nextList);

          this.showButton = this.show$.value < this.count;
          if (!this.showButton) {
            this.show$.next(news.length);
          }
          this._loading = false;
          this.page++;
        }),
        catchError(() => {
          this._loading = false;
          return EMPTY;
        })
      );
  }

  private sortTags(news: INews[]) {
    return news.map((newsItem) => ({...newsItem, tags: newsItem.tags.sort(this.compareTags)}));
  }

  private compareTags(tag1: { id: number, name: string }, tag2: { id: number, name: string }) {
    return tag2.id - tag1.id;
  }

  public prepareFilter() {
    if (!this.filter) {
      this.filter = {
        limit: this.show$.value,
        offset: 0
      };
    } else {
      this.filter.limit = this.show$.value;
      this.filter.offset += this.show$.value;
    }

    return this.filter;
  }

  public showMore(show) {
    if (this._loading) {
      return of(false);
    }

    return this.loadNextPageNews().pipe(map(() => true));
  }
}
