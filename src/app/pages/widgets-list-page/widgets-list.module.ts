import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {LayoutModule} from '../../layout/layout.module';
import { WidgetsListPageComponent } from './widgets-list-page.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    LayoutModule
  ],
  providers: [],
  declarations: [
    WidgetsListPageComponent
  ],
  exports: [
    WidgetsListPageComponent
  ]
})
export class WidgetsListModule {
}
