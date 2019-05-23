import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {filter, map, withLatestFrom} from 'rxjs/operators';
import {INews} from '../../broadcast/chess-footer/news/news.model';
import {ISetkaEditorPublic, NewsService} from '../../news/news.service';
import {SubscriptionHelper, Subscriptions} from '../../shared/helpers/subscription.helper';

@Component({
  selector: 'wc-setka-news',
  templateUrl: './setka-news.component.html',
  styleUrls: ['../../news/news-view/news-view.component.scss']
})
export class SetkaNewsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  public news: INews;

  @ViewChildren('newsContent') newsContentQuery: QueryList<ElementRef<HTMLElement>>;

  private setkaApi$ = new ReplaySubject<ISetkaEditorPublic>(1);

  public isLoadedSetkaApi$: Observable<boolean> = this.setkaApi$.pipe(
    map(setkaApi => Boolean(setkaApi))
  );

  private subs: Subscriptions = {};

  constructor(
    private newsService: NewsService
  ) {
  }

  ngOnInit(): void {
    this.subs.loadSetkaApi = this.newsService.loadSetkaApi()
      .subscribe(setkaApi => this.setkaApi$.next(setkaApi));
  }

  ngAfterViewInit() {
    this.subs.setkaInitJS = this.newsContentQuery.changes
      .pipe(
        filter(({ length }) => length > 0),
        withLatestFrom(this.setkaApi$),
      )
      .subscribe(([queryList, setkaApi]) => setkaApi.start());
  }

  public ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }
}
