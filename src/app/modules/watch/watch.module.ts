import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WatchPageComponent } from './watch-page/watch-page.component';
import {AppCommonModule} from "@app/modules/app-common/app-common.module";
import { WatchRoutingModule } from './watch-routing.module';
import {MainModule} from "@app/modules/main/main.module";
import {GameModule} from "@app/modules/game/game.module";

@NgModule({
  declarations: [WatchPageComponent],
  imports: [
    CommonModule,
    WatchRoutingModule,
    AppCommonModule,
    MainModule,
    GameModule,

  ]
})
export class WatchModule { }
