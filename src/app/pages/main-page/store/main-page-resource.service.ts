import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {IWidgetResponseEntities, IWidgetWithExpandAll, WidgetService} from '../../../../widget/app/services/widget.service';

import {
  BannerType, mainBanner,
  miniBanner,
  NewsBanner,
  ShopBanner,
  VideoBanner
} from './main-page.reducer';

export interface IWidgetBannerResponse {
  banner_type: BannerType.Widget;
  title: string;
  widget: IWidgetWithExpandAll;
  link_text: string;
  link_url: string;
}

export interface IBannerResponse {
  main_banner: NewsBanner | ShopBanner | VideoBanner | IWidgetBannerResponse;
  mini_banner_1: miniBanner;
  mini_banner_2: miniBanner;
  mini_banner_3: miniBanner;
}

export interface IBannerResponseEntities {
  banner: mainBanner;
  mini_banner_1: miniBanner;
  mini_banner_2: miniBanner;
  mini_banner_3: miniBanner;
  widgetData?: IWidgetResponseEntities;
}

@Injectable()
export class MainPageResourceService {

  constructor(
    private httpClient: HttpClient,
    private widgetService: WidgetService
  ) {}

  getInfo(): Observable<IBannerResponseEntities> {
    return this.httpClient.get<IBannerResponse>(`${environment.endpoint}/banner/`).pipe(
      map(({ main_banner, mini_banner_1, mini_banner_2, mini_banner_3 }) => {
        let normalizedResponse: IBannerResponseEntities;

        if ( main_banner.banner_type === BannerType.Widget) {
          const widget =  main_banner.widget;

          normalizedResponse = {
            banner: {
              ... main_banner,
              widget: widget.id
            },
            mini_banner_1,
            mini_banner_2,
            mini_banner_3,
            widgetData: this.widgetService.expandWidget(widget)
          };

        } else {
          normalizedResponse = {
            banner:  main_banner,
            mini_banner_1,
            mini_banner_2,
            mini_banner_3
          };
        }

        return normalizedResponse;
      })
    );
  }
}
