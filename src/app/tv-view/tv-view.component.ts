import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {INews} from '../broadcast/chess-footer/news/news.model';
import {NewsService} from '../news/news.service';

const TV_NEWS_ID = 859;

@Component({
  selector: 'app-tv-view',
  templateUrl: './tv-view.component.html',
  styleUrls: []
})
export class TvViewComponent implements OnInit {
  public news$: Observable<INews>;

  constructor(
    private newsService: NewsService
  ) {
  }

  ngOnInit(): void {
    this.news$ = this.newsService.getNewsById(TV_NEWS_ID);
  }
}
