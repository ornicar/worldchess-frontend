import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsGroupComponent } from './news-group/news-group.component';
import { NewsService } from './news.service';
import { HttpClientModule } from '@angular/common/http';
import { NewsViewComponent } from './news-view/news-view.component';
import { Route, RouterModule, UrlMatchResult, UrlSegment, UrlSegmentGroup } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { LayoutModule } from '@app/layout/layout.module';
import { environment } from '../../../environments/environment';

export function staticPageMatcher (segments: UrlSegment[], group: UrlSegmentGroup, route: Route): UrlMatchResult {
  if (segments.length) {
    return null;
  }
  if (!group.parent.segments.length) {
    return null;
  }

  const path = group.parent.segments.find(() => true).path;
  if (environment.staticNews.hasOwnProperty(path)) {
    return {
      consumed: segments,
      posParams: {
        id: new UrlSegment(environment.staticNews[path], {}),
        slug: new UrlSegment(path, {}),
      },
    };
  }
  return null;
}

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        matcher: staticPageMatcher,
        component: NewsViewComponent,
      },
      {
        path: '',
        component: NewsGroupComponent,
      },
      {
        path: ':slug',
        component: NewsViewComponent,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class NewsRoutingModule {
}

@NgModule({
  imports: [
    CommonModule,
    NewsRoutingModule,
    HttpClientModule,
    SharedModule,
    LayoutModule,
  ],
  providers: [
    NewsService,
  ],
  declarations: [
    NewsGroupComponent,
    NewsViewComponent,
  ],
  bootstrap: [
    NewsGroupComponent,
  ],
})
export class NewsModule {
}
