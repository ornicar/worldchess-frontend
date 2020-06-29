import {Component, Input, OnInit} from '@angular/core';
import {Banner, BannerType} from "@app/modules/main/model/banner";

@Component({
  selector: 'horizontal-image-banner',
  templateUrl: './horizontal-image-banner.component.html',
  styleUrls: ['./horizontal-image-banner.component.scss']
})
export class HorizontalImageBannerComponent implements OnInit {

  constructor() { }

  @Input()
  data: Banner;

  ngOnInit() {
  }

  hasAccess(){
    return this.data.banner_type===BannerType.news || this.data.banner_type===BannerType.image
  }
}
