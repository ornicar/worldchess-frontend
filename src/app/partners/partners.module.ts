import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import { PartnersService } from './partners.service';
import { PartnersListComponent } from './partners-list/partners-list.component';
import { NguCarouselModule } from '@ngu/carousel';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    NguCarouselModule,
    RouterModule
  ],
  declarations: [
    PartnersListComponent,
  ],
  exports: [
    PartnersListComponent
  ],
  providers: [
    PartnersService
  ]
})
export class PartnersModule {
}
