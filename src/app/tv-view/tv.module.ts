import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {ComponentsModule} from '../components/components.module';
import { NewsModule } from '../news/news.module';
import { SharedModule } from '../shared/shared.module';
import { LayoutModule } from '../layout/layout.module';
import {TvViewComponent} from './tv-view.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    NewsModule,
    SharedModule,
    LayoutModule,
    ComponentsModule
  ],
  providers: [],
  declarations: [
    TvViewComponent,
  ],
  exports: [
    TvViewComponent,
  ]
})
export class TvModule {
}
