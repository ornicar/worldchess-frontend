import {Component, Input, OnInit} from '@angular/core';
import {NewsShort} from "@app/modules/main/model/news-short";
import {News} from "@app/modules/main/model/news";

@Component({
  selector: 'main-page-news-bar-item',
  templateUrl: './main-page-news-bar-item.component.html',
  styleUrls: ['./main-page-news-bar-item.component.scss']
})
export class MainPageNewsBarItemComponent implements OnInit {

  constructor() { }


  @Input()
  value: News;

  ngOnInit() {
  }

}
