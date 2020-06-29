import {Component, Input, OnInit} from '@angular/core';
import {ShopBanner} from "@app/modules/main/model/shop-banner";
import {environment} from "../../../../../../environments/environment";
import {Router} from "@angular/router";

@Component({
  selector: 'shop-banner',
  templateUrl: './shop-banner.component.html',
  styleUrls: ['./shop-banner.component.scss']
})
export class ShopBannerComponent implements OnInit {
  constructor(
    private route: Router
  ) { }

  @Input()
  data: ShopBanner;

  shopUrl = environment.shopUrl;



  ngOnInit() {
  }

  goToShop($event){
    $event.preventDefault();
    $event.stopPropagation();
    window.location.href=this.shopUrl;
  }
}
