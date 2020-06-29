import {Component, Inject, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {NewsServiceService} from "@app/modules/main/service/news-service.service";
import {environment} from "../../../../../../../environments/environment";
import {NewsShort} from "@app/modules/main/model/news-short";

@Component({
  selector: 'main-page-news-caption-item',
  templateUrl: './main-page-news-caption-item.component.html',
  styleUrls: ['./main-page-news-caption-item.component.scss']
})
export class MainPageNewsCaptionItemComponent implements OnInit {

  @Input()
  private data: NewsShort;

  link = environment.newsLink;
  image$ = new BehaviorSubject("");
  newsTime$ = new BehaviorSubject("");
  newsTitle$ = new BehaviorSubject("");

  ngOnInit() {
    const val = this.data;
    if (val) {
      this.image$.next(val && val.imageSrc || '');
      this.newsTime$.next(val && val.time && val.time.toString() || '');
      this.newsTitle$.next(val && val.title || '');
    }
  }

  goToNews(event){
    window.location.href = this.link;
  }


}
