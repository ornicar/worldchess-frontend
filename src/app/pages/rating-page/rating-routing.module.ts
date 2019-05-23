import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RatingListPageComponent} from './rating-list/rating-list-page.component';
import {RatingPlayerPageComponent} from './rating-player/rating-player-page.component';

const routes: Routes = [
  {path: 'ratings', component: RatingListPageComponent},
  {path: 'ratings/:id', component: RatingPlayerPageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RatingRoutingModule {
}
