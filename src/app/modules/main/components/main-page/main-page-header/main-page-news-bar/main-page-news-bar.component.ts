import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {NewsServiceService} from "@app/modules/main/service/news-service.service";
import {NewsShort} from "@app/modules/main/model/news-short";
import {BehaviorSubject} from "rxjs";
import {News} from "@app/modules/main/model/news";

@Component({
  selector: 'main-page-news-bar',
  templateUrl: './main-page-news-bar.component.html',
  styleUrls: ['./main-page-news-bar.component.scss']
})
export class MainPageNewsBarComponent implements OnInit {

  private newsService: NewsServiceService;

  @Input()
  private data: News[];

  data$:BehaviorSubject<NewsShort[]>=new BehaviorSubject([]);

  constructor(newsService:NewsServiceService) {
    this.newsService = newsService;
  }

  ngOnChanges(changes: SimpleChanges) {
       if (changes['data'].currentValue!==this.data$.value){
         this.data$.next(changes['data'].currentValue || [])
       }
  }

  ngOnInit() {
    this.data$.next(this.data || []);
  }

}
