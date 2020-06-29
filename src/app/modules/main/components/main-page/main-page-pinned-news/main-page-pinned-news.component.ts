import {Component, Input, OnInit} from '@angular/core';
import {PinnedNews} from "@app/modules/main/model/pinned-news";
import {News} from "@app/modules/main/model/news";
import {Router} from "@angular/router";

@Component({
  selector: 'main-page-pinned-news',
  templateUrl: './main-page-pinned-news.component.html',
  styleUrls: ['./main-page-pinned-news.component.scss']
})
export class MainPagePinnedNewsComponent implements OnInit {

  @Input() data: News;

  currentDate = new Date();

  @Input() full: boolean = false;

  constructor(
    private route: Router
  ) { }

  ngOnInit(): void {
  }

  goToNews(event){
    this.route.navigate(['/news',this.data.slug || this.data.id]);
  }

}
