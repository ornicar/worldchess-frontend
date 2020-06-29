import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MainMenuComponent} from './components/main-menu/main-menu.component';
import {SvgModule} from "@app/modules/svg/svg.module";
import {RouterModule} from "@angular/router";
import {MonthDayPipe} from './pipes/month-day.pipe';
import {AgePipe} from "@app/modules/app-common/pipes/age-pipe";
import {CountryPipePipe} from "@app/modules/app-common/pipes/country-pipe.pipe";
import {PlayerRatingResourceService} from "@app/modules/app-common/services/player-rating-resource.service";
import { BoardTypePipe } from './pipes/board-type.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { EmbedYoutubePipe } from './pipes/embed-youtube.pipe';
import {GameFooterComponent} from "@app/modules/game/game-footer/game-footer.component";
import {AccountStoreModule} from "@app/account/account-store/account-store.module";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [MainMenuComponent, MonthDayPipe, AgePipe, CountryPipePipe, BoardTypePipe, SafePipe, EmbedYoutubePipe, GameFooterComponent],
  exports: [
    MainMenuComponent,
    GameFooterComponent,
    AgePipe,
    MonthDayPipe,
    CountryPipePipe,
    BoardTypePipe,
    SafePipe,
    EmbedYoutubePipe,

  ],
  providers: [
    PlayerRatingResourceService
  ],
  imports: [
    AccountStoreModule,
    SvgModule,
    RouterModule,
    CommonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      },
      defaultLanguage: 'en'
    })
  ],
})
export class AppCommonModule { }
