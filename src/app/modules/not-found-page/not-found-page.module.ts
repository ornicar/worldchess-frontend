import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LottieAnimationViewModule } from 'ng-lottie';
import { LayoutModule } from '../../layout/layout.module';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: NotFoundPageComponent,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class NotFoundPageRoutingModule {
}

@NgModule({
  declarations: [
    NotFoundPageComponent,
  ],
  imports: [
    CommonModule,
    NotFoundPageRoutingModule,
    LottieAnimationViewModule.forRoot(),
    LayoutModule,
  ],
})
export class NotFoundPageModule {
}
