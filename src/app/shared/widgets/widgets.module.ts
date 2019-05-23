import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {Angulartics2Module} from 'angulartics2';
import {ArrowDownComponent} from './arrow-down/arrow-down.component';
import {CountdownComponent, TimerItemPipe} from './countdown/countdown.component';
import {CountryFlagComponent} from './country-flag/country-flag.component';
import {SubscriptionsComponent} from './subscriptions/subscriptions.component';
import {TimerComponent} from './timer/timer.component';
import {CommonModule} from '@angular/common';
import {FigureComponent} from './figure/figure.component';
import {ChessgroundComponent} from './chessground/chessground.component';
import { YoutubePlayerComponent } from './youtube-player/youtube-player.component';
import { DragScrollComponent } from './drag-scroll/drag-scroll.component';
import { PreloaderComponent } from './preloader/preloader.component';
import { HugeTooltipComponent } from './hugetooltip/hugetooltip.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    Angulartics2Module
  ],
  declarations: [
    ArrowDownComponent,
    ChessgroundComponent,
    CountryFlagComponent,
    TimerComponent,
    FigureComponent,
    CountdownComponent,
    TimerItemPipe,
    SubscriptionsComponent,
    YoutubePlayerComponent,
    DragScrollComponent,
    PreloaderComponent,
    HugeTooltipComponent,
  ],
  exports: [
    ArrowDownComponent,
    ChessgroundComponent,
    CountryFlagComponent,
    TimerComponent,
    FigureComponent,
    CountdownComponent,
    SubscriptionsComponent,
    YoutubePlayerComponent,
    DragScrollComponent,
    PreloaderComponent,
    HugeTooltipComponent,
  ]
})
export class WidgetsModule { }
