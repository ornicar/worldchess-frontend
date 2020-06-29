import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { TournamentListComponent } from './tournament-list/tournament-list.component';
import { RouterModule } from '@angular/router';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { OwnEventButtonComponent } from './own-event-button/own-event-button.component';
import { TournamentListTitleComponent } from './tournament-list-title/tournament-list-title.component';
import { MainPreloaderComponent } from './main-preloader/main-preloader.component';
import { SvgModule } from '@app/modules/svg/svg.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    SvgModule
  ],
  declarations: [
    TournamentListComponent,
    ComingSoonComponent,
    OwnEventButtonComponent,
    TournamentListTitleComponent,
    MainPreloaderComponent,
  ],
  exports: [
    TournamentListComponent,
    ComingSoonComponent,
    OwnEventButtonComponent,
    TournamentListTitleComponent,
    MainPreloaderComponent,
  ],
})
export class ComponentsModule { }
