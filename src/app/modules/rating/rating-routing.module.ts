import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RatingListPageComponent } from './rating-list/rating-list-page.component';
import { RatingPlayerPageComponent } from './rating-player/rating-player-page.component';

@NgModule({
  imports: [RouterModule.forChild([
    {path: '', component: RatingListPageComponent },
    {path: ':id', component: RatingPlayerPageComponent},
  ])],
  exports: [RouterModule]
})
export class RatingRoutingModule {
}
