import {Component, Input, OnInit} from '@angular/core';
import {Banner, BannerType} from "@app/modules/main/model/banner";



@Component({
  selector: 'image-banner',
  templateUrl: './image-banner.component.html',
  styleUrls: ['./image-banner.component.scss']
})
export class ImageBannerComponent implements OnInit {

  constructor() { }

  @Input()
  data: Banner;

  ngOnInit() {
  }

  hasAccess(){
    return this.data.banner_type===BannerType.news || this.data.banner_type===BannerType.image
  }

}
