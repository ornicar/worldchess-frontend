import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { combineLatest, Subscription } from 'rxjs';
import { NewsService } from '../news/news.service';
import {INews} from '../broadcast/chess-footer/news/news.model';

const ARMAGEDDON_NEWS_ID = 1408;

@Component({
  selector: 'app-armageddon-view',
  templateUrl: './armageddon-view.component.html',
  styleUrls: ['../news/news-view/news-view.component.scss']
})
export class ArmageddonViewComponent implements OnDestroy, AfterViewInit {
  public routeSs: Subscription;
  public news: INews;

  @ViewChildren('newsContent') newsContentQuery: QueryList<ElementRef<HTMLElement>>;

  private setkaApi: any;

  constructor(private newsService: NewsService) {
    this.routeSs = combineLatest(
      this.newsService.getNewsById(ARMAGEDDON_NEWS_ID),
      this.newsService.setkaApi
    )
      .subscribe(([news, setkaApi]) => {
        this.news = news;
        this.setkaApi = setkaApi;
      });
  }

  ngAfterViewInit() {
    this.newsContentQuery.changes
      .pipe(
        switchMap(() => this.newsService.setkaApi),
      )
      .subscribe(s => s.start());
  }


  public ngOnDestroy() {
    this.routeSs.unsubscribe();
  }

  public getImageUrl(image) {
    return `url(${image.full})`;
  }
}
