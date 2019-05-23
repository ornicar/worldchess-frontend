import {INewsFilters, NewsResourceService} from './news-resource.service';
import {INews} from './news.model';
import {catchError, map, tap} from 'rxjs/operators';
import {BehaviorSubject, combineLatest, EMPTY, of} from 'rxjs';
import {Injectable} from '@angular/core';

const NEWS_PER_PAGE = 15;

@Injectable()
export class NewsPaginationService {
  isNewsPage = false;
  showButton = false;
  filter: {tags?: string[], categories?: string[]} = null;

  private show$ = new BehaviorSubject<number>(0);
  private newsList$ = new BehaviorSubject<INews[]>([]);

  news$ = combineLatest(this.newsList$, this.show$)
    .pipe(map(([news, count]) => news.slice(0, count)));

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
    this.newsList$.next([]);
    this.show$.next(countShow);
    return this.loadNextPageNews();
  }

  private loadNextPageNews() {
    const params = this.preparedFilters() || {};
    params.per_page = NEWS_PER_PAGE;
    params.page = this.page;
    this._loading = true;

    return this.newsResource.loadNews(params)
      .pipe(
        map(n => this.sortTags(n)),
        tap((news) => {
          const nextList = this.newsList$.value;
          nextList.push(...news);
          this.newsList$.next(nextList);

          this.showButton = this.show$.value < this.newsResource.count;
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

  private compareTags(tag1: {id: number, name: string}, tag2: {id: number, name: string}) {
    return tag2.id - tag1.id;
  }

  public preparedFilters(): INewsFilters {
    if (!this.filter) {
      return null;
    }

    const out: any = {};
    if (this.filter.tags) {
      out.tags = this.filter.tags.join(',');
    }
    if (this.filter.categories) {
      out.categories = this.filter.categories.join(',');
    }
    return out;
  }

  public showMore(show) {
    if (this._loading) {
      return of(false);
    }

    const nextShow = this.show$.value + show;

    this.show$.next(nextShow);
    if (nextShow >= this.newsResource.count) {
      this.showButton = false;
      return of(true);
    }

    if (this.newsList$.value.length < nextShow + show && this.newsResource.count > nextShow) {
      return this.loadNextPageNews().pipe(map(() => true));
    }

    return of(true);
  }
}
