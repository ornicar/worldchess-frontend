import {AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChildren} from '@angular/core';
import {NewsService} from '../news.service';
import {ActivatedRoute} from '@angular/router';
import {filter, switchMap, take} from 'rxjs/operators';
import {INews} from '../../broadcast/chess-footer/news/news.model';
import {combineLatest, Subscription} from 'rxjs';

@Component({
  selector: 'app-news-view',
  templateUrl: './news-view.component.html',
  styleUrls: ['./news-view.component.scss']
})
export class NewsViewComponent implements OnDestroy, AfterViewInit {
  public routeSs: Subscription;
  public news: INews;

  @ViewChildren('newsContent') newsContentQuery: QueryList<ElementRef<HTMLElement>>;

  private setkaApi: any;

  constructor(
    private newsService: NewsService,
    private route: ActivatedRoute) {

    this.routeSs = this.route.params.pipe(
      switchMap(params => {
        return combineLatest(
          this.newsService.getNewsById(parseInt(params['id'], 10)),
          this.newsService.setkaApi
        );
      })
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

  public getNewsFilterUrl(tagId = null) {
    return `/news/${tagId ? '?tags=' + tagId : ''}`;
  }
}
