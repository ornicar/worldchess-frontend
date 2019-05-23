import { Component, Input } from '@angular/core';
import { WidgetBanner } from '../store/main-page.reducer';

@Component({
  selector: 'wc-main-page-widget-banner',
  templateUrl: './widget-banner.component.html',
  styleUrls: ['./widget-banner.component.scss']
})
export class MainPageWidgetBannerComponent {
  @Input() banner: WidgetBanner;
}
