import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NouisliderModule} from 'ng2-nouislider';
import {ChessNavigationComponent} from './chess-navigation.component';
import {MovesNavigationSliderComponent} from './moves-navigation-slider/moves-navigation-slider.component';
import {ColliderService} from './moves-navigation-slider/collider.service';
import {MovesNavigationContainerComponent} from './moves-navigation-container/moves-navigation-container.component';
import {MovesNavigationChartComponent} from './moves-navigation-slider/moves-navigation-chart/moves-navigation-chart.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NouisliderModule,
  ],
  declarations: [
    ChessNavigationComponent,
    MovesNavigationSliderComponent,
    MovesNavigationContainerComponent,
    MovesNavigationChartComponent
  ],
  providers: [
    ColliderService
  ],
  exports: [
    ChessNavigationComponent
  ]
})
export class ChessNavigationModule { }
