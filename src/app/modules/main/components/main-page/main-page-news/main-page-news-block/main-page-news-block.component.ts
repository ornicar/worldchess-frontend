import {Component, Input, OnInit} from '@angular/core';
import {News} from "@app/modules/main/model/news";

@Component({
  selector: 'wc-main-page-news-block',
  templateUrl: './main-page-news-block.component.html',
  styleUrls: ['./main-page-news-block.component.scss']
})
export class MainPageNewsBlockComponent implements OnInit {

  constructor() { }

  @Input()
  data:News[] = []

  ngOnInit() {
  }

}
