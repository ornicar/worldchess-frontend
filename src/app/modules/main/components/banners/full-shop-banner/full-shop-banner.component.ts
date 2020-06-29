import {Component, Input, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ShopBanner} from "@app/modules/main/model/shop-banner";
import {environment} from "../../../../../../environments/environment";

@Component({
  selector: 'wc-full-shop-banner',
  templateUrl: './full-shop-banner.component.html',
  styleUrls: ['./full-shop-banner.component.scss']
})
export class FullShopBannerComponent implements OnInit {

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
