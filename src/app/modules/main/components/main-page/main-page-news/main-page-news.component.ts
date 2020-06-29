import {Component, Input, OnInit} from '@angular/core';
import {HolderItem} from "@app/modules/main/components/main-page/holder-item";
import { Router } from '@angular/router';
@Component({
  selector: 'main-page-news',
  templateUrl: './main-page-news.component.html',
  styleUrls: ['./main-page-news.component.scss']
})
export class MainPageNewsComponent implements OnInit {

  constructor(
    private route: Router
  ) { }

  @Input() mainBannerItem:HolderItem | undefined = undefined;
  @Input() newsBannerItem:HolderItem | undefined = undefined;

  ngOnInit() {
  }

  goToNews($event) {
    $event.preventDefault();
    this.route.navigate(['/news']).then();   
  }

}
