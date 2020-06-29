import {Component, Input, OnInit} from '@angular/core';
import {Banner, BannerDto, BannerType} from "@app/modules/main/model/banner";

@Component({
  selector: 'wc-main-banner',
  templateUrl: './main-banner.component.html',
  styleUrls: ['./main-banner.component.scss']
})
export class MainBannerComponent implements OnInit {

  constructor() { }

  @Input()
  data: Banner;

  ngOnInit() {
  }

  hasAccess(){
    return this.data && this.data.banner_type===BannerType.news;
  }
}
