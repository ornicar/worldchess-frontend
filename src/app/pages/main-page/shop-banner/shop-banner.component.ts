import { Component, Input } from '@angular/core';
import { ShopBanner } from '../store/main-page.reducer';

@Component({
  selector: 'wc-main-page-shop-banner',
  templateUrl: './shop-banner.component.html',
  styleUrls: ['./shop-banner.component.scss']
})
export class MainPageShopBannerComponent {
  @Input() banner: ShopBanner;
}
