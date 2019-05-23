import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {ITournament} from '../../../core/tournament/tournament.model';
import { INews } from '../../news/news.model';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'wc-news-last',
  templateUrl: './news-last.component.html',
  styleUrls: ['./news-last.component.scss']
})
export class NewsLastComponent implements OnInit {
  @Output() changeTab = new EventEmitter();
  @Input() tournament: ITournament = null;

  constructor() { }

  @Input() public news: INews;

  public ngOnInit() {
  }

  public getNewsUrl() {
    return `/news/${this.news.id}`;
  }

  public getNewsFiltersUrl(tagId = null) {
    return `/news/${tagId ? '?tags=' + tagId : ''}`;
  }

  public newsImage() {
    return this.news && this.news.image ? `url(${this.news.image.full})` : '';
  }
}
