import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import { TournamentListComponent } from './tournament-list/tournament-list.component';
import { RouterModule } from '@angular/router';
import { CoreModule } from '../broadcast/core/core.module';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { OwnEventButtonComponent } from './own-event-button/own-event-button.component';
import { TournamentListTitleComponent } from './tournament-list-title/tournament-list-title.component';
import { SetkaNewsComponent } from './setka-news/setka-news.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    CoreModule,
    SharedModule
  ],
  declarations: [
    TournamentListComponent,
    ComingSoonComponent,
    OwnEventButtonComponent,
    TournamentListTitleComponent,
    SetkaNewsComponent,
  ],
  exports: [
    TournamentListComponent,
    ComingSoonComponent,
    OwnEventButtonComponent,
    TournamentListTitleComponent,
    SetkaNewsComponent
  ],
})
export class ComponentsModule { }
