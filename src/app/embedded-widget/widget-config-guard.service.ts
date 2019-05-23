import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { IWidgetConfig, WidgetStyle } from './widget-config';

@Injectable()
export class WidgetConfigGuard implements Resolve<IWidgetConfig> {

  private getStyle(queryParam) {
    switch (queryParam) {
      case 'light':
        return WidgetStyle.Light;

      case 'dark':
      default:
        return WidgetStyle.Dark;
    }
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): IWidgetConfig {
    return {
      style: this.getStyle(route.queryParams['style'])
    };
  }
}
