import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'wc-news-card',
  templateUrl: './news-card.component.html',
  styleUrls: ['./news-card.component.scss']
})
export class NewsCardComponent implements OnInit {

  @Input() newsItem: any;

  constructor() { }

  ngOnInit() {
  }

  public getNewsUrl() {
    return `/news/${this.newsItem.id}`;
  }

  public getNewsFilterUrl(tagId = null) {
    return `/news${tagId ? '?tags=' + tagId : ''}`;
  }

  public newsImage() {
    return this.newsItem && this.newsItem.image ? `url(${this.newsItem.image.full})` : '';
  }

}
