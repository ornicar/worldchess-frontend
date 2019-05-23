import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LayoutModule} from '../layout/layout.module';
import {NewsGroupComponent} from './news-group/news-group.component';
import {NewsService} from './news.service';
import {HttpClientModule} from '@angular/common/http';
import { NewsViewComponent } from './news-view/news-view.component';
import {RouterModule} from '@angular/router';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
    LayoutModule
  ],
  providers: [
    NewsService
  ],
  declarations: [
    NewsGroupComponent,
    NewsViewComponent
  ],
  exports: [
    NewsGroupComponent,
    NewsViewComponent
  ]
})
export class NewsModule {
}
