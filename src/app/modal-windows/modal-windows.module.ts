import { NgModule } from '@angular/core';
import { ModalWindowsService } from './modal-windows.service';
import { AlertWindowComponent } from './alert-window/alert-window.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { BugReportWindowComponent } from './bug-report-window/bug-report-window.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmWindowComponent } from './confirm-window/confirm-window.component';
import { SvgModule } from '@app/modules/svg/svg.module';
import { GameSettingsWindowsComponent } from './game-settings-windows/game-settings-windows.component';
import { MatButtonToggleModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatRippleModule } from '@angular/material';
import { AlertWithCountdownComponent } from './alert-with-countdown/alert-with-countdown.component';
import { WidgetsModule } from '@app/shared/widgets/widgets.module';
import { AlertConnectComponent } from './alert-connect/alert-connect.component';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AlertWindowComponent,
    BugReportWindowComponent,
    ConfirmWindowComponent,
    GameSettingsWindowsComponent,
    AlertWithCountdownComponent,
    AlertConnectComponent,
  ],
  entryComponents: [
    AlertWindowComponent,
    AlertWithCountdownComponent,
    BugReportWindowComponent,
    ConfirmWindowComponent,
    GameSettingsWindowsComponent,
    AlertConnectComponent,
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    FormsModule,
    SvgModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    ReactiveFormsModule,
    WidgetsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      },
      defaultLanguage: 'en'
    })
  ],
  providers: [
    ModalWindowsService,
  ],
})
export class ModalWindowsModule { }
