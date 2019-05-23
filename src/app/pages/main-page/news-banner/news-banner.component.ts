import { Component, Input } from '@angular/core';
import { NewsBanner } from '../store/main-page.reducer';

@Component({
  selector: 'wc-main-page-news-banner',
  templateUrl: './news-banner.component.html',
  styleUrls: ['./news-banner.component.scss']
})
export class MainPageNewsBannerComponent {
  @Input() banner: NewsBanner;
}
